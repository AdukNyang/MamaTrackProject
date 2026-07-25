import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';

import { ScreenShell } from '@/components/ui/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { Layout, Spacing } from '@/constants/theme';

export default function ExploreScreen() {
  return (
    <ScreenShell subtitle="Clinical workflows and supervisor tools" includeTabBarInset>
      <View style={styles.titleContainer}>
        <ThemedText type="section">Explore</ThemedText>
        <ThemedText style={styles.centerText} themeColor="textSecondary">
          Clinical workflows, visit templates, and supervisor tools will live here.
        </ThemedText>
      </View>

      <View style={styles.sectionsWrapper}>
        <Collapsible title="Patient registration">
          <ThemedText type="small" themeColor="textSecondary">
            Register expectant mothers with LMP, EDD, gravida, and parity. Assign each patient to
            a community health worker and clinic.
          </ThemedText>
        </Collapsible>

        <Collapsible title="Antenatal visits">
          <ThemedText type="small" themeColor="textSecondary">
            Record blood pressure, weight, fundal height, and fetal heart rate at every scheduled
            contact.
          </ThemedText>
        </Collapsible>

        <Collapsible title="Risk flags">
          <ThemedText type="small" themeColor="textSecondary">
            Escalate danger signs — high BP, bleeding, reduced fetal movement — so supervisors can
            respond immediately.
          </ThemedText>
          <Image source={require('@/assets/images/react-logo.png')} style={styles.imageReact} />
        </Collapsible>
      </View>

      {Platform.OS === 'web' ? <WebBadge /> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: Spacing.two,
    alignItems: 'flex-start',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  centerText: {
    maxWidth: 320,
  },
  sectionsWrapper: {
    gap: Spacing.four,
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  imageReact: {
    width: 100,
    height: 100,
    marginTop: Spacing.three,
  },
});
