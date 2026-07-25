import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ScreenShell } from '@/components/ui/screen-shell';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { api } from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/api-error';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useTheme } from '@/hooks/use-theme';
import { useWorkspace } from '@/hooks/use-workspace';

export default function NewChwScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { clinicId } = useWorkspace();
  const { mutate: createChw } = useApiMutation(api.chwUsers.create);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [villageArea, setVillageArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!clinicId) {
      setError('Your account is not linked to a clinic.');
      return;
    }

    if (!fullName.trim()) {
      setError('Enter the CHW full name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createChw({
        clinicId,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        villageArea: villageArea.trim() || undefined,
      });
      router.back();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Could not create CHW.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell subtitle="Register a community health worker">
      <View style={styles.form}>
        <TextField
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextField
          label="Village / area"
          value={villageArea}
          onChangeText={setVillageArea}
          autoCapitalize="words"
        />

        {error ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        ) : null}

        <Button label="Save CHW" fullWidth loading={loading} onPress={() => void handleSubmit()} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
});
