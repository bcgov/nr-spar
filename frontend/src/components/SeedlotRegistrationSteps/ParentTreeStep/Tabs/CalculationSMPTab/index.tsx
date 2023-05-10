import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { hashObject } from 'react-hash-string';
import {
  FlexGrid,
  Row,
  Column,
  InlineNotification,
  TextInput,
  Button,
  Checkbox,
  OverflowMenu,
  OverflowMenuItem,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Pagination
} from '@carbon/react';
import {
  Upload,
  View,
  Settings,
  TrashCan,
  Add
} from '@carbon/icons-react';

import Subtitle from '../../../../Subtitle';
import UploadFileModal from '../../UploadFileModal';

import { SMPMixType } from '../../../../../types/SeedlotTypes/ParentTree';
import paginationOnChange from '../../../../../utils/PaginationUtils';

import {
  smpMixFixedHeaders,
  pageTexts,
  newSMPMixEntry,
  DEFAULT_INITIAL_ROWS,
  PAGINATION_OPTIONS
} from '../../constants';

import {
  ControlFiltersType,
  GeneticTraitsType
} from '../../definitions';

import {
  clearTable,
  createEmptySMPMix,
  createRandomSMPMix,
  disableWheelEvent
} from '../../utils';

import '../styles.scss';

interface CalculationSMPTabProps {
  geneticTraits: Array<GeneticTraitsType>;
}

const CalculationSMPTab = ({ geneticTraits }: CalculationSMPTabProps) => {
  // The initial table should have 20 rows according with the design
  const emptySMPMix: SMPMixType = createEmptySMPMix(DEFAULT_INITIAL_ROWS);

  const [updateTable, setUpdateTable] = useState<boolean>(false);
  const [firstRowIndex, setFirstRowIndex] = useState<number>(0);
  const [currentPageSize, setCurrentPageSize] = useState<number>(20);
  const [smpMixData, setSMPMixData] = useState<SMPMixType>(emptySMPMix);
  const [open, setOpen] = useState<boolean>(false);
  const [filterControl, setFilterControl] = useState<ControlFiltersType>(() => {
    const returnObj = {};
    geneticTraits.forEach((trait) => {
      (returnObj as ControlFiltersType)[`${trait.code}-clonal`] = false;
      (returnObj as ControlFiltersType)[`${trait.code}-weighted`] = false;
    });
    return returnObj;
  });

  const handleFilters = (
    event: React.ChangeEvent<HTMLInputElement>,
    geneticTrait: string
  ) => {
    const { checked } = event.target;
    setFilterControl({
      ...filterControl,
      [geneticTrait]: checked
    });
  };

  const refControl = useRef<any>({});
  const addRefs = (element: HTMLInputElement, name: string) => {
    if (element !== null) {
      refControl.current = {
        ...refControl.current,
        [name]: element
      };
    }
  };

  const fillTableAndResults = (smpMix: SMPMixType, tableOnly?: boolean) => {
    // eslint-disable-next-line max-len
    smpMix.smpMixEntries.slice(firstRowIndex, firstRowIndex + currentPageSize).forEach((element, index) => {
      const indexParentId = `${(index.toString())}`;

      const inputClone = `inputClone-${indexParentId}`;
      const inputVolume = `inputVolume-${indexParentId}`;
      const inputProportion = `inputProportion-${indexParentId}`;

      // Check if the current cloneNumber exists in that orchard before trying
      // to change the input's value
      if (
        refControl.current[inputClone]
        && refControl.current[inputVolume]
        && refControl.current[inputProportion]
      ) {
        refControl.current[inputClone].value = element.cloneNumber;
        refControl.current[inputVolume].value = element.volume;
        refControl.current[inputProportion].value = element.proportion;

        geneticTraits.forEach((genTrait) => {
          const genTraitClonalInputRef = `inputTraitClonal-${genTrait.code}-${indexParentId}`;
          const genTraitWeightedInputRef = `inputTraitWeighted-${genTrait.code}-${indexParentId}`;
          refControl.current[genTraitClonalInputRef].value = element[`${genTrait.code}Clonal`];
          refControl.current[genTraitWeightedInputRef].value = element[`${genTrait.code}Weighted`];
        });
      }
    });

    if (!tableOnly) {
      geneticTraits.forEach((genTrait) => {
        const genTraitInputRef = `inputTraitResult-${genTrait.code}`;
        const totalGenTraitKey = `${genTrait.code}Total`;
        refControl.current[genTraitInputRef].value = smpMix.geneticWorth[totalGenTraitKey];
      });

      // Other inputs are manual...
      // eslint-disable-next-line max-len
      refControl.current.smpParentTrees.value = smpMix.totalParentTreesFromOutside;
      refControl.current.totalVolume.value = smpMix.totalVolume;
    }
  };

  // These functions will be altered once the real API is connected
  const testSubmit = () => {
    setSMPMixData(createRandomSMPMix(smpMixData.smpMixEntries.length));
    setUpdateTable(true);
  };

  const handleTableChange = (
    field: string,
    value: string,
    index: number,
    genTrait: string = ''
  ) => {
    // // eslint-disable-next-line no-debugger
    // debugger;
    const updatedSMPMixData = smpMixData.smpMixEntries.map((entry, i) => {
      if (i === index) {
        switch (field) {
          case 'inputClone':
            return { ...entry, cloneNumber: value };
          case 'inputVolume':
            return { ...entry, volume: value };
          case 'inputProportion':
            return { ...entry, proportion: value };
          case 'inputTraitClonal':
            return { ...entry, [`${genTrait}Clonal`]: value };
          case 'inputTraitWeighted':
            return { ...entry, [`${genTrait}Weighted`]: value };
          default:
            break;
        }
      }
      return entry;
    });
    setSMPMixData({
      ...smpMixData,
      smpMixEntries: updatedSMPMixData
    });
  };

  const addNewRow = () => {
    setSMPMixData({
      ...smpMixData,
      smpMixEntries: [...smpMixData.smpMixEntries, newSMPMixEntry]
    });
  };

  const deleteRow = (index: number) => {
    const filteredEntries = smpMixData.smpMixEntries.filter(
      (_, i) => i !== firstRowIndex + index
    );
    setSMPMixData({
      ...smpMixData,
      smpMixEntries: filteredEntries
    });
  };

  useEffect(() => {
    if (updateTable) {
      fillTableAndResults(smpMixData);
      setUpdateTable(false);
    }
  }, [smpMixData, updateTable]);

  return (
    <FlexGrid className="parent-tree-tabs">
      <Row className="title-row">
        <Column sm={4} md={5} lg={9}>
          <h2>{pageTexts.tabTitles.mixTab}</h2>
          <Subtitle text={pageTexts.smpMix.subtitle} />
        </Column>
      </Row>
      <Row className="notification-row">
        <InlineNotification
          lowContrast
          kind="info"
          aria-label={pageTexts.sharedTabTexts.notification.actionButtonLabel}
          subtitle={pageTexts.smpMix.notification.subtitle}
          title={pageTexts.sharedTabTexts.notification.title}
        />
      </Row>
      <Row className="parent-tree-table-row">
        <TableContainer
          title={pageTexts.tabTitles.mixTab}
          description={pageTexts.smpMix.tableSubtitle}
        >
          <TableToolbar>
            <TableToolbarContent>
              <Button
                renderIcon={Add}
                kind="ghost"
                iconDescription={pageTexts.smpMix.addButtonDesc}
                hasIconOnly
                onClick={() => addNewRow()}
              />
              <OverflowMenu
                aria-label={pageTexts.sharedTabTexts.overflowMenus.columnsOverflow}
                renderIcon={View}
                menuOptionsClass="parent-tree-view-options"
                iconDescription={pageTexts.sharedTabTexts.overflowMenus.columnsOverflow}
                flipped
              >
                <p className="view-options-separator">
                  {pageTexts.sharedTabTexts.overflowMenus.clonalValue}
                </p>
                {geneticTraits.map((trait) => (
                  <Checkbox
                    key={`checkbox-trait-${trait.code}-clonal`}
                    id={`checkbox-trait-${trait.code}-clonal`}
                    name={`checkbox-trait-${trait.code}-clonal`}
                    className="breeding-value-checkbox"
                    labelText={trait.filterLabel}
                    defaultChecked={filterControl[`${trait.code}-clonal`]}
                    value={filterControl[`${trait.code}-clonal`]}
                    onChange={
                      (e: React.ChangeEvent<HTMLInputElement>) => handleFilters(e, `${trait.code}-clonal`)
                    }
                  />
                ))}
                <p className="view-options-separator">
                  {pageTexts.sharedTabTexts.overflowMenus.weightedValue}
                </p>
                {geneticTraits.map((trait) => (
                  <Checkbox
                    key={`checkbox-trait-${trait.code}-weighted`}
                    id={`checkbox-trait-${trait.code}-weighted`}
                    name={`checkbox-trait-${trait.code}-weighted`}
                    className="breeding-value-checkbox"
                    labelText={trait.filterLabel}
                    defaultChecked={filterControl[`${trait.code}-weighted`]}
                    value={filterControl[`${trait.code}-weighted`]}
                    onChange={
                      (e: React.ChangeEvent<HTMLInputElement>) => handleFilters(e, `${trait.code}-weighted`)
                    }
                  />
                ))}
              </OverflowMenu>
              <OverflowMenu
                aria-label={pageTexts.sharedTabTexts.overflowMenus.optionsOverflow}
                renderIcon={Settings}
                menuOptionsClass="parent-tree-table-options"
                iconDescription={pageTexts.sharedTabTexts.overflowMenus.optionsOverflow}
              >
                <OverflowMenuItem
                  itemText={pageTexts.sharedTabTexts.overflowMenus.downloadTable}
                />
                <OverflowMenuItem
                  itemText={pageTexts.sharedTabTexts.overflowMenus.exportPdf}
                />
                <OverflowMenuItem
                  itemText={pageTexts.sharedTabTexts.overflowMenus.cleanTable}
                  onClick={() => {
                    clearTable(refControl);
                    setSMPMixData(emptySMPMix);
                  }}
                />
              </OverflowMenu>
              <Button
                onClick={() => setOpen(true)}
                size="sm"
                kind="primary"
                renderIcon={Upload}
                iconDescription={pageTexts.sharedTabTexts.uploadButtonIconDesc}
              >
                {pageTexts.sharedTabTexts.uploadButtonLabel}
              </Button>
              {open && ReactDOM.createPortal(
                <UploadFileModal open={open} setOpen={setOpen} onSubmit={testSubmit} />,
                document.body
              )}
            </TableToolbarContent>
          </TableToolbar>
          <Table useZebraStyles>
            <TableHead>
              <TableRow>
                {smpMixFixedHeaders.map((header) => (
                  <TableHeader
                    key={header.key}
                  >
                    {header.header}
                  </TableHeader>
                ))}
                {geneticTraits.map((trait) => (
                  filterControl[`${trait.code}-clonal`]
                  && (
                    <TableHeader
                      key={`header-trait-${trait.code}-clonal`}
                    >
                      {`${trait.filterLabel} ${pageTexts.smpMix.clonalHeader}`}
                    </TableHeader>
                  )
                ))}
                {geneticTraits.map((trait) => (
                  filterControl[`${trait.code}-weighted`]
                  && (
                    <TableHeader
                      key={`header-trait-${trait.code}-weighted`}
                    >
                      {`${trait.filterLabel} ${pageTexts.smpMix.weightedHeader}`}
                    </TableHeader>
                  )
                ))}
                <TableHeader>
                  {pageTexts.smpMix.tableActions}
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                // eslint-disable-next-line max-len
                smpMixData.smpMixEntries.slice(firstRowIndex, firstRowIndex + currentPageSize).map((row, i) => (
                  <TableRow key={`${hashObject(row) + i}`}>
                    <TableCell>
                      <input
                        ref={(el: HTMLInputElement) => addRefs(el, `inputClone-${(i)}`)}
                        type="number"
                        className="table-input"
                        placeholder={pageTexts.sharedTabTexts.tableInputPlaceholder}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleTableChange('inputClone', e.target.value, i);
                        }}
                        value={row.cloneNumber}
                        onWheel={(e: React.WheelEvent) => disableWheelEvent(e)}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        ref={(el: HTMLInputElement) => addRefs(el, `inputVolume-${(i)}`)}
                        type="number"
                        className="table-input"
                        placeholder={pageTexts.sharedTabTexts.tableInputPlaceholder}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleTableChange('inputVolume', e.target.value, i);
                        }}
                        value={row.volume}
                        onWheel={(e: React.WheelEvent) => disableWheelEvent(e)}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        ref={(el: HTMLInputElement) => addRefs(el, `inputProportion-${(i)}`)}
                        type="number"
                        className="table-input"
                        placeholder={pageTexts.sharedTabTexts.tableInputPlaceholder}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleTableChange('inputProportion', e.target.value, i);
                        }}
                        value={row.proportion}
                        onWheel={(e: React.WheelEvent) => disableWheelEvent(e)}
                      />
                    </TableCell>
                    {
                      geneticTraits.map((trait) => (
                        (
                          // We can't make this render dinamically, because we need the reference
                          // of the inputs to set the values correctly when importing a file
                          <TableCell
                            key={`cell-trait-${trait.code}-${i.toString()}-clonal`}
                            className={filterControl[`${trait.code}-clonal`] ? '' : 'parent-tree-hide'}
                          >
                            <input
                              ref={(el: HTMLInputElement) => addRefs(el, `inputTraitClonal-${trait.code}-${i}`)}
                              type="number"
                              className="table-input"
                              placeholder={pageTexts.sharedTabTexts.tableInputPlaceholder}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                handleTableChange('inputTraitClonal', e.target.value, i, trait.code);
                              }}
                              value={row[`${trait.code}Clonal`]}
                              onWheel={(e: React.WheelEvent) => disableWheelEvent(e)}
                            />
                          </TableCell>
                        )
                      ))
                    }
                    {
                      geneticTraits.map((trait) => (
                        (
                          <TableCell
                            key={`cell-trait-${trait.code}-${i.toString()}-weighted`}
                            className={filterControl[`${trait.code}-weighted`] ? '' : 'parent-tree-hide'}
                          >
                            <input
                              ref={(el: HTMLInputElement) => addRefs(el, `inputTraitWeighted-${trait.code}-${i}`)}
                              type="number"
                              className="table-input"
                              placeholder={pageTexts.sharedTabTexts.tableInputPlaceholder}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                handleTableChange('inputTraitWeighted', e.target.value, i, trait.code);
                              }}
                              value={row[`${trait.code}Weighted`]}
                              onWheel={(e: React.WheelEvent) => disableWheelEvent(e)}
                            />
                          </TableCell>
                        )
                      ))
                    }
                    <TableCell>
                      <Button
                        renderIcon={TrashCan}
                        kind="ghost"
                        iconDescription={pageTexts.smpMix.deleteRow}
                        hasIconOnly
                        onClick={() => deleteRow(i)}
                      />
                    </TableCell>
                  </TableRow>
                ))
                }
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          backwardText={pageTexts.sharedTabTexts.pagination.previous}
          forwardText={pageTexts.sharedTabTexts.pagination.next}
          itemsPerPageText=""
          page={1}
          pageNumberText={pageTexts.sharedTabTexts.pagination.pageNumber}
          pageSize={currentPageSize}
          pageSizes={PAGINATION_OPTIONS}
          totalItems={smpMixData.smpMixEntries.length}
          onChange={({ page, pageSize }: { page: number, pageSize: number }) => {
            paginationOnChange(
              pageSize,
              currentPageSize,
              page,
              setCurrentPageSize,
              setFirstRowIndex
            );
            setUpdateTable(true);
          }}
        />
      </Row>
      <Row className="title-row">
        <Column sm={4} md={5} lg={9}>
          <h2>{pageTexts.smpMix.summary.title}</h2>
          <Subtitle text={pageTexts.smpMix.summary.subtitle} />
        </Column>
      </Row>
      <Row className="summary-row">
        <Column sm={2} md={4} lg={4}>
          <TextInput
            id="smpParentTrees"
            ref={(el: HTMLInputElement) => addRefs(el, 'smpParentTrees')}
            labelText={pageTexts.smpMix.summary.fieldLabels.smpParentTrees}
            readOnly
          />
        </Column>
        <Column sm={2} md={4} lg={4}>
          <TextInput
            id="totalVolume"
            ref={(el: HTMLInputElement) => addRefs(el, 'totalVolume')}
            labelText={pageTexts.smpMix.summary.fieldLabels.totalVolume}
            readOnly
          />
        </Column>
      </Row>
      <Row className="traits-row">
        {geneticTraits.map((trait) => (
          <Column key={`column-trait-${trait.code}`} sm={2} md={4} lg={4}>
            <TextInput
              id={`input-trait-result-${trait.code}`}
              ref={(el: HTMLInputElement) => addRefs(el, `inputTraitResult-${trait.code}`)}
              labelText={trait.description}
              readOnly
            />
          </Column>
        ))}
      </Row>
    </FlexGrid>
  );
};

export default CalculationSMPTab;
