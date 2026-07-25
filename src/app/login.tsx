import { Redirect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OTP_LENGTH } from '@/constants/auth';
import { Spacing } from '@/constants/theme';
import { useAuth, useAuthActions } from '@/contexts/auth-context';
import {
  getApiErrorMessage,
  validateLoginCredentials,
  validateVerificationCode,
} from '@/lib/api-error';

type LoginStep =
  | { mode: 'credentials' }
  | { mode: 'verify'; email: string };

type FieldErrors = {
  email?: string;
  password?: string;
  code?: string;
  form?: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { signIn, verify } = useAuthActions();

  const [step, setStep] = useState<LoginStep>({ mode: 'credentials' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const handleCredentialsSubmit = useCallback(async () => {
    clearErrors();
    setLoading(true);

    const validation = validateLoginCredentials(email, password);
    if ('emailError' in validation || 'passwordError' in validation) {
      setFieldErrors({
        email: validation.emailError,
        password: validation.passwordError,
      });
      setLoading(false);
      return;
    }

    try {
      const result = await signIn(validation.normalizedEmail, password);

      if (result.signingIn) {
        router.replace('/home');
        return;
      }

      setCode('');
      setStep({ mode: 'verify', email: validation.normalizedEmail });
    } catch (submitError) {
      setFieldErrors({
        form: getApiErrorMessage(submitError, 'Unable to sign in. Try again.'),
      });
    } finally {
      setLoading(false);
    }
  }, [clearErrors, email, password, router, signIn]);

  const handleVerificationSubmit = useCallback(async () => {
    if (step.mode !== 'verify') {
      return;
    }

    clearErrors();
    setLoading(true);

    const validation = validateVerificationCode(code);
    if ('codeError' in validation) {
      setFieldErrors({ code: validation.codeError });
      setLoading(false);
      return;
    }

    try {
      const result = await verify(step.email, validation.trimmedCode);

      if (result.signingIn) {
        router.replace('/home');
        return;
      }

      setFieldErrors({
        code: 'That verification code is incorrect or expired.',
      });
    } catch (submitError) {
      setFieldErrors({
        form: getApiErrorMessage(
          submitError,
          'Unable to verify your code. Try again.',
        ),
      });
    } finally {
      setLoading(false);
    }
  }, [clearErrors, code, router, verify, step]);

  const handleBackToCredentials = useCallback(() => {
    setStep({ mode: 'credentials' });
    setCode('');
    clearErrors();
  }, [clearErrors]);

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <View style={styles.content}>
            <View style={styles.panel}>
              <View style={styles.header}>
                <ThemedText type="label" themeColor="textSecondary">
                  Account
                </ThemedText>
                <ThemedText type="section">
                  {step.mode === 'credentials' ? 'Log in' : 'Verify email'}
                </ThemedText>
                <ThemedText type="body" themeColor="textSecondary">
                  {step.mode === 'credentials'
                    ? 'Sign in with your assigned email and password.'
                    : `Enter the ${OTP_LENGTH}-digit code sent to ${step.email}.`}
                </ThemedText>
              </View>

              {step.mode === 'credentials' ? (
                <View style={styles.form}>
                  <TextField
                    label="Email"
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (fieldErrors.email || fieldErrors.form) {
                        clearErrors();
                      }
                    }}
                    error={fieldErrors.email}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    returnKeyType="next"
                  />
                  <TextField
                    label="Password"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (fieldErrors.password || fieldErrors.form) {
                        clearErrors();
                      }
                    }}
                    error={fieldErrors.password}
                    secureTextEntry
                    textContentType="password"
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      void handleCredentialsSubmit();
                    }}
                  />
                </View>
              ) : (
                <View style={styles.form}>
                  <OtpInput
                    value={code}
                    onChange={(value) => {
                      setCode(value);
                      if (fieldErrors.code || fieldErrors.form) {
                        clearErrors();
                      }
                    }}
                    error={fieldErrors.code}
                    onComplete={() => {
                      void handleVerificationSubmit();
                    }}
                  />
                </View>
              )}

              {fieldErrors.form ? (
                <ThemedText type="small" themeColor="error">
                  {fieldErrors.form}
                </ThemedText>
              ) : null}

              <View style={styles.actions}>
                {step.mode === 'verify' ? (
                  <Button
                    label="Back"
                    variant="ghost"
                    onPress={handleBackToCredentials}
                    disabled={loading}
                  />
                ) : null}

                <Button
                  label={
                    step.mode === 'credentials' ? 'Continue' : 'Verify and sign in'
                  }
                  icon={step.mode === 'credentials' ? 'arrow.right' : 'checkmark'}
                  iconPosition="trailing"
                  fullWidth
                  loading={loading}
                  onPress={() => {
                    if (step.mode === 'credentials') {
                      void handleCredentialsSubmit();
                      return;
                    }

                    void handleVerificationSubmit();
                  }}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  panel: {
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  form: {
    gap: Spacing.three,
  },
  actions: {
    gap: Spacing.two,
  },
});
