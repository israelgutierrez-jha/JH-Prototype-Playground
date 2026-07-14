// Checked-in config for the restricted external (CU-facing) gallery build —
// see CLAUDE.md's "External / CU-facing gallery" section. `galleryPasswordHash`
// gates the gallery listing itself (separate from each prototype's own
// passwordHash in its meta.ts). Edited via the global Settings page, written
// through the dev-only `/__proto-api/external-access` endpoint so it lands
// here and shows up in `git diff` like everything else in this repo.
export interface ExternalAccessConfig {
  galleryPasswordHash: string
}

export const externalAccessConfig: ExternalAccessConfig = {
  galleryPasswordHash: '',
}
