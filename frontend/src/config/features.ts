import { env } from '../env';

/**
 * Toggles for functionality that ops can turn off without a redeploy, sourced
 * from the `nr-spar-<zone>-features` OpenShift ConfigMap. The value arrives at
 * runtime through Caddy's `/env.js`, so flipping the ConfigMap and restarting
 * the frontend rollout is enough — no rebuild.
 *
 * Only the literal string `true` enables a flag. An unset or any other value
 * leaves the feature off.
 */
const isEnabled = (value: unknown): boolean => String(value ?? '').toLowerCase() === 'true';

export const isSeedlotBEnabled = (): boolean => isEnabled(env.VITE_SEEDLOT_B_ENABLED);
