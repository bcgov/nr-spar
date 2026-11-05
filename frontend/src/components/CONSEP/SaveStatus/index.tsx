import React, { useEffect, useState } from 'react';
import { Button, InlineLoading } from '@carbon/react';

import { AutosaveStatus } from '../../../hooks/useAutosave';
import './styles.scss';

type SaveStatusProps = {
  status: AutosaveStatus;
  onRetry: () => void;
  onReload: () => void;
};

const minutesAgo = (savedAt: Date, now: number) => {
  const minutes = Math.floor((now - savedAt.getTime()) / 60000);
  return minutes < 1 ? 'just now' : `${minutes} min ago`;
};

/**
 * The one place a page shows how auto save is doing (#2785): persistent and non-blocking,
 * replacing the per-save toasts and the conflict banner.
 */
const SaveStatus = ({ status, onRetry, onReload }: SaveStatusProps) => {
  // Re-render twice a minute so "x min ago" keeps up.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  switch (status.state) {
    case 'saving':
      return <InlineLoading className="save-status" status="active" description="Saving…" />;
    case 'saved':
      return (
        <InlineLoading
          className="save-status"
          status="finished"
          description={`Saved ${status.savedAt ? minutesAgo(status.savedAt, now) : ''}`.trim()}
        />
      );
    case 'failed':
      return (
        <div className="save-status">
          <InlineLoading status="error" description="Not saved. Your next change retries, or" />
          <Button kind="ghost" size="sm" onClick={onRetry}>Retry now</Button>
        </div>
      );
    case 'conflict':
      return (
        <div className="save-status">
          <InlineLoading status="error" description="Conflict detected" />
          <span className="save-status-detail">
            Another user changed this test, so saving is paused. Reload to continue; unsaved
            changes will be lost.
          </span>
          <Button kind="ghost" size="sm" onClick={onReload}>Reload</Button>
        </div>
      );
    default:
      return null;
  }
};

export default SaveStatus;
