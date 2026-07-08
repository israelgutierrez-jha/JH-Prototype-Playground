/**
 * Refresh the vendored JH packages in `vendor/` to their latest published
 * versions, then update package.json + the lockfile + generated docs.
 *
 * WHY THIS EXISTS
 * ----------------
 * New users install the JH packages offline from the committed `vendor/*.tgz`
 * tarballs — no Artifactory token needed (see README / .npmrc). That means the
 * repo never picks up design-system component updates on its own. This script
 * is the *maintainer/CI* side of that trade-off: run where an
 * `ARTIFACTORY_TOKEN` is available, it repacks newer versions into `vendor/`
 * and regenerates everything so the result can be committed. New-user setup is
 * unaffected — they still just consume the committed tarballs.
 *
 * USAGE
 * -----
 *   ARTIFACTORY_TOKEN=… node scripts/update-vendor.mjs [--dry-run] [--pkg <name>]
 *
 *   --dry-run   Report available updates without changing anything.
 *   --pkg <n>   Only consider the named package (repeatable). Default: every
 *               dependency resolved from `file:./vendor/`.
 *
 * Requires the scoped-registry config in `.npmrc` and an `ARTIFACTORY_TOKEN`
 * env var (the same secret CI already uses). Tracks the latest published
 * version, including pre-releases (the current pins are betas).
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync, rmSync, appendFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const PKG_JSON = resolve(ROOT, 'package.json')
const VENDOR_DIR = resolve(ROOT, 'vendor')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const onlyPkgs = args.flatMap((a, i) => (a === '--pkg' ? [args[i + 1]] : [])).filter(Boolean)

/** Tarball prefix npm uses for a (possibly scoped) package name. */
function tarballPrefix(name) {
  return name.replace(/^@/, '').replace(/\//g, '-')
}

/** Parse a semver string into { core: number[], pre: (string|number)[] }. */
function parseVersion(v) {
  const [main] = v.split('+')
  const [core, pre = ''] = main.split('-')
  return {
    core: core.split('.').map(Number),
    pre: pre ? pre.split('.').map(p => (/^\d+$/.test(p) ? Number(p) : p)) : [],
  }
}

/** semver-precedence comparison: <0 if a<b, >0 if a>b, 0 if equal. */
function compareVersions(a, b) {
  const va = parseVersion(a)
  const vb = parseVersion(b)
  for (let i = 0; i < 3; i++) {
    if ((va.core[i] ?? 0) !== (vb.core[i] ?? 0)) return (va.core[i] ?? 0) - (vb.core[i] ?? 0)
  }
  // A version WITHOUT a pre-release outranks one with a pre-release.
  if (va.pre.length === 0 && vb.pre.length === 0) return 0
  if (va.pre.length === 0) return 1
  if (vb.pre.length === 0) return -1
  for (let i = 0; i < Math.max(va.pre.length, vb.pre.length); i++) {
    const x = va.pre[i]
    const y = vb.pre[i]
    if (x === undefined) return -1
    if (y === undefined) return 1
    if (x === y) continue
    const xNum = typeof x === 'number'
    const yNum = typeof y === 'number'
    if (xNum && yNum) return x - y
    if (xNum !== yNum) return xNum ? -1 : 1 // numeric identifiers rank lower
    return x < y ? -1 : 1
  }
  return 0
}

function npm(args) {
  return execFileSync('npm', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

/** Latest published version (including pre-releases) from the registry. */
function latestVersion(name) {
  const raw = npm(['view', name, 'versions', '--json'])
  const versions = JSON.parse(raw)
  const list = Array.isArray(versions) ? versions : [versions]
  return list.reduce((best, v) => (compareVersions(v, best) > 0 ? v : best), list[0])
}

function summarize(lines) {
  const text = lines.join('\n')
  console.log(text)
  const summaryPath = process.env.VENDOR_SYNC_SUMMARY
  if (summaryPath) appendFileSync(summaryPath, text + '\n')
}

function main() {
  if (!process.env.ARTIFACTORY_TOKEN) {
    console.error(
      'ARTIFACTORY_TOKEN is not set. This script talks to the JH registry — ' +
        'set the token (see .npmrc) before running.'
    )
    process.exit(1)
  }

  const pkg = JSON.parse(readFileSync(PKG_JSON, 'utf8'))
  const vendored = Object.entries(pkg.dependencies ?? {})
    .filter(([name, spec]) => spec.startsWith('file:./vendor/') && (!onlyPkgs.length || onlyPkgs.includes(name)))
    .map(([name, spec]) => {
      const prefix = tarballPrefix(name)
      const current = spec.slice(`file:./vendor/${prefix}-`.length, -'.tgz'.length)
      return { name, spec, prefix, current }
    })

  if (!vendored.length) {
    console.error('No vendored (file:./vendor/) dependencies matched.')
    process.exit(1)
  }

  const updated = []
  for (const dep of vendored) {
    let latest
    try {
      latest = latestVersion(dep.name)
    } catch (err) {
      console.error(`✗ ${dep.name}: failed to query registry — ${err.message.split('\n')[0]}`)
      process.exitCode = 1
      continue
    }
    if (compareVersions(latest, dep.current) <= 0) {
      console.log(`• ${dep.name}: up to date (${dep.current})`)
      continue
    }
    console.log(`↑ ${dep.name}: ${dep.current} → ${latest}${dryRun ? ' (dry run)' : ''}`)
    updated.push({ ...dep, latest })
  }

  if (!updated.length) {
    summarize(['No vendored package updates available.'])
    return
  }
  if (dryRun) {
    summarize(['Updates available (dry run — nothing written):', ...updated.map(u => `- ${u.name}: ${u.current} → ${u.latest}`)])
    return
  }

  const nextPkg = JSON.parse(readFileSync(PKG_JSON, 'utf8'))
  for (const u of updated) {
    // Pack the new version into vendor/, then drop the old tarball.
    npm(['pack', `${u.name}@${u.latest}`, '--pack-destination', VENDOR_DIR])
    const oldFile = `${u.prefix}-${u.current}.tgz`
    const newFile = `${u.prefix}-${u.latest}.tgz`
    for (const f of readdirSync(VENDOR_DIR)) {
      if (f === oldFile && f !== newFile) rmSync(resolve(VENDOR_DIR, f))
    }
    nextPkg.dependencies[u.name] = `file:./vendor/${newFile}`
  }
  writeFileSync(PKG_JSON, JSON.stringify(nextPkg, null, 2) + '\n')

  console.log('\nRefreshing lockfile (npm install)…')
  npm(['install'])
  console.log('Regenerating component docs (npm run docs)…')
  npm(['run', 'docs'])

  summarize([
    'Synced vendored JH packages to their latest published versions:',
    '',
    ...updated.map(u => `- \`${u.name}\`: ${u.current} → **${u.latest}**`),
    '',
    'Regenerated `package-lock.json` and the component docs (`_api/*.generated.ts`, ' +
      '`_registry.generated.ts`, `CLAUDE.md`, `.cursorrules`).',
    '',
    '> Review the generated API changes and update the hand-authored `whenToUse` / ' +
      '`examples` / `gotchas` in `src/data/components/*.ts` if the component behavior changed.',
  ])
}

main()
