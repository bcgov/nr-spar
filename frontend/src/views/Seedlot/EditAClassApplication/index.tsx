import React, { useState } from 'react';
import { SeedlotRegFormType } from '../../../types/SeedlotRegistrationTypes';

import { InitialSeedlotFormData } from '../CreateAClass/constants';

import './styles.scss';
import EditAClassApplicationForm from './Form';

type props = {
  // Defines whether this component is being used on the review seedlot page
  isReview?: boolean,
  // Must provide the two props below if isReview is true
  applicantReviewData?: SeedlotRegFormType,
  setApplicantReviewData?: React.Dispatch<React.SetStateAction<SeedlotRegFormType>>
}

const EditAClassApplication = (
  { isReview, applicantReviewData, setApplicantReviewData }: props
) => {
  const [
    seedlotEditData,
    setSeedlotEditData
  ] = useState<SeedlotRegFormType>(InitialSeedlotFormData);

  return (
    <EditAClassApplicationForm
      isReview={isReview}
      applicantData={isReview ? applicantReviewData! : seedlotEditData}
      setApplicantData={isReview ? setApplicantReviewData! : setSeedlotEditData}
    />
  );
};

export default EditAClassApplication;
