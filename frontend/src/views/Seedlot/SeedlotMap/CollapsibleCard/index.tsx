import React, { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from '@carbon/icons-react';

import './styles.scss';

export interface CollapsibleCardProps {
  /** Heading text shown in the clickable header. */
  title: string;
  /** Whether the card body is visible on first render. Defaults to `false`. */
  defaultOpen?: boolean;
  /**
   * Optional controlled open state. When provided, the card defers to the
   * parent's value instead of managing its own. Pair with `onOpenChange`
   * to keep the parent in sync. Used by `<SeedlotMap>` to let the
   * `<MapToolbar>` Bookmarks button toggle the existing Bookmarks card.
   */
  open?: boolean;
  /** Called whenever the user clicks the header. Receives the next open value. */
  onOpenChange?: (open: boolean) => void;
  /** Card body content. Only rendered when the card is open. */
  children: ReactNode;
}

/**
 * Floating overlay card with a clickable header that toggles the body.
 *
 * Used inside the SeedlotMap workspace to stack collapsible info panels
 * (Legend / Bookmarks / Polygon statistics) on top of the Leaflet map,
 * matching the nr-silva OpeningsMap pattern of absolutely-positioned
 * white cards with rounded corners and a subtle shadow.
 *
 * The card supports BOTH uncontrolled (default) and controlled modes:
 * pass `defaultOpen` to set the initial state and let the card manage
 * itself, or pass `open`+`onOpenChange` to drive the open state from a
 * parent (e.g. so a sibling toolbar button can toggle the card open).
 * A stable `data-testid` is derived from the title so tests can locate a
 * card by its heading (e.g. `card-legend`, `card-bookmarks`).
 */
const CollapsibleCard = ({
  title,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children
}: CollapsibleCardProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const handleToggle = () => {
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const testId = `card-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const bodyId = `${testId}-body`;

  return (
    <div
      className={`collapsible-card ${open ? 'collapsible-card--open' : 'collapsible-card--closed'}`}
      data-testid={testId}
    >
      <button
        type="button"
        className="collapsible-card__header"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        data-testid={`${testId}-toggle`}
      >
        <span className="collapsible-card__title">{title}</span>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>
      {open && (
        <div
          id={bodyId}
          className="collapsible-card__body"
          data-testid={`${testId}-body`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleCard;
