import React from 'react';
import { Loading } from '@carbon/react';

interface LoadingMaskProps {
  message?: string;
}

/**
 * Full-viewport loading mask shown while the AOI save/validate flow is
 * in flight. Mirrors the legacy SPAR `<div id="loadingMask">` overlay
 * from `cwmSparmap.jsp:362` and the visibility toggles in
 * `sparmap.js:734, 760, 772` — the legacy code popped a half-opaque
 * gray screen during the `seedCollectionMarkup.do` AJAX round-trip so
 * operators got immediate "something is happening" feedback.
 *
 * The mask covers the full viewport (position:fixed) rather than just
 * the map workspace — long Submit operations were the legacy use case,
 * and operators expect the whole page to feel disabled until the save
 * resolves. Click events bubble through the mask div by default; the
 * Carbon `<Loading>` spinner handles aria-live announcements for us.
 */
export const LoadingMask = ({ message = 'Working…' }: LoadingMaskProps) => (
  <div className="aoi-loading-mask" data-testid="aoi-loading-mask" aria-live="polite">
    <Loading description={message} small={false} withOverlay={false} />
    <span className="aoi-loading-mask__message">{message}</span>
  </div>
);

export default LoadingMask;
