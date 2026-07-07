import raw from './external-links.json'

export interface ExternalPrototypeLink {
  id: string
  title: string
  url: string
  designer: string
  description: string
  createdAt: string
}

/**
 * Links to prototypes that live outside this repo (Figma, v0, etc.), so they
 * still show up in the gallery. Added/removed via the gallery's "Link
 * external" dialog, which writes back to `external-links.json` through the
 * dev-only `/__proto-api/external-links` endpoint — committed like any other
 * source file so the whole team sees the same links.
 */
export const EXTERNAL_LINKS: ExternalPrototypeLink[] = raw as ExternalPrototypeLink[]
