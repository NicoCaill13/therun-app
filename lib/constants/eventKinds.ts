import type { ImageSourcePropType } from 'react-native';

/** Discipline × surface; maps to one illustration under `assets/images/`. */
export type EventKind = 'social_run' | 'social_trail' | 'technical_run' | 'technical_trail';

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  social_run: 'SOCIAL RUN',
  social_trail: 'SOCIAL TRAIL',
  technical_run: 'TECHNICAL RUN',
  technical_trail: 'TECHNICAL TRAIL',
};

export function getEventKindIllustrationSource(kind: EventKind): ImageSourcePropType {
  switch (kind) {
    case 'social_run':
      return require('../../assets/images/social_run.png');
    case 'social_trail':
      return require('../../assets/images/social_trail.png');
    case 'technical_run':
      return require('../../assets/images/technical_run.png');
    case 'technical_trail':
      return require('../../assets/images/technical_trail.png');
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
