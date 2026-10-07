-- =============================================================================
-- Dammas Express — Batch 2: route page content (routes table only)
-- =============================================================================
--
-- Run each PART separately in the Supabase SQL editor, in order.
--
-- What this touches (routes table only, no other table):
--   * 8 routes with no editorial content yet: content, pickup_zones,
--     dropoff_zones, faq, meta_title, meta_description. Each UPDATE only applies
--     while that route's content is still empty, so anything written in the
--     dashboard in the meantime is never overwritten.
--   * deira-to-al-quoz: two targeted fixes inside the existing content, plus
--     dropoff_zones, faq, meta_title, meta_description. The rest of the Deira
--     text is left exactly as it is.
--   * burjman--to-al-quoz: from_location spelling "Burjman" -> "BurJuman".
--     The slug is NOT changed by this script.
--
-- Not touched: price_one_way, price_return, duration, slug, sort_order,
-- is_active, and every other table.
--
-- Facts used (from existing site data and owner confirmation, 2026-10-07):
--   * Service runs Monday to Sunday; morning arrivals 7:00–10:00 AM, evening
--     returns 5:00–8:00 PM.
--   * Drop-off: Al Quoz Industrial Areas 1–4 on every route.
--   * Prices as already stored per route (AED 300 Deira side, AED 250 Bur
--     Dubai side); "Salik included" as already shown on every route page.
--   * "Sharaf DG" means the Sharaf DG landmark on Bank Street (Khalid Bin Al
--     Waleed Road), Bur Dubai.
--   * Pickup landmarks are well-known public places, described as places
--     pickup "can be arranged around" — never as official stops.


-- =============================================================================
-- PART 1 — PREVIEW (read-only)
-- =============================================================================

-- 1a. Current state of every route this script would touch.
select slug,
       from_location,
       price_one_way,
       duration,
       length(coalesce(content, ''))            as content_chars,
       pickup_zones,
       dropoff_zones,
       coalesce(json_array_length(faq::json), 0) as faq_count,
       meta_title,
       meta_description
from routes
order by sort_order, slug;

-- 1b. Which of the 8 new-content routes are still empty (only these get content).
select slug,
       case when coalesce(trim(content), '') = '' then 'WILL GET CONTENT'
            else 'SKIPPED - already has content' end as status
from routes
where slug in ('al-karama-to-al-quoz', 'bur-dubai-to-al-quoz', 'al-rigga-to-al-quoz',
               'abu-hail-to-al-quoz', 'al-muteena-to-al-quoz', 'al-baraha-to-al-quoz',
               'burjman--to-al-quoz', 'sharaf-dg-to-al-quoz');

-- 1c. The two Deira passages that PART 2 changes, before and after.
select substring(content from '[^.]{0,80}AED 250 to AED 300 per month[^.]{0,40}') as price_before,
       substring(
         regexp_replace(content,
           'ranging between\s*(<strong>|<b>)?\s*AED 250 to AED 300 per month',
           'of \1AED 300 per month', 'g')
         from '[^.]{0,80}AED 300 per month[^.]{0,40}')                           as price_after,
       substring(content from '<li>(?:[^<]|<(?!/li>))*Al Karama(?:\s|&amp;|&)+Bur Dubai links(?:[^<]|<(?!/li>))*</li>')
                                                                                 as list_item_to_remove
from routes
where slug = 'deira-to-al-quoz';

-- 1d. Deira FAQ as it is now — compare with the new set in PART 2.
select faq from routes where slug = 'deira-to-al-quoz';


-- =============================================================================
-- PART 2 — APPLY (atomic: all of it commits or none of it does)
-- =============================================================================
begin;

-- ---------------------------------------------------------------------------
-- Deira (targeted fixes only)
-- ---------------------------------------------------------------------------
update routes set
  content = regexp_replace(
              regexp_replace(content,
                -- The Deira price is AED 300, not a 250–300 range.
                'ranging between\s*(<strong>|<b>)?\s*AED 250 to AED 300 per month',
                'of \1AED 300 per month', 'g'),
              -- Al Karama and Bur Dubai are not Deira neighbourhoods; they have
              -- their own route pages. Removes only that one list item.
              '<li>(?:[^<]|<(?!/li>))*Al Karama(?:\s|&amp;|&)+Bur Dubai links(?:[^<]|<(?!/li>))*</li>',
              '', 'g'),
  dropoff_zones = 'Al Quoz Industrial Area 1, Al Quoz Industrial Area 2, Al Quoz Industrial Area 3, Al Quoz Industrial Area 4',
  meta_title = 'Deira to Al Quoz Car Lift, AED 300 a Month',
  meta_description = 'Shared monthly car lift from Deira to Al Quoz Industrial Areas 1–4. Pickup near Deira City Centre, Gold Souq Metro and Baniyas Square, 7 days a week.',
  -- Questions 2 and 3 are the existing answers, unchanged. Question 1 now
  -- states the Deira price. Questions 4–7 are new.
  faq = $j$[
    {"question": "How much does a monthly car lift from Deira to Al Quoz cost?",
     "answer": "The monthly pass from Deira to Al Quoz is AED 300, with Salik included."},
    {"question": "What are the exact timings for the morning and evening shifts?",
     "answer": "Our morning arrivals at Al Quoz operate from 7:00 AM to 10:00 AM, and our return evening shifts run from 5:00 PM to 8:00 PM to perfectly match factory and office shift conclusions."},
    {"question": "Are your vehicles legal and safe?",
     "answer": "Yes! Unlike illegal private car lifts, Dammas Express is a registered, RTA-compliant transport entity. All our Toyota HiAce and Coaster vehicles are heavily maintained, fully commercial-grade, and carry standard commercial passenger insurance."},
    {"question": "Does the Deira to Al Quoz car lift run on weekends?",
     "answer": "Yes. Trips run every day, Monday to Sunday, in the morning (7:00–10:00 AM) and evening (5:00–8:00 PM) windows."},
    {"question": "Where can I be picked up in Deira?",
     "answer": "Popular pickup points for commuters include Deira City Centre, Gold Souq Metro Station and Baniyas Square. Tell us your building when you book and we will confirm the most practical point for your seat."},
    {"question": "How far is Deira from Al Quoz?",
     "answer": "Roughly 20–23 km by road, depending on where you are picked up in Deira and which industrial area you work in. Travel time varies a lot with traffic on the Creek crossings; our Deira to Al Quoz travel guide, linked below, covers distance, timings and other ways to make the trip."},
    {"question": "Can my company arrange staff transport from Deira?",
     "answer": "Yes. Choose the corporate option on our booking form or message us on WhatsApp with the number of employees, their pickup areas in Deira and their shift times, and we will prepare a quote."}
  ]$j$
where slug = 'deira-to-al-quoz';

-- ---------------------------------------------------------------------------
-- Al Karama
-- ---------------------------------------------------------------------------
update routes set
  pickup_zones = 'ADCB Metro Station, Karama Shopping Complex',
  dropoff_zones = 'Al Quoz Industrial Area 1, Al Quoz Industrial Area 2, Al Quoz Industrial Area 3, Al Quoz Industrial Area 4',
  meta_title = 'Karama to Al Quoz Car Lift, AED 250 Monthly',
  meta_description = 'Monthly car lift from Al Karama to Al Quoz Industrial Areas 1–4 for AED 250, Salik included. Pickup near ADCB Metro, morning and evening trips, 7 days a week.',
  content = $c$
<h2>Getting from Karama to Al Quoz without the daily taxi bill</h2>
<p>Al Karama is one of the closest residential areas to Al Quoz, yet the trip is still awkward without a car. The Red Line from ADCB Metro Station runs south along Sheikh Zayed Road, while most workshops, warehouses and showrooms in Al Quoz Industrial Areas 1 to 4 sit well inland from the stations. A Metro commute usually ends with a feeder bus, a taxi or a long walk in the heat. By road the trip is roughly 15–17 km, depending on where you are picked up and which industrial area you work in.</p>
<p>Dammas Express runs a shared monthly car lift for exactly this journey. You keep a reserved seat, travel with the same group of commuters each day, and are dropped in your work area in Al Quoz rather than at the nearest station.</p>

<h2>Where pickup can be arranged in Karama</h2>
<p>Karama is compact and walkable, so most passengers meet the vehicle at a well-known point near home rather than at their building door. Pickup can be arranged around ADCB Metro Station and the Karama Shopping Complex area. When you message us, share your building or nearest landmark and we will tell you which point suits your seat. The final pickup point and time are confirmed when you book.</p>

<h2>Who uses the Karama route</h2>
<ul>
<li>Shop, showroom and warehouse staff starting morning shifts in Al Quoz</li>
<li>Office and administration staff at Al Quoz companies who want the same ride every day</li>
<li>Karama flat-sharers who would otherwise split taxi fares</li>
<li>Employers with several staff living in Karama who want them on one arrangement</li>
</ul>

<h2>Car lift, Metro, taxi or your own car?</h2>
<p>Each option has a trade-off. The Metro is the cheapest, but the last stretch into the industrial area is the hard part. A taxi is the most direct, but daily fares add up quickly over a working month. Driving means fuel, Salik and finding parking in Al Quoz. A car lift sits in between: a fixed monthly cost and a drop-off near your workplace, in exchange for travelling at set times in a shared vehicle.</p>

<h2>Timings and price</h2>
<p>Morning trips reach Al Quoz between 7:00 and 10:00 AM, and evening returns leave between 5:00 and 8:00 PM, Monday to Sunday. Your exact pickup time depends on your shift start and is fixed when your seat is confirmed. The Karama route costs AED 250 per month, with Salik included.</p>

<h2>Booking a seat</h2>
<p>Send us a WhatsApp message with your pickup area in Karama, your workplace area in Al Quoz and your shift times. We check seat availability, confirm your pickup point and time, and your monthly pass starts from the agreed date. Companies arranging transport for several employees can request a corporate quote through the booking form.</p>
$c$,
  faq = $j$[
    {"question": "Is there a car lift from Karama to Al Quoz?",
     "answer": "Yes. Dammas Express runs a shared monthly car lift from Al Karama to Al Quoz Industrial Areas 1 to 4, with morning and evening trips every day, Monday to Sunday."},
    {"question": "How far is Karama from Al Quoz?",
     "answer": "Roughly 15–17 km by road, depending on your pickup point and which industrial area you are going to. Travel time varies with traffic, especially in the morning peak."},
    {"question": "Where can I be picked up in Karama?",
     "answer": "Pickup can be arranged around ADCB Metro Station and the Karama Shopping Complex area. Tell us your building when you book and we will confirm the nearest practical point."},
    {"question": "How much is the monthly pass from Karama?",
     "answer": "AED 250 per month, with Salik included."},
    {"question": "Can my company book seats for several staff living in Karama?",
     "answer": "Yes. Use the corporate option on our booking form or message us on WhatsApp with the number of staff, their pickup areas and shift times, and we will prepare a quote."}
  ]$j$
where slug = 'al-karama-to-al-quoz' and coalesce(trim(content), '') = '';

-- ---------------------------------------------------------------------------
-- Bur Dubai
-- ---------------------------------------------------------------------------
update routes set
  pickup_zones = 'Al Fahidi Metro Station, Al Ghubaiba Metro and Bus Station, Meena Bazaar',
  dropoff_zones = 'Al Quoz Industrial Area 1, Al Quoz Industrial Area 2, Al Quoz Industrial Area 3, Al Quoz Industrial Area 4',
  meta_title = 'Bur Dubai to Al Quoz Car Lift, 7 Days a Week',
  meta_description = 'Skip the Metro line change: shared car lift from Bur Dubai (Al Fahidi, Al Ghubaiba, Meena Bazaar) to Al Quoz. AED 250 a month, Monday to Sunday.',
  content = $c$
<h2>A fixed daily ride from old Bur Dubai to Al Quoz</h2>
<p>The older streets of Bur Dubai, around Al Fahidi, Meena Bazaar and the Al Ghubaiba waterfront, are home to many people who work in Al Quoz. The area is well served by the Metro Green Line, but Al Quoz is reached from the Red Line. A public transport commute therefore means changing lines, then covering the last stretch from Sheikh Zayed Road into the industrial areas.</p>
<p>Our shared car lift replaces that chain of connections with one vehicle: a reserved seat from a pickup point in Bur Dubai to your work area in Al Quoz Industrial Areas 1 to 4, and back again in the evening.</p>

<h2>Pickup points commuters use in Bur Dubai</h2>
<p>Narrow lanes and limited stopping space in central Bur Dubai make door-to-door pickup impractical for a shared vehicle, so passengers gather at recognisable spots. Pickup can be arranged around Al Fahidi Metro Station, Al Ghubaiba Metro and Bus Station, and the Meena Bazaar area. If you live closer to BurJuman or Bank Street, those areas have their own route pages, linked below, which may be more convenient.</p>

<h2>Is a car lift better than the Metro from Bur Dubai?</h2>
<p>Not for everyone. If your workplace is close to a Red Line station and your hours change from day to day, the Metro may suit you better and costs less. A car lift makes sense when your workplace is deep inside the industrial area, your shift starts early, or you would rather not change lines and walk in the summer heat. It also avoids daily taxi fares, which add up quickly over a month.</p>

<h2>Typical passengers on this route</h2>
<p>Most riders have fixed daytime shifts: retail and showroom staff, warehouse and logistics workers, technicians and office staff. Many travel with colleagues from the same company, and some employers book several seats on one monthly arrangement.</p>

<h2>Timings, days and cost</h2>
<ul>
<li>Morning arrivals in Al Quoz: 7:00–10:00 AM</li>
<li>Evening returns: 5:00–8:00 PM</li>
<li>Days: Monday to Sunday</li>
<li>Monthly pass: AED 250, Salik included</li>
</ul>
<p>Your exact pickup time is set around your shift start when your seat is confirmed. If your shift hours change, message us and we will check what is possible on the route.</p>

<h2>How to book</h2>
<p>Message us on WhatsApp with your nearest landmark in Bur Dubai, where you work in Al Quoz and your shift hours. We confirm availability, your pickup point and your pickup time before your pass starts.</p>
$c$,
  faq = $j$[
    {"question": "Do you run a car lift from Bur Dubai to Al Quoz every day?",
     "answer": "Yes. The route runs Monday to Sunday, with morning arrivals in Al Quoz between 7:00 and 10:00 AM and evening returns between 5:00 and 8:00 PM."},
    {"question": "Which parts of Bur Dubai can I be picked up from?",
     "answer": "Pickup can be arranged around Al Fahidi Metro Station, Al Ghubaiba Metro and Bus Station and the Meena Bazaar area. BurJuman and the Bank Street (Sharaf DG) area have their own routes."},
    {"question": "What does the Bur Dubai to Al Quoz pass cost?",
     "answer": "AED 250 per month, with Salik included."},
    {"question": "Which part of Al Quoz do you drop off in?",
     "answer": "We serve Al Quoz Industrial Areas 1 to 4. Tell us where you work when you book and we will confirm your drop-off point."},
    {"question": "Is the service licensed?",
     "answer": "Yes. Dammas Express is licensed by the RTA for passenger transport, and trips run in commercial passenger vehicles rather than private cars."}
  ]$j$
where slug = 'bur-dubai-to-al-quoz' and coalesce(trim(content), '') = '';

-- ---------------------------------------------------------------------------
-- Al Rigga
-- ---------------------------------------------------------------------------
update routes set
  pickup_zones = 'Al Rigga Metro Station, Union Metro Station, Al Ghurair Centre',
  dropoff_zones = 'Al Quoz Industrial Area 1, Al Quoz Industrial Area 2, Al Quoz Industrial Area 3, Al Quoz Industrial Area 4',
  meta_title = 'Al Rigga to Al Quoz Monthly Car Lift Service',
  meta_description = 'Reserved seat from Al Rigga to Al Quoz Industrial Areas 1–4. Pickup around Al Rigga and Union Metro, AED 300 a month with Salik included, 7 days a week.',
  content = $c$
<h2>Al Rigga to Al Quoz: crossing the Creek every morning</h2>
<p>Al Rigga sits in the heart of Deira, a short walk from two Metro stations and some of the city's busiest streets. Getting to Al Quoz from here means crossing Dubai Creek and heading south through the morning peak. On public transport that usually involves at least one change, followed by a final leg from Sheikh Zayed Road into the industrial area.</p>
<p>With a monthly car lift you keep the same seat in a shared vehicle from Al Rigga to Al Quoz Industrial Areas 1 to 4, and you no longer have to plan connections every day.</p>

<h2>Pickup around Al Rigga</h2>
<p>Al Rigga's main roads are busy at peak times, so pickups are kept to easy, recognisable points. Pickup can be arranged around Al Rigga Metro Station, Union Metro Station and the Al Ghurair Centre area. Tell us your building when you book and we will confirm the pickup point and time that work for your seat.</p>

<h2>Why Rigga residents choose a car lift</h2>
<ul>
<li>No line change, and no walk from a station on Sheikh Zayed Road to your workplace</li>
<li>A predictable monthly cost instead of daily taxi fares</li>
<li>A reserved seat on fixed morning and evening trips</li>
<li>An air-conditioned commercial vehicle run by a licensed operator</li>
</ul>

<h2>Timing matters on this route</h2>
<p>The difference between an easy and a difficult commute from Rigga is mostly timing. Crossing the Creek before the heaviest traffic builds makes the whole trip smoother, which is why morning pickups are arranged around your shift start rather than one departure time for everyone.</p>

<h2>Schedule, price and booking</h2>
<p>Morning trips arrive in Al Quoz between 7:00 and 10:00 AM, and evening returns run between 5:00 and 8:00 PM, every day from Monday to Sunday. The Al Rigga route costs AED 300 per month, with Salik included. To book, send us your pickup area in Rigga, your workplace in Al Quoz and your shift hours on WhatsApp, and we will confirm availability before your pass starts.</p>

<h2>For companies with staff in Deira</h2>
<p>Many companies in Al Quoz have employees living in Al Rigga and neighbouring parts of Deira such as Al Muteena and Abu Hail. If you need to move a group of staff on the same shift, use the corporate option on our booking form and we will put together a quote based on headcount, pickup areas and timings.</p>
$c$,
  faq = $j$[
    {"question": "Is there a monthly car lift from Al Rigga to Al Quoz?",
     "answer": "Yes. Dammas Express runs a shared monthly car lift from Al Rigga to Al Quoz Industrial Areas 1 to 4, every day from Monday to Sunday."},
    {"question": "Can I be picked up near Al Rigga or Union Metro Station?",
     "answer": "Pickup can be arranged around both stations and the Al Ghurair Centre area. The exact point is confirmed when you book."},
    {"question": "How much does the car lift from Al Rigga cost?",
     "answer": "AED 300 per month, with Salik included."},
    {"question": "Does the Rigga route run on weekends?",
     "answer": "Yes. The service runs seven days a week, Monday to Sunday."},
    {"question": "What time do I need to be ready in the morning?",
     "answer": "It depends on your shift start. Morning trips arrive in Al Quoz between 7:00 and 10:00 AM, and we confirm your pickup time when your seat is booked."}
  ]$j$
where slug = 'al-rigga-to-al-quoz' and coalesce(trim(content), '') = '';

-- ---------------------------------------------------------------------------
-- Abu Hail
-- ---------------------------------------------------------------------------
update routes set
  pickup_zones = 'Abu Hail Metro Station, Abu Hail Centre',
  dropoff_zones = 'Al Quoz Industrial Area 1, Al Quoz Industrial Area 2, Al Quoz Industrial Area 3, Al Quoz Industrial Area 4',
  meta_title = 'Abu Hail to Al Quoz Car Lift & Staff Transport',
  meta_description = 'Car lift and staff transport from Abu Hail to Al Quoz Industrial Areas. Pickup around Abu Hail Metro Station, fixed morning and evening trips, AED 300 a month.',
  content = $c$
<h2>From Abu Hail to Al Quoz without the cross-city hassle</h2>
<p>Abu Hail is a quieter residential part of Deira, popular with families and long-term residents, but it is on the far side of the city from Al Quoz. A public transport commute typically starts on the Green Line at Abu Hail Metro Station, changes to the Red Line, and still leaves a final stretch from Sheikh Zayed Road into the industrial areas. That is a long trip to make twice a day.</p>
<p>Dammas Express offers a shared monthly car lift from Abu Hail to Al Quoz Industrial Areas 1 to 4, so you travel in one vehicle with a reserved seat instead of piecing the journey together.</p>

<h2>Pickup in Abu Hail</h2>
<p>Pickup can be arranged around Abu Hail Metro Station and the Abu Hail Centre area. Abu Hail borders Hor Al Anz and Al Muteena, so passengers from nearby streets can often join from the same point. Message us with your building and we will confirm the most practical pickup.</p>

<h2>What the monthly pass includes</h2>
<ul>
<li>A reserved seat on the Abu Hail route</li>
<li>Morning arrivals in Al Quoz between 7:00 and 10:00 AM, evening returns between 5:00 and 8:00 PM</li>
<li>Service every day, Monday to Sunday</li>
<li>AED 300 per month, with Salik included</li>
<li>Air-conditioned passenger vehicles from our Toyota HiAce and Coaster fleet</li>
</ul>

<h2>Travel time on a cross-city route</h2>
<p>Because the trip crosses Deira, the Creek and the city centre, traffic has a bigger effect here than on shorter routes. The travel time shown above is a typical estimate, not a guarantee, and morning pickups are timed around your shift start.</p>

<h2>Who the route suits</h2>
<p>The Abu Hail route is used mainly by people with regular daytime jobs in Al Quoz, including warehouse, factory and workshop staff, showroom teams and office employees, who would rather not spend part of their salary on taxis or several hours a week on connections. It is also used by employers who house staff in Abu Hail and need them at work at the same time each morning.</p>

<h2>How to book</h2>
<p>Send a WhatsApp message with your pickup area, your workplace in Al Quoz and your shift hours. We confirm seat availability, your pickup point and your pickup time before your first trip. For several employees, request a corporate quote through the booking form.</p>
$c$,
  faq = $j$[
    {"question": "Is there a car lift from Abu Hail to Al Quoz?",
     "answer": "Yes. Dammas Express runs a shared monthly car lift from Abu Hail to Al Quoz Industrial Areas 1 to 4, every day from Monday to Sunday."},
    {"question": "Where is the pickup in Abu Hail?",
     "answer": "Pickup can be arranged around Abu Hail Metro Station and the Abu Hail Centre area. If you live in nearby Hor Al Anz, ask us about joining from the closest point."},
    {"question": "How long does the trip take?",
     "answer": "It depends on traffic across Deira, the Creek crossings and the city centre. The travel time on this page is a typical estimate; your pickup time is confirmed around your shift start."},
    {"question": "What is the monthly price from Abu Hail?",
     "answer": "AED 300 per month, with Salik included."},
    {"question": "Can my company arrange transport for staff living in Abu Hail?",
     "answer": "Yes. Send us the number of employees, their pickup areas and shift times through the corporate option on our booking form or on WhatsApp, and we will prepare a quote."}
  ]$j$
where slug = 'abu-hail-to-al-quoz' and coalesce(trim(content), '') = '';

-- ---------------------------------------------------------------------------
-- Al Muteena
-- ---------------------------------------------------------------------------
update routes set
  pickup_zones = 'Salah Al Din Metro Station, Al Muteena Street',
  dropoff_zones = 'Al Quoz Industrial Area 1, Al Quoz Industrial Area 2, Al Quoz Industrial Area 3, Al Quoz Industrial Area 4',
  meta_title = 'Al Muteena to Al Quoz Shared Ride, AED 300',
  meta_description = 'Daily shared ride from Al Muteena to Al Quoz Industrial Areas 1–4. Pickup around Salah Al Din Metro and Al Muteena Street. AED 300 a month, Monday to Sunday.',
  content = $c$
<h2>Daily transport from Al Muteena to Al Quoz</h2>
<p>Al Muteena is one of Deira's busiest residential neighbourhoods, known for Al Muteena Street and its mix of apartments, restaurants and small businesses. For residents who work in Al Quoz, the commute runs almost the length of the city: across Deira, over the Creek and south to the industrial areas.</p>
<p>Our shared monthly car lift gives you a reserved seat from Al Muteena to Al Quoz Industrial Areas 1 to 4 on fixed morning and evening trips, so you are not relying on taxis or on several Metro and bus connections.</p>

<h2>Where to meet the vehicle</h2>
<p>Stopping on Al Muteena's main streets at rush hour is difficult, so pickups use simple meeting points. Pickup can be arranged around Salah Al Din Metro Station and along Al Muteena Street. When you book, share your building or nearest landmark and we will confirm the point and time.</p>

<h2>Is a monthly car lift worth it from Al Muteena?</h2>
<p>That depends on how you travel now. If you use taxis, a fixed monthly pass costs far less over a working month. If you use the Metro, the car lift costs more but removes the line change, the wait for a feeder bus and the walk to your workplace in Al Quoz. If you drive, you avoid fuel, Salik and the search for parking in the industrial area.</p>

<h2>Who rides from Al Muteena</h2>
<p>Riders are mostly people with set daytime hours in Al Quoz, such as warehouse and factory staff, technicians, showroom teams and office administrators, along with companies that house employees in this part of Deira.</p>

<h2>Timings and price</h2>
<p>Morning trips reach Al Quoz between 7:00 and 10:00 AM, and evening returns leave between 5:00 and 8:00 PM. The route runs Monday to Sunday and costs AED 300 per month, with Salik included.</p>

<h2>Booking your seat</h2>
<p>Message us on WhatsApp with your pickup area, your workplace in Al Quoz and your shift hours. We check availability, confirm your pickup point and time, and your pass starts from the agreed date. Companies with several staff in Al Muteena and neighbouring Al Baraha or Al Rigga can ask for a corporate quote.</p>
$c$,
  faq = $j$[
    {"question": "Do you have a car lift from Al Muteena to Al Quoz?",
     "answer": "Yes. Dammas Express runs a shared monthly car lift from Al Muteena to Al Quoz Industrial Areas 1 to 4."},
    {"question": "Can I be picked up near Salah Al Din Metro Station?",
     "answer": "Pickup can be arranged around Salah Al Din Metro Station and along Al Muteena Street. The exact point is confirmed when you book."},
    {"question": "What does the Al Muteena route cost?",
     "answer": "AED 300 per month, with Salik included."},
    {"question": "What are the morning and evening times?",
     "answer": "Morning trips arrive in Al Quoz between 7:00 and 10:00 AM, and evening returns run between 5:00 and 8:00 PM. Your pickup time is set around your shift start."},
    {"question": "Does the Al Muteena route run at weekends?",
     "answer": "Yes. The service runs every day of the week, Monday to Sunday."}
  ]$j$
where slug = 'al-muteena-to-al-quoz' and coalesce(trim(content), '') = '';

-- ---------------------------------------------------------------------------
-- Al Baraha
-- ---------------------------------------------------------------------------
update routes set
  pickup_zones = 'Al Baraha Hospital (Kuwait Hospital Dubai) area, Al Khaleej Road',
  dropoff_zones = 'Al Quoz Industrial Area 1, Al Quoz Industrial Area 2, Al Quoz Industrial Area 3, Al Quoz Industrial Area 4',
  meta_title = 'Al Baraha to Al Quoz Shift Car Lift',
  meta_description = 'Monthly transport from Al Baraha, Deira to Al Quoz Industrial Areas 1–4. Pickup near Al Baraha Hospital and Al Khaleej Road. AED 300, Salik included.',
  content = $c$
<h2>Al Baraha to Al Quoz, every morning and evening</h2>
<p>Al Baraha is a residential district in north Deira, close to the waterfront and Al Khaleej Road. It is a convenient place to live but a long way from Al Quoz. The journey crosses the Creek and much of the city, and the Metro stations nearest Al Baraha are on the Green Line, so a public transport commute to Al Quoz needs a line change and a final leg into the industrial area.</p>
<p>Our shared monthly car lift connects Al Baraha with Al Quoz Industrial Areas 1 to 4 in a single trip, with a seat reserved for you.</p>

<h2>Pickup in Al Baraha</h2>
<p>Pickup can be arranged around the Al Baraha Hospital area (now Kuwait Hospital Dubai) and along Al Khaleej Road. Both are easy for most residents to reach on foot and give the vehicle somewhere safe to stop. Share your building when you book and we will confirm the exact point and time.</p>

<h2>Who the route suits</h2>
<p>The route suits people with regular daytime work in Al Quoz, such as workshop, warehouse and factory staff, showroom teams and office employees, who want to stop paying for daily taxis or spending long hours on connections.</p>

<h2>Shift-friendly timings</h2>
<p>Morning trips arrive in Al Quoz between 7:00 and 10:00 AM, and evening returns run between 5:00 and 8:00 PM, every day from Monday to Sunday. Your pickup time is confirmed when your seat is booked, based on your shift start.</p>
<p>Because this is a long cross-city trip, traffic on the Creek crossings has the biggest effect on journey time. The travel time shown above is an estimate, and it can be longer on busy mornings.</p>

<h2>Price and what to expect</h2>
<p>The Al Baraha route costs AED 300 per month, with Salik included. You travel in an air-conditioned vehicle from our Toyota HiAce and Coaster fleet, operated by a licensed passenger transport company rather than a private car offering informal lifts.</p>

<h2>Booking and company transport</h2>
<p>To book, message us on WhatsApp with your pickup area in Al Baraha, your workplace in Al Quoz and your shift hours. Employers with several staff living in Al Baraha or nearby Al Muteena can request a corporate quote through the booking form.</p>
$c$,
  faq = $j$[
    {"question": "Is there transport from Al Baraha to Al Quoz?",
     "answer": "Yes. Dammas Express runs a shared monthly car lift from Al Baraha to Al Quoz Industrial Areas 1 to 4, with morning and evening trips."},
    {"question": "Where can I be picked up in Al Baraha?",
     "answer": "Pickup can be arranged around the Al Baraha Hospital (Kuwait Hospital Dubai) area and along Al Khaleej Road. We confirm the exact point when you book."},
    {"question": "How much is the monthly car lift from Al Baraha?",
     "answer": "AED 300 per month, with Salik included."},
    {"question": "Is the service available seven days a week?",
     "answer": "Yes. Trips run every day, Monday to Sunday."},
    {"question": "Can my company arrange staff transport from Al Baraha?",
     "answer": "Yes. Send us the number of employees, their pickup areas and shift times through the corporate option on our booking form or on WhatsApp, and we will prepare a quote."}
  ]$j$
where slug = 'al-baraha-to-al-quoz' and coalesce(trim(content), '') = '';

-- ---------------------------------------------------------------------------
-- BurJuman (slug unchanged: burjman--to-al-quoz)
-- ---------------------------------------------------------------------------
update routes set
  pickup_zones = 'BurJuman Metro Station, BurJuman Centre',
  dropoff_zones = 'Al Quoz Industrial Area 1, Al Quoz Industrial Area 2, Al Quoz Industrial Area 3, Al Quoz Industrial Area 4',
  meta_title = 'BurJuman to Al Quoz Car Lift, AED 250 a Month',
  meta_description = 'Car lift from BurJuman to Al Quoz for AED 250 a month. Pickup by BurJuman Metro and BurJuman Centre, drop-off in Al Quoz Industrial Areas, 7 days a week.',
  content = $c$
<h2>BurJuman to Al Quoz: when a car lift beats the Metro</h2>
<p>BurJuman is one of the best-connected spots in Bur Dubai. BurJuman Metro Station is an interchange between the Red and Green Lines, right beside BurJuman Centre, and for many journeys the Metro is a good option from here. The problem comes at the other end: most companies in Al Quoz Industrial Areas 1 to 4 are a long walk, a feeder bus or a taxi ride from the nearest Red Line station on Sheikh Zayed Road.</p>
<p>A shared monthly car lift takes you from BurJuman directly to your work area in Al Quoz, with a seat reserved for you on fixed morning and evening trips.</p>

<h2>Pickup around BurJuman</h2>
<p>Pickup can be arranged around BurJuman Metro Station and BurJuman Centre, which most people living in the surrounding streets can reach on foot. The exact meeting point and time are confirmed when you book. If you live closer to Al Fahidi or the Bank Street area, check the Bur Dubai and Sharaf DG routes as well.</p>

<h2>When is the Metro the better choice?</h2>
<p>If your office is a short walk from a Red Line station and your hours vary from day to day, the Metro will be cheaper and more flexible. If you work deep inside the industrial area, start early, or want to avoid the walk in summer, a reserved car lift seat is usually easier.</p>

<h2>Who uses this route</h2>
<p>Riders are mostly people with fixed daytime hours in Al Quoz: showroom and retail staff, warehouse teams, technicians and office workers. Some are new to Dubai and prefer a fixed arrangement to working out connections; others simply want to stop paying daily taxi fares.</p>

<h2>Timings, days and price</h2>
<ul>
<li>Morning arrivals in Al Quoz between 7:00 and 10:00 AM</li>
<li>Evening returns between 5:00 and 8:00 PM</li>
<li>Every day, Monday to Sunday</li>
<li>AED 250 per month, with Salik included</li>
</ul>

<h2>How to book</h2>
<p>Send us a WhatsApp message with your pickup area near BurJuman, your workplace in Al Quoz and your shift hours. We will confirm availability, your pickup point and your pickup time. Companies booking several employees can request a corporate quote through the booking form.</p>
$c$,
  faq = $j$[
    {"question": "Is there a car lift from BurJuman to Al Quoz?",
     "answer": "Yes. Dammas Express runs a shared monthly car lift from the BurJuman area to Al Quoz Industrial Areas 1 to 4, every day from Monday to Sunday."},
    {"question": "Where is the pickup near BurJuman?",
     "answer": "Pickup can be arranged around BurJuman Metro Station and BurJuman Centre. The exact meeting point is confirmed when you book."},
    {"question": "Why use a car lift if BurJuman has a Metro station?",
     "answer": "The Metro covers most of the distance, but most workplaces in the Al Quoz industrial areas are a long walk or a feeder bus from the nearest station. The car lift drops you in your work area."},
    {"question": "How much does the BurJuman route cost?",
     "answer": "AED 250 per month, with Salik included."},
    {"question": "What time are the morning and evening trips?",
     "answer": "Morning trips arrive in Al Quoz between 7:00 and 10:00 AM, and evening returns run between 5:00 and 8:00 PM."}
  ]$j$
where slug = 'burjman--to-al-quoz' and coalesce(trim(content), '') = '';

-- Display name only (H1, route cards, WhatsApp message). The slug is left as
-- it is; see the dashboard warning in the batch report before editing this
-- route in the dashboard.
update routes set from_location = 'BurJuman'
where slug = 'burjman--to-al-quoz' and from_location = 'Burjman';

-- ---------------------------------------------------------------------------
-- Sharaf DG (Bank Street, Bur Dubai)
-- ---------------------------------------------------------------------------
update routes set
  pickup_zones = 'Sharaf DG, Bank Street (Khalid Bin Al Waleed Road), Al Mankhool',
  dropoff_zones = 'Al Quoz Industrial Area 1, Al Quoz Industrial Area 2, Al Quoz Industrial Area 3, Al Quoz Industrial Area 4',
  meta_title = 'Sharaf DG (Bank Street) to Al Quoz Car Lift',
  meta_description = 'Shared car lift from the Sharaf DG / Bank Street area of Bur Dubai to Al Quoz. Pickup around Bank Street and Al Mankhool, AED 250 a month, 7 days a week.',
  content = $c$
<h2>Car lift from Sharaf DG, Bank Street to Al Quoz</h2>
<p>The Sharaf DG landmark on Khalid Bin Al Waleed Road, better known locally as Bank Street, is a familiar reference point for people living in Al Mankhool and the surrounding part of Bur Dubai. Many residents here work in Al Quoz. The area is close to the Metro, but the industrial areas are not: reaching most workplaces in Al Quoz Industrial Areas 1 to 4 still means a bus, a taxi or a long walk from the nearest Red Line station.</p>
<p>Dammas Express runs a shared monthly car lift from this part of Bur Dubai straight to your work area in Al Quoz, with a reserved seat on fixed morning and evening trips.</p>

<h2>Pickup on the Bank Street and Al Mankhool side</h2>
<p>Pickup can be arranged around the Sharaf DG landmark on Bank Street and in Al Mankhool. Bank Street is busy throughout the day, so the exact stopping point is agreed with you when you book, somewhere the vehicle can stop safely. Dammas Express is not affiliated with Sharaf DG; the name is used here only because it is a well-known local landmark.</p>

<h2>Sharaf DG, BurJuman or Bur Dubai route?</h2>
<p>These three pickup areas are close together. As a rough guide, choose this route if you live around Bank Street or Al Mankhool, the BurJuman route if you are nearer BurJuman Centre and its Metro station, and the Bur Dubai route if you live in the older area around Al Fahidi, Meena Bazaar or Al Ghubaiba. If you are unsure, send us your building name and we will tell you which pickup is closest.</p>

<h2>Who it suits</h2>
<p>The route is used mainly by people with fixed daytime shifts in Al Quoz, such as showroom, warehouse and workshop staff, technicians and office teams, and by employers who want several staff living in Bur Dubai on one arrangement.</p>

<h2>Timings and price</h2>
<p>Morning trips arrive in Al Quoz between 7:00 and 10:00 AM, and evening returns run between 5:00 and 8:00 PM, every day from Monday to Sunday. The monthly pass from this area costs AED 250, with Salik included.</p>

<h2>Book your seat</h2>
<p>Message us on WhatsApp with your pickup area, your workplace in Al Quoz and your shift hours, and we will confirm availability, your pickup point and your pickup time. Employers with several staff in Bur Dubai can request a corporate quote through the booking form.</p>
$c$,
  faq = $j$[
    {"question": "Where is the Sharaf DG pickup?",
     "answer": "Pickup can be arranged around the Sharaf DG landmark on Bank Street (Khalid Bin Al Waleed Road) and in Al Mankhool, Bur Dubai. The exact stopping point is confirmed when you book."},
    {"question": "Is Dammas Express part of Sharaf DG?",
     "answer": "No. Dammas Express is an independent passenger transport company; Sharaf DG is used only as a well-known landmark for the pickup area."},
    {"question": "Should I choose this route or the BurJuman route?",
     "answer": "Choose this route if you live around Bank Street or Al Mankhool, and the BurJuman route if you are closer to BurJuman Centre. Send us your building name if you are not sure."},
    {"question": "How much does it cost?",
     "answer": "AED 250 per month, with Salik included."},
    {"question": "Does it run on weekends?",
     "answer": "Yes. The service runs every day, Monday to Sunday."}
  ]$j$
where slug = 'sharaf-dg-to-al-quoz' and coalesce(trim(content), '') = '';

commit;


-- =============================================================================
-- PART 3 — VERIFY (read-only)
-- =============================================================================

-- 3a. Every route should now have content, pickup zones, drop-off zones, FAQs
--     and meta. Prices and durations should be exactly as in PART 1a.
select slug,
       from_location,
       price_one_way,
       duration,
       length(coalesce(content, ''))            as content_chars,
       pickup_zones,
       dropoff_zones,
       coalesce(json_array_length(faq::json), 0) as faq_count,
       meta_title,
       length(meta_description)                  as meta_description_chars
from routes
order by sort_order, slug;

-- 3b. Should return NO rows: outdated days, placeholders, the old Deira price
--     range, or the misplaced Deira list item.
select slug, 'problem found' as status
from routes
where concat_ws(' ', content, faq::text, pickup_zones, dropoff_zones, meta_title, meta_description)
      ~* '(Saturday|Friday|Mon\s*[–-]\s*Fri|Sat\s*[–-]\s*Thu|six days a week|\malpha\M|\mbeta\M|\mgamma\M|AED 250 to AED 300|Bur Dubai links)';
