# The Run – Front (Expo)

Application mobile (Expo / React Native) pour The Run.

## Prérequis

- Node.js 18+
- npm ou yarn

## Installation

```bash
npm install
```

Copier `.env.example` vers `.env` et renseigner les variables (ex. `API_BASE_URL`).

## Lancer l’app

Sans Android ni iOS installés, lance directement dans le navigateur :

```bash
npm run start:web
```

Ou `npm start` puis appuyer sur **w** pour ouvrir le web. Pour Android/iOS, il faut le SDK ou Xcode configuré sur la machine.

## Tests

```bash
npm test
npm run test:coverage
```

### Tests E2E API (creation de compte)

Test de bout en bout contre l’API reelle (therun) : POST /api/user/register, GET /me avec le token, 400/409.

**Prerequis :** API therun lancee sur `http://localhost:3000`.

```bash
npm run test:e2e:api
```

URL de l’API modifiable via `E2E_API_BASE_URL` (ex. `http://192.168.x.x:3000/api`).

## Dépannage

### Android : "Failed to resolve the Android SDK path"

Le SDK Android n’est pas trouvé. Définir le chemin du SDK :

```bash
export ANDROID_HOME=$HOME/Android/Sdk
# ou, si installé via Android Studio :
export ANDROID_HOME=$HOME/AppData/Local/Android/Sdk   # Windows
```

Pour que ce soit permanent, ajouter la ligne dans `~/.bashrc` ou `~/.profile`, puis redémarrer le terminal.

Si le SDK n’est pas installé : installer [Android Studio](https://developer.android.com/studio) et accepter l’installation du SDK, ou installer uniquement les [command line tools](https://developer.android.com/studio#command-tools).

### "Error: spawn adb ENOENT"

`adb` n’est pas dans le `PATH`. En général le SDK fournit `adb` dans `$ANDROID_HOME/platform-tools`. Ajouter au `PATH` :

```bash
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Warning "SafeAreaView has been deprecated"

Ce message vient des composants internes de React Native (LogBox / DevTools), pas du code de l’app. L’app utilise déjà `react-native-safe-area-context` (SafeAreaProvider, useSafeAreaInsets). Le warning disparaîtra dans une future version de React Native. Il peut être ignoré.

### DevTools : "EDGE_PATH environment variable must be set"

Optionnel. Si tu veux ouvrir les React Native DevTools dans Edge/Chromium, définir par exemple :

```bash
export EDGE_PATH=/usr/bin/edge   # ou chemin vers edge/chrome
```

Sans cela, l’app tourne normalement ; seul le lancement automatique des DevTools échoue.
