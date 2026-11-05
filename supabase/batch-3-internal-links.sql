-- =============================================================================
-- Dammas Express — Batch 3: blog internal links (blog_posts table only)
-- =============================================================================
--
-- Run each PART separately in the Supabase SQL editor, in order.
--
-- What this touches: blog_posts.content and blog_posts.updated_at only.
--   * Unwraps WhatsApp links that were pasted as Google search links
--     (https://www.google.com/search?q=https://wa.me/...).
--   * Adds one short contextual paragraph to 17 posts, linking each guide to
--     its route page and each general post to /routes, /services or /booking.
--     Each paragraph is inserted just before a named section heading, only
--     when that heading is found and the link is not already in the post, so
--     re-running PART 2 never duplicates anything.
--
-- Not touched: title, slug, excerpt, category, is_published, image_url, the
-- routes table, and every other table.
--
-- Facts used are only those already on the site: service Monday to Sunday,
-- drop-off in Al Quoz Industrial Areas 1–4, Hor Al Anz residents join the Abu
-- Hail route (as the Abu Hail route page states). No prices are added.


-- =============================================================================
-- PART 1 — PREVIEW (read-only)
-- =============================================================================

-- 1a. Overview of every published post.
select slug,
       title,
       length(excerpt)                                                            as excerpt_chars,
       (select count(*) from regexp_matches(content, 'href="/routes', 'g'))       as route_links,
       (select count(*) from regexp_matches(content, 'google\.com/search', 'gi')) as google_wrapped_links
from blog_posts
where is_published
order by slug;

-- 1b. Every link inside every post body (exact href + anchor text).
--     Rows flagged EXTERNAL point somewhere other than wa.me / dammasexpress.ae.
select p.slug,
       m[1]                                    as href,
       regexp_replace(m[2], '<[^>]+>', '', 'g') as anchor_text,
       case when m[1] ~* '^https?://' and m[1] !~* '^https?://(wa\.me|(www\.)?dammasexpress\.ae)'
            then 'EXTERNAL' else '' end        as flag
from blog_posts p,
     regexp_matches(p.content, '<a\s[^>]*href="([^"]*)"[^>]*>((?:[^<]|<(?!/a>))*)</a>', 'gi') as m
where p.is_published
order by p.slug;

-- 1c. Check each planned insertion.
--     Expected for every row: post_found = true, heading_matches = 1,
--     link_already_present = false. A row with heading_matches = 0 is skipped
--     by PART 2 (nothing breaks) — the heading wording needs checking.
with ins(slug, heading, guard_href) as (values
  ('deira-to-al-quoz-transport',                                 'Upgrade Your Daily Commute',                              '/routes/deira-to-al-quoz'),
  ('al-rigga-to-al-quoz-car-lift-commuter-guide',                'Secure Your Seat with Dammas Express',                    '/routes/al-rigga-to-al-quoz'),
  ('abu-hail-to-al-quoz-car-lift-commuter-guide',                'Book Your Seat with Dammas Express',                      '/routes/abu-hail-to-al-quoz'),
  ('al-muteena-al-baraha-to-al-quoz-car-lift-commuter-guide',    'Secure Your Seat with Dammas Express Today',              '/routes/al-muteena-to-al-quoz'),
  ('bur-dubai-karama-al-quoz',                                   'Upgrade Your Daily Journey with Dammas Express',          '/routes/bur-dubai-to-al-quoz'),
  ('burjman-to-al-quoz-car-lift-commuter-guide',                 'Secure Your Seat with Dammas Express Today',              '/routes/burjman--to-al-quoz'),
  ('sharaf-dg-to-al-quoz-car-lift-commuter-guide',               'Secure Your Seat with Dammas Express Today',              '/routes/sharaf-dg-to-al-quoz'),
  ('hor-al-anz-to-al-quoz-car-lift-commuter-guide',              'Secure Your Seat with Dammas Express Today',              '/routes/abu-hail-to-al-quoz'),
  ('al-quoz-car-lift-services',                                  'Make the Smart Switch Today',                             '/routes'),
  ('best-car-lift-service-dubai',                                'Fixed Shift Timings and Optimized Routes',                '/routes'),
  ('how-much-can-you-save-with-a-monthly-car-lift-pass-dubai',   'Safe, Legal, and 100% RTA Compliant',                     '/routes'),
  ('surviving-summer-heat-dubai-metro-to-al-quoz-commute',       'Transparent Monthly Pricing',                             '/routes'),
  ('dubai-back-to-school-traffic-august-2026-al-quoz-commute',   'Secure Your September Seat Today',                        '/routes'),
  ('private-carpool-fines-dubai-rta-regulations-dammas-express', 'Transparent Monthly Rates with Complete Peace of Mind',   '/services'),
  ('shared-vs-dedicated-monthly-car-lift-dubai',                 'Your Commute with Dammas Express',                        '/services'),
  ('planning-staff-transportation-multiple-shifts-dubai',        'The Broader Impact on Your Business',                     '/booking'),
  ('al-quoz-corporate-staff-pick-and-drop-services',             'Partner with Dammas Express for Your Business Transport', '/booking')
)
select i.slug,
       p.id is not null                                                           as post_found,
       p.is_published,
       (select count(*) from regexp_matches(p.content,
          '<h2[^>]*>(?:\s|<[^>]+>)*' || i.heading, 'gi'))                         as heading_matches,
       position(('href="' || i.guard_href || '"') in coalesce(p.content, '')) > 0 as link_already_present
from ins i
left join blog_posts p on p.slug = i.slug
order by i.slug;


-- =============================================================================
-- PART 2 — APPLY (atomic: all of it commits or none of it does)
-- =============================================================================
begin;

-- 2a. Unwrap WhatsApp links pasted as Google search links, plain and URL-encoded.
update blog_posts
set content = regexp_replace(
                regexp_replace(content,
                  $r$https?://(?:www\.)?google\.com/search\?q=(https?://wa\.me/[^"'\s<&]+)$r$,
                  '\1', 'gi'),
                $r$https?://(?:www\.)?google\.com/search\?q=https%3A%2F%2Fwa\.me%2F([0-9]+)$r$,
                'https://wa.me/\1', 'gi'),
    updated_at = now()
where content ~* 'google\.com/search\?q=(https?://|https%3A%2F%2F)wa\.me';

-- 2b. One contextual paragraph per post, before the first matching heading.
with ins(slug, heading, guard_href, para) as (values
  ('deira-to-al-quoz-transport', 'Upgrade Your Daily Commute', '/routes/deira-to-al-quoz',
   $p$<p>If a monthly pass sounds like the right fit, our <a href="/routes/deira-to-al-quoz">Deira to Al Quoz car lift service</a> page lists the pickup points, the monthly price and how to book a seat on this route.</p>$p$),

  ('al-rigga-to-al-quoz-car-lift-commuter-guide', 'Secure Your Seat with Dammas Express', '/routes/al-rigga-to-al-quoz',
   $p$<p>Pickup points, the current price and answers to common questions are on the page for our <a href="/routes/al-rigga-to-al-quoz">monthly car lift from Al Rigga</a>.</p>$p$),

  ('abu-hail-to-al-quoz-car-lift-commuter-guide', 'Book Your Seat with Dammas Express', '/routes/abu-hail-to-al-quoz',
   $p$<p>For pickup points around Abu Hail, the monthly price and booking steps, see the <a href="/routes/abu-hail-to-al-quoz">Abu Hail route details</a>.</p>$p$),

  ('al-muteena-al-baraha-to-al-quoz-car-lift-commuter-guide', 'Secure Your Seat with Dammas Express Today', '/routes/al-muteena-to-al-quoz',
   $p$<p>Pickup points and prices are listed separately for <a href="/routes/al-muteena-to-al-quoz">our Al Muteena route</a> and <a href="/routes/al-baraha-to-al-quoz">the Al Baraha car lift</a>, so you can check the one closest to home.</p>$p$),

  ('bur-dubai-karama-al-quoz', 'Upgrade Your Daily Journey with Dammas Express', '/routes/bur-dubai-to-al-quoz',
   $p$<p>Each area has its own page with pickup points and booking details: <a href="/routes/bur-dubai-to-al-quoz">Bur Dubai to Al Quoz transport</a> and <a href="/routes/al-karama-to-al-quoz">the Karama route</a>.</p>$p$),

  ('burjman-to-al-quoz-car-lift-commuter-guide', 'Secure Your Seat with Dammas Express Today', '/routes/burjman--to-al-quoz',
   $p$<p>Pickup points near BurJuman, the monthly price and booking details are on our <a href="/routes/burjman--to-al-quoz">BurJuman to Al Quoz car lift</a> page.</p>$p$),

  ('sharaf-dg-to-al-quoz-car-lift-commuter-guide', 'Secure Your Seat with Dammas Express Today', '/routes/sharaf-dg-to-al-quoz',
   $p$<p>For the pickup area around Bank Street and Al Mankhool, the price and how to book, see our <a href="/routes/sharaf-dg-to-al-quoz">Sharaf DG (Bank Street) route</a>.</p>$p$),

  ('hor-al-anz-to-al-quoz-car-lift-commuter-guide', 'Secure Your Seat with Dammas Express Today', '/routes/abu-hail-to-al-quoz',
   $p$<p>There is no separate Hor Al Anz route. Residents usually join our <a href="/routes/abu-hail-to-al-quoz">Abu Hail to Al Quoz car lift</a> from the closest pickup point. Send us your building name and we will confirm where to meet the vehicle.</p>$p$),

  ('al-quoz-car-lift-services', 'Make the Smart Switch Today', '/routes',
   $p$<p>You can see <a href="/routes">all nine pickup routes and their monthly prices</a> on one page before you get in touch.</p>$p$),

  ('best-car-lift-service-dubai', 'Fixed Shift Timings and Optimized Routes', '/routes',
   $p$<p>You can <a href="/routes">compare each route's price and pickup points</a> on our routes page.</p>$p$),

  ('how-much-can-you-save-with-a-monthly-car-lift-pass-dubai', 'Safe, Legal, and 100% RTA Compliant', '/routes',
   $p$<p>To check the <a href="/routes">monthly price for your area</a>, see our list of pickup routes.</p>$p$),

  ('surviving-summer-heat-dubai-metro-to-al-quoz-commute', 'Transparent Monthly Pricing', '/routes',
   $p$<p>See the <a href="/routes">routes that drop off inside Al Quoz Industrial Areas 1–4</a>, with the pickup areas and price for each.</p>$p$),

  ('dubai-back-to-school-traffic-august-2026-al-quoz-commute', 'Secure Your September Seat Today', '/routes',
   $p$<p>Check the <a href="/routes">pickup areas we serve</a> and the monthly price for each.</p>$p$),

  ('private-carpool-fines-dubai-rta-regulations-dammas-express', 'Transparent Monthly Rates with Complete Peace of Mind', '/services',
   $p$<p>Dammas Express provides <a href="/services">licensed car lift and staff transport services</a> to Al Quoz in commercial passenger vehicles.</p>$p$),

  ('shared-vs-dedicated-monthly-car-lift-dubai', 'Your Commute with Dammas Express', '/services',
   $p$<p>Read more about our <a href="/services">shared car lift and staff transport options</a>.</p>$p$),

  ('planning-staff-transportation-multiple-shifts-dubai', 'The Broader Impact on Your Business', '/booking',
   $p$<p>If you are planning transport for a team, you can <a href="/booking">request a corporate transport quote</a> with your headcount, pickup areas and shift times.</p>$p$),

  ('al-quoz-corporate-staff-pick-and-drop-services', 'Partner with Dammas Express for Your Business Transport', '/booking',
   $p$<p>To get pricing for your team, fill in our <a href="/booking">company transport quote form</a> with your headcount, pickup areas and shift times.</p>$p$)
)
update blog_posts p
set content    = regexp_replace(p.content,
                   '(<h2[^>]*>(?:\s|<[^>]+>)*' || i.heading || ')',
                   i.para || '\1', 'i'),
    updated_at = now()
from ins i
where p.slug = i.slug
  and p.content ~* ('<h2[^>]*>(?:\s|<[^>]+>)*' || i.heading)
  and position(('href="' || i.guard_href || '"') in p.content) = 0
returning p.slug;

commit;


-- =============================================================================
-- PART 3 — VERIFY (read-only)
-- =============================================================================

-- 3a. Should return NO rows: Google-wrapped links left behind.
select slug from blog_posts where content ~* 'google\.com/search';

-- 3b. Internal links per post after the change.
select slug,
       (select count(*) from regexp_matches(content, 'href="/routes/[^"]+"', 'g')) as route_page_links,
       (select count(*) from regexp_matches(content, 'href="/routes"', 'g'))       as routes_index_links,
       (select count(*) from regexp_matches(content, 'href="/services"', 'g'))     as services_links,
       (select count(*) from regexp_matches(content, 'href="/booking"', 'g'))      as booking_links
from blog_posts
where is_published
order by slug;

-- 3c. Should return NO rows: a post body linking to a missing or inactive route.
select p.slug as post, m[1] as broken_href
from blog_posts p,
     regexp_matches(p.content, 'href="/routes/([^"#?]+)"', 'g') as m
where p.is_published
  and not exists (select 1 from routes r where r.slug = m[1] and r.is_active);

-- 3d. Should return NO rows: outdated day wording or placeholder text.
select slug, 'problem found' as status
from blog_posts
where is_published
  and concat_ws(' ', title, excerpt, content)
      ~* '(Mon\s*[–-]\s*Fri|Monday to Friday|Sat\s*[–-]\s*Thu|Saturday to Thursday|closed on Fridays?|Fridays? off|\malpha\M|\mbeta\M|\mgamma\M)';


-- =============================================================================
-- PART 4 — FOLLOW-UP for the 3 posts PART 2 skipped
-- =============================================================================
-- Their stored headings are numbered ("3. Fixed Shift Timings…"), and the
-- summer-heat post's pricing heading is not an H2, so PART 2's patterns found
-- nothing. Same guards as PART 2: first match only, skipped if already linked.
begin;

with ins(slug, heading, guard_href, para) as (values
  ('best-car-lift-service-dubai', 'Fixed Shift Timings and Optimized Routes', '/routes',
   $p$<p>You can <a href="/routes">compare each route's price and pickup points</a> on our routes page.</p>$p$),

  ('private-carpool-fines-dubai-rta-regulations-dammas-express', 'Transparent Monthly Rates with Complete Peace of Mind', '/services',
   $p$<p>Dammas Express provides <a href="/services">licensed car lift and staff transport services</a> to Al Quoz in commercial passenger vehicles.</p>$p$),

  ('surviving-summer-heat-dubai-metro-to-al-quoz-commute', 'Fixed Shift Timings Tailored for Working Hours', '/routes',
   $p$<p>See the <a href="/routes">routes that drop off inside Al Quoz Industrial Areas 1–4</a>, with the pickup areas and price for each.</p>$p$)
)
update blog_posts p
set content    = regexp_replace(p.content,
                   '(<h2[^>]*>(?:\s|<[^>]+>)*(?:\d+\.\s*)?' || i.heading || ')',
                   i.para || '\1', 'i'),
    updated_at = now()
from ins i
where p.slug = i.slug
  and p.content ~* ('<h2[^>]*>(?:\s|<[^>]+>)*(?:\d+\.\s*)?' || i.heading)
  and position(('href="' || i.guard_href || '"') in p.content) = 0
returning p.slug;

commit;
