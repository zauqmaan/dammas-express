// Internal-link map between the route pages and the blog guides that cover the
// same trip. Route pages are the commercial pages (price, pickup, booking);
// the guides are informational (distance, Metro vs car lift, travel tips).
// Linking them both ways tells Google which page answers which intent, instead
// of leaving two similar pages to compete for the same searches.
//
// Slugs only — names and titles are read from Supabase at render time, and a
// link is rendered only when its target is active/published, so deactivating a
// route or unpublishing a post can never leave a broken link behind.

interface RouteLinks {
  /** Geographically adjacent routes, for commuters on the boundary between two pickup areas. */
  nearby: string[]
  /** The blog guide covering this trip, if one exists. */
  guide?: string
}

export const ROUTE_LINKS: Record<string, RouteLinks> = {
  // Deira side of the Creek
  'deira-to-al-quoz': {
    nearby: ['al-rigga-to-al-quoz', 'al-baraha-to-al-quoz', 'al-muteena-to-al-quoz'],
    guide: 'deira-to-al-quoz-transport',
  },
  'al-rigga-to-al-quoz': {
    nearby: ['deira-to-al-quoz', 'al-muteena-to-al-quoz', 'abu-hail-to-al-quoz'],
    guide: 'al-rigga-to-al-quoz-car-lift-commuter-guide',
  },
  'abu-hail-to-al-quoz': {
    nearby: ['al-muteena-to-al-quoz', 'al-rigga-to-al-quoz'],
    guide: 'abu-hail-to-al-quoz-car-lift-commuter-guide',
  },
  'al-muteena-to-al-quoz': {
    nearby: ['al-baraha-to-al-quoz', 'al-rigga-to-al-quoz', 'abu-hail-to-al-quoz'],
    guide: 'al-muteena-al-baraha-to-al-quoz-car-lift-commuter-guide',
  },
  'al-baraha-to-al-quoz': {
    nearby: ['al-muteena-to-al-quoz', 'deira-to-al-quoz'],
    guide: 'al-muteena-al-baraha-to-al-quoz-car-lift-commuter-guide',
  },

  // Bur Dubai side of the Creek
  'bur-dubai-to-al-quoz': {
    nearby: ['burjman--to-al-quoz', 'sharaf-dg-to-al-quoz', 'al-karama-to-al-quoz'],
    guide: 'bur-dubai-karama-al-quoz',
  },
  'al-karama-to-al-quoz': {
    nearby: ['bur-dubai-to-al-quoz', 'burjman--to-al-quoz', 'sharaf-dg-to-al-quoz'],
    guide: 'bur-dubai-karama-al-quoz',
  },
  'burjman--to-al-quoz': {
    nearby: ['sharaf-dg-to-al-quoz', 'bur-dubai-to-al-quoz', 'al-karama-to-al-quoz'],
    guide: 'burjman-to-al-quoz-car-lift-commuter-guide',
  },
  'sharaf-dg-to-al-quoz': {
    nearby: ['burjman--to-al-quoz', 'bur-dubai-to-al-quoz', 'al-karama-to-al-quoz'],
    guide: 'sharaf-dg-to-al-quoz-car-lift-commuter-guide',
  },
}

/** Route slugs whose guide is the given blog post — the reverse of `guide` above. */
export function routesForGuide(postSlug: string): string[] {
  return Object.entries(ROUTE_LINKS)
    .filter(([, links]) => links.guide === postSlug)
    .map(([routeSlug]) => routeSlug)
}
