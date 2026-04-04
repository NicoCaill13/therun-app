import type { ReactElement, ReactNode } from 'react';

import { MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { DESKTOP_BREAKPOINT } from '@/lib/constants/breakpoints';
import { SHELL_PADDING_X_DESKTOP, SHELL_PADDING_X_MOBILE } from '@/lib/constants/layout';

const SURFACE_DIM = '#0e0e0e';
const ON_SURFACE_VARIANT = '#adaaaa';
const PRIMARY = '#ff5722';

export interface AuthNavBarProps {
  variant?: 'solid' | 'transparent';
}

export interface AppNavBarProps {
  variant?: 'solid' | 'transparent';
}

interface NavItem {
  label: string;
  href: '/(auth)/landing' | '/(auth)/join-code' | '/(auth)/sign-up' | '/(auth)/sign-in';
  match: string;
}

const AUTH_NAV_ITEMS: NavItem[] = [
  { label: 'JOIN', href: '/(auth)/join-code', match: 'join-code' },
  { label: 'SIGN UP', href: '/(auth)/sign-up', match: 'sign-up' },
  { label: 'LOG IN', href: '/(auth)/sign-in', match: 'sign-in' },
];

const NOTIFICATION_ICON_SIZE = 24;

const NAV_BAR_BOTTOM_BORDER_WIDTH = 1;

interface NavBarShellProps {
  variant: 'solid' | 'transparent';
  onBrandPress: () => void;
  brandA11yLabel: string;
  trailing: ReactNode;
}

function NavBarShell({
  variant,
  onBrandPress,
  brandA11yLabel,
  trailing,
}: NavBarShellProps): ReactElement {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const isTransparent = variant === 'transparent';

  return (
    <View
      style={[
        styles.bar,
        isTransparent ? styles.barTransparent : styles.barSolid,
        isDesktop ? styles.barDesktop : styles.barMobile,
      ]}
    >
      <Pressable onPress={onBrandPress} accessibilityRole="link" accessibilityLabel={brandA11yLabel}>
        <Text
          style={[styles.brand, isTransparent ? styles.brandOnImage : styles.brandSolid]}
          numberOfLines={1}
        >
          THE RUN
        </Text>
      </Pressable>

      {trailing}
    </View>
  );
}

function AuthNavTrailing({
  variant,
}: {
  variant: 'solid' | 'transparent';
}): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const isTransparent = variant === 'transparent';

  const isActive = (match: string): boolean => pathname.includes(match);

  return (
    <View style={[styles.links, !isDesktop && styles.linksMobile]}>
      {AUTH_NAV_ITEMS.map((item) => {
        const active = isActive(item.match);
        return (
          <Pressable
            key={item.href}
            onPress={() => {
              router.push(item.href);
            }}
            accessibilityRole="link"
            accessibilityLabel={item.label}
            hitSlop={6}
          >
            <Text
              style={[
                styles.link,
                isTransparent && styles.linkOnImage,
                !isTransparent && styles.linkSolid,
                active && styles.linkActive,
                !isDesktop && styles.linkCompact,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AppNavTrailing(): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      hitSlop={8}
      style={styles.trailingIconWrap}
    >
      <MaterialIcons name="notifications-none" size={NOTIFICATION_ICON_SIZE} color={ON_SURFACE_VARIANT} />
    </Pressable>
  );
}

export function AuthNavBar({ variant = 'solid' }: AuthNavBarProps): ReactElement {
  const router = useRouter();

  const onBrandPress = (): void => {
    router.push('/(auth)/landing');
  };

  return (
    <NavBarShell
      variant={variant}
      onBrandPress={onBrandPress}
      brandA11yLabel="Home — The Run"
      trailing={<AuthNavTrailing variant={variant} />}
    />
  );
}

export function AppNavBar({ variant = 'solid' }: AppNavBarProps): ReactElement {
  const router = useRouter();

  const onBrandPress = (): void => {
    router.push('/(app)');
  };

  return (
    <NavBarShell
      variant={variant}
      onBrandPress={onBrandPress}
      brandA11yLabel="Home — The Run"
      trailing={<AppNavTrailing />}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: SHELL_PADDING_X_MOBILE,
    borderBottomWidth: NAV_BAR_BOTTOM_BORDER_WIDTH,
    borderBottomColor: PRIMARY,
  },
  barTransparent: {
    backgroundColor: 'transparent',
  },
  barSolid: {
    backgroundColor: SURFACE_DIM,
  },
  barDesktop: {
    paddingHorizontal: SHELL_PADDING_X_DESKTOP,
  },
  barMobile: {
    flexWrap: 'wrap',
    rowGap: 8,
  },
  brand: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  brandOnImage: {
    color: PRIMARY,
  },
  brandSolid: {
    color: PRIMARY,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  linksMobile: {
    gap: 10,
    flexShrink: 1,
    justifyContent: 'flex-end',
    flex: 1,
  },
  link: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  linkOnImage: {
    color: ON_SURFACE_VARIANT,
  },
  linkSolid: {
    color: ON_SURFACE_VARIANT,
  },
  linkActive: {
    color: PRIMARY,
  },
  linkCompact: {
    fontSize: 10,
    letterSpacing: 1,
  },
  trailingIconWrap: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
