import React from 'react';
import {
  OverflowMenuItem, Checkbox, TableBody, TableRow,
  TableCell, TextInput, ActionableNotification, Pagination
} from '@carbon/react';
import { pageText, pageSizesConfig } from '../constants';
import { HeaderObj, RowItem, TabTypes } from '../definitions';
import { ParentTreeStepDataObj } from '../../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { OrchardObj } from '../../OrchardStep/definitions';

import '../styles.scss';
import PaginationChangeType from '../../../../types/PaginationChangeType';

export const renderColOptions = (
  headerConfig: Array<HeaderObj>,
  currentTab: keyof TabTypes,
  toggleColumn: Function
) => {
  const toggleableCols = headerConfig
    .filter((header) => header.isAnOption && header.availableInTabs.includes(currentTab));

  return (
    <>
      <OverflowMenuItem
        className="menu-item-label-text"
        closeMenu={() => false}
        itemText={pageText[currentTab].toggleName}
      />
      {
        toggleableCols.map((header) => (
          <OverflowMenuItem
            key={header.id}
            closeMenu={() => false}
            onClick={(e: React.ChangeEvent<any>) => toggleColumn(header.id, e.target.nodeName)}
            itemText={
              (
                <Checkbox
                  checked={header.enabled}
                  id={header.id}
                  labelText={header.name}
                />
              )
            }
          />
        ))
      }
    </>
  );
};

const renderTableCell = (
  rowData: RowItem,
  header: HeaderObj,
  currentTab: keyof TabTypes,
  setInputChange: Function
) => {
  if (header.availableInTabs.includes(currentTab) && header.enabled) {
    const className = header.editable ? 'td-no-padding' : null;
    return (
      <TableCell key={header.id} className={className}>
        {
          header.editable
            ? (
              <TextInput
                labelText=""
                hideLabel
                type="number"
                placeholder="Add value"
                defaultValue={rowData[header.id]}
                id={`${rowData.cloneNumber}-${rowData[header.id]}`}
                onBlur={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setInputChange(rowData.cloneNumber, header.id, event.target.value);
                }}
                onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
                onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
                  if (event.key === 'Enter') {
                    (event.target as HTMLInputElement).blur();
                  }
                }}
              />
            )
            : (
              rowData[header.id]
            )
        }
      </TableCell>
    );
  }
  return null;
};

export const renderTableBody = (
  currentTab: keyof TabTypes,
  slicedRows: Array<RowItem>,
  headerConfig: Array<HeaderObj>,
  setInputChange: Function
) => {
  if (currentTab === 'mixTab') {
    return null;
  }
  return (
    <TableBody>
      {
        slicedRows.map((rowData) => (
          rowData.isCalcTab
            ? null
            : (
              <TableRow key={rowData.cloneNumber}>
                {
                  headerConfig.map((header) => (
                    renderTableCell(rowData, header, currentTab, setInputChange)
                  ))
                }
              </TableRow>
            )
        ))
      }
    </TableBody>
  );
};

export const renderNotification = (
  state: ParentTreeStepDataObj,
  currentTab: keyof TabTypes,
  orchardsData: Array<OrchardObj>,
  toggleNotification: Function
) => {
  if (state.notifCtrl[currentTab].showInfo && orchardsData.length > 0) {
    return (
      <ActionableNotification
        kind="info"
        lowContrast
        title={pageText.notificationTitle}
        inline
        actionButtonLabel=""
        onClose={() => {
          toggleNotification('info');
          return false;
        }}
      >
        <span className="notification-subtitle">
          {pageText[currentTab].notificationSubtitle}
        </span>
      </ActionableNotification>
    );
  }

  if (state.notifCtrl[currentTab].showError && orchardsData.length === 0) {
    return (
      <ActionableNotification
        kind="error"
        lowContrast
        title={pageText.errorNotifTitle}
        actionButtonLabel=""
        onClose={() => {
          toggleNotification('error');
          return false;
        }}
      >
        <span className="notification-subtitle">
          {pageText.errorDescription}
        </span>
      </ActionableNotification>
    );
  }

  return null;
};

export const renderPagination = (
  state: ParentTreeStepDataObj,
  currentTab: keyof TabTypes,
  currPageSize: number,
  handlePagination: Function
) => {
  if (currentTab === 'mixTab') {
    return null;
  }
  return (
    <Pagination
      pageSize={currPageSize}
      pageSizes={pageSizesConfig}
      itemsPerPageText=""
      totalItems={Object.values(state.tableRowData).length}
      onChange={
        (paginationObj: PaginationChangeType) => handlePagination(paginationObj)
      }
    />
  );
};
