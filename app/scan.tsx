import { useCallback, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform, TextInput, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { Container, Typography, H1, H3, Button, Input } from '@/components/ui';

// ============================================================================
// Permission Request Screen
// ============================================================================

interface PermissionRequestProps {
  onRequestPermission: () => void;
  isPending: boolean;
}

function PermissionRequest({ onRequestPermission, isPending }: PermissionRequestProps) {
  return (
    <Container isCenter hasSafeArea padding="lg">
      <View className="items-center max-w-xs">
        <View className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-6">
          <Typography className="text-4xl">📷</Typography>
        </View>

        <H3 className="text-center mb-2">Acces a la camera</H3>

        <Typography color="muted" className="text-center mb-6">
          Pour scanner un QR code, nous avons besoin d'acceder a votre camera.
        </Typography>

        <Button
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={isPending}
          onPress={onRequestPermission}
        >
          Autoriser la camera
        </Button>
      </View>
    </Container>
  );
}

// ============================================================================
// Permission Denied Screen
// ============================================================================

interface PermissionDeniedProps {
  onOpenSettings: () => void;
  onUseCode: () => void;
}

function PermissionDenied({ onOpenSettings, onUseCode }: PermissionDeniedProps) {
  return (
    <Container isCenter hasSafeArea padding="lg">
      <View className="items-center max-w-xs">
        <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-6">
          <Typography className="text-4xl">🚫</Typography>
        </View>

        <H3 className="text-center mb-2">Camera non autorisee</H3>

        <Typography color="muted" className="text-center mb-6">
          L'acces a la camera a ete refuse. Vous pouvez modifier ce parametre dans les reglages ou entrer le code manuellement.
        </Typography>

        <Button
          variant="primary"
          size="lg"
          isFullWidth
          onPress={onOpenSettings}
          className="mb-3"
        >
          Ouvrir les reglages
        </Button>

        <Button
          variant="outline"
          size="lg"
          isFullWidth
          onPress={onUseCode}
        >
          Entrer le code
        </Button>
      </View>
    </Container>
  );
}

// ============================================================================
// Manual Code Entry (design: join_by_code_input - 6-char mono boxes, TopAppBar)
// ============================================================================

const CODE_LENGTH = 6;

interface ManualCodeEntryProps {
  onSubmit: (code: string) => void;
  onSwitchToScan: () => void;
  onBack: () => void;
  hasPermission: boolean;
}

function ManualCodeEntry({ onSubmit, onSwitchToScan, onBack, hasPermission }: ManualCodeEntryProps) {
  const [chars, setChars] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#0a181e';

  const code = chars.join('').toUpperCase();

  const handleCharChange = useCallback((index: number, value: string) => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-1);
    setChars((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    setError(null);
    if (cleaned && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback(
    (index: number, key: string) => {
      if (key === 'Backspace' && !chars[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [chars]
  );

  const handleSubmit = useCallback(() => {
    const trimmed = code.trim();
    if (trimmed.length < 4) {
      setError('Invalid code. Please check and try again');
      return;
    }
    setError(null);
    onSubmit(trimmed);
  }, [code, onSubmit]);

  return (
    <View className="flex-1 bg-backgroundLight dark:bg-backgroundDark" style={{ paddingTop: insets.top }}>
      {/* TopAppBar - design join_by_code_input */}
      <View className="flex-row items-center px-4 py-4 justify-between bg-white dark:bg-backgroundDark">
        <Pressable onPress={onBack} className="w-10 h-10 items-center justify-center" accessibilityLabel="Back">
          <MaterialIcons name="arrow-back-ios" size={24} color={iconColor} />
        </Pressable>
        <Typography className="text-charcoal dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
          Join with Code
        </Typography>
      </View>

      <View className="flex-1 px-6 bg-white dark:bg-backgroundDark">
        <H1 className="text-charcoal dark:text-white tracking-tight text-[32px] font-bold leading-tight pt-8 pb-2">
          Enter Club Code
        </H1>
        <Typography className="text-charcoal/70 dark:text-white/60 text-base leading-relaxed pb-8">
          Enter the 6-character code provided by your organizer to join the session.
        </Typography>

        {/* 6-char mono inputs - design */}
        <View className="flex-row justify-between py-4 gap-1">
          {Array.from({ length: CODE_LENGTH }, (_, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              value={chars[i]}
              onChangeText={(v) => handleCharChange(i, v)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
              maxLength={1}
              autoCapitalize="characters"
              autoCorrect={false}
              className={`flex-1 h-14 text-center border-b-2 bg-transparent text-charcoal dark:text-white text-xl font-medium ${
                error ? 'border-errorRed' : 'border-charcoal dark:border-white focus:border-brandOrange'
              }`}
              placeholder=""
              placeholderTextColor="#94a3b8"
              accessibilityLabel={`Character ${i + 1}`}
              selectTextOnFocus
            />
          ))}
        </View>

        {error && (
          <View className="pt-4 flex-row items-center justify-center gap-2">
            <MaterialIcons name="error" size={18} color="#E5484D" />
            <Typography className="text-errorRed text-sm font-medium">{error}</Typography>
          </View>
        )}

        <View className="flex-grow" />

        <View className="pb-10 pt-4">
          <Pressable
            onPress={handleSubmit}
            disabled={code.length < 4}
            className={`w-full py-4 rounded-xl ${code.length >= 4 ? 'bg-charcoal dark:bg-white' : 'bg-secondary-200 dark:bg-secondary-700'} ${code.length >= 4 ? 'dark:border-0' : ''}`}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Typography
              className={`text-base font-semibold text-center ${code.length >= 4 ? 'text-white dark:text-charcoal' : 'text-secondary-500'}`}
            >
              Continue
            </Typography>
          </Pressable>
          <Pressable className="mt-6 items-center" accessibilityRole="button" accessibilityLabel="Where do I find the code?">
            <Typography className="text-charcoal/50 dark:text-white/40 text-sm font-medium">
              Where do I find the code?
            </Typography>
          </Pressable>
        </View>
      </View>

      {/* iOS Home Indicator - design */}
      <View className="justify-center pb-2 items-center bg-white dark:bg-backgroundDark">
        <View className="w-32 h-1 bg-secondary-200 dark:bg-white/20 rounded-full" />
      </View>
    </View>
  );
}

// ============================================================================
// QR Scanner
// ============================================================================

interface QRScannerProps {
  onScanned: (code: string) => void;
  onSwitchToManual: () => void;
}

function QRScanner({ onScanned, onSwitchToManual }: QRScannerProps) {
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (scanned) return;

    const { data } = result;

    // Extract event code from URL or use raw data
    // Expected formats:
    // - https://runningparty.run/join/ABC123
    // - the-run://join/ABC123
    // - ABC123 (raw code)
    const urlMatch = data.match(/\/join\/([A-Za-z0-9]+)/);
    const code = urlMatch ? urlMatch[1].toUpperCase() : data.toUpperCase();

    if (code && code.length >= 4) {
      setScanned(true);
      onScanned(code);
    }
  }, [scanned, onScanned]);

  const handleRescan = useCallback(() => {
    setScanned(false);
  }, []);

  return (
    <View style={styles.scannerContainer}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top */}
          <View style={styles.overlayTop} />

          {/* Middle row with cutout */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanArea}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <View style={styles.overlaySide} />
          </View>

          {/* Bottom */}
          <View style={styles.overlayBottom}>
            <Typography className="text-white text-center mb-2">
              Placez le QR code dans le cadre
            </Typography>

            {scanned && (
              <Button variant="outline" size="sm" onPress={handleRescan}>
                Scanner a nouveau
              </Button>
            )}
          </View>
        </View>
      </CameraView>

      {/* Bottom action button */}
      <View style={styles.bottomActions}>
        <Button
          variant="outline"
          size="lg"
          isFullWidth
          onPress={onSwitchToManual}
        >
          Entrer le code manuellement
        </Button>
      </View>
    </View>
  );
}

// ============================================================================
// Main Scan Screen
// ============================================================================

type ScanMode = 'scan' | 'manual';

export default function ScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>(
    params.mode === 'manual' ? 'manual' : 'scan'
  );
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Sync initial mode from deep link / navigation params (e.g. "Join with a code")
  useEffect(() => {
    if (params.mode === 'manual') {
      setMode('manual');
    }
  }, [params.mode]);

  // Determine initial mode based on permission when no param
  useEffect(() => {
    if (!params.mode && permission && !permission.granted) {
      setMode('manual');
    }
  }, [permission, params.mode]);

  const handleCodeSubmit = useCallback((code: string) => {
    router.push(`/join/${code}`);
  }, [router]);

  const handleRequestPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    try {
      const result = await requestPermission();
      if (result.granted) {
        setMode('scan');
      }
    } finally {
      setIsRequestingPermission(false);
    }
  }, [requestPermission]);

  const handleOpenSettings = useCallback(() => {
    // On iOS, this opens the app settings
    // On Android, we can use Linking to open settings
    if (Platform.OS === 'ios') {
      import('expo-linking').then((Linking) => {
        Linking.openSettings();
      });
    } else {
      Alert.alert(
        'Parametres',
        'Ouvrez les parametres de l\'application pour autoriser la camera.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const switchToManual = useCallback(() => {
    setMode('manual');
  }, []);

  const switchToScan = useCallback(() => {
    if (permission?.granted) {
      setMode('scan');
    } else {
      handleRequestPermission();
    }
  }, [permission, handleRequestPermission]);

  // Still loading permissions
  if (!permission) {
    return (
      <>
        <Stack.Screen options={{ title: 'Scanner' }} />
        <Container isCenter hasSafeArea>
          <Typography color="muted">Chargement...</Typography>
        </Container>
      </>
    );
  }

  // Manual mode or no permission
  if (mode === 'manual') {
    return (
      <>
        <Stack.Screen options={{ title: 'Rejoindre' }} />
        <ManualCodeEntry
          onSubmit={handleCodeSubmit}
          onSwitchToScan={switchToScan}
          onBack={() => router.back()}
          hasPermission={permission.granted}
        />
      </>
    );
  }

  // Need to request permission
  if (!permission.granted && !permission.canAskAgain) {
    return (
      <>
        <Stack.Screen options={{ title: 'Scanner' }} />
        <PermissionDenied
          onOpenSettings={handleOpenSettings}
          onUseCode={switchToManual}
        />
      </>
    );
  }

  if (!permission.granted) {
    return (
      <>
        <Stack.Screen options={{ title: 'Scanner' }} />
        <PermissionRequest
          onRequestPermission={handleRequestPermission}
          isPending={isRequestingPermission}
        />
      </>
    );
  }

  // Scanner mode
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Scanner',
          headerTransparent: true,
          headerTintColor: '#fff',
        }}
      />
      <QRScanner
        onScanned={handleCodeSubmit}
        onSwitchToManual={switchToManual}
      />
    </>
  );
}

// ============================================================================
// Styles
// ============================================================================

const SCAN_AREA_SIZE = 250;

const styles = StyleSheet.create({
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#16a34a',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});
