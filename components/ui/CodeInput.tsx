import { View, TextInput, Platform } from 'react-native';
import { useRef, useState, useCallback } from 'react';

// ============================================================================
// Component - 6-character code input with individual boxes
// ============================================================================

export function CodeInput({
  length = 6,
  value = '',
  onChange,
  error,
  autoFocus = true,
}: CodeInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(autoFocus ? 0 : -1);

  const chars = value.padEnd(length, '').split('').slice(0, length);

  const handleChange = useCallback(
    (text: string, index: number) => {
      const sanitized = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!sanitized) return;

      const newChars = [...chars];
      newChars[index] = sanitized[0];
      const newValue = newChars.join('');
      onChange(newValue);

      // Auto-advance to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [chars, length, onChange]
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace') {
        const newChars = [...chars];
        if (newChars[index] && newChars[index] !== ' ') {
          newChars[index] = '';
          onChange(newChars.join('').trimEnd());
        } else if (index > 0) {
          newChars[index - 1] = '';
          onChange(newChars.join('').trimEnd());
          inputRefs.current[index - 1]?.focus();
        }
      }
    },
    [chars, onChange]
  );

  const borderColor = error ? 'border-error-red' : 'border-border-grey dark:border-gray-700';
  const focusBorderColor = error ? 'border-error-red' : 'border-brand-orange';

  return (
    <View>
      <View className="flex-row justify-center gap-3">
        {chars.map((char, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={char.trim()}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            maxLength={1}
            autoCapitalize="characters"
            autoFocus={autoFocus && index === 0}
            className={`w-12 h-14 text-center text-xl font-sans-bold text-primary dark:text-white bg-white dark:bg-gray-900 rounded-xl border-2 ${
              focusedIndex === index ? focusBorderColor : borderColor
            }`}
            style={Platform.OS === 'web' ? { outlineStyle: 'none' } : undefined}
            accessibilityLabel={`Code character ${index + 1}`}
          />
        ))}
      </View>
      {error && (
        <View className="flex-row items-center justify-center mt-4 gap-2">
          <View className="w-5 h-5 rounded-full bg-error-red items-center justify-center">
            <View className="w-1 h-1 bg-white rounded-full" />
          </View>
          <View>
            <TextInput
              editable={false}
              value={error}
              className="text-error-red text-sm font-sans-medium"
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Types
// ============================================================================

interface CodeInputProps {
  length?: number;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
}
