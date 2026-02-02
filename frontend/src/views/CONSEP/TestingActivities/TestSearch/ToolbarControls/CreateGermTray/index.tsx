import React, { useState } from 'react';
import { Checkbox, Button } from '@carbon/react';
import { GermTrayOptions, CreateGermTrayProps } from './definitions';
import './styles.scss';

const CreateGermTray: React.FC<CreateGermTrayProps> = ({
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [options, setOptions] = useState<GermTrayOptions>({
    printDishLabels: false,
    printGerminationTrayLabels: false,
    printGerminationCoverSheet: false,
    printGerminationTestRecord: false
  });

  const handleCheckboxChange = (key: keyof GermTrayOptions) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = () => {
    onSubmit(options);
  };

  const isAnyCheckboxSelected = Object.values(options).some((value) => value);

  return (
    <div className="create-germ-tray-content">
      <div className="germ-tray-options">
        <Checkbox
          id="print-dish-labels"
          labelText="Print dish labels"
          checked={options.printDishLabels}
          onChange={() => handleCheckboxChange('printDishLabels')}
        />
        <Checkbox
          id="print-germination-tray-labels"
          labelText="Print germination tray labels"
          checked={options.printGerminationTrayLabels}
          onChange={() => handleCheckboxChange('printGerminationTrayLabels')}
        />
        <Checkbox
          id="print-germination-cover-sheet"
          labelText="Print germination cover sheet"
          checked={options.printGerminationCoverSheet}
          onChange={() => handleCheckboxChange('printGerminationCoverSheet')}
        />
        <Checkbox
          id="print-germination-test-record"
          labelText="Print germination test record"
          checked={options.printGerminationTestRecord}
          onChange={() => handleCheckboxChange('printGerminationTestRecord')}
        />
      </div>
      <div className="germ-tray-actions">
        <Button kind="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button kind="primary" onClick={handleSubmit} disabled={isLoading || !isAnyCheckboxSelected}>
          Create germination tray
        </Button>
      </div>
    </div>
  );
};

export default CreateGermTray;
