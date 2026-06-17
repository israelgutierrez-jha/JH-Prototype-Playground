import { readFileSync, writeFileSync } from 'fs'

const content = readFileSync('CLAUDE.md', 'utf8')
writeFileSync('.cursorrules', content)
console.log('✓ .cursorrules synced from CLAUDE.md')
