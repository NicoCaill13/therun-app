import { Alert, Platform } from "react-native";

/**
 * Cross-platform user-visible message. On web, React Native's Alert is easy to miss;
 * use the browser's native dialog there so validation and API errors are visible.
 */
export function showAppAlert(title: string, message?: string): void {
  if (Platform.OS === "web") {
    const text = message ? `${title}\n\n${message}` : title;
    if (typeof globalThis.alert === "function") {
      globalThis.alert(text);
    }
    return;
  }
  if (message !== undefined && message.length > 0) {
    Alert.alert(title, message);
    return;
  }
  Alert.alert(title);
}
