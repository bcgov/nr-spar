import React from 'react';
import {
  Row,
  Column,
  RadioButtonGroup,
  Checkbox,
  CheckboxGroup,
  RadioButtonSkeleton
} from '@carbon/react';
import { useQuery } from '@tanstack/react-query';

import { SeedlotRegFormType } from '../../types/SeedlotRegistrationTypes';

import Subtitle from '../Subtitle';
import { SeedlotInformationProps } from './definitions';
import SeedlotSourceType from '../../types/SeedlotSourceType';
import InputErrorText from '../InputErrorText';

const SeedlotInformation = ({ formData, setFormData }: SeedlotInformationProps) => {

  const vegCodeQuery = useQuery({
    queryKey: ['vegetation-codes'],
    queryFn: () => getVegCodes(true),
    enabled: (!isEdit && isSeedlot),
    staleTime: THREE_HOURS, // will not refetch for 3 hours
    cacheTime: THREE_HALF_HOURS // data is cached 3.5 hours then deleted
  });

  const seedlotSourcesQuery = useQuery({
    queryKey: ['seedlot-sources'],
    queryFn: () => getSeedlotSources(),
    enabled: isSeedlot,
    staleTime: THREE_HOURS,
    cacheTime: THREE_HALF_HOURS
  });

  /**
   *  Default value is only set once upon query success, when cache data is used
   *  we will need to set the default again here.
   */
  useEffect(() => {
    if (seedlotSourcesQuery.isSuccess && !formData.sourceCode.value) {
      setDefaultSource(seedlotSourcesQuery.data);
    }
  }, [seedlotSourcesQuery.isFetched]);

  const renderSources = () => {
    if (seedlotSourcesQuery.isFetched) {
      return seedlotSourcesQuery.data.map((source: SeedlotSourceType) => (
        <RadioButton
          key={source.code}
          checked={formData.sourceCode.value === source.code}
          id={`seedlot-source-radio-btn-${source.code.toLocaleLowerCase()}`}
          labelText={source.description}
          value={source.code}
        />
      ));
    }
    return <InputErrorText description="Could not retrieve seedlot sources." />;
  };

  const handleCheckBox = (inputName: keyof SeedlotRegFormType, checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [inputName]: {
        ...prevData[inputName],
        value: checked
      }
    }));
  };

  const handleSource = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      sourceCode: {
        ...prevData.sourceCode,
        value
      }
    }));
  };

  return (
    <>
      <Row className="seedlot-information-title">
        <Column lg={8}>
          <h2>Seedlot information</h2>
          <Subtitle text="Enter the initial information about this seedlot" />
        </Column>
      </Row>
      <Row className="seedlot-species-row">
        {
          displayCombobox(vegCodeQuery, speciesFieldConfig)
        }
      </Row>
      <Row className="class-source-radio">
        <Column sm={4} md={8} lg={16}>
          <RadioButtonGroup
            legendText="Class A source"
            name="class-source-radiogroup"
            orientation="vertical"
            onChange={(e: string) => handleSource(e)}
          >
            {
              seedlotSourcesQuery.isFetching
                ? (
                  <RadioButtonSkeleton />
                )
                : renderSources()
            }
          </RadioButtonGroup>
        </Column>
      </Row>
      <Row className="registered-checkbox">
        <Column sm={4} md={8} lg={16}>
          <CheckboxGroup legendText="To be registered?">
            <Checkbox
              id="registered-tree-seed-center"
              name="registered"
              labelText="Yes, to be registered with the Tree Seed Centre"
              checked={formData.willBeRegistered.value}
              onChange={
                (e: React.ChangeEvent<HTMLInputElement>) => handleCheckBox('willBeRegistered', e.target.checked)
              }
            />
          </CheckboxGroup>
        </Column>
      </Row>
      <Row className="collected-checkbox">
        <Column sm={4} md={8} lg={16}>
          <CheckboxGroup legendText="Collected from B.C. source?">
            <Checkbox
              id="collected-bc"
              name="collectedBC"
              labelText="Yes, collected from a location within B.C."
              checked={formData.isBcSource.value}
              onChange={
                (e: React.ChangeEvent<HTMLInputElement>) => handleCheckBox('isBcSource', e.target.checked)
              }
            />
          </CheckboxGroup>
        </Column>
      </Row>
    </>
  )
};

export default SeedlotInformation;
