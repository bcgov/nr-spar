/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabList,
  Tab,
  FlexGrid,
  Row,
  Column,
  ActionableNotification,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  OverflowMenuItem,
  OverflowMenu,
  Button,
  Checkbox,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton
} from '@carbon/react';
import { View, Settings, Upload } from '@carbon/icons-react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { getSeedPlanUnits, getParentTreeGeneQuali } from '../../../api-service/orchardAPI';

import DropDownObj from '../../../types/DropDownObject';
import DescriptionBox from '../../DescriptionBox';
import { OrchardObj } from '../OrchardStep/definitions';
import {
  getPageText, notificationCtrlObj, headerTemplate, rowTemplate
} from './constants';
import {
  TabTypes, HeaderObj, RowItem, RowDataDictType
} from './definitions';
import { getTabString, processOrchards, sortRowItem } from './utils';
import { ParentTreeGeneticQualityType, GenWorthCodeEnum } from '../../../types/ParentTreeGeneticQualityType';

import './styles.scss';

interface ParentTreeStepProps {
  seedlotSpecies: DropDownObj
  state: object;
  setStepData: Function;
  orchards: Array<OrchardObj>;
}

const ParentTreeStep = (
  {
    seedlotSpecies,
    state,
    setStepData,
    orchards
  }: ParentTreeStepProps
) => {
  const pageText = getPageText();
  const queryClient = useQueryClient();
  const [orchardsData, setOrchardsData] = useState<Array<OrchardObj>>([]);
  const [currentTab, setCurrentTab] = useState<keyof TabTypes>('coneTab');
  const [notifCtrl, setNotifCtrl] = useState(structuredClone(notificationCtrlObj));
  const [headerConfig, setHeaderConfig] = useState<Array<HeaderObj>>(structuredClone(headerTemplate));
  const [tableRowData, setTableRowData] = useState<RowDataDictType>({});

  const toggleNotification = (notifType: string) => {
    const newNotifCtrl = { ...notifCtrl };
    if (notifType === 'info') {
      newNotifCtrl[currentTab].showInfo = false;
    }
    if (notifType === 'error') {
      newNotifCtrl[currentTab].showError = false;
    }
    setNotifCtrl(newNotifCtrl);
  };

  useEffect(
    () => {
      const processedOrchard = processOrchards(orchards);
      setOrchardsData(processedOrchard);
    },
    [orchards]
  );

  // Seed plan units queries
  useQueries({
    queries:
      orchardsData.map((orchard) => ({
        queryKey: ['orchard', orchard.orchardId, 'seed-plan-units'],
        queryFn: () => getSeedPlanUnits(orchard.orchardId),
        refetchOnMount: false,
        refetchOnWindowFocus: false
      }))
  });

  const getSPUfromQuery = (orchardId: string): string => {
    const data: Array<any> = queryClient.getQueryData(['orchard', orchardId, 'seed-plan-units']) ?? [];
    if (data[0]?.seedPlanningUnitId) {
      return data[0].seedPlanningUnitId;
    }
    return '';
  };

  const enableParentTreeQuery = (orchardId: string): boolean => {
    if (queryClient.getQueryState(['orchard', orchardId, 'seed-plan-units'])?.status === 'success') {
      return getSPUfromQuery(orchardId) !== '';
    }
    return false;
  };

  const processParentTreeData = (data: ParentTreeGeneticQualityType) => {
    let clonedTableRowData: RowDataDictType = structuredClone(tableRowData);

    data.parentTrees.forEach((parentTree) => {
      if (!Object.prototype.hasOwnProperty.call(clonedTableRowData, parentTree.parentTreeNumber)) {
        const newRowData: RowItem = structuredClone(rowTemplate);
        newRowData.clone_number = parentTree.parentTreeNumber;
        // Assign genetic worth values
        parentTree.parentTreeGeneticQualities.forEach((singleGenWorthObj) => {
          const genWorthName = singleGenWorthObj.geneticWorthCode.toLowerCase();
          if (Object.prototype.hasOwnProperty.call(newRowData, genWorthName)) {
            newRowData[genWorthName] = singleGenWorthObj.geneticQualityValue;
          }
        });
        clonedTableRowData = Object.assign(clonedTableRowData, {
          [parentTree.parentTreeNumber]: newRowData
        });
      }
    });

    setTableRowData(clonedTableRowData);
  };

  // Parent tree genetic quality queries
  useQueries({
    queries:
      orchardsData.map((orchard) => ({
        queryKey: ['orchard', 'parent-tree-genetic-quality', orchard.orchardId, getSPUfromQuery(orchard.orchardId)],
        queryFn: () => getParentTreeGeneQuali(orchard.orchardId, getSPUfromQuery(orchard.orchardId)),
        enabled: enableParentTreeQuery(orchard.orchardId),
        onSuccess: (data: ParentTreeGeneticQualityType) => processParentTreeData(data),
        refetchOnMount: false,
        refetchOnWindowFocus: false
      }))
  });

  return (
    <FlexGrid className="parent-tree-step-container">
      <Row>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <Tabs onChange={
            (value: { selectedIndex: number }) => setCurrentTab(getTabString(value.selectedIndex))
          }
          >
            <TabList className="parent-tree-step-tab-list" aria-label="List of tabs">
              <Tab>
                {pageText.coneTab.tabTitle}
                &nbsp;(required)
              </Tab>
              <Tab>{pageText.successTab.tabTitle}</Tab>
              <Tab>{pageText.mixTab.tabTitle}</Tab>
            </TabList>
            <FlexGrid className="parent-tree-tab-container">
              <Row className="title-row">
                <Column sm={4} md={8} lg={16} xlg={12} max={10}>
                  <DescriptionBox
                    header={pageText[currentTab].tabTitle}
                    description={pageText[currentTab].tabDescription}
                  />
                </Column>
              </Row>
              <Row className="notification-row">
                <Column>
                  {
                    (notifCtrl[currentTab].showInfo && orchardsData.length > 0)
                      ? (
                        <ActionableNotification
                          kind="info"
                          lowContrast
                          title={pageText.notificationTitle}
                          inline
                          actionButtonLabel=""
                          onClose={(_event: any) => {
                            toggleNotification('info');
                            return false;
                          }}
                        >
                          <span className="notification-subtitle">
                            {pageText[currentTab].notificationSubtitle}
                          </span>
                        </ActionableNotification>
                      )
                      : null
                  }
                  {
                    (notifCtrl[currentTab].showError && orchardsData.length === 0)
                      ? (
                        <ActionableNotification
                          kind="error"
                          lowContrast
                          title={pageText.errorNotifTitle}
                          actionButtonLabel=""
                          onClose={(_event: any) => {
                            toggleNotification('error');
                            return false;
                          }}
                        >
                          <span className="notification-subtitle">
                            {pageText.errorDescription}
                          </span>
                        </ActionableNotification>
                      )
                      : null
                  }
                </Column>
              </Row>
              <Row className="parent-tree-step-table-container">
                <Column>
                  <TableContainer
                    title={pageText[currentTab].tabTitle}
                    description={pageText[currentTab].tableDescription}
                  >
                    <TableToolbar aria-label="data table toolbar">
                      <TableToolbarContent>
                        <OverflowMenu
                          renderIcon={View}
                          menuOptionsClass="parent-tree-view-options"
                          iconDescription="haha"
                          flipped
                        >
                          <div>
                            haha
                          </div>
                          <div>
                            hahaha
                          </div>
                        </OverflowMenu>
                        <OverflowMenu
                          renderIcon={Settings}
                          menuOptionsClass="parent-tree-table-options"
                          iconDescription="sss"
                        >
                          <OverflowMenuItem
                            itemText="gggg"
                          />
                        </OverflowMenu>
                        <Button
                          size="sm"
                          kind="primary"
                          renderIcon={Upload}
                        // onClick={() => console.log(queryClient.getQueryData(['orchard', '405', 'seed-plan-units']))}
                        >
                          Upload from file
                        </Button>
                      </TableToolbarContent>
                    </TableToolbar>
                    <Table useZebraStyles>
                      <TableHead>
                        <TableRow>
                          {
                            headerConfig.map((header) => (
                              (header.availableInTabs.includes(currentTab) && header.enabled)
                                ? (
                                  <TableHeader id={header.id} key={header.id}>
                                    {header.name}
                                  </TableHeader>
                                )
                                : null
                            ))
                          }
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {
                          // Since we cannot sort an Object, we will have to sort the array here
                          sortRowItem(Object.values(tableRowData)).map((rowData) => (
                            <TableRow key={rowData.clone_number}>
                              {
                                headerConfig.map((header) => (
                                  // This is to enforce that the cell data is actually related to the column
                                  (header.availableInTabs.includes(currentTab) && header.enabled)
                                    ? (
                                      <TableCell key={header.id}>
                                        {rowData[header.id]}
                                      </TableCell>
                                    )
                                    : null
                                ))
                              }
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Column>
              </Row>
            </FlexGrid>
          </Tabs>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ParentTreeStep;
