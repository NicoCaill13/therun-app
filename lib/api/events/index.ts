// Event types and schemas
export {
  // Enums
  EventStatusSchema,
  ParticipantStatusSchema,
  type EventStatus,
  type ParticipantStatus,

  // Input schemas
  CreateEventInputSchema,
  type CreateEventInput,

  // Response schemas
  EventBlockSchema,
  SimpleUserSchema,
  EventParticipantSchema,
  CurrentUserParticipationSchema,
  EventDetailsResponseSchema,
  MeEventItemSchema,
  MeEventsListResponseSchema,

  // Response types
  type EventBlock,
  type SimpleUser,
  type EventParticipant,
  type CurrentUserParticipation,
  type EventDetailsResponse,
  type MeEventItem,
  type MeEventsListResponse,

  // Query params
  type EventScope,
  type MeEventsQueryParams,
} from './types';

// Event hooks
export { eventKeys, useMyEvents, useEventDetails, useCreateEvent } from './hooks';
