// Used to gate the external (CU-facing) build's gallery and per-prototype
// views — see CLAUDE.md's "External / CU-facing gallery" section. This is a
// client-side deterrent (the hash ships in the JS bundle), not real security.
export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
