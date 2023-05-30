/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabList,
  Tab,
  FlexGrid,
  Row,
  Column,
  Button,
  ActionableNotification,
  TableContainer,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarSearch
} from '@carbon/react';

import DropDownObj from '../../../types/DropDownObject';
import DescriptionBox from '../../DescriptionBox';
import { OrchardObj } from '../OrchardStep/definitions';
import { getPageText, notificationCtrlObj } from './constants';
import { tabTypes } from './definitions';
import { getTabString, processOrchards } from './utils';

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
  const [orchardsData, setOrchardsData] = useState<Array<OrchardObj>>([]);
  const [currentTab, setCurrentTab] = useState<keyof tabTypes>('coneTab');
  // eslint-disable-next-line prefer-object-spread
  const notifCtrlObj = Object.assign({}, notificationCtrlObj);
  const [notifCtrl, setNotifCtrl] = useState({ ...notifCtrlObj });

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

  // console.log(notifCtrl, currentTab);

  useEffect(
    () => {
      const processedOrchard = processOrchards(orchards);
      setOrchardsData(processedOrchard);
    },
    [orchards]
  );

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
                    notifCtrl[currentTab].showInfo && orchardsData.length > 0
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
                    notifCtrl[currentTab].showError && orchardsData.length === 0
                      ? (
                        <ActionableNotification
                          kind="error"
                          lowContrast
                          title={pageText.errorNotifTitle}
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
              <Row>
                <Column>
                  <TableContainer
                    title={pageText[currentTab].tabTitle}
                    description={pageText[currentTab].tableDescription}
                  >
                    <TableToolbar aria-label="data table toolbar">
                      <TableToolbarContent>
                        <TableToolbarSearch onChange={() => console.log('toolbar search')} />
                        <TableToolbarMenu light>
                          <TableToolbarAction>
                            Download table template
                          </TableToolbarAction>
                          <TableToolbarAction>
                            Export table as PDF file
                          </TableToolbarAction>
                          <TableToolbarAction>
                            Clean table data
                          </TableToolbarAction>
                        </TableToolbarMenu>
                        <Button>Primary Button</Button>
                      </TableToolbarContent>
                    </TableToolbar>
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
