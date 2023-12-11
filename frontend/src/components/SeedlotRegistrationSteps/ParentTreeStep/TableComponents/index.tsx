import React from 'react';
import {
  OverflowMenuItem, Checkbox, TableBody, TableRow, Row, Column,
  TableCell, TextInput, ActionableNotification, Pagination, Button
} from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';
import { pageText, PageSizesConfig } from '../constants';
import {
  HeaderObj, HeaderObjId, RowItem, StrTypeRowItem, TabTypes
} from '../definitions';
import { ParentTreeStepDataObj } from '../../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { OrchardObj } from '../../OrchardStep/definitions';
import PaginationChangeType from '../../../../types/PaginationChangeType';
import blurOnEnter from '../../../../utils/KeyboardUtil';
import { handlePagination } from '../../../../utils/PaginationUtils';
import {
  applyValueToAll, setInputChange, toggleColumn, toggleNotification
} from '../utils';
import { deleteMixRow, handleInput } from './utils';

import '../styles.scss';

export const renderColOptions = (
  headerConfig: Array<HeaderObj>,
  currentTab: keyof TabTypes,
  setHeaderConfig: Function
) => {
  const toggleableCols = headerConfig
    .filter((header) => (header.isAnOption
      && header.availableInTabs.includes(currentTab)
      && !String(header.id).startsWith('w_') // id starts with w_ is only for smp mix table
    ));

  const smpWeightedCols = headerConfig
    .filter((header) => header.isAnOption && String(header.id).startsWith('w_'));

  return (
    <>
      <OverflowMenuItem
        wrapperClassName="toggle-category-name"
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
              toggleColumn(header.id, e.target.nodeName, headerConfig, setHeaderConfig);
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
      {
        // This renders the 'Show weighted value' section
        currentTab === 'mixTab'
          ? (
            <>
              <OverflowMenuItem
                wrapperClassName="toggle-category-name"
                className="menu-item-label-text"
                closeMenu={() => false}
                itemText={pageText[currentTab].toggleNameBottom}
              />
              {
                smpWeightedCols.map((header) => (
                  <OverflowMenuItem
                    key={header.id}
                    closeMenu={() => false}
                    onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                      toggleColumn(header.id, e.target.nodeName, headerConfig, setHeaderConfig);
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
          )
          : null
      }
    </>
  );
};

/**
 * Used to render cell that isn't a text input, e.g. delete button
 */
const renderNonInputCell = (
  rowData: RowItem,
  colName: HeaderObjId,
  applicableGenWorths: string[],
  state: ParentTreeStepDataObj,
  setStepData: Function
) => {
  if (colName === 'actions') {
    return (
      <Button
        kind="ghost"
        hasIconOnly
        renderIcon={TrashCan}
        iconDescription="Delete this row"
        onClick={() => deleteMixRow(rowData, applicableGenWorths, state, setStepData)}
      />
    );
  }
  return rowData[colName as keyof StrTypeRowItem].value;
};

const renderTableCell = (
  rowData: RowItem,
  header: HeaderObj,
  applicableGenWorths: string[],
  state: ParentTreeStepDataObj,
  setStepData: Function
) => {
  const className = header.editable ? 'td-no-padding' : null;
  const headerIdRowKey = header.id as keyof StrTypeRowItem;
  let cellId = '';
  const idPrefix = rowData.isMixTab ? rowData.rowId : rowData.parentTreeNumber;
  if (header.id === 'actions') {
    cellId = `${idPrefix}-actions`;
  } else {
    cellId = rowData[headerIdRowKey].id;
  }
  return (
    <TableCell key={header.id} className={className} id={cellId}>
      {
        header.editable
          ? (
            <TextInput
              labelText=""
              hideLabel
              invalidText=""
              type="number"
              placeholder="Add value"
              value={rowData[headerIdRowKey].value}
              id={`${cellId}-input`}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setInputChange(
                  rowData,
                  headerIdRowKey,
                  event.target.value,
                  state,
                  setStepData
                );
              }}
              onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
              onKeyUp={(event: React.KeyboardEvent<HTMLElement>) => {
                blurOnEnter(event);
              }}
              onBlur={(event: React.ChangeEvent<HTMLInputElement>) => (
                handleInput(
                  rowData,
                  event.target.value,
                  headerIdRowKey,
                  applicableGenWorths,
                  state,
                  setStepData
                )
              )}
              invalid={rowData[headerIdRowKey].isInvalid}
            />
          )
          : (
            renderNonInputCell(rowData, header.id, applicableGenWorths, state, setStepData)
          )
      }
    </TableCell>
  );
};

export const renderTableBody = (
  currentTab: keyof TabTypes,
  slicedRows: Array<RowItem>,
  mixTabRows: Array<RowItem>,
  headerConfig: Array<HeaderObj>,
  applicableGenWorths: string[],
  state: ParentTreeStepDataObj,
  setStepData: Function
) => {
  if (currentTab === 'mixTab') {
    return (
      <TableBody>
        {
          mixTabRows.map((rowData) => (
            <TableRow key={rowData.rowId}>
              {
                headerConfig
                  .filter((header) => (
                    header.availableInTabs.includes(currentTab) && header.enabled
                  ))
                  .map((header) => {
                    const clonedHeader = structuredClone(header);
                    if (header.id === 'parentTreeNumber') {
                      clonedHeader.editable = true;
                    }
                    return renderTableCell(
                      rowData,
                      clonedHeader,
                      applicableGenWorths,
                      state,
                      setStepData
                    );
                  })
              }
            </TableRow>
          ))
        }
      </TableBody>
    );
  }
  return (
    <TableBody>
      {
        slicedRows.map((rowData) => (
          rowData.isMixTab
            ? null
            : (
              <TableRow key={rowData.parentTreeNumber.value}>
                {
                  headerConfig
                    .filter((header) => (
                      header.availableInTabs.includes(currentTab) && header.enabled
                    ))
                    .map((header) => (
                      renderTableCell(rowData, header, applicableGenWorths, state, setStepData)
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
  setStepData: Function
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
          toggleNotification('info', state, currentTab, setStepData);
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
          toggleNotification('error', state, currentTab, setStepData);
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
  setCurrentPage: Function,
  setCurrPageSize: Function,
  setRows: Function,
  currMixPageSize: number,
  setCurrMixPageSize: Function,
  setCurrentMixPage: Function,
  setSlicedMixRows: Function
) => {
  const tableData = Object.values(state.tableRowData);
  const mixTableData = Object.values(state.mixTabData);
  if (currentTab === 'mixTab') {
    return (
      <Pagination
        pageSize={currMixPageSize}
        pageSizes={PageSizesConfig}
        itemsPerPageText=""
        totalItems={mixTableData.length}
        onChange={
          (paginationObj: PaginationChangeType) => {
            handlePagination(
              paginationObj,
              setCurrentMixPage,
              setCurrMixPageSize,
              mixTableData,
              true,
              'parentTreeNumber',
              setSlicedMixRows
            );
          }
        }
      />
    );
  }
  return (
    <Pagination
      pageSize={currPageSize}
      pageSizes={PageSizesConfig}
      itemsPerPageText=""
      totalItems={tableData.length}
      onChange={
        (paginationObj: PaginationChangeType) => {
          handlePagination(
            paginationObj,
            setCurrentPage,
            setCurrPageSize,
            tableData,
            true,
            'parentTreeNumber',
            setRows
          );
        }
      }
    />
  );
};

export const renderDefaultInputs = (
  isSMPDefaultValChecked: boolean,
  state: ParentTreeStepDataObj,
  setStepData: Function
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
              applyValueToAll('smpSuccessPerc', event.target.value, state, setStepData);
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
              applyValueToAll('nonOrchardPollenContam', event.target.value, state, setStepData);
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
