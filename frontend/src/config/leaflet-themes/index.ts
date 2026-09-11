import type { SparMapTheme, SparMapThemeProfile } from '../../types/SparMapTypes';
import { colareaProfile } from './colarea';
import { collectionProfile } from './collection';
import { aouaProfile } from './aoua';
import { aoubProfile } from './aoub';
import { aoubplusProfile } from './aoubplus';
import { aoucbstProfile } from './aoucbst';
import { plantsiteAProfile } from './plantsiteA';
import { plantsiteAFillProfile } from './plantsiteAFill';
import { plantsiteBProfile } from './plantsiteB';
import { plantsitecbstProfile } from './plantsitecbst';
import { defaultProfile } from './default';

/**
 * Registry of all 11 SPAR map theme profiles. Now fully populated across
 * every `SparMapTheme` key after Task 18.
 */
const profiles: Record<SparMapTheme, SparMapThemeProfile> = {
  COLAREA: colareaProfile,
  collection: collectionProfile,
  aoua: aouaProfile,
  aoub: aoubProfile,
  aoubplus: aoubplusProfile,
  AOUCBST: aoucbstProfile,
  plantsiteA: plantsiteAProfile,
  plantsiteAFill: plantsiteAFillProfile,
  plantsiteB: plantsiteBProfile,
  PLANTSITECBST: plantsitecbstProfile,
  default: defaultProfile
};

/**
 * Look up a theme profile by name. Because `profiles` is a total
 * `Record<SparMapTheme, ...>`, the lookup is guaranteed to return a profile
 * for any valid theme key and the previous throw branch is unreachable.
 */
export const getThemeProfile = (theme: SparMapTheme): SparMapThemeProfile => profiles[theme];
