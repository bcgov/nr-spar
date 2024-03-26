import React from 'react';

import EditAClassApplication from '../../../views/Seedlot/EditAClassApplication';
import { SeedlotRegFormType } from '../../../types/SeedlotRegistrationTypes';

type props = {
  applicantData: SeedlotRegFormType,
  setApplicantData: React.Dispatch<React.SetStateAction<SeedlotRegFormType>>
}

const ApplicantAndSeedlotEdit = ({ applicantData, setApplicantData }: props) => (
  <EditAClassApplication
    isReview
    applicantReviewData={applicantData}
    setApplicantReviewData={setApplicantData}
  />
);

export default ApplicantAndSeedlotEdit;
