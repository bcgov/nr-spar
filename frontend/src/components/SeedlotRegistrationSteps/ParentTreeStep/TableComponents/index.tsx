import React, { useEffect, useRef } from 'react';
import {
  OverflowMenuItem, Checkbox, TableBody, TableRow, Row, Column,
  TableCell, TextInput, ActionableNotification, Pagination, Button, Tooltip
} from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';
import { pageText, PageSizesConfig } from '../constants';
import {
  EditableCellProps,
  HeaderObj, RowItem, StrTypeRowItem, TabTypes
} from '../definitions';
import { ParentTreeStepDataObj } from '../../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { OrchardObj } from '../../OrchardStep/definitions';
import PaginationChangeType from '../../../../types/PaginationChangeType';
import blurOnEnter from '../../../../utils/KeyboardUtil';
import { handlePagination } from '../../../../utils/PaginationUtils';
import {
  applyValueToAll, toggleColumn, toggleNotification
} from '../utils';
import { deleteMixRow, handleInput } from './utils';

import '../styles.scss';
import MultiOptionsObj from '../../../../types/MultiOptionsObject';

export const renderColOptions = (
  headerConfig: Array<HeaderObj>,
  currentTab: TabTypes,
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
const renderDeleteActionBtn = (
  rowData: RowItem,
  applicableGenWorths: string[],
  state: ParentTreeStepDataObj,
  setStepData: Function
) => (
  <Button
    kind="ghost"
    hasIconOnly
    renderIcon={TrashCan}
    iconDescription="Delete this row"
    onClick={() => deleteMixRow(rowData, applicableGenWorths, state, setStepData)}
  />
);

/**
 * This function will wrap the input with a tooltip if it's invalid
 */
const EditableCell = ({
  rowData,
  header,
  applicableGenWorths,
  state,
  setStepData,
  seedlotSpecies
}: EditableCellProps) => {
  const headerId = header.id as keyof StrTypeRowItem;
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.value = rowData[headerId].value;
    }
  }, [rowData]);

  const textInput = (
    <TextInput
      ref={ref}
      labelText=""
      hideLabel
      invalidText=""
      type="number"
      placeholder="Add value"
      defaultValue={rowData[headerId].value}
      id={`${rowData[headerId].id}-input`}
      onWheel={(e: React.ChangeEvent<HTMLInputElement>) => e.target.blur()}
      onKeyUp={(event: React.KeyboardEvent<HTMLElement>) => {
        blurOnEnter(event);
      }}
      onBlur={(event: React.ChangeEvent<HTMLInputElement>) => {
        handleInput(
          rowData,
          event.target.value,
          headerId,
          applicableGenWorths,
          state,
          setStepData,
          seedlotSpecies
        );
      }}
      invalid={rowData[headerId].isInvalid}
    />
  );

  if (rowData[headerId].isInvalid) {
    return (
      <Tooltip className="input-error-tooltip" label={rowData[headerId].errMsg ?? ''} align="bottom">
        {textInput}
      </Tooltip>
    );
  }
  return textInput;
};

const renderTableCell = (
  rowData: RowItem,
  header: HeaderObj,
  applicableGenWorths: string[],
  state: ParentTreeStepDataObj,
  setStepData: Function,
  seedlotSpecies: MultiOptionsObj
) => {
  const className = header.editable ? 'td-no-padding' : null;
  if (header.id === 'actions') {
    return (
      <TableCell key={`${header.id}-${rowData.rowId}`} className={className} id={`${rowData.rowId}-action-btn-del`}>
        {
          renderDeleteActionBtn(rowData, applicableGenWorths, state, setStepData)
        }
      </TableCell>
    );
  }
  if (header.id !== 'isMixTab' && header.id !== 'rowId') {
    return (
      <TableCell key={header.id} className={className} id={rowData[header.id].id}>
        {
          header.editable
            ? (
              <EditableCell
                rowData={rowData}
                header={header}
                applicableGenWorths={applicableGenWorths}
                state={state}
                setStepData={setStepData}
                seedlotSpecies={seedlotSpecies}
              />
            )
            : (
              rowData[header.id as keyof StrTypeRowItem].value
            )
        }
      </TableCell>
    );
  }
  return null;
};

export const renderTableBody = (
  currentTab: TabTypes,
  slicedRows: Array<RowItem>,
  mixTabRows: Array<RowItem>,
  headerConfig: Array<HeaderObj>,
  applicableGenWorths: string[],
  state: ParentTreeStepDataObj,
  setStepData: Function,
  seedlotSpecies: MultiOptionsObj
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
                      setStepData,
                      seedlotSpecies
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
                      renderTableCell(
                        rowData,
                        header,
                        applicableGenWorths,
                        state,
                        setStepData,
                        seedlotSpecies
                      )
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
  currentTab: TabTypes,
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
        hasFocus={false}
        // Without this blur the page will keep focusing on the close button
        onClick={(e: any) => e.target.blur()}
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
  currentTab: TabTypes,
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
        className="table-pagination"
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
      className="table-pagination"
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
  setStepData: Function,
  seedlotSpecies: MultiOptionsObj
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
              applyValueToAll('smpSuccessPerc', event.target.value, state, setStepData, seedlotSpecies);
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
              applyValueToAll('nonOrchardPollenContam', event.target.value, state, setStepData, seedlotSpecies);
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
