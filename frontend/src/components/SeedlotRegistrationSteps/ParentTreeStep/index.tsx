import React from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FlexGrid,
  Row,
  Column
} from '@carbon/react';

import DropDownObj from '../../../types/DropDownObject';
import ConeAndPollen from './Tabs/ConeAndPollen';
import SuccessOnParent from './Tabs/SuccessOnParent';
import CalcOfMix from './Tabs/CalcOfMix';

import { pageTexts } from './constants';

import './styles.scss';

interface ParentTreeStepProps {
  seedlotSpecies: DropDownObj
  state: object;
  setStepData: Function;
}

const ParentTreeStep = (
  {
    seedlotSpecies,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setStepData
  }: ParentTreeStepProps
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const a = 'b';
  return (
    <FlexGrid className="parent-tree-step-container">
      <Row>
        <Column sm={4} md={8} lg={16} xlg={16}>
          <Tabs>
            <TabList className="parent-tree-step-tab-list" aria-label="List of tabs">
              <Tab>{pageTexts.tabTitles.coneTab}</Tab>
              <Tab>{pageTexts.tabTitles.smpTab}</Tab>
              <Tab>{pageTexts.tabTitles.mixTab}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <ConeAndPollen seedlotSpecies={seedlotSpecies} />
              </TabPanel>
              <TabPanel>
                <SuccessOnParent />
              </TabPanel>
              <TabPanel>
                <CalcOfMix />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ParentTreeStep;
