import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { EmptyState } from '../EmptyState';
import { SuccessState } from '../SuccessState';

// Mock the Container component to just render children
jest.mock('@/components/ui', () => {
  const { View, Text, Pressable } = require('react-native');
  return {
    Container: ({ children }: { children: React.ReactNode }) => (
      <View testID="container">{children}</View>
    ),
    Typography: ({ children, color }: { children: React.ReactNode; color?: string }) => (
      <Text testID={`typography-${color || 'default'}`}>{children}</Text>
    ),
    H3: ({ children }: { children: React.ReactNode }) => (
      <Text testID="h3">{children}</Text>
    ),
    Button: ({
      children,
      onPress,
      variant,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
      variant?: string;
    }) => (
      <Pressable testID={`button-${variant || 'default'}`} onPress={onPress}>
        <Text>{children}</Text>
      </Pressable>
    ),
  };
});

describe('State Components', () => {
  describe('LoadingState', () => {
    it('should render with default message', () => {
      render(<LoadingState />);
      expect(screen.getByText('Chargement...')).toBeTruthy();
    });

    it('should render with custom message', () => {
      const customMessage = 'Chargement des donnees...';
      render(<LoadingState message={customMessage} />);
      expect(screen.getByText(customMessage)).toBeTruthy();
    });

    it('should have activity indicator', () => {
      render(<LoadingState />);
      // ActivityIndicator should be present
      expect(screen.getByTestId('container')).toBeTruthy();
    });
  });

  describe('ErrorState', () => {
    const mockOnRetry = jest.fn();
    const mockOnBack = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render error message', () => {
      const errorMessage = 'Une erreur est survenue';
      render(<ErrorState message={errorMessage} onRetry={mockOnRetry} />);
      expect(screen.getByText(errorMessage)).toBeTruthy();
    });

    it('should render default title in full variant', () => {
      render(<ErrorState message="Error" onRetry={mockOnRetry} />);
      expect(screen.getByText('Oups !')).toBeTruthy();
    });

    it('should render custom title', () => {
      const customTitle = 'Erreur reseau';
      render(
        <ErrorState message="Error" onRetry={mockOnRetry} title={customTitle} />
      );
      expect(screen.getByText(customTitle)).toBeTruthy();
    });

    it('should call onRetry when retry button is pressed', () => {
      render(<ErrorState message="Error" onRetry={mockOnRetry} />);
      fireEvent.press(screen.getByText('Reessayer'));
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should render back button when onBack is provided', () => {
      render(
        <ErrorState message="Error" onRetry={mockOnRetry} onBack={mockOnBack} />
      );
      expect(screen.getByText('Retour')).toBeTruthy();
    });

    it('should call onBack when back button is pressed', () => {
      render(
        <ErrorState message="Error" onRetry={mockOnRetry} onBack={mockOnBack} />
      );
      fireEvent.press(screen.getByText('Retour'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should render compact variant without title', () => {
      render(
        <ErrorState message="Error" onRetry={mockOnRetry} variant="compact" />
      );
      expect(screen.getByText('Error')).toBeTruthy();
      expect(screen.queryByText('Oups !')).toBeFalsy();
    });

    it('should render custom button labels', () => {
      render(
        <ErrorState
          message="Error"
          onRetry={mockOnRetry}
          onBack={mockOnBack}
          retryLabel="Essayer a nouveau"
          backLabel="Fermer"
        />
      );
      expect(screen.getByText('Essayer a nouveau')).toBeTruthy();
      expect(screen.getByText('Fermer')).toBeTruthy();
    });
  });

  describe('EmptyState', () => {
    const mockOnAction = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render title and description', () => {
      render(
        <EmptyState
          title="Aucun resultat"
          description="Essayez une autre recherche"
        />
      );
      expect(screen.getByText('Aucun resultat')).toBeTruthy();
      expect(screen.getByText('Essayez une autre recherche')).toBeTruthy();
    });

    it('should render custom icon', () => {
      render(<EmptyState title="Vide" icon="🏃" />);
      expect(screen.getByText('🏃')).toBeTruthy();
    });

    it('should render default icon when none provided', () => {
      render(<EmptyState title="Vide" />);
      expect(screen.getByText('📭')).toBeTruthy();
    });

    it('should render action button when provided', () => {
      render(
        <EmptyState title="Vide" actionLabel="Creer" onAction={mockOnAction} />
      );
      expect(screen.getByText('Creer')).toBeTruthy();
    });

    it('should call onAction when action button is pressed', () => {
      render(
        <EmptyState title="Vide" actionLabel="Creer" onAction={mockOnAction} />
      );
      fireEvent.press(screen.getByText('Creer'));
      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });

    it('should not render action button when no onAction', () => {
      render(<EmptyState title="Vide" actionLabel="Creer" />);
      expect(screen.queryByText('Creer')).toBeFalsy();
    });
  });

  describe('SuccessState', () => {
    const mockOnAction = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render default title', () => {
      render(<SuccessState />);
      expect(screen.getByText('Succes !')).toBeTruthy();
    });

    it('should render custom title', () => {
      render(<SuccessState title="Bienvenue !" />);
      expect(screen.getByText('Bienvenue !')).toBeTruthy();
    });

    it('should render message and subtitle', () => {
      render(
        <SuccessState
          message="Vous avez rejoint"
          subtitle="Course du dimanche"
        />
      );
      expect(screen.getByText('Vous avez rejoint')).toBeTruthy();
      expect(screen.getByText('"Course du dimanche"')).toBeTruthy();
    });

    it('should render default icon', () => {
      render(<SuccessState />);
      expect(screen.getByText('✓')).toBeTruthy();
    });

    it('should render custom icon', () => {
      render(<SuccessState icon="🎉" />);
      expect(screen.getByText('🎉')).toBeTruthy();
    });

    it('should render action button and call onAction', () => {
      render(<SuccessState actionLabel="Continuer" onAction={mockOnAction} />);
      expect(screen.getByText('Continuer')).toBeTruthy();
      fireEvent.press(screen.getByText('Continuer'));
      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });
  });
});
