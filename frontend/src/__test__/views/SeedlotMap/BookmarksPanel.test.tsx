import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

import BookmarksPanel from '../../../views/Seedlot/SeedlotMap/BookmarksPanel';
import {
  SparMapProvider,
  useSparMap,
} from '../../../contexts/SparMapContext';

/**
 * BookmarksPanel is pure in-memory UI — no API calls, no persistence.
 * The tests focus on the state transitions:
 *   1. Empty-state tile renders when the bookmark list is empty.
 *   2. Save + name workflow appends a bookmark and clears the name.
 *   3. Go button invokes the context `restoreView` with the correct
 *      center/zoom.
 *   4. Delete button removes the bookmark from the list.
 *
 * The context bridge callbacks (`getCurrentView`, `restoreView`) are
 * injected by a helper wrapper component that emulates `<ViewControl>`.
 */

const injectBridge = (
  getCurrentViewMock: () => { center: [number, number]; zoom: number } | null,
  restoreViewMock: (center: [number, number], zoom: number) => void,
) => {
  const BridgeInjector = () => {
    const { _setMapControls } = useSparMap();
    React.useEffect(() => {
      _setMapControls({
        getCurrentView: getCurrentViewMock,
        restoreView: restoreViewMock,
      });
      return () =>
        _setMapControls({ getCurrentView: null, restoreView: null });
    }, [_setMapControls]);
    return null;
  };
  return BridgeInjector;
};

const renderPanel = (
  getCurrentViewMock: () => { center: [number, number]; zoom: number } | null,
  restoreViewMock: (center: [number, number], zoom: number) => void,
) => {
  const BridgeInjector = injectBridge(getCurrentViewMock, restoreViewMock);
  return render(
    <SparMapProvider>
      <BridgeInjector />
      <BookmarksPanel />
    </SparMapProvider>,
  );
};

const typeName = (value: string) => {
  // Carbon's <TextInput> forwards `data-testid` onto the underlying
  // <input>, so no querySelector step is needed.
  const input = screen.getByTestId('bookmark-name-input') as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
  return input;
};

describe('BookmarksPanel', () => {
  beforeEach(() => {
    // Freeze Date.now() so the generated bookmark IDs are predictable.
    vi.spyOn(Date, 'now').mockReturnValue(1712345678900);
  });

  it('renders the session-only note and empty-state Tile initially', () => {
    renderPanel(
      () => ({ center: [48.43, -123.37], zoom: 10 }),
      () => {},
    );
    expect(screen.queryByTestId('bookmarks-panel')).toBeTruthy();
    expect(screen.queryByTestId('bookmarks-panel-note')).toBeTruthy();
    expect(screen.queryByTestId('bookmarks-panel-empty')).toBeTruthy();
    // Save button should exist but be disabled until a name is typed.
    const saveBtn = screen.getByTestId('bookmark-save') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });

  it('enables the Save button once a non-empty name is typed', () => {
    renderPanel(
      () => ({ center: [48.43, -123.37], zoom: 10 }),
      () => {},
    );
    typeName('Victoria harbour');
    const saveBtn = screen.getByTestId('bookmark-save') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(false);
  });

  it('adds a bookmark to the list when Save is clicked with a valid name', () => {
    renderPanel(
      () => ({ center: [48.43, -123.37], zoom: 10 }),
      () => {},
    );
    typeName('Victoria harbour');
    act(() => {
      fireEvent.click(screen.getByTestId('bookmark-save'));
    });
    // Empty state Tile should be gone; the list should show the name.
    expect(screen.queryByTestId('bookmarks-panel-empty')).toBeFalsy();
    expect(screen.queryByText('Victoria harbour')).toBeTruthy();
  });

  it('clears the name input after saving', () => {
    renderPanel(
      () => ({ center: [48.43, -123.37], zoom: 10 }),
      () => {},
    );
    const input = typeName('Kelowna');
    act(() => {
      fireEvent.click(screen.getByTestId('bookmark-save'));
    });
    expect(input.value).toBe('');
  });

  it('calls restoreView with the bookmarked center + zoom when Go is clicked', () => {
    const restoreMock = vi.fn();
    renderPanel(
      () => ({ center: [48.4284, -123.3656], zoom: 12 }),
      restoreMock,
    );
    typeName('Johnson St');
    act(() => {
      fireEvent.click(screen.getByTestId('bookmark-save'));
    });
    // Find the single Go button via a testid prefix match.
    const goButtons = screen.getAllByText('Go');
    act(() => {
      fireEvent.click(goButtons[0]);
    });
    expect(restoreMock).toHaveBeenCalledTimes(1);
    expect(restoreMock).toHaveBeenCalledWith([48.4284, -123.3656], 12);
  });

  it('removes the bookmark from the list when Delete is clicked', () => {
    renderPanel(
      () => ({ center: [48.43, -123.37], zoom: 10 }),
      () => {},
    );
    typeName('Delete me');
    act(() => {
      fireEvent.click(screen.getByTestId('bookmark-save'));
    });
    expect(screen.queryByText('Delete me')).toBeTruthy();
    // Find the delete button — Carbon's hasIconOnly Button renders
    // its iconDescription as an accessible name on the <button>.
    const deleteBtn = screen.getByRole('button', { name: /Delete bookmark/i });
    act(() => {
      fireEvent.click(deleteBtn);
    });
    expect(screen.queryByText('Delete me')).toBeNull();
    // Empty state should come back.
    expect(screen.queryByTestId('bookmarks-panel-empty')).toBeTruthy();
  });

  it('does not save a bookmark when getCurrentView returns null', () => {
    renderPanel(() => null, () => {});
    typeName('Never saved');
    act(() => {
      fireEvent.click(screen.getByTestId('bookmark-save'));
    });
    // Bookmark should not have been added — empty state stays.
    expect(screen.queryByText('Never saved')).toBeNull();
    expect(screen.queryByTestId('bookmarks-panel-empty')).toBeTruthy();
  });
});
