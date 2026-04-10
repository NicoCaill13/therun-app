import { Platform } from "react-native";

/**
 * MIME types / extensions for expo-document-picker.
 *
 * - Web: the HTML `accept` attribute often greys out `.gpx` if only MIME types are
 *   listed, because the browser frequently reports an empty `File.type` for GPX.
 * - iOS: `UTType(mimeType: "application/gpx+xml")` is often nil in Expo's bridge,
 *   which breaks filtering; we open all types and validate after pick.
 * - Android: some providers expose GPX as `application/octet-stream`.
 */
export function getGpxDocumentPickerTypes(): string[] {
  if (Platform.OS === "web") {
    return [
      ".gpx",
      "application/gpx+xml",
      "application/xml",
      "text/xml",
      "text/plain",
    ];
  }
  if (Platform.OS === "ios") {
    return ["*/*"];
  }
  return [
    "application/gpx+xml",
    "application/xml",
    "text/xml",
    "text/plain",
    "application/octet-stream",
  ];
}

export function assertPickedFileIsGpx(
  fileName: string,
  mimeType?: string | null,
): void {
  const trimmed = fileName.trim();
  if (trimmed.toLowerCase().endsWith(".gpx")) {
    return;
  }
  const m = mimeType?.toLowerCase().trim();
  if (m === "application/gpx+xml") {
    return;
  }
  throw new Error("Please choose a GPX file (.gpx).");
}
