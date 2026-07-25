import { useCallback, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { OTP_LENGTH } from '@/constants/auth';
import { Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  length?: number;
  onComplete?: (value: string) => void;
};

function sanitizeDigits(input: string, maxLength: number) {
  return input.replace(/\D/g, '').slice(0, maxLength);
}

export function OtpInput({
  value,
  onChange,
  error,
  length = OTP_LENGTH,
  onComplete,
}: OtpInputProps) {
  const theme = useTheme();
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  const focusIndex = useCallback((index: number) => {
    const target = Math.max(0, Math.min(index, length - 1));
    inputsRef.current[target]?.focus();
  }, [length]);

  const updateValue = useCallback(
    (nextValue: string) => {
      const sanitized = sanitizeDigits(nextValue, length);
      onChange(sanitized);
      if (sanitized.length === length) {
        onComplete?.(sanitized);
      }
    },
    [length, onChange, onComplete],
  );

  const handleChange = useCallback(
    (index: number, text: string) => {
      const cleaned = sanitizeDigits(text, length);

      if (cleaned.length > 1) {
        updateValue(cleaned);
        focusIndex(Math.min(cleaned.length, length - 1));
        return;
      }

      const nextDigits = [...digits];
      nextDigits[index] = cleaned;
      updateValue(nextDigits.join(''));

      if (cleaned && index < length - 1) {
        focusIndex(index + 1);
      }
    },
    [digits, focusIndex, length, updateValue],
  );

  const handleKeyPress = useCallback(
    (index: number, event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (event.nativeEvent.key !== 'Backspace') {
        return;
      }

      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        updateValue(nextDigits.join(''));
        return;
      }

      if (index > 0) {
        focusIndex(index - 1);
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        updateValue(nextDigits.join(''));
      }
    },
    [digits, focusIndex, updateValue],
  );

  return (
    <View style={styles.wrapper}>
      <ThemedText type="label" themeColor="textSecondary">
        Verification code
      </ThemedText>

      <View style={styles.row}>
        {digits.map((digit, index) => (
          <Pressable
            key={index}
            onPress={() => focusIndex(index)}
            style={[
              styles.cell,
              {
                borderColor: error ? theme.error : theme.border,
                backgroundColor: theme.background,
              },
            ]}>
            <TextInput
              ref={(element) => {
                inputsRef.current[index] = element;
              }}
              value={digit}
              onChangeText={(text) => handleChange(index, text)}
              onKeyPress={(event) => handleKeyPress(index, event)}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={length}
              selectTextOnFocus
              style={[styles.input, { color: theme.text }]}
              accessibilityLabel={`Verification digit ${index + 1}`}
            />
          </Pressable>
        ))}
      </View>

      {error ? (
        <ThemedText type="small" style={{ color: theme.error }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  cell: {
    flex: 1,
    minHeight: 56,
    borderWidth: 1,
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'Inter_700Bold',
    paddingVertical: Spacing.two,
  },
});
