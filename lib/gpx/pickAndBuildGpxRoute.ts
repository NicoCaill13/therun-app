import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { Platform } from "react-native";

import { buildGpxRouteFromXml } from "@/lib/gpx/buildGpxRouteFromXml";
import {
  assertPickedFileIsGpx,
  getGpxDocumentPickerTypes,
} from "@/lib/gpx/gpxDocumentPickerConfig";
import { MAX_GPX_FILE_BYTES } from "@/lib/gpx/gpxConstants";
import type { GpxRouteDraft } from "@/lib/gpx/gpxRouteDraft";
import { GpxImportCancelledError } from "@/lib/gpx/gpxImportErrors";

async function readUriAsUtf8(uri: string): Promise<string> {
  if (Platform.OS === "web") {
    const res = await fetch(uri);
    return res.text();
  }
  const file = new File(uri);
  return file.text();
}

export async function pickAndBuildGpxRoute(): Promise<GpxRouteDraft> {
  const result = await DocumentPicker.getDocumentAsync({
    type: getGpxDocumentPickerTypes(),
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new GpxImportCancelledError();
  }

  const asset = result.assets[0];
  const uri = asset.uri;
  const fileName = asset.name?.trim() || "route.gpx";

  assertPickedFileIsGpx(fileName, asset.mimeType);

  if (asset.size != null && asset.size > MAX_GPX_FILE_BYTES) {
    throw new Error("This file exceeds the 5MB limit.");
  }

  const xml = await readUriAsUtf8(uri);
  if (xml.length > MAX_GPX_FILE_BYTES) {
    throw new Error("This file exceeds the 5MB limit.");
  }

  return buildGpxRouteFromXml(xml, fileName);
}
