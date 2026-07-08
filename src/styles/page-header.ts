import { css } from 'lit'

/**
 * Shared page-header treatment used across the top-level areas (Prototypes,
 * Templates, Resources) so the title/subtitle look and spacing stay
 * consistent. Include in a component via `static styles = [pageHeaderStyles, css`...`]`.
 *
 * Markup:
 *   <div class="page-header">
 *     <div class="page-header-text">
 *       <h1 class="page-title">…</h1>
 *       <p class="page-subtitle">…</p>
 *     </div>
 *     <div class="page-header-actions">…optional buttons…</div>
 *   </div>
 */
export const pageHeaderStyles = css`
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--jh-dimension-400, 2rem);
    padding: var(--jh-dimension-600, 3rem) var(--jh-dimension-600, 3rem) 0;
  }

  .page-header-text {
    min-width: 0;
  }

  .page-header-actions {
    display: flex;
    align-items: center;
    gap: var(--jh-dimension-200, 1rem);
    flex-shrink: 0;
  }

  /* Search that sits inline in the header, level with the title and any
     action buttons. Kept here so it stays consistent across pages. */
  .page-header-search {
    width: 260px;
  }

  .page-title {
    margin: 0 0 var(--jh-dimension-200, 1rem);
    font-size: var(--jh-font-size-500, 1.25rem);
    font-weight: var(--jh-font-weight-semibold, 600);
    color: var(--jh-color-content-primary-enabled);
  }

  .page-subtitle {
    margin: 0;
    font-size: var(--jh-font-size-100, 0.875rem);
    color: var(--jh-color-content-secondary-enabled);
  }
`
