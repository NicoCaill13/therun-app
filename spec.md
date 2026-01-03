# 🏃 THE RUN - ROADMAP CHRONOLOGIQUE FRONT-END (V3.1)

Document de référence pour l'implémentation (Web Next.js / Mobile Expo).

---

## 📅 PHASE 0 : LE SOCLE (Semaine 1)
*Objectif : Mise en place de l'usine logicielle et des contrats d'interface.*

### 0.1 Infrastructure & Unified Routing
- **Decision lock** : **Solito** est retenu comme source de vérité du routing (Next App Router ↔ Expo Router).
- **Deep Linking** : Setup des Universal Links (`https://the.run/join/[code]`) et du scheme (`the-run://`).
- Mapping : `/join/[code]` (Web) <-> `the-run://join/[code]` (Native).

### 0.2 Data & Error Layer (Normalisation)
- **Client API** : Instance Axios centralisée.
- **Normalisation des erreurs** (`normalizeApiError.ts`) :
  - `kind` : `PLAN_LIMIT` (403), `VALIDATION` (400), `UNAUTHORIZED` (401), `NOT_FOUND` (404), `NETWORK` (timeout/offline), `UNKNOWN` (fallback).
- **TanStack Query Defaults** :
  - `staleTime`: 5 min, `refetchOnWindowFocus`: false.
  - `retry`: (count, err) => err.kind !== 'UNAUTHORIZED' && count < 2.

### 0.3 Auth Storage & Rehydration
- **Persistance** : `SecureStore` (Native) / `Cookies` (Web).
- **Boot Sequence** : Logique de "rehydrate" au démarrage pour éviter le flash d'écran (DoD 6).

### 0.4 Design System Primitif
- Composants **NativeWind v4** : `Button`, `Input`, `Typography`, `Container`.
- Intégration d'un `UpsellModalProvider` (basé sur `error.kind === 'PLAN_LIMIT'`).

---

## 🚀 PHASE 1 : ORGANIZER CORE FLOW (MVP-1)
*Objectif : "Créer en 2 minutes" + Affichage instantané.*

### 1.1 Dashboard Accueil (Minimal)
- État vide (Empty State) avec bouton CTA unique : **"Créer une sortie"**.

### 1.2 Formulaire de Création (Wizard)
- `React Hook Form` + Zod.
- Gestion des erreurs via le normaliseur : déclenchement de la modale Upsell globale sur 403.

### 1.3 Écran Détail & Séquence de Cache
- **Séquence post-POST** : 
  1. `setQueryData(['events', id], created)`
  2. `Maps(/events/${id})` 
  3. `invalidateQueries(['events', id])` + `invalidateQueries(['events', 'mine'])`.

---

## 📲 PHASE 2 : PRESSURE TEST & GUEST FLOW (MVP-3 / MVP-6)
*Objectif : Check-in en < 30 secondes.*

### 2.1 Interface d'accès (Organisateur)
- Affichage du **QR Code** (encodant strictement l'URL universelle `https://the.run/join/[code]`).
- Affichage du **Code Court** (6 caractères).

### 2.2 Join Flow Mobile (App Native)
- Intégration `expo-camera` (Scan) et champ de saisie manuelle.

### 2.3 Landing Guest (Web Mobile / Next.js)
- **Séquence API** : `POST /auth/guest` -> `POST /events/join-by-code`.
- **Session** : JWT guest (24h) stocké en Cookie/SessionStorage pour éviter la perte de state au refresh.

---

## 🏃 PHASE 3 : STRUCTURE DE COURSE (MVP-4 / MVP-2)

### 3.1 Liste des Participants & Allures
- Utilisation de `FlashList` (60 FPS).
- Actions **Join/Leave** avec **Optimistic UI** (update immédiat du cache local).
- Sélection du groupe d'allure (S4.1.2).

### 3.2 Cartographie (Split Technique)
- **3.2.a Map Placeholder** : Affichage du point de RDV (Pin + zone de départ).
- **3.2.b Tracé GPX (Polyline)** : Parsing et affichage du tracé sur la carte.

---

## 📈 PHASE 4 : CYCLE DE VIE & HISTORIQUE (MVP-7)

### 4.1 Clôture & Status
- Action "Clôturer" (Organisateur) -> Passage en `status = COMPLETED` (Lecture seule).

### 4.2 Home v2 (Feed)
- Remplacement du CTA unique par un feed paginé (`useInfiniteQuery`).
- Tri : **Upcoming** (startDate ASC) / **Past** (startDate DESC).

---

## ✅ DEFINITION OF DONE (D.O.D) GÉNÉRALE

1. **Zod Validation** : Chaque réponse API est castée et validée.
2. **Error Normalization** : Aucun parsing Axios dans les écrans ; usage du `kind`.
3. **Instant Experience** : Usage de `setQueryData` post-création (pas de loader).
4. **Optimistic UI** : Participation (Join/Leave) perçue comme instantanée.
5. **Universal Routing** : Scan QR -> Web (si pas d'app) ou Deep Link (si app).
6. **Auth Rehydrate** : État de connexion restauré au boot sans flash UI incohérent.