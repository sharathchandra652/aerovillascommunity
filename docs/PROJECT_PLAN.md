# Aero Villas Community — Virtual Experience Website: Project Plan

A web platform where buyers can explore the Aero Villas community from anywhere:
walk around it in 360°, click on any villa on the layout, see its floor plan,
facing, size, price and availability, take an interior tour, and send an enquiry.

Reference for the kind of experience: https://zenvistas.spimproject.com/exterior.html
(built by SPIM Innovations on their WebVerse product). We build our own version
with our own layout, renders and branding — nothing is copied from that site.

---

## 1. What the finished site contains

| # | Page / module | What the buyer can do |
|---|---|---|
| 1 | **Home** | Hero render or drone video, project highlights, RERA number, "Start Virtual Tour" button |
| 2 | **360° Exterior Tour** | Drag to look around the community, zoom, jump between viewpoints (gate, clubhouse, park, streets) via hotspots, tap labels on amenities, day/night toggle |
| 3 | **Interactive Master Plan** | Our layout drawing with every villa/plot clickable, colour-coded Available / Booked / Sold; filters by villa type, facing, size, price |
| 4 | **Villa Detail** | Villa number, type, plot & built-up area, facing, price, status, 2D + 3D floor plans, gallery, "Take Interior Tour", "Enquire about this villa" |
| 5 | **360° Interior Tour** | Walk room to room inside each villa type |
| 6 | **Amenities** | Clubhouse, pool, gym, park, etc. with images and 360 hotspots |
| 7 | **Location** | Map with nearby schools, hospitals, offices, airport, travel times |
| 8 | **Gallery** | Renders, construction progress photos, videos |
| 9 | **Contact / Book Site Visit** | Form, WhatsApp, call button, Google Maps pin |
| 10 | **Admin panel** (staff only) | Update villa status/price, view and export leads |

---

## 2. What we need from you (asset checklist)

This is the most important part — development cannot finish without it.
Tick items off as you send them.

### A. Layout & drawings (from architect)
- [ ] Master plan / site layout — **PDF or DWG/CAD** (a high-res image works to start)
- [ ] List of all plots/villas with numbers matching the layout
- [ ] Floor plans for each villa type (ground, first, terrace), PDF or image
- [ ] Elevation drawings of each villa type
- [ ] Amenity / clubhouse drawings

### B. Villa data (from sales team) — one spreadsheet row per villa
| Villa No | Type | Plot area (sq.yd / sq.ft) | Built-up area | Facing | Road width | Price | Status | Corner? |
|---|---|---|---|---|---|---|---|---|
| A-01 | 4BHK East | 267 sq.yd | 3,200 sq.ft | East | 40 ft | ₹2.1 Cr | Available | Yes |

### C. Images & 3D
- [ ] Villa exterior renders (each type, front + angle views) — minimum 1920px wide, 4K preferred
- [ ] Aerial / bird's-eye render of the whole community
- [ ] Interior renders (living, kitchen, bedrooms)
- [ ] **360° panoramas** (see section 3 — if you don't have these, we need a 3D artist or drone shoot)
- [ ] Drone photos/video of the actual site (if construction has started)
- [ ] 3D model source files (3ds Max / SketchUp / Blender / Revit), if they exist

### D. Branding & text
- [ ] Logo (SVG or high-res PNG), brand colours, fonts if any
- [ ] Project description, USP points, brochure PDF
- [ ] Amenities list with short descriptions
- [ ] Specifications (structure, flooring, doors, electrical, etc.)
- [ ] RERA registration number, approvals (HMDA/DTCP etc.), legal disclaimer text

### E. Business details
- [ ] Site address + Google Maps pin
- [ ] Sales phone number, WhatsApp number, enquiry email
- [ ] Where leads should go (email, Google Sheet, or CRM like Zoho/HubSpot)
- [ ] Domain name (e.g. aerovillas.in) and who owns it

---

## 3. The 360° images — decide how we get them

The exterior tour needs **equirectangular 360° panoramas** (2:1 ratio, 8000×4000 px or more),
one per viewpoint. Typical count: 8–15 exterior viewpoints + 4–6 per villa type interior.

| Option | When to use | Rough cost / time |
|---|---|---|
| **A. CG renders from 3D model** (recommended if not yet built) | Project is pre-launch / under construction | 3D artist: model + ~20 panoramas, 4–8 weeks |
| **B. Drone + 360 camera shoot** | Site/model villa is built | 1–2 days shoot + 1 week editing |
| **C. Start with flat renders only** | Assets not ready; launch fast | Build tour later, site still goes live |

We can launch with **Option C** and plug 360s in later — the code is the same.

---

## 4. Technology

| Part | Choice | Why |
|---|---|---|
| Framework | **Next.js (React) + TypeScript** | Fast, SEO-friendly, one codebase for pages + API |
| Styling | **Tailwind CSS** | Quick responsive design |
| 360° viewer | **Pannellum** (free) or **Marzipano** (free, multi-res tiles) | Hotspots, scene links, mobile gyroscope |
| Master plan | **SVG overlay** on the layout image | Every villa = one clickable shape, colour by status |
| Maps | Google Maps or Mapbox | Location & nearby places |
| Database + admin auth | **Supabase** (Postgres) | Villa data, leads, staff login, no server to maintain |
| Images | Cloudflare / Vercel image CDN, WebP/AVIF | Large panoramas load fast |
| Hosting | **Vercel** | Free/cheap, auto-deploy from GitHub |
| Forms / leads | Supabase table + email notification (+ WhatsApp link) | Optional CRM sync later |
| Analytics | Google Analytics 4 / Meta Pixel | Track tour usage & leads |

### Data model (first version)
- `villa_types` — name, bedrooms, built-up area, floor plan images, interior tour id
- `villas` — number, type, plot area, facing, road width, price, status, corner, SVG shape id
- `tour_scenes` — panorama image, title, hotspots (position, target scene or info)
- `amenities` — name, description, images, hotspot scene
- `leads` — name, phone, email, villa of interest, message, source, created_at

---

## 5. Phased plan & timeline

Assumes assets arrive on time; 1–2 developers.

### Phase 0 — Collect & prepare (Week 1–2)
- Receive checklist items from section 2
- Trace master plan into SVG (each plot a clickable shape)
- Build villa spreadsheet → import to database
- Decide 360 option (A / B / C); brief 3D artist if needed

### Phase 1 — Foundation (Week 2–3)
- Next.js project setup, design system (colours, fonts, components), hosting on Vercel
- Home, Amenities, Gallery, Contact pages with real content
- Enquiry form → database + email alert, WhatsApp/call buttons

### Phase 2 — Interactive Master Plan (Week 3–5)
- Clickable SVG layout, status colours, hover tooltips, zoom/pan on mobile
- Filters: type, facing, size, price, availability
- Villa detail panel/page with floor plans, specs, "Enquire" pre-filled with villa number

### Phase 3 — 360° Tours (Week 5–7, or when panoramas are ready)
- Exterior tour: scenes, navigation hotspots, info hotspots on amenities, mini-map
- Link master plan ↔ tour (click villa in tour → detail; "view in 360" from detail)
- Interior tour per villa type; day/night toggle if renders provided
- Multi-resolution tiles for fast loading

### Phase 4 — Location, Admin & Launch (Week 7–8)
- Location map with nearby places & travel times
- Admin panel: login, edit villa status/price, view/export leads
- SEO (meta tags, sitemap, share previews), analytics, RERA disclaimers
- Testing on phones/tablets/desktop, speed optimisation, go live on domain

### Phase 5 — Later enhancements (optional)
- Guided auto-tour with voice-over, balcony/view-from-villa per plot
- CRM integration, brochure download gated by lead form
- Online booking with payment gateway
- Real-time 3D model in browser (three.js) / VR headset mode

**Total: ~8 weeks for a full launch**, or ~3–4 weeks for a first live version
(Phases 0–2) while 360 content is being produced.

---

## 6. Budget items to plan for (outside development)

- 3D modelling + renders + 360 panoramas (biggest cost if not already available)
- Drone shoot (if site exists)
- Domain (~₹1,000/yr) and hosting (Vercel/Supabase free tiers usually enough at start)
- Google Maps API (free tier covers typical traffic)
- Optional paid 360 engine (krpano licence) if advanced features are needed

---

## 7. Next steps

1. Send the **master plan** and **villa spreadsheet** (sections 2A and 2B) — this unblocks Phase 2.
2. Confirm which 360 option (A / B / C) we go with.
3. Share logo, colours and brochure so the design can start.
4. Confirm domain name and where leads should be delivered.

Once the layout and villa list arrive, development starts with the project setup
and the interactive master plan.
