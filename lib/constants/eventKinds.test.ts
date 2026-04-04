import {
  type EventKind,
  getEventKindIllustrationSource,
} from '@/lib/constants/eventKinds';

const ALL_KINDS: EventKind[] = [
  'social_run',
  'social_trail',
  'technical_run',
  'technical_trail',
];

describe('eventKinds', () => {
  it('resolves a non-empty illustration source for every event kind', () => {
    ALL_KINDS.forEach((kind) => {
      const src = getEventKindIllustrationSource(kind);
      expect(src).toBeTruthy();
    });
  });
});
