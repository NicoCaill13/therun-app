import { useCallback } from 'react';
import { View, Share, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/states';
import { useEventDetails } from '@/lib/api';
import { config } from '@/lib/config';
import { useColorScheme } from '@/components/useColorScheme';

export default function ShareEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#0a181e';

  const { data, isLoading, error, refetch } = useEventDetails(id ?? '');

  if (isLoading || !id) {
    return (
      <>
        <Stack.Screen options={{ title: 'Share Event' }} />
        <LoadingState message="Chargement..." />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Stack.Screen options={{ title: 'Share Event' }} />
        <ErrorState
          message={error?.message || 'Evenement introuvable'}
          onRetry={refetch}
          onBack={() => router.back()}
        />
      </>
    );
  }

  const { event } = data;
  const joinUrl = `${config.webUrl}/join/${event.eventCode}`;

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Rejoins-moi pour "${event.title}" ! ${joinUrl}`,
        url: joinUrl,
      });
    } catch {
      // User cancelled
    }
  }, [event.title, joinUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await Share.share({
        message: joinUrl,
        url: joinUrl,
      });
    } catch {
      // User cancelled
    }
  }, [joinUrl]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="flex-1 bg-backgroundLight dark:bg-backgroundDark"
        style={{ paddingTop: insets.top }}
      >
        {/* TopAppBar - design share_event_qr */}
        <View className="flex-row items-center justify-between px-4 pb-2 bg-transparent">
          <Pressable onPress={() => router.back()} className="w-12 h-12 items-center justify-center" accessibilityLabel="Retour">
            <MaterialIcons name="chevron-left" size={28} color={iconColor} />
          </Pressable>
          <Typography className="text-lg font-bold leading-tight tracking-tight text-charcoal dark:text-white flex-1 text-center">
            Share Event
          </Typography>
          <Pressable className="w-12 h-12 items-center justify-center rounded-xl" accessibilityLabel="More options">
            <MaterialIcons name="more-horiz" size={24} color={iconColor} />
          </Pressable>
        </View>

        <View className="flex-1 px-6 pt-6 items-center">
          <View className="rounded-full bg-brandOrange/10 px-3 py-1.5 flex-row items-center gap-1.5 mb-3">
            <View className="w-2 h-2 rounded-full bg-brandOrange" />
            <Typography className="text-brandOrange text-xs font-bold uppercase tracking-widest">
              Live Event
            </Typography>
          </View>
          <Typography className="text-2xl font-bold leading-tight text-charcoal dark:text-white text-center mb-1">
            Invite the Pack
          </Typography>
          <Typography color="muted" className="text-sm text-center mb-8">
            {event.title}
          </Typography>

          <View className="w-full max-w-[320px] bg-white dark:bg-secondary-900 border border-borderGrey dark:border-secondary-800 rounded-xl shadow-xl p-8 items-center">
            <View className="bg-white p-2 rounded-lg">
              <QRCode value={joinUrl} size={200} color="#000000" backgroundColor="#FFFFFF" />
            </View>
            <View className="mt-6 items-center">
              <Typography variant="caption" color="muted" className="uppercase tracking-widest mb-2">
                Manual Entry Code
              </Typography>
              <Typography className="font-mono text-2xl font-bold tracking-widest text-charcoal dark:text-white bg-backgroundLight dark:bg-black/20 px-4 py-2 rounded-lg">
                {event.eventCode}
              </Typography>
            </View>
          </View>

          <Typography color="muted" className="text-sm font-medium italic text-center mt-8">
            Participants can join in under 30 seconds
          </Typography>
        </View>

        {/* Footer - design */}
        <View className="px-6 pb-6 gap-3" style={{ paddingBottom: insets.bottom + 24 }}>
          <Pressable
            onPress={handleShare}
            className="h-14 rounded-xl bg-charcoal dark:bg-white items-center justify-center flex-row gap-2"
          >
            <MaterialIcons name="ios-share" size={22} color={colorScheme === 'dark' ? '#0B1220' : '#fff'} />
            <Typography className="text-white dark:text-charcoal font-bold">Share Event</Typography>
          </Pressable>
          <Pressable
            onPress={handleCopyLink}
            className="h-14 rounded-xl bg-secondary-100 dark:bg-secondary-800 border border-transparent dark:border-secondary-700 items-center justify-center flex-row gap-2"
          >
            <MaterialIcons name="content-copy" size={20} color={iconColor} />
            <Typography className="text-charcoal dark:text-white font-bold">Copy link</Typography>
          </Pressable>
        </View>
        {/* iOS Bottom Indicator - design */}
        <View className="w-32 h-1.5 bg-secondary-300 dark:bg-secondary-700 mx-auto mt-6 rounded-full opacity-50" />
      </View>
    </>
  );
}
