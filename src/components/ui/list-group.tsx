import { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ListGroupProps = {
  children: ReactNode;
};

export function ListGroup({ children }: ListGroupProps) {
  const theme = useTheme();
  const items = Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[
        styles.group,
        {
          borderColor: theme.border,
          backgroundColor: theme.background,
        },
      ]}>
      {items.map((child, index) => (
        <View
          key={index}
          style={
            index < items.length - 1
              ? {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.border,
                }
              : undefined
          }>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
});
