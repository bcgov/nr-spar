/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  Link,
  FlexGrid,
  Row,
  Column,
  TextInput,
  Dropdown,
  Button,
  Pagination,
  DataTableSkeleton
} from '@carbon/react';
import { Search } from '@carbon/icons-react';

import ModalStateManager from '../../ModalStateManager';
import ClientSearchTable from '../../ClientSearchTable';
import EmptySection from '../../EmptySection';

import { searchForestClients } from '../../../api-service/forestClientsAPI';
import PaginationChangeType from '../../../types/PaginationChangeType';
import ComboBoxEvent from '../../../types/ComboBoxEvent';
import { ForestClientDisplayType } from '../../../types/ForestClientTypes/ForestClientDisplayType';

import {
  ClientSearchDropdown, ClientSearchModalProps,
  ClientSearchOptions, LaunchModal
} from './definitions';
import { clientSearchOptions, getEmptySectionDescription } from './constants';

import './styles.scss';

type MutationParams = {
  word: string;
  option: ClientSearchOptions
};

const ClientSearchModal = (
  {
    linkText,
    modalLabel
  }: ClientSearchModalProps
) => {
  const navigate = useNavigate();

  const [searchWord, setSearchWord] = useState<string>('');
  const [searchOption, setSearchOption] = useState<ClientSearchDropdown>(clientSearchOptions[0]);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<ForestClientDisplayType[]>([]);

  const searchClientMutation = useMutation({
    mutationFn: (requestParam: MutationParams) => {
      setShowTable(true);
      return searchForestClients(
        requestParam.word,
        requestParam.option
      );
    },
    onSuccess: (res: any) => {
      console.log(res);
      setSearchResults(res);
    },
    onError: (error: Error) => {
      console.log(error.message);
    }
  });

  const [currPageNumber, setCurrPageNumber] = useState<number>(0);
  const [currPageSize, setCurrPageSize] = useState<number>(10);

  const handlePagination = (paginationObj: PaginationChangeType) => {
    setCurrPageNumber(paginationObj.page - 1); // index starts at 0 on java.
    setCurrPageSize(paginationObj.pageSize);
  };

  const tablePagination = () => (
    <Pagination
      className="seedlot-data-table-pagination"
      page={currPageNumber + 1}
      pageSize={currPageSize}
      pageSizes={[10, 20, 30, 40, 50]}
      itemsPerPageText=""
      totalItems={searchResults.length ?? 0}
      onChange={
        (paginationObj: PaginationChangeType) => {
          handlePagination(paginationObj);
        }
      }
    />
  );

  const showResultsTable = () => (
    searchClientMutation.isLoading
      ? (
        <DataTableSkeleton
          showToolbar={false}
          showHeader={false}
        />
      )
      : (
        <ClientSearchTable
          clientData={searchResults}
          showPagination
          tablePagination={tablePagination()}
        />
      )
  );

  const modalHeader = () => (
    <FlexGrid className="client-search-grid">
      <Row className="client-modal-title">
        <Column sm={4} md={4} lg={16} xlg={16}>
          <h3>Client Search</h3>
        </Column>
      </Row>
      <Row>
        <Column sm={4} md={4} lg={16} xlg={16}>
          <p className="client-modal-description">
            Search for a specific client or agency, you can search by name, acronym or number.
            To view more information about the client, you can
            {' '}
            <Link
              onClick={() => navigate('/seedlots')}
              href="#"
            >
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
            disabled={searchClientMutation.isLoading}
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
            disabled={searchClientMutation.isLoading}
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
            disabled={searchClientMutation.isLoading}
            onClick={
              () => searchClientMutation.mutate({ word: searchWord, option: searchOption.option })
            }
          >
            Search
          </Button>
        </Column>
      </Row>
    </FlexGrid>
  );

  return (
    <ModalStateManager
      renderLauncher={({ setOpen }: LaunchModal) => (
        <Link
          role="button"
          onClick={() => setOpen(true)}
          href="#"
        >
          {linkText}
        </Link>
      )}
    >
      {({ open, setOpen }: LaunchModal) => (
        <Modal
          className="client-search-modal"
          size="lg"
          open={open}
          onRequestClose={() => setOpen(false)}
          modalLabel={modalLabel}
          primaryButtonText="Apply selected client"
          primaryButtonDisabled
          secondaryButtonText="Cancel"
          modalHeading={modalHeader()}
          closeButtonLabel="Close client search modal"
        >
          <FlexGrid className="client-search-grid">
            <Row>
              <Column sm={4} md={4} lg={16} xlg={16}>
                {
                  showTable
                    ? showResultsTable()
                    : (
                      <EmptySection
                        pictogram="Summit"
                        title="Nothing to show yet!"
                        description={getEmptySectionDescription()}
                      />
                    )
                }
              </Column>
            </Row>
          </FlexGrid>
        </Modal>
      )}
    </ModalStateManager>
  );
};

export default ClientSearchModal;
