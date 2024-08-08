import React, { useContext, useEffect, useRef } from 'react';
import {
  OverflowMenuItem, Checkbox, TableBody, TableRow, Row, Column,
  TableCell, TextInput, ActionableNotification, Pagination, Button, Tooltip
} from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';

import { ParentTreeStepDataObj } from '../../../../views/Seedlot/ContextContainerClassA/definitions';
import PaginationChangeType from '../../../../types/PaginationChangeType';
import blurOnEnter from '../../../../utils/KeyboardUtil';
import { handlePagination } from '../../../../utils/PaginationUtils';
import MultiOptionsObj from '../../../../types/MultiOptionsObject';
import ClassAContext from '../../../../views/Seedlot/ContextContainerClassA/context';

import { pageText, PageSizesConfig } from '../constants';
import {
  EditableCellProps,
  GeneticWorthInputType,
  HeaderObj, RowItem, StrTypeRowItem, TabTypes
} from '../definitions';
import {
  applyValueToAll, areOrchardsValid, toggleColumn, toggleNotification
} from '../utils';
import { deleteMixRow, handleInput } from './utils';

import '../styles.scss';
import OrchardDataType from '../../../../types/OrchardDataType';
import { GeneticWorthDto } from '../../../../types/GeneticWorthType';

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
type DeleteActionBtnProps = {
  rowData: RowItem,
  applicableGenWorths: string[],
  isReviewEdit?: boolean
}
const DeleteActionBtn = (
  { rowData, applicableGenWorths, isReviewEdit } : DeleteActionBtnProps
) => {
  const {
    allStepData: { parentTreeStep: state },
    setStepData, isFormSubmitted
  } = useContext(ClassAContext);
  return (
    <Button
      kind="ghost"
      hasIconOnly
      renderIcon={TrashCan}
      iconDescription="Delete this row"
      onClick={() => deleteMixRow(rowData, applicableGenWorths, state, setStepData)}
      disabled={isFormSubmitted && !isReviewEdit}
    />
  );
};

/**
 * This function will wrap the input with a tooltip if it's invalid
 */
const EditableCell = ({
  rowData,
  header,
  applicableGenWorths,
  readOnly,
  orchardData,
  geneticWorthList
}: EditableCellProps) => {
  const {
    allStepData: { parentTreeStep: state, orchardStep },
    setStepData,
    seedlotSpecies
  } = useContext(ClassAContext);
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
          seedlotSpecies,
          orchardData,
          geneticWorthList,
          orchardStep.orchards.primaryOrchard.value.code
        );
      }}
      invalid={rowData[headerId].isInvalid}
      readOnly={readOnly}
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

/**
 * Adds a bracket to estimated genetic worth value.
 */
const formatTextOnlyCellValue = (
  rowData: RowItem,
  headerId: string,
  text: string,
  applicableGenWorths: string[]
): string => {
  if (applicableGenWorths.includes(headerId)
    && (rowData[(headerId as keyof RowItem)] as GeneticWorthInputType).isEstimated
  ) {
    return `(${text})`;
  }
  return text;
};

const renderTableCell = (
  rowData: RowItem,
  header: HeaderObj,
  applicableGenWorths: string[],
  orchardData: OrchardDataType[],
  geneticWorthList: GeneticWorthDto[],
  isFormSubmitted: boolean,
  editOnReview? : boolean
) => {
  const headerId = header.id;
  let className = header.editable ? 'td-no-padding' : undefined;

  // Apply red color style for estimated gen worth
  if (applicableGenWorths.includes(headerId)
    && (rowData[(headerId as keyof RowItem)] as GeneticWorthInputType).isEstimated
  ) {
    const redCellClass = 'td-red-cell';
    if (!className) {
      className = redCellClass;
    } else {
      className = `${className} ${redCellClass}`;
    }
  }

  if (headerId === 'actions') {
    return (
      <TableCell key={`${headerId}-${rowData.rowId}`} className={className} id={`${rowData.rowId}-action-btn-del`}>
        <DeleteActionBtn
          rowData={rowData}
          applicableGenWorths={applicableGenWorths}
          isReviewEdit={editOnReview}
        />
      </TableCell>
    );
  }
  if (headerId !== 'isMixTab' && headerId !== 'rowId') {
    return (
      <TableCell key={headerId} className={className} id={rowData[headerId].id}>
        {
          header.editable
            ? (
              <EditableCell
                rowData={rowData}
                header={header}
                applicableGenWorths={applicableGenWorths}
                readOnly={isFormSubmitted && !editOnReview}
                orchardData={orchardData}
                geneticWorthList={geneticWorthList}
              />
            )
            : formatTextOnlyCellValue(
              rowData,
              headerId,
              rowData[headerId as keyof StrTypeRowItem].value,
              applicableGenWorths
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
  orchardData: OrchardDataType[],
  geneticWorthList: GeneticWorthDto[],
  isFormSubmitted: boolean,
  editOnReview?: boolean
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
                      orchardData,
                      geneticWorthList,
                      isFormSubmitted,
                      editOnReview
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
                        orchardData,
                        geneticWorthList,
                        isFormSubmitted,
                        editOnReview
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

export const renderNotification = (currentTab: TabTypes) => {
  const {
    allStepData: { parentTreeStep: state, orchardStep },
    setStepData
  } = useContext(ClassAContext);

  if (state.notifCtrl[currentTab].showError && !areOrchardsValid(orchardStep)) {
    return (
      <Row className="notification-row">
        <Column>
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
        </Column>
      </Row>
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
