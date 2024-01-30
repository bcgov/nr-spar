/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Button,
  Modal,
  FlexGrid,
  Row,
  Column,
  Pagination,
  DataTableSkeleton
} from '@carbon/react';

import ClientSearchTable from '../../ClientSearchTable';
import EmptySection from '../../EmptySection';
import ClientSearchFields from './ClientSearchFields';

import { searchForestClients } from '../../../api-service/forestClientsAPI';
import PaginationChangeType from '../../../types/PaginationChangeType';
import { ForestClientDisplayType } from '../../../types/ForestClientTypes/ForestClientDisplayType';

import {
  ClientSearchDropdown, ClientSearchModalProps, MutationParams
} from './definitions';
import { clientSearchOptions, getEmptySectionDescription } from './constants';

import './styles.scss';

const ClientSearchModal = (
  {
    linkText,
    modalLabel,
    applySelectedClient
  }: ClientSearchModalProps
) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [searchWord, setSearchWord] = useState<string>('');
  const [searchOption, setSearchOption] = useState<ClientSearchDropdown>(clientSearchOptions[0]);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<ForestClientDisplayType[]>([]);
  const [selectedClient, setSelectedClient] = useState<ForestClientDisplayType>();
  const [disableApplyButton, setDisableApplyButton] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const searchClientMutation = useMutation({
    mutationFn: (requestParam: MutationParams) => {
      setShowTable(true);
      return searchForestClients(
        requestParam.word,
        requestParam.option
      );
    },
    onSuccess: (res: any) => {
      setSearchResults(res);
    },
    onError: (error: Error) => {
      setShowTable(false);
      setErrorMessage(error.message);
    }
  });

  const [currPageNumber, setCurrPageNumber] = useState<number>(0);
  const [currPageSize, setCurrPageSize] = useState<number>(10);
  const [curIndex, setCurIndex] = useState<number>(0);

  const handlePagination = (paginationObj: PaginationChangeType) => {
    if (paginationObj.forwardBtnRef) {
      setCurIndex(curIndex - paginationObj.pageSize);
    } else {
      setCurIndex(curIndex + paginationObj.pageSize);
    }
    setCurrPageNumber(paginationObj.page - 1);
    setCurrPageSize(paginationObj.pageSize);
  };

  const tablePagination = () => (
    <Pagination
      className="client-table-pagination"
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
          clientData={searchResults.slice(
            curIndex,
            currPageSize + Math.min(curIndex, searchResults.length)
          )}
          showPagination={searchResults.length > 10}
          tablePagination={tablePagination()}
          selectClientFn={(client: ForestClientDisplayType) => {
            if (disableApplyButton) {
              setDisableApplyButton(false);
            }
            setSelectedClient(client);
          }}
          currentSelected={selectedClient}
        />
      )
  );

  return (
    <>
      <Button
        className="client-search-toggle-btn"
        onClick={() => setIsOpen(true)}
      >
        <p>{linkText}</p>
      </Button>
      {
        createPortal(
          <Modal
            className="client-search-modal"
            size="lg"
            open={isOpen}
            onRequestClose={() => setIsOpen(false)}
            onRequestSubmit={() => {
              applySelectedClient(selectedClient);
              setIsOpen(false);
            }}
            modalLabel={modalLabel}
            modalHeading="Client search"
            primaryButtonText="Apply selected client"
            primaryButtonDisabled={disableApplyButton}
            secondaryButtonText="Cancel"
            closeButtonLabel="Close client search modal"
          >
            <FlexGrid className="client-search-grid">
              <ClientSearchFields
                searchWord={searchWord}
                setSearchWord={setSearchWord}
                searchOption={searchOption}
                setSearchOption={setSearchOption}
                mutationFn={searchClientMutation}
              />
              <Row>
                <Column sm={4} md={4} lg={16} xlg={16}>
                  {
                    showTable
                      ? showResultsTable()
                      : (
                        <EmptySection
                          pictogram={errorMessage ? 'FaceVeryDissatisfied' : 'Summit'}
                          title={errorMessage ? 'An unexpected error occuried :(' : 'Nothing to show yet!'}
                          description={getEmptySectionDescription(errorMessage)}
                        />
                      )
                  }
                </Column>
              </Row>
            </FlexGrid>
          </Modal>,
          document.body
        )
      }
    </>
  );
};

export default ClientSearchModal;
