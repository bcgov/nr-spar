import React from 'react';
import {
  OverflowMenuItem, Checkbox, TableBody, TableRow, Row, Column,
  TableCell, TextInput, ActionableNotification, Pagination
} from '@carbon/react';
import { pageText, pageSizesConfig } from '../constants';
import { HeaderObj, RowItem, TabTypes } from '../definitions';
import { ParentTreeStepDataObj } from '../../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { OrchardObj } from '../../OrchardStep/definitions';
import PaginationChangeType from '../../../../types/PaginationChangeType';
import blurOnEnter from '../../../../utils/KeyboardUtil';

import '../styles.scss';

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
            onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
              toggleColumn(header.id, e.target.nodeName);
            }}
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
  setInputChange: Function
) => {
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
              value={rowData[header.id]}
              id={`${rowData.parentTreeNumber}-${rowData[header.id]}`}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setInputChange(rowData.parentTreeNumber, header.id, event.target.value);
              }}
              onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
              onKeyUp={(event: React.KeyboardEvent<HTMLElement>) => {
                blurOnEnter(event);
              }}
            />
          )
          : (
            rowData[header.id]
          )
      }
    </TableCell>
  );
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
          rowData.isMixTab
            ? null
            : (
              <TableRow key={rowData.parentTreeNumber}>
                {
                  headerConfig
                    .filter((header) => (
                      header.availableInTabs.includes(currentTab) && header.enabled
                    ))
                    .map((header) => (
                      renderTableCell(rowData, header, setInputChange)
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

export const renderDefaultInputs = (
  isSMPDefaultValChecked: boolean,
  applyValueToAll: Function
) => {
  if (isSMPDefaultValChecked) {
    return (
      <Row className="smp-default-input-row">
        <Column sm={4} md={4} lg={4} xlg={4} max={4}>
          <TextInput
            id="default-smp-success-input"
            type="number"
            labelText={pageText.successTab.smpInputLabel}
            onBlur={(event: React.ChangeEvent<HTMLInputElement>) => {
              applyValueToAll('smpSuccessPerc', event.target.value);
            }}
            onKeyUp={(event: React.KeyboardEvent<HTMLElement>) => {
              blurOnEnter(event);
            }}
          />
        </Column>
        <Column sm={4} md={4} lg={4} xlg={4} max={4}>
          <TextInput
            id="default-pollen-contam-input"
            type="number"
            labelText={pageText.successTab.pollenCotamInputLabel}
            onBlur={(event: React.ChangeEvent<HTMLInputElement>) => {
              applyValueToAll('nonOrchardPollenContam', event.target.value);
            }}
            onKeyUp={(event: React.KeyboardEvent<HTMLElement>) => {
              blurOnEnter(event);
            }}
          />
        </Column>
      </Row>
    );
  }
  return null;
};
