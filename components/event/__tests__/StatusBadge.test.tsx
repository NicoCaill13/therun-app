import {
  getParticipantStatusIcon,
  getParticipationStatusText,
} from '../StatusBadge';

// Note: Testing pure functions only. Component rendering tests would require
// proper React Native environment setup with NativeWind.

describe('StatusBadge Utilities', () => {
  describe('getParticipantStatusIcon', () => {
    it('should return correct icon for GOING', () => {
      expect(getParticipantStatusIcon('GOING')).toBe('✅');
    });

    it('should return correct icon for MAYBE', () => {
      expect(getParticipantStatusIcon('MAYBE')).toBe('🤔');
    });

    it('should return correct icon for DECLINED', () => {
      expect(getParticipantStatusIcon('DECLINED')).toBe('❌');
    });

    it('should return correct icon for INVITED', () => {
      expect(getParticipantStatusIcon('INVITED')).toBe('📨');
    });
  });

  describe('getParticipationStatusText', () => {
    it('should return correct text for GOING', () => {
      expect(getParticipationStatusText('GOING')).toBe(
        'Vous participez a cet evenement'
      );
    });

    it('should return correct text for MAYBE', () => {
      expect(getParticipationStatusText('MAYBE')).toBe(
        'Vous avez indique "peut-etre"'
      );
    });

    it('should return correct text for DECLINED', () => {
      expect(getParticipationStatusText('DECLINED')).toBe(
        'Vous avez decline cet evenement'
      );
    });

    it('should return correct text for INVITED', () => {
      expect(getParticipationStatusText('INVITED')).toBe('Vous etes invite');
    });

    it('should return empty string for unknown status', () => {
      expect(getParticipationStatusText('UNKNOWN' as never)).toBe('');
    });
  });
});
