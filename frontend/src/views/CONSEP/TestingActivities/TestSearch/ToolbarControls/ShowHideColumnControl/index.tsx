/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { Button, Checkbox } from '@carbon/react';
import * as Icons from '@carbon/icons-react';
import { type MRT_TableInstance } from 'material-react-table';
import { Menu, MenuItem } from '@mui/material';
import './styles.scss';

const ShowHideColumnControl = ({
  table,
  columnVisibilityLocalStorageKey = 'table-columns-visibility'
}: {
  table: MRT_TableInstance<any>;
  columnVisibilityLocalStorageKey?: string;
}) => {
  // The button element that the menu is attached to
  const [menuButtonElement, setMenuButtonElement] = useState<null | HTMLElement>(null);

  // Menu is open if menuButtonElement exists
  const isMenuOpen = Boolean(menuButtonElement);

  useEffect(() => {
    localStorage.setItem(
      columnVisibilityLocalStorageKey,
      JSON.stringify(table.getState().columnVisibility)
    );
  }, [table.getState().columnVisibility]);

  // When button is clicked, set the element to anchor the menu
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuButtonElement(event.currentTarget);
  };

  // Close the menu
  const handleMenuClose = () => {
    setMenuButtonElement(null);
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        kind="primary"
        aria-label="Edit Columns"
        size="md"
        className="concep-test-search-table-toolbar-button"
      >
        Edit Columns
        <Icons.Column size={16} className="concep-test-search-table-toolbar-button-icon" />
      </Button>

      <Menu
        anchorEl={menuButtonElement} // Position menu relative to the button
        open={isMenuOpen}
        onClose={handleMenuClose}
        className="table-column-menu"
      >
        <div className="helper-text">Customize columns</div>

        {table
          .getAllLeafColumns()
          .slice(1, -1)
          .map((column: any) => (
            <MenuItem key={column.id}>
              <Checkbox
                id={`${column.id}-checkbox`}
                checked={column.getIsVisible()}
                labelText={column.columnDef.header}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const { checked } = e.target;
                  table.setColumnVisibility({
                    ...table.getState().columnVisibility,
                    [column.id]: checked
                  });
                }}
                className="column-checkbox"
              />
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default ShowHideColumnControl;
