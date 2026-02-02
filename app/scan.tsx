import { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
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
// Manual Code Entry
// ============================================================================

interface ManualCodeEntryProps {
  onSubmit: (code: string) => void;
  onSwitchToScan: () => void;
  hasPermission: boolean;
}

function ManualCodeEntry({ onSubmit, onSwitchToScan, hasPermission }: ManualCodeEntryProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = code.trim().toUpperCase();

    if (trimmed.length < 4) {
      setError('Le code doit contenir au moins 4 caracteres');
      return;
    }

    setError(null);
    onSubmit(trimmed);
  }, [code, onSubmit]);

  const handleCodeChange = useCallback((text: string) => {
    // Allow only alphanumeric characters, uppercase
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setCode(cleaned);
    setError(null);
  }, []);

  return (
    <Container hasSafeArea padding="lg">
      <H1 className="mb-2">Rejoindre une sortie</H1>
      <Typography color="muted" className="mb-8">
        Entrez le code de l'evenement pour le rejoindre
      </Typography>

      <Input
        label="Code de l'evenement"
        placeholder="Ex: ABC123"
        value={code}
        onChangeText={handleCodeChange}
        error={error ?? undefined}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        containerClassName="mb-6"
        className="text-center text-2xl font-mono tracking-widest"
      />

      <Button
        variant="primary"
        size="lg"
        isFullWidth
        onPress={handleSubmit}
        isDisabled={code.length < 4}
      >
        Rejoindre
      </Button>

      {hasPermission && (
        <Button
          variant="ghost"
          size="lg"
          isFullWidth
          onPress={onSwitchToScan}
          className="mt-4"
        >
          Scanner un QR code
        </Button>
      )}
    </Container>
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
    // - https://the.run/join/ABC123
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
