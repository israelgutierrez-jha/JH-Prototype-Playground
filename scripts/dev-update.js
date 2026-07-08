import { spawnSync } from 'child_process'
import { createServer } from 'net'

// Keeps designers on the latest JH design-system packages without requiring
// them to know git or npm — runs before `vite` on every `npm run dev`. Never
// blocks or overwrites anything: every failure path prints one plain-English
// line and falls through to launching vite anyway.

// Keep in sync with server.port in vite.config.ts.
const DEV_PORT = 5173

function run(command, args) {
  return spawnSync(command, args, { encoding: 'utf8' })
}

function skip(message) {
  console.log(message)
}

function isPortInUse(port) {
  return new Promise(resolve => {
    const tester = createServer()
    tester.once('error', () => resolve(true))
    tester.once('listening', () => tester.close(() => resolve(false)))
    tester.listen(port, '127.0.0.1')
  })
}

function update() {
  const inWorkTree = run('git', ['rev-parse', '--is-inside-work-tree'])
  if (inWorkTree.error || inWorkTree.status !== 0) {
    skip("Couldn't check for updates, continuing with what you have.")
    return
  }

  const upstream = run('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'])
  if (upstream.status !== 0) {
    skip('No update source configured, continuing with what you have.')
    return
  }

  const fetch = run('git', ['fetch'])
  if (fetch.status !== 0) {
    skip("Couldn't reach the update server, continuing with what you have.")
    return
  }

  const pull = run('git', ['pull', '--ff-only'])
  if (pull.status !== 0) {
    skip('Skipping update: you have local changes that conflict with the latest version. Continuing with what you have.')
    return
  }

  const alreadyUpToDate = /Already up to date/i.test(pull.stdout ?? '')
  if (alreadyUpToDate) return

  console.log('Updated — installing the latest packages...')
  spawnSync('npm', ['install'], { stdio: 'inherit' })
}

async function main() {
  // A designer re-running `npm run dev` to "sync" while their existing
  // server is still up would otherwise silently get a second, independent
  // server on the next free port — leaving the original one running with
  // stale packages. Catch that here instead of letting Vite do it.
  if (await isPortInUse(DEV_PORT)) {
    console.log(
      `The playground is already running at http://localhost:${DEV_PORT} — open that tab instead of starting a new one.\n` +
      `To pick up an update, stop that server (Ctrl+C in its terminal window) and run "npm run dev" again.`
    )
    process.exit(1)
  }

  try {
    update()
  } catch {
    skip("Couldn't check for updates, continuing with what you have.")
  }
}

main()
