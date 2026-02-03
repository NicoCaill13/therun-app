# MVP Gap Analysis (spec.md vs the-run-front)

Reference: `spec.md` (Roadmap V3.1). This doc lists what is **missing or incomplete** to consider the MVP done.

---

## Already done (no action)

- **Phase 0**: Socle (routing, error layer, auth rehydration, design system, UpsellModalProvider).
- **Phase 1**: Dashboard empty + CTA, Create form (RHF + Zod), Detail + setQueryData post-creation, navigate to event after create.
- **Phase 2**: QR + code court, Scan + saisie manuelle, Guest join flow (API + UI). Landing Guest **Web** (Next.js) is out of scope for this Expo app.
- **Phase 3**: Liste participants (filters, groups), Join/Leave with Optimistic UI (participants hooks), PaceGroupSelector, Map placeholder (pin + open external map).
- **Phase 4**: Clôture (Complete event), Home v2 feed (useMyEventsInfinite, tabs Upcoming/Past).
- **DoD**: Zod, error normalization, instant experience, optimistic participation, deep linking, auth rehydrate.

---

## Gaps to close for MVP

### 1. Phase 3.1 – FlashList for participants (spec: “60 FPS”) — DONE

**Spec:** “Utilisation de **FlashList** (60 FPS).”

**Done:** `@shopify/flash-list` added; `app/event/participants/[eventId].tsx` uses `FlashList` for the main participants list with `estimatedItemSize={64}`. Filter tabs remain `FlatList` (horizontal, small dataset).

---

### 2. Phase 3.2.b – Tracé GPX / polyline on map (spec: “Parsing et affichage du tracé sur la carte”) — DONE

**Spec:** “**3.2.b Tracé GPX (Polyline)** : Parsing et affichage du tracé sur la carte.”

**Done:** `react-native-maps` added. `EventMapView` component (`components/map/EventMapView.tsx`) renders `MapView` with `Polyline` (decoded from route `encodedPolyline`) and `Marker` (event location) when a route with polyline exists and platform is native; otherwise falls back to `EventMapPlaceholder` (external map). Event detail screen uses `EventMapView` with first route; route name badge remains over the map.

---

### 3. Phase 2.3 – JWT guest persistence (spec: “JWT guest (24h) stocké”)

**Spec:** “**Session** : JWT guest (24h) stocké en Cookie/SessionStorage pour éviter la perte de state au refresh.”

**Current:** `GuestJoinResponse` has `eventId`, `participantId`, `userId`, `isGuest` (no `token`). Auth uses `signInAsGuest(token, guestId)` with a constructed string; token is stored via `signIn()` → `setAuthToken()`.

**Action:** Align with backend:
- If backend will return a JWT in guest-join (or a dedicated `POST /auth/guest`): add `token` to `GuestJoinResponseSchema` (or to auth response), then in the join success handler call `setAuthToken(response.token)` (and keep `signInAsGuest` using that token). No change to storage layer (SecureStore / localStorage already used).
- If backend does not expose a guest JWT yet: document as “Guest JWT persistence when API provides it” and leave current behavior.

---

### 4. Test coverage threshold (optional)

**Current:** `npm run test:coverage` fails on **functions** threshold: 67.93% (required 70%).

**Action:** Add a few targeted tests (e.g. event detail branches, create flow) or temporarily lower the functions threshold in Jest config until coverage is increased.

---

## Summary

| Item                         | Priority for MVP | Effort |
|-----------------------------|------------------|--------|
| FlashList (participants)    | High (explicit in spec) | Low  |
| Map + polyline (GPX)       | Medium (nice-to-have)   | Medium |
| Guest JWT from API         | Backend-driven          | Low once API ready |
| Coverage ≥ 70% (functions) | Optional                | Low–Medium |

**Minimal set to “close MVP” from a front perspective:**  
(1) Swap participants list to **FlashList**.  
(2) Optionally document or implement **guest JWT** when the API contract is defined.  
(3) Either implement **map + polyline** or clearly mark it as post-MVP.

Landing Guest **Web** (Next.js) and **Solito** are not in scope for this Expo-only repo.
