/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    state,
    setStepData
  }: ParentTreeStepProps
) => (
  <div className="seedlot-parent-tree-step">
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

export default ParentTreeStep;
