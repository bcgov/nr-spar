import React, { useMemo } from 'react';
import ClassAContext from './ClassAContext';

type props = {
  children: React.ReactNode
}

const SeedlotContextClassA = ({ children }: props) => {

  const contextData = useMemo(
    () => (
      {
        allStepData,
        setStepData,
        seedlotSpecies: getSpeciesOptionByCode(
          seedlotQuery.data?.vegetationCode,
          vegCodeQuery.data
        ),
        formStep,
        setStep,
        defaultAgencyObj: getAgencyObj(),
        defaultCode: getDefaultLocationCode(),
        agencyOptions: applicantAgencyQuery.data ?? [],
        isFormSubmitted
      }),
    [
      allStepData, setStepData, seedlotQuery.status,
      vegCodeQuery.status, formStep, forestClientQuery.status,
      applicantAgencyQuery.status, isFormSubmitted
    ]
  );

  return (
    <ClassAContext.Provider value={contextData}>
      {children}
    </ClassAContext.Provider>
  )
};

export default SeedlotContextClassA;
