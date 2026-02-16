// Core
export { apiClient } from './client';
export { normalizeApiError, shouldShowUpsell, shouldReauthenticate } from './normalizeApiError';
export type { ApiErrorKind, NormalizedApiError } from './normalizeApiError';

// Auth
export { useRegister, useLogin } from './auth';
export { RegisterInputSchema, LoginInputSchema, AuthResponseSchema, AuthUserSchema, LoginResponseSchema } from './auth';
export type { RegisterInput, LoginInput, AuthResponse, AuthUser, LoginResponse } from './auth';

// Me
export { useMe, useMeEvents } from './me';
export { MeProfileSchema, MeEventsListSchema, MeEventItemSchema } from './me';
export type { MeProfile, MeEventsList, MeEventItem, MeEventsScope } from './me';

// Events
export {
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useCompleteEvent,
  useBroadcast,
  useDuplicateEvent,
} from './events';
export {
  CreateEventInputSchema,
  UpdateEventInputSchema,
  EventDetailsSchema,
  EventBlockSchema,
  BroadcastInputSchema,
  DuplicateEventInputSchema,
} from './events';
export type {
  CreateEventInput,
  UpdateEventInput,
  EventDetails,
  EventBlock,
  EventParticipant,
  SimpleUser,
  CurrentUserParticipation,
  BroadcastInput,
  BroadcastResponse,
  DuplicateEventInput,
} from './events';

// Participants
export {
  useParticipants,
  useParticipantsSummary,
  useUpsertMyParticipation,
  useUpdateMySelection,
  useUpdateParticipantRole,
} from './participants';
export {
  ParticipantsListSchema,
  ParticipantsSummarySchema,
  ParticipantItemSchema,
  UpdateParticipantRoleInputSchema,
} from './participants';
export type {
  ParticipantsList,
  ParticipantsSummary,
  ParticipantItem,
  ParticipationStatus,
  UpdateSelectionInput,
  UpdateParticipantRoleInput,
} from './participants';

// Invitations
export { useInvitations, useInviteSearch, useInviteParticipant, useRespondInvitation } from './invitations';
export {
  InvitationsListSchema,
  InviteSearchResponseSchema,
  InviteParticipantInputSchema,
  RespondInvitationInputSchema,
  RespondInvitationResponseSchema,
} from './invitations';
export type {
  InvitationItem,
  InvitationsList,
  InviteSearchItem,
  InviteSearchResponse,
  InviteParticipantInput,
  InviteParticipantResponse,
  RespondInvitationInput,
  RespondInvitationResponse,
} from './invitations';

// Notifications
export { useNotifications, useMarkNotificationRead } from './notifications';
export { NotificationSchema, NotificationsListSchema } from './notifications';
export type { Notification, NotificationsList } from './notifications';

// Routes
export {
  useRoutes,
  useMyRoutes,
  useRoute,
  useSuggestRoutes,
  useCreateRoute,
  useAddRouteToEvent,
  useEventRoutes,
  routeKeys,
} from './routes';
export type {
  Route,
  RouteListResponse,
  ListRoutesQueryParams,
  SuggestRoutesQueryParams,
  SuggestRoutesResponse,
  CreateRouteInput,
  CreateEventRouteInput,
  EventRoute,
  EventRoutesList,
} from './routes';

// Public
export { usePublicEventByCode, useGuestJoin } from './public';
export { PublicEventSchema, GuestJoinInputSchema, GuestJoinResponseSchema } from './public';
export type { PublicEvent, GuestJoinInput, GuestJoinResponse } from './public';

// Join
export { useResolveEventCode, useParticipate } from './join';
export { JoinEventSummarySchema, JoinParticipateResponseSchema } from './join';
export type { JoinEventSummary, JoinParticipateResponse } from './join';
