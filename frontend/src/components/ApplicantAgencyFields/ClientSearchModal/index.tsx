/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  Link,
  FlexGrid,
  Row,
  Column,
  TextInput,
  Dropdown,
  Button
} from '@carbon/react';
import { Search } from '@carbon/icons-react';

import ModalStateManager from '../../ModalStateManager';
import EmptySection from '../../EmptySection';

import { ClientSearchModalProps, LaunchModal } from './definitions';
import { clientSearchOptions, getEmptySectionDescription } from './constants';

import './styles.scss';

const ClientSearchModal = (
  {
    linkText,
    modalLabel
  }: ClientSearchModalProps
) => {
  const navigate = useNavigate();

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
          secondaryButtonText="Cancel"
          modalHeading="Client Search"
          closeButtonLabel="Close client search modal"
        >
          <FlexGrid className="client-search-grid">
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
                  placeholder="Search for client or agency "
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
                />
              </Column>
              <Column sm={4} md={4} lg={2} xlg={2}>
                <Button
                  size="md"
                  renderIcon={Search}
                  className="client-search-button"
                >
                  Search
                </Button>
              </Column>
            </Row>
            <Row>
              <Column sm={4} md={4} lg={16} xlg={16}>
                <EmptySection
                  pictogram="Summit"
                  title="Nothing to show yet!"
                  description={getEmptySectionDescription()}
                />
              </Column>
            </Row>
          </FlexGrid>
        </Modal>
      )}
    </ModalStateManager>
  );
};

export default ClientSearchModal;
