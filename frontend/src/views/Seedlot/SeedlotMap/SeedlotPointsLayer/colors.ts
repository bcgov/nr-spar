/**
 * Per-species colour for seedlot/veglot point markers. Mirrors the
 * legacy SPAR per-species styles (`styles=4331..4378` on the WMS layer)
 * which used distinct colours per vegetation code so an operator could
 * scan the map and tell species apart at a glance.
 *
 * Values are picked to give good visual separation between the species
 * most commonly registered in SPAR (FD, PL, HW, CW, SX, BL, etc.) and
 * to stay distinguishable when alpha-blended over the BC Gov basemap.
 *
 * Codes not in this table render in `DEFAULT_COLOR` — gray — so the
 * point is still visible but visually de-emphasised vs known species.
 */

export const SPECIES_COLOR_MAP: Record<string, string> = {
  // Conifer mainstays
  FDC: '#1b5e20', // Coastal Douglas Fir — dark green
  FDI: '#8d6e63', // Interior Douglas Fir — olive/brown
  PLI: '#fb8c00', // Interior Lodgepole Pine — orange
  PLC: '#ff7043', // Coastal Lodgepole Pine — coral
  HW: '#e91e63', // Western Hemlock — pink
  HM: '#9c27b0', // Mountain Hemlock — magenta
  SS: '#00bcd4', // Sitka Spruce — cyan
  SX: '#26a69a', // Spruce Hybrid — teal
  SXS: '#4dd0e1', // Sitka Spruce Hybrid — turquoise
  SB: '#3949ab', // Black Spruce — indigo
  CW: '#5d4037', // Western Red Cedar — brown
  YC: '#fbc02d', // Yellow Cedar — yellow
  LW: '#7b1fa2', // Western Larch — purple
  LT: '#9575cd', // Tamarack — mauve
  PW: '#b39ddb', // White Pine — lavender
  PY: '#d4af37', // Yellow Pine — gold
  BA: '#42a5f5', // Amabilis Fir — light blue
  BG: '#aed581', // Grand Fir — light green
  BL: '#1976d2', // Subalpine Fir — blue
  BP: '#283593', // Noble Fir — dark blue

  // Hardwoods
  AC: '#fff59d', // Poplar — pale yellow
  AX: '#ffcc80', // Poplar Hybrid — pale orange
  AT: '#fff176', // Trembling Aspen — light yellow
  EP: '#c5e1a5', // Paper Birch — pale green
  ALNUCRI: '#ffab91', // Sitka Alder — light salmon
  DG: '#ff8a65' // Green/Sitka Alder hybrid — salmon
};

/** Fallback colour for species codes not in the map. */
export const DEFAULT_COLOR = '#9e9e9e';

/**
 * Look up the colour for a vegetation code. Falls back to
 * `DEFAULT_COLOR` for unknown codes so the marker is still visible.
 */
export const colorForSpecies = (code: string | null | undefined): string => {
  if (!code) return DEFAULT_COLOR;
  return SPECIES_COLOR_MAP[code.toUpperCase()] ?? DEFAULT_COLOR;
};
