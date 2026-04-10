import type { ReactElement } from "react";
import { useId, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Line, Pattern, Polyline, Rect } from "react-native-svg";

import { decodePolyline } from "@/lib/geo/googlePolyline";
import { latLngPathToSvgPolylineLayout } from "@/lib/geo/latLngPathToSvgPolylinePoints";

/**
 * Matches tpl/mobile/polyline/code.html: grid on surface-container-low, black drop
 * shadow polyline, soft orange glow layer, main #ff5722 stroke, start/end nodes.
 * Geographic aspect ratio preserved via latLngPathToSvgPolylineLayout + meet.
 */
const MAX_VIEW_EXTENT = 100;
const PADDING_RATIO = 0.02;

/** tpl viewBox width 400 — stroke widths in template are in this user space. */
const TPL_VIEWBOX_REF = 400;
const TPL_STROKE_SHADOW = 4;
const TPL_STROKE_MAIN = 2.5;
const TPL_STROKE_GLOW = 6.5;
const TPL_START_R = 4;
const TPL_START_RING = 2;
const TPL_END_R = 4;

const PLATE_BG = "#131313";
const SHADOW_STROKE = "rgba(0,0,0,0.5)";
const GLOW_STROKE = "rgba(255, 87, 34, 0.42)";
const START_FILL = "#0e0e0e";

function parsePolylineEndpoints(
  points: string,
): { sx: number; sy: number; ex: number; ey: number } | null {
  const pairs = points.trim().split(/\s+/).filter(Boolean);
  if (pairs.length < 2) {
    return null;
  }
  const read = (pair: string): { x: number; y: number } | null => {
    const [xs, ys] = pair.split(",");
    const x = Number(xs);
    const y = Number(ys);
    if (Number.isNaN(x) || Number.isNaN(y)) {
      return null;
    }
    return { x, y };
  };
  const start = read(pairs[0]);
  const end = read(pairs[pairs.length - 1]);
  if (!start || !end) {
    return null;
  }
  return { sx: start.x, sy: start.y, ex: end.x, ey: end.y };
}

function tplScale(viewBoxWidth: number, viewBoxHeight: number): number {
  const raw = Math.min(viewBoxWidth, viewBoxHeight) / TPL_VIEWBOX_REF;
  return Math.max(raw, 0.22);
}

interface RoutePolylinePreviewProps {
  encodedPolyline: string;
  strokeColor?: string;
  backgroundColor?: string;
}

export function RoutePolylinePreview({
  encodedPolyline,
  strokeColor = "#ff5722",
  backgroundColor = PLATE_BG,
}: RoutePolylinePreviewProps): ReactElement {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const patternId = `rpGrid${uid}`;

  const layout = useMemo(() => {
    const path = decodePolyline(encodedPolyline);
    return latLngPathToSvgPolylineLayout(path, MAX_VIEW_EXTENT, PADDING_RATIO);
  }, [encodedPolyline]);

  const endpoints = useMemo(
    () => (layout ? parsePolylineEndpoints(layout.points) : null),
    [layout],
  );

  if (!layout || !endpoints) {
    return <View style={[styles.fill, { backgroundColor }]} />;
  }

  const { points, viewBoxWidth: vw, viewBoxHeight: vh } = layout;
  const k = tplScale(vw, vh);
  const strokeShadow = TPL_STROKE_SHADOW * k;
  const strokeGlow = TPL_STROKE_GLOW * k;
  const strokeMain = TPL_STROKE_MAIN * k;
  const startR = TPL_START_R * k;
  const startRing = TPL_START_RING * k;
  const endR = TPL_END_R * k;

  const cell = Math.max(Math.min(vw, vh) * 0.1, 3);
  const gridLine = Math.max(cell * 0.035, 0.06);

  return (
    <View style={[styles.fill, { backgroundColor }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${vw} ${vh}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <Pattern
            id={patternId}
            width={cell}
            height={cell}
            patternUnits="userSpaceOnUse"
          >
            <Line
              x1={0}
              y1={0}
              x2={cell}
              y2={0}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={gridLine}
            />
            <Line
              x1={0}
              y1={0}
              x2={0}
              y2={cell}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={gridLine}
            />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width={vw} height={vh} fill={backgroundColor} />
        <Rect x={0} y={0} width={vw} height={vh} fill={`url(#${patternId})`} />
        <Polyline
          points={points}
          fill="none"
          stroke={SHADOW_STROKE}
          strokeWidth={strokeShadow}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Polyline
          points={points}
          fill="none"
          stroke={GLOW_STROKE}
          strokeWidth={strokeGlow}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeMain}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={endpoints.sx}
          cy={endpoints.sy}
          r={startR}
          fill={START_FILL}
          stroke={strokeColor}
          strokeWidth={startRing}
        />
        <Circle
          cx={endpoints.ex}
          cy={endpoints.ey}
          r={endR}
          fill={strokeColor}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
