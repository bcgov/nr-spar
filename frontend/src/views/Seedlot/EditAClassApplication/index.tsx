import React, { useState } from 'react';

import { InitialSeedlotRegFormData } from '../CreateAClass/constants';
import { SeedlotRegFormType } from '../../../types/SeedlotRegistrationTypes';

import EditAClassApplicationForm from './Form';

import './styles.scss';

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
  ] = useState<SeedlotRegFormType>(InitialSeedlotRegFormData);

  return (
    <EditAClassApplicationForm
      isReview={isReview}
      applicantData={isReview ? applicantReviewData! : seedlotEditData}
      setApplicantData={isReview ? setApplicantReviewData! : setSeedlotEditData}
    />
  );
};

export default EditAClassApplication;
