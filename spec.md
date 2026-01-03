# 🏃 PROJET : THE RUN - ROADMAP FRONT-END (WEB & MOBILE)

Ce document définit l'architecture technique, les choix technologiques et le découpage industriel des travaux pour les interfaces Web (Next.js) et Mobile (Expo).

---

## 🏗️ 1. ARCHITECTURE & STANDARDS TECHNIQUES

### 1.1 Core Stack
- **Monorepo** : `TurboRepo` (orchestration des builds et partage des types entre Back et Front).
- **Architecture de Navigation** : `Solito` (Unification de `next/router` et `react-navigation`).
- **Styling** : `NativeWind v4` (Tailwind CSS pour React Native). **Règle : 0 fichier .css, 0 StyleSheet.create.**
- **Data Fetching** : `TanStack Query v5` (Hooks `useQuery` et `useMutation` obligatoires).

### 1.2 Data Access Layer (Intransigeance Qualité)
- **Validation Runtime** : `Zod` pour valider chaque payload entrant de l'API.
- **Client HTTP** : `Axios` avec intercepteurs pour la gestion automatique du cycle de vie du JWT (Refresh/Injection).
- **Type Safety** : Utilisation des types générés du backend (D.T.O) via le workspace `packages/api`.

---

## 📈 2. DÉCOUPAGE DES EPICS (ROADMAP MVP)

### EPIC 0 : Fondations & Core Architecture
*Objectif : Initialiser l'usine logicielle et le contrat d'interface.*

- **T0.1 : Setup TurboRepo & Workspaces**
  - Configurer `apps/web` (Next.js), `apps/mobile` (Expo), `packages/app` (Code partagé), `packages/ui` (Design System).
- **T0.2 : Provider & Client API**
  - Configurer l'instance Axios globale avec intercepteurs.
  - Setup du `QueryClientProvider` pour TanStack Query.
- **T0.3 : Design System Primitif (UI-Kit)**
  - Implémenter les composants fondamentaux : `<Button>`, `<Input>`, `<Typography>`, `<Card>`, `<Avatar>`.
  - Intégrer les variantes de thèmes (Dark/Light) via NativeWind.
- **T0.4 : Auth Logic (Zustand)**
  - Créer le store d'authentification.
  - Gestion du stockage sécurisé (`expo-secure-store` pour mobile / `cookies-next` pour web).

---

### EPIC 1 : Discovery & Event Details (MVP-1 / MVP-4)
*Objectif : Affichage des données et consultation des sorties.*

- **T1.1 : Feed des événements (Home)**
  - Implémenter `useInfiniteQuery` pour la liste des sorties.
  - Créer le composant `<EventCard>` (Responsive : 1 colonne mobile / Grid web).
- **T1.2 : Fiche Détail Événement**
  - Routing dynamique : `[id]`.
  - Header d'événement (Date, Heure, Lieu, Organisateur).
  - Intégration de la Map (Lecture seule) : MapKit/Google Maps natif vs Google JS API sur Web.
- **T1.3 : Liste des Participants (MVP-4)**
  - Sectionner l'affichage par rôle (Organisateur, Encadrant, Participant).
  - Implémenter le compteur de participants en temps réel.

---

### EPIC 2 : Check-in & RSVP (MVP-3 / MVP-6)
*Objectif : Le flux critique du "Pressure Test" (Inscription rapide).*

- **T2.1 : Logique RSVP (Join/Leave)**
  - Créer les mutations `useJoinEvent` et `useLeaveEvent`.
  - Implémenter les **Mises à jour Optimistes** (UI mise à jour avant retour serveur).
- **T2.2 : Scan QR Code & Saisie Code Court**
  - Intégration `expo-camera` pour le scan mobile.
  - Champ de saisie "Code Court" (S3.3.1) avec validation auto après 6 caractères.
- **T2.3 : Flux Guest (Web Mobile)**
  - Développer la landing page ultra-légère pour les utilisateurs sans compte (S6.1.1).
  - Gestion de l'anonymisation / création de compte temporaire.

---

### EPIC 3 : Création & Management (MVP-1 / MVP-2)
*Objectif : Outiller l'organisateur pour la création de contenu.*

- **T3.1 : Wizard de création d'événement**
  - Utilisation de `React Hook Form` pour un formulaire multi-étapes.
  - Composant de sélection de date/heure natif (DatePicker).
- **T3.2 : Configurateur de Groupes d'Allure**
  - Interface de gestion dynamique de listes (Ajouter/Supprimer une allure).
  - Validation Zod croisée (Ex: Vitesse min < Vitesse max).
- **T3.3 : Traceur de Parcours (MVP-2)**
  - Intégration de l'édition de carte (Placer des points).
  - Import / Upload de fichier GPX.

---

### EPIC 4 : Historique & Réutilisation (MVP-7 / MVP-8)
*Objectif : Capitalisation des données et modèle Premium.*

- **T4.1 : Vue Historique**
  - Filtres par date (Passé / À venir).
  - Agrégats personnels (Nombre de kms parcourus sur The Run).
- **T4.2 : Duplication d'événement**
  - Logique de clonage de structure (Reprendre parcours + groupes sans les participants).
- **T4.3 : Paywall & Limites Free/Premium**
  - Logique de blocage UI si > 1 event actif (S8.2.1).
  - Modale d'Upsell Premium.

---

## 🛠️ 3. DÉFINITION DU "DONE" (CRITÈRES DE QUALITÉ)

Pour chaque tâche, le développeur doit garantir :
1. **Zod Validation** : Tout appel API est validé par un schéma.
2. **Cross-Platform** : Le rendu est testé sur iOS (Simulator) et Chrome (Responsive).
3. **Accessibility** : Les zones de clic (HitSlop) font au minimum 44x44dp sur mobile.
4. **Performance** : Utilisation de `FlashList` pour toute liste dépassant 20 éléments.
5. **Types** : Aucun `any` autorisé. Utilisation des types `Partial` ou `Omit` proscrite au profit de types explicites.