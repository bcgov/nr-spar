import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import CollapsibleCard from '../../../views/Seedlot/SeedlotMap/CollapsibleCard';

describe('CollapsibleCard', () => {
  it('renders closed by default when defaultOpen is false', () => {
    render(
      <CollapsibleCard title="Legend" defaultOpen={false}>
        <p data-testid="child">hidden content</p>
      </CollapsibleCard>
    );

    // Header is always present
    expect(screen.queryByTestId('card-legend')).toBeTruthy();
    expect(screen.queryByTestId('card-legend-toggle')).toBeTruthy();
    // Body + children are not rendered when closed
    expect(screen.queryByTestId('card-legend-body')).toBeNull();
    expect(screen.queryByTestId('child')).toBeNull();
    // aria-expanded reflects the closed state
    expect(screen.getByTestId('card-legend-toggle').getAttribute('aria-expanded'))
      .toBe('false');
  });

  it('renders open when defaultOpen is true', () => {
    render(
      <CollapsibleCard title="Bookmarks" defaultOpen>
        <p data-testid="child">visible content</p>
      </CollapsibleCard>
    );

    expect(screen.queryByTestId('card-bookmarks-body')).toBeTruthy();
    expect(screen.queryByTestId('child')).toBeTruthy();
    expect(screen.getByTestId('card-bookmarks-toggle').getAttribute('aria-expanded'))
      .toBe('true');
  });

  it('toggles open state when the header button is clicked', () => {
    render(
      <CollapsibleCard title="Polygon statistics" defaultOpen={false}>
        <p data-testid="child">payload</p>
      </CollapsibleCard>
    );

    const toggle = screen.getByTestId('card-polygon-statistics-toggle');

    // Starts closed
    expect(screen.queryByTestId('child')).toBeNull();

    // Click opens the card
    fireEvent.click(toggle);
    expect(screen.queryByTestId('child')).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    // Click again closes it
    fireEvent.click(toggle);
    expect(screen.queryByTestId('child')).toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('derives a stable testid slug from multi-word titles', () => {
    render(
      <CollapsibleCard title="My Custom Card">
        <span>child</span>
      </CollapsibleCard>
    );

    // Spaces are collapsed into hyphens and lower-cased
    expect(screen.queryByTestId('card-my-custom-card')).toBeTruthy();
  });
});
