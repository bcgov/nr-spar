/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Button,
  Modal,
  FlexGrid,
  Row,
  Column
} from '@carbon/react';

import ClientSearchTable from '../../ClientSearchTable';
import ClientSearchFields from './ClientSearchFields';

import { searchForestClients } from '../../../api-service/forestClientsAPI';
import { ForestClientSearchType } from '../../../types/ForestClientTypes/ForestClientSearchType';

import {
  ClientSearchDropdown, ClientSearchModalProps
} from './definitions';
import { clientSearchOptions } from './constants';

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
  const [selectedClient, setSelectedClient] = useState<ForestClientSearchType>();
  const [disableApplyButton, setDisableApplyButton] = useState<boolean>(true);

  const searchClientMutation = useMutation({
    mutationFn: () => searchForestClients(
      searchWord,
      searchOption.option
    )
  });

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
                  <ClientSearchTable
                    clientData={searchClientMutation.data ?? []}
                    showPagination
                    selectClientFn={(client: ForestClientSearchType) => {
                      if (disableApplyButton) {
                        setDisableApplyButton(false);
                      }
                      setSelectedClient(client);
                    }}
                    currentSelected={selectedClient}
                    mutationFn={searchClientMutation}
                  />
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
