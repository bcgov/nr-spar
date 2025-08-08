/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import {
  FlexGrid, Row, Column,
  TextInput, Dropdown, Button
} from '@carbon/react';
import { Search } from '@carbon/icons-react';

import ComboBoxEvent from '../../../types/ComboBoxEvent';
import useWindowSize from '../../../hooks/UseWindowSize';
import { MEDIUM_SCREEN_WIDTH } from '../../../shared-constants/shared-constants';

import { clientSearchOptions } from './constants';
import { ClientSearchFieldsProps } from './definitions';

const ClientSearchFields = ({
  searchWord,
  setSearchWord,
  searchOption,
  setSearchOption,
  mutationFn
}: ClientSearchFieldsProps) => {
  const windowSize = useWindowSize();

  return (
    <FlexGrid className="client-search-grid">
      <Row>
        <Column sm={4} md={4} lg={16} xlg={16}>
          <p className="client-modal-description">
            Search for a specific client or agency, you can search by name, acronym or number.
            {/* Commenting this until search screen is created */}
            {/* To view more information about the client, you can
            {' '}
            <Link to="">
              go to client search screen.
            </Link> */}
          </p>
        </Column>
      </Row>
      <Row className="client-search-row">
        <Column sm={2} md={3} lg={10} xlg={10}>
          <TextInput
            id="client-search-input"
            labelText=""
            aria-label="Client Search Input"
            placeholder="Search for client or agency"
            defaultValue={searchWord}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchWord(e.target.value);
            }}
            disabled={mutationFn.isPending}
          />
        </Column>
        <Column sm={1} md={3} lg={3} xlg={3}>
          <Dropdown
            id="client-search-dropdown"
            label=""
            aria-label="Client Search Field Select Dropdown"
            titleText=""
            items={clientSearchOptions}
            initialSelectedItem={clientSearchOptions[0]}
            selectedItem={searchOption}
            disabled={mutationFn.isPending}
            onChange={(e: ComboBoxEvent) => {
              setSearchOption(e.selectedItem);
            }}
          />
        </Column>
        <Column sm={1} md={2} lg={3} xlg={3}>
          <Button
            size="md"
            renderIcon={
              windowSize.innerWidth > MEDIUM_SCREEN_WIDTH
                ? Search
                : null
            }
            className="client-search-button"
            disabled={mutationFn.isPending}
            onClick={
              searchWord.length
                ? () => mutationFn.mutate()
                : null
            }
          >
            Search
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default ClientSearchFields;
