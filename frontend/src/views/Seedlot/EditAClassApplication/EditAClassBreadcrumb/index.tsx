import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem
} from '@carbon/react';

import { useNavigate, useParams } from 'react-router-dom';
import PathConstants from '../../../../routes/pathConstants';
import { addParamToPath } from '../../../../utils/PathUtils';

const EditAClassBreadcrumb = () => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();

  return (
    <Breadcrumb>
      <BreadcrumbItem onClick={() => navigate(PathConstants.SEEDLOTS)}>
        Seedlots
      </BreadcrumbItem>
      <BreadcrumbItem onClick={() => navigate(PathConstants.MY_SEEDLOTS)}>
        My seedlots
      </BreadcrumbItem>
      <BreadcrumbItem onClick={() => navigate(addParamToPath(PathConstants.SEEDLOT_DETAILS, seedlotNumber ?? ''))}>
        {`Seedlot ${seedlotNumber}`}
      </BreadcrumbItem>
    </Breadcrumb>
  );
};

export default EditAClassBreadcrumb;
