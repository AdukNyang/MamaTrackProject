import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ScreenShell } from '@/components/ui/screen-shell';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { api } from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/api-error';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useApiQuery } from '@/hooks/use-api-query';
import { useTheme } from '@/hooks/use-theme';
import { useWorkspace } from '@/hooks/use-workspace';

export default function NewPatientScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { clinicId } = useWorkspace();
  const chwQueryFn = useCallback(
    () => (clinicId ? api.chwUsers.listByClinic(clinicId) : Promise.resolve([])),
    [clinicId],
  );
  const { data: chws } = useApiQuery(chwQueryFn, Boolean(clinicId));
  const { mutate: createPatient } = useApiMutation(api.patients.createBySupervisor);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [selectedChwId, setSelectedChwId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError('Enter the patient full name.');
      return;
    }

    if (!selectedChwId) {
      setError('Select a community health worker.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPatient({
        chwId: selectedChwId,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        village: village.trim() || undefined,
      });
      router.back();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Could not create patient.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell subtitle="Register a new antenatal case">
      <View style={styles.form}>
        <TextField
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextField label="Village" value={village} onChangeText={setVillage} autoCapitalize="words" />

        <View style={styles.field}>
          <ThemedText type="label" themeColor="textSecondary">
            Assigned CHW
          </ThemedText>
          <View style={styles.chwList}>
            {(chws ?? []).map((chw) => {
              const selected = selectedChwId === chw._id;
              return (
                <Pressable
                  key={chw._id}
                  accessibilityRole="button"
                  onPress={() => setSelectedChwId(chw._id)}
                  style={({ pressed }) => [
                    styles.chwOption,
                    {
                      borderColor: selected ? theme.accent : theme.border,
                      backgroundColor: selected ? theme.backgroundSelected : theme.background,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}>
                  <ThemedText type="smallBold">{chw.fullName}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {chw.villageArea ?? 'No village assigned'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        ) : null}

        <Button label="Save patient" fullWidth loading={loading} onPress={() => void handleSubmit()} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  chwList: {
    gap: Spacing.two,
  },
  chwOption: {
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    gap: Spacing.one,
  },
});
