/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import {
  FlexGrid, Row, Column,
  TextInput, Dropdown, Button
} from '@carbon/react';
import { Search } from '@carbon/icons-react';
import { Link } from 'react-router-dom';

import ComboBoxEvent from '../../../types/ComboBoxEvent';

import { clientSearchOptions } from './constants';
import { ClientSearchFieldsProps } from './definitions';

const ClientSearchFields = ({
  searchWord,
  setSearchWord,
  searchOption,
  setSearchOption,
  mutationFn
}: ClientSearchFieldsProps) => (
  <FlexGrid className="client-search-grid">
    <Row>
      <Column sm={4} md={4} lg={16} xlg={16}>
        <p className="client-modal-description">
          Search for a specific client or agency, you can search by name, acronym or number.
          To view more information about the client, you can
          {' '}
          <Link to="">
            go to client search screen.
          </Link>
        </p>
      </Column>
    </Row>
    <Row className="client-search-row">
      <Column sm={4} md={4} lg={10} xlg={10}>
        <TextInput
          id="client-search-input"
          labelText=""
          aria-label="Client Search Input"
          placeholder="Search for client or agency"
          defaultValue={searchWord}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchWord(e.target.value);
          }}
          disabled={mutationFn.isLoading}
        />
      </Column>
      <Column sm={4} md={4} lg={4} xlg={4}>
        <Dropdown
          id="client-search-dropdown"
          label=""
          aria-label="Client Search Field Select Dropdown"
          titleText=""
          items={clientSearchOptions}
          initialSelectedItem={clientSearchOptions[0]}
          selectedItem={searchOption}
          disabled={mutationFn.isLoading}
          onChange={(e: ComboBoxEvent) => {
            setSearchOption(e.selectedItem);
          }}
        />
      </Column>
      <Column sm={4} md={4} lg={2} xlg={2}>
        <Button
          size="md"
          renderIcon={Search}
          className="client-search-button"
          disabled={mutationFn.isLoading}
          onClick={
            () => mutationFn.mutate({ word: searchWord, option: searchOption.option })
          }
        >
          Search
        </Button>
      </Column>
    </Row>
  </FlexGrid>
);

export default ClientSearchFields;
