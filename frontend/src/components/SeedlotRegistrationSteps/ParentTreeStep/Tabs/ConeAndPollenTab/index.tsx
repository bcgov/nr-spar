import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
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
  Pagination,
  DataTableSkeleton
} from '@carbon/react';
import { Upload, View, Settings } from '@carbon/icons-react';

import Subtitle from '../../../../Subtitle';
import UploadFileModal from '../../UploadFileModal';

import { ConeAndPollenType } from '../../../../../types/SeedlotTypes/ParentTree';
import paginationOnChange from '../../../../../utils/PaginationUtils';

import {
  coneAndPollenFixedHeaders,
  DEFAULT_INITIAL_ROWS,
  pageTexts,
  PAGINATION_OPTIONS
} from '../../constants';

import {
  ControlFiltersType,
  TabProps
} from '../../definitions';

import {
  clearTable,
  createEmptyConeAndPollen,
  createRandomConeAndPollen,
  disableWheelEvent
} from '../../utils';

import '../styles.scss';

const ConeAndPollenTab = ({
  parentTrees,
  orchards,
  geneticTraits,
  isLoading
}: TabProps) => {
  const emptyConeAndPollen: ConeAndPollenType = createEmptyConeAndPollen(parentTrees);

  const [updateTable, setUpdateTable] = useState<boolean>(false);
  const [firstRowIndex, setFirstRowIndex] = useState<number>(0);
  const [currentPageSize, setCurrentPageSize] = useState<number>(20);
  const [open, setOpen] = useState<boolean>(false);
  const [coneAndPollenData, setConeAndPollenData] = useState<ConeAndPollenType>(emptyConeAndPollen);
  const [filterControl, setFilterControl] = useState<ControlFiltersType>(() => {
    const returnObj = {};
    geneticTraits.forEach((trait) => {
      (returnObj as ControlFiltersType)[trait.code] = false;
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

  const fillTableAndResults = (coneAndPollen: ConeAndPollenType, tableOnly?: boolean) => {
    coneAndPollen.coneAndPollenEntries.forEach((element) => {
      // We have a possible cenario with 2 orchards with the same parent tree ID
      // so we need combine the parent tree ID with the orchard ID to get the
      // unique value used on the inputs
      orchards.forEach((orchard) => {
        const indexParentIdCombination = `${(element.cloneNumber)}-${orchard}`;

        const inputCone = `inputCone-${indexParentIdCombination}`;
        const inputPollen = `inputPollen-${indexParentIdCombination}`;
        const inputSMP = `inputSMP-${indexParentIdCombination}`;

        // Check if the current cloneNumber exists in that orchard before trying
        // to change the input's value
        if (
          refControl.current[inputCone]
          && refControl.current[inputPollen]
          && refControl.current[inputSMP]
        ) {
          refControl.current[inputCone].value = element.coneCount;
          refControl.current[inputPollen].value = element.pollenCount;
          refControl.current[inputSMP].value = element.smpSuccess;
        }
      });
    });

    if (!tableOnly) {
      geneticTraits.forEach((genTrait) => {
        const genTraitInputRef = `inputTraitResult-${genTrait.code}`;
        const totalGenTraitKey = `${genTrait.code}Total`;
        refControl.current[genTraitInputRef].value = coneAndPollen.geneticWorth[totalGenTraitKey];
      });

      // Other inputs are manual...
      // eslint-disable-next-line max-len
      refControl.current.totalParentTreesConeAndPollen.value = coneAndPollen.totalParentTreesConeAndPollen;
      refControl.current.totalConeCount.value = coneAndPollen.totalConeCount;
      refControl.current.totalPollenCount.value = coneAndPollen.totalPollenCount;
      refControl.current.averageSMP.value = coneAndPollen.averageSMP;
      refControl.current.populationSize.value = coneAndPollen.geneticWorth.populationSize;
      refControl.current.testedParentTree.value = coneAndPollen.geneticWorth.testedParentTree;
      refControl.current.coancestry.value = coneAndPollen.geneticWorth.coancestry;
      refControl.current.smpParents.value = coneAndPollen.geneticWorth.smpParents;
    }
  };

  // This function will be altered once the real API is connected
  const testSubmit = () => {
    setConeAndPollenData(createRandomConeAndPollen(parentTrees));
    setUpdateTable(true);
  };

  // TODO: STOP using index to identify object
  const handleTableChange = (field: string, value: string, index: number) => {
    const updatedConeAndPollen = coneAndPollenData.coneAndPollenEntries.map((entry, i) => {
      if (i === index) {
        switch (field) {
          case 'inputCone':
            return { ...entry, coneCount: value };
          case 'inputPollen':
            return { ...entry, pollenCount: value };
          case 'inputSMP':
            return { ...entry, smpSuccess: value };
          default:
            break;
        }
      }
      return entry;
    });

    setConeAndPollenData({
      ...coneAndPollenData,
      coneAndPollenEntries: updatedConeAndPollen
    });

    // After each change, a recalculation will be necessary, but first we need to
    // get the calculations done on the backend
  };

  useEffect(() => {
    if (updateTable) {
      fillTableAndResults(coneAndPollenData);
      setUpdateTable(false);
    }
  }, [updateTable]);

  return (
    <FlexGrid className="parent-tree-tabs">
      <Row className="title-row">
        <Column sm={4} md={5} lg={9}>
          <h2>{pageTexts.tabTitles.coneTab}</h2>
          <Subtitle text={pageTexts.coneAndPollen.subtitle} />
        </Column>
      </Row>
      <Row className="notification-row">
        <InlineNotification
          lowContrast
          kind="info"
          aria-label={pageTexts.sharedTabTexts.notification.actionButtonLabel}
          subtitle={pageTexts.coneAndPollen.notification.subtitle}
          title={pageTexts.sharedTabTexts.notification.title}
        />
      </Row>
      <Row className="parent-tree-table-row">
        {isLoading
          ? (
            <DataTableSkeleton
              headers={coneAndPollenFixedHeaders}
              columnCount={coneAndPollenFixedHeaders.length}
              rowCount={DEFAULT_INITIAL_ROWS}
              showHeader
              showToolbar
              zebra
            />
          ) : (
            <>
              <TableContainer
                title={pageTexts.tabTitles.coneTab}
                description={pageTexts.coneAndPollen.tableSubtitle}
              >
                <TableToolbar>
                  <TableToolbarContent>
                    <OverflowMenu
                      aria-label={pageTexts.sharedTabTexts.overflowMenus.columnsOverflow}
                      renderIcon={View}
                      menuOptionsClass="parent-tree-view-options"
                      iconDescription={pageTexts.sharedTabTexts.overflowMenus.columnsOverflow}
                      flipped
                    >
                      <p className="view-options-separator">
                        {pageTexts.sharedTabTexts.overflowMenus.breedingValues}
                      </p>
                      {geneticTraits.map((trait) => (
                        <Checkbox
                          key={`checkbox-trait-${trait.code}`}
                          id={`checkbox-trait-${trait.code}`}
                          name={`checkbox-trait-${trait.code}`}
                          className="breeding-value-checkbox"
                          labelText={trait.filterLabel}
                          defaultChecked={filterControl[trait.code]}
                          value={filterControl[trait.code]}
                          onChange={
                            (e: React.ChangeEvent<HTMLInputElement>) => handleFilters(e, trait.code)
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
                          setConeAndPollenData(emptyConeAndPollen);
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
                      {coneAndPollenFixedHeaders.map((header) => (
                        <TableHeader
                          key={header.key}
                        >
                          {header.header}
                        </TableHeader>
                      ))}
                      {geneticTraits.map((trait) => (
                        filterControl[trait.code]
                        && (
                          <TableHeader
                            key={`header-trait-${trait.code}`}
                          >
                            {trait.filterLabel}
                          </TableHeader>
                        )
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      parentTrees.slice(firstRowIndex, firstRowIndex + currentPageSize)
                        .map((row, i) => (
                          <TableRow key={(row.id)}>
                            <TableCell>
                              {row.value}
                            </TableCell>
                            <TableCell>
                              <input
                                ref={(el: HTMLInputElement) => addRefs(el, `inputCone-${(row.id)}`)}
                                type="number"
                                className="table-input"
                                placeholder={pageTexts.sharedTabTexts.tableInputPlaceholder}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  // TODO: STOP using index to identify object
                                  handleTableChange('inputCone', e.target.value, i);
                                }}
                                onWheel={(e: React.WheelEvent) => disableWheelEvent(e)}
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                ref={(el: HTMLInputElement) => addRefs(el, `inputPollen-${(row.id)}`)}
                                type="number"
                                className="table-input"
                                placeholder={pageTexts.sharedTabTexts.tableInputPlaceholder}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  // TODO: STOP using index to identify object
                                  handleTableChange('inputPollen', e.target.value, i);
                                }}
                                onWheel={(e: React.WheelEvent) => disableWheelEvent(e)}
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                ref={(el: HTMLInputElement) => addRefs(el, `inputSMP-${(row.id)}`)}
                                type="number"
                                className="table-input"
                                placeholder={pageTexts.sharedTabTexts.tableInputPlaceholder}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  // TODO: STOP using index to identify object
                                  handleTableChange('inputSMP', e.target.value, i);
                                }}
                                onWheel={(e: React.WheelEvent) => disableWheelEvent(e)}
                              />
                            </TableCell>
                            {
                              geneticTraits.map((trait) => (
                                filterControl[trait.code]
                                && (
                                  <TableCell
                                    key={`cell-trait-${trait.code}-${(row.id + i).toString()}`}
                                  >
                                    {coneAndPollenData.coneAndPollenEntries[i][trait.code]}
                                  </TableCell>
                                )
                              ))
                            }
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
                totalItems={parentTrees.length}
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
            </>
          )}
      </Row>
      <Row className="title-row">
        <Column sm={4} md={5} lg={9}>
          <h2>{pageTexts.coneAndPollen.summary.title}</h2>
          <Subtitle text={pageTexts.coneAndPollen.summary.subtitle} />
        </Column>
      </Row>
      <Row className="summary-row">
        <Column sm={2} md={4} lg={4}>
          <TextInput
            id="totalParentTreesConeAndPollen"
            ref={(el: HTMLInputElement) => addRefs(el, 'totalParentTreesConeAndPollen')}
            labelText={pageTexts.coneAndPollen.summary.fieldLabels.totalParentTrees}
            readOnly
          />
        </Column>
        <Column sm={2} md={4} lg={4}>
          <TextInput
            id="totalConeCount"
            ref={(el: HTMLInputElement) => addRefs(el, 'totalConeCount')}
            labelText={pageTexts.coneAndPollen.summary.fieldLabels.totalConeCount}
            readOnly
          />
        </Column>
        <Column sm={2} md={4} lg={4}>
          <TextInput
            id="totalPollenCount"
            ref={(el: HTMLInputElement) => addRefs(el, 'totalPollenCount')}
            labelText={pageTexts.coneAndPollen.summary.fieldLabels.totalPollenCount}
            readOnly
          />
        </Column>
        <Column sm={2} md={4} lg={4}>
          <TextInput
            id="averageSMP"
            ref={(el: HTMLInputElement) => addRefs(el, 'averageSMP')}
            labelText={pageTexts.coneAndPollen.summary.fieldLabels.averageSMP}
            readOnly
          />
        </Column>
      </Row>
      <Row className="title-row">
        <Column sm={4} md={5} lg={9}>
          <h2>{pageTexts.sharedTabTexts.geneticWorth.title}</h2>
          <Subtitle text={pageTexts.sharedTabTexts.geneticWorth.subtitle} />
        </Column>
      </Row>
      <Row className="genetic-row">
        <Column sm={2} md={4} lg={4}>
          <TextInput
            id="populationSize"
            ref={(el: HTMLInputElement) => addRefs(el, 'populationSize')}
            labelText={pageTexts.sharedTabTexts.geneticWorth.defaultFieldsLabels.populationSize}
            readOnly
          />
        </Column>
        <Column sm={2} md={4} lg={4}>
          <TextInput
            id="testedParentTree"
            ref={(el: HTMLInputElement) => addRefs(el, 'testedParentTree')}
            labelText={pageTexts.sharedTabTexts.geneticWorth.defaultFieldsLabels.testedParentTree}
            readOnly
          />
        </Column>
        <Column sm={2} md={4} lg={4}>
          <TextInput
            id="coancestry"
            ref={(el: HTMLInputElement) => addRefs(el, 'coancestry')}
            labelText={pageTexts.sharedTabTexts.geneticWorth.defaultFieldsLabels.coancestry}
            readOnly
          />
        </Column>
        <Column sm={2} md={4} lg={4}>
          <TextInput
            id="smpParents"
            ref={(el: HTMLInputElement) => addRefs(el, 'smpParents')}
            labelText={pageTexts.sharedTabTexts.geneticWorth.defaultFieldsLabels.smpParents}
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

export default ConeAndPollenTab;
