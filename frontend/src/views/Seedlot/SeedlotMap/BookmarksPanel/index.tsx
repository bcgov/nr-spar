import React, { useState } from 'react';
import {
  TextInput,
  Button,
  ContainedList,
  ContainedListItem,
  Tile
} from '@carbon/react';
import { Bookmark as BookmarkIcon, TrashCan } from '@carbon/icons-react';

import { useSparMap } from '../../../../contexts/SparMapContext';

/**
 * A single in-memory bookmark of a map view. Intentionally flat and
 * serialisable so the shape could later be persisted to the backend
 * without any refactor — but for SPAR (ISSSDP-153 matrix: SESSION=-,
 * BOOKMARKS=Y) we keep it in memory only, matching the legacy CWM
 * behavior.
 */
interface Bookmark {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  createdAt: string;
}

/**
 * BOOKMARKS panel — Batch 3. Session-scoped list of saved map views
 * (center + zoom) with save + recall + delete affordances. Rendered
 * OUTSIDE the `<MapContainer>` as a sibling of GeomCalcPanel /
 * LegendPanel; relies on `<ViewControl>` being mounted inside the map
 * to register the `getCurrentView` + `restoreView` bridge callbacks.
 *
 * Bookmarks are NOT persisted across sessions — neither localStorage
 * nor the backend are touched. Leaving the page clears the list, which
 * matches the SPAR parity matrix. A prominent note in the panel body
 * tells the user to expect this so they don't assume their bookmarks
 * will still be there tomorrow.
 */
const BookmarksPanel = () => {
  const { getCurrentView, restoreView } = useSparMap();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [name, setName] = useState('');

  const canSave = Boolean(name.trim()) && Boolean(getCurrentView);

  const handleSave = () => {
    const view = getCurrentView?.();
    if (!view || !name.trim()) return;
    const bm: Bookmark = {
      // Date.now()+random suffix is unique enough for an in-memory
      // list. We don't need a UUID generator dependency for this.
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      center: view.center,
      zoom: view.zoom,
      createdAt: new Date().toISOString()
    };
    setBookmarks((prev) => [...prev, bm]);
    setName('');
  };

  const handleGo = (bm: Bookmark) => {
    restoreView?.(bm.center, bm.zoom);
  };

  const handleDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="bookmarks-panel" data-testid="bookmarks-panel">
      <h3 className="bookmarks-panel__heading">Bookmarks</h3>
      <p className="bookmarks-panel__note" data-testid="bookmarks-panel-note">
        Bookmarks are stored for this session only — they will clear
        when you leave the page.
      </p>
      <div className="bookmarks-panel__form">
        <TextInput
          id="bookmark-name"
          labelText="Bookmark name"
          placeholder="e.g. Victoria harbour"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          data-testid="bookmark-name-input"
        />
        <Button
          kind="primary"
          renderIcon={BookmarkIcon}
          onClick={handleSave}
          disabled={!canSave}
          data-testid="bookmark-save"
        >
          Save current view
        </Button>
      </div>
      {bookmarks.length === 0 ? (
        <Tile data-testid="bookmarks-panel-empty">
          No bookmarks saved yet. Use the button above to save the
          current map view.
        </Tile>
      ) : (
        <ContainedList
          label="Saved views"
          kind="on-page"
          data-testid="bookmarks-panel-list"
        >
          {bookmarks.map((bm) => (
            <ContainedListItem
              key={bm.id}
              data-testid={`bookmark-item-${bm.id}`}
              action={(
                <>
                  <Button
                    kind="ghost"
                    size="sm"
                    onClick={() => handleGo(bm)}
                    data-testid={`bookmark-go-${bm.id}`}
                  >
                    Go
                  </Button>
                  <Button
                    kind="ghost"
                    size="sm"
                    hasIconOnly
                    iconDescription="Delete bookmark"
                    renderIcon={TrashCan}
                    onClick={() => handleDelete(bm.id)}
                    data-testid={`bookmark-delete-${bm.id}`}
                  />
                </>
              )}
            >
              {bm.name}
            </ContainedListItem>
          ))}
        </ContainedList>
      )}
    </div>
  );
};

export default BookmarksPanel;
