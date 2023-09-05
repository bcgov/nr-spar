import React from 'react';
import { Column, TextInput } from '@carbon/react';
import InfoDisplayObj from '../../../types/InfoDisplayObj';

import '../styles.scss';

interface InfoSectionColumnProps {
  item: InfoDisplayObj
}

const InfoSectionColumn = (
  { item }: InfoSectionColumnProps
) => {
  const formatStrForKey = (str: string) => (
    str.replace(/[^a-zA-Z]+/g, '').toLowerCase()
  );

  return (
    <Column
      key={`${formatStrForKey(item.name)}-col`}
      sm={4}
      md={4}
      lg={8}
      xlg={4}
      max={4}
    >
      <TextInput
        id={`${formatStrForKey(item.name)}-id`}
        labelText={item.name}
        value={item.value}
        placeholder="--"
        readOnly
      />
    </Column>
  );
};

export default InfoSectionColumn;
