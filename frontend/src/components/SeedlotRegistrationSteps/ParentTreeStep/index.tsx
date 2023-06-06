import React from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@carbon/react';

import ConeAndPollen from './Tabs/ConeAndPollen';

import { pageTexts } from './constants';

import './styles.scss';
import DropDownObj from '../../../types/DropDownObject';

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
    <div className="parent-tree-step-container">
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab>{pageTexts.tabTitles.coneTab}</Tab>
          <Tab>{pageTexts.tabTitles.smpTab}</Tab>
          <Tab>{pageTexts.tabTitles.mixTab}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ConeAndPollen seedlotSpecies={seedlotSpecies} />
          </TabPanel>
          <TabPanel>
            SMP
          </TabPanel>
          <TabPanel>
            MIX
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default ParentTreeStep;
