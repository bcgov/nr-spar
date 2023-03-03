import React, { useState } from 'react';
import axios from 'axios';

import { Button } from '@carbon/react';
import { Edit } from '@carbon/icons-react';

import Subtitle from '../Subtitle';

import SeedlotRegistration from '../../types/SeedlotRegistration';

import getUrl from '../../utils/ApiUtils';
import ApiAddresses from '../../utils/ApiAddresses';
import { useAuth } from '../../contexts/AuthContext';

import './styles.scss';

const ApplicantSeedlotInformation = () => {
  const { token } = useAuth();
  const getAxiosConfig = () => {
    const axiosConfig = {};
    if (token) {
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      Object.assign(axiosConfig, headers);
    }
    return axiosConfig;
  };

  const seedlotData: SeedlotRegistration = {
    applicant: {
      name: '',
      number: '',
      email: ''
    },
    species: '',
    source: '',
    registered: true,
    collectedBC: true
  };

  const [seedlotInfo, setSeedlotInfo] = useState<SeedlotRegistration>(seedlotData);

  const getSeedlotInfo = () => {
    axios.get(getUrl(ApiAddresses.SeedlotInfoRetrieveAll), getAxiosConfig())
      .then((response) => {
        if(response.data.seedlotInfos){
          setSeedlotInfo(response.data.seedlotInfos[0]);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(`Error: ${error}`);
      });
  };

  getSeedlotInfo();

  return (
    <div className="applicant-seedlot-information">
      <div className="applicant-seedlot-information-title-section">
        <p className="applicant-seedlot-information-title">
          Applicant and seedlot information
        </p>
        <Subtitle text="Check your seedlot initial information" />
      </div>
      {seedlotInfo &&
        <div>
          <div className="applicant-seedlot-info-section">
            <div className="applicant-seedlot-agency-name">
              <p className="applicant-seedlot-info-label">
                Applicant agency name
              </p>
              <p className="applicant-seedlot-info-value">
                {seedlotInfo.applicant.name}
              </p>
            </div>
            <div className="applicant-seedlot-agency-number">
              <p className="applicant-seedlot-info-label">
                Applicant agency number
              </p>
              <p className="applicant-seedlot-info-value">
                {seedlotInfo.applicant.number}
              </p>
            </div>
            <div className="applicant-seedlot-agency-email">
              <p className="applicant-seedlot-info-label">
                Applicant email address
              </p>
              <p className="applicant-seedlot-info-value">
                {seedlotInfo.applicant.email}
              </p>
            </div>
            <div className="applicant-seedlot-seedlot-species">
              <p className="applicant-seedlot-info-label">
                Seedlot species
              </p>
              <p className="applicant-seedlot-info-value">
                {seedlotInfo.species}
              </p>
            </div>
            <div className="applicant-seedlot-class-a-source">
              <p className="applicant-seedlot-info-label">
                Class A source
              </p>
              <p className="applicant-seedlot-info-value">
                {seedlotInfo.source}
              </p>
            </div>
          </div>
          <div className="applicant-seedlot-registered-collected">
            <div className="applicant-seedlot-registered">
              <p className="applicant-seedlot-info-label">
                To be registered?
              </p>
              <p className="applicant-seedlot-info-value">
                {seedlotInfo.registered ? ("Yes, to be registered with the Tree Seed Centre") :
                ("No")}
              </p>
            </div>
            <div className="applicant-seedlot-collected">
              <p className="applicant-seedlot-info-label">
                Collected from B.C. source?
              </p>
              <p className="applicant-seedlot-info-value">
                {seedlotInfo.collectedBC ? ("Yes, collected from a location within B.C.") :
                ("No")}
              </p>
            </div>
          </div>
          <Button
            kind="tertiary"
            size="md"
            className="btn-edit"
            renderIcon={Edit}
          >
            Edit applicant
          </Button>
        </div>
      }
    </div>
  );
};

export default ApplicantSeedlotInformation;
