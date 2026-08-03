import type { ImageSourcePropType } from 'react-native';

export const ONBOARDING_STORAGE_KEY = 'mamatrack_onboarding_complete';

export type OnboardingSlide = {
  id: string;
  step: string;
  label: string;
  title: string;
  illustration: ImageSourcePropType;
};

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: 'welcome',
    step: '01',
    label: 'MamaTrack',
    title: 'Every mother deserves safe antenatal care.',
    illustration: require('@/assets/images/onboarding/onboarding-01-welcome.png'),
  },
  {
    id: 'patients',
    step: '02',
    label: 'Patients',
    title: 'Register and follow every pregnancy.',
    illustration: require('@/assets/images/onboarding/onboarding-02-patients.png'),
  },
  {
    id: 'visits',
    step: '03',
    label: 'Antenatal Visits',
    title: 'Record vitals at every contact.',
    illustration: require('@/assets/images/onboarding/onboarding-03-visits.png'),
  },
  {
    id: 'risk-flags',
    step: '04',
    label: 'Risk Alerts',
    title: 'Flag danger signs immediately.',
    illustration: require('@/assets/images/onboarding/onboarding-04-risks.png'),
  },
  {
    id: 'sync',
    step: '05',
    label: 'Field Ready',
    title: 'Work offline. Sync when connected.',
    illustration: require('@/assets/images/onboarding/onboarding-05-sync.png'),
  },
];
