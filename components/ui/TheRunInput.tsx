import { useCallback, useState } from 'react';
import type { ReactElement } from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

const SURFACE_CONTAINER_HIGHEST = '#262626';
const ON_SURFACE = '#ffffff';
const ON_SURFACE_VARIANT = '#adaaaa';
const PRIMARY = '#ff5722';

const GHOST_BORDER_RGB = 'rgba(255, 87, 34, 0.4)';

export interface TheRunInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  errorMessage?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  testID?: string;
}

export function TheRunInput({
  label,
  value,
  onChangeText,
  errorMessage,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
  testID,
}: TheRunInputProps): ReactElement {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const showFieldError = Boolean(errorMessage);

  return (
    <View style={styles.root}>
      <Text
        style={[
          styles.label,
          isFocused && styles.labelFocused,
          showFieldError && styles.labelError,
        ]}
      >
        {label.toUpperCase()}
      </Text>
      <View
        style={[
          styles.field,
          isFocused && styles.fieldFocused,
          showFieldError && styles.fieldErrorOutline,
        ]}
      >
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.input}
          placeholderTextColor={ON_SURFACE_VARIANT}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
        />
      </View>
      {showFieldError ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: ON_SURFACE_VARIANT,
    marginBottom: 8,
  },
  labelFocused: {
    color: PRIMARY,
  },
  labelError: {
    color: '#ff8a80',
  },
  field: {
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 52,
    justifyContent: 'center',
  },
  fieldFocused: {
    borderWidth: 1,
    borderColor: GHOST_BORDER_RGB,
  },
  fieldErrorOutline: {
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 128, 0.5)',
  },
  input: {
    color: ON_SURFACE,
    fontSize: 16,
    paddingVertical: 10,
    margin: 0,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: '#ff8a80',
  },
});
