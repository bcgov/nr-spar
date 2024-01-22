import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  OverflowMenu
} from '@carbon/react';

import { useNavigate, useParams } from 'react-router-dom';
import PathConstants from '../../routes/pathConstants';
import { addParamToPath } from '../../utils/PathUtils';

import './styles.scss';

const SeedlotRegistrationBreadcrumb = () => {
  const navigate = useNavigate();
  const { seedlotNumber } = useParams();

  return (
    <div className="breadcrumbs-container">
      <Breadcrumb>
        <BreadcrumbItem onClick={() => navigate(PathConstants.SEEDLOTS)}>
          Seedlots
        </BreadcrumbItem>
        <BreadcrumbItem className="overflow-menu-container">
          <OverflowMenu>
            <BreadcrumbItem onClick={() => navigate(PathConstants.MY_SEEDLOTS)}>
              My seedlots
            </BreadcrumbItem>
          </OverflowMenu>
        </BreadcrumbItem>
        <BreadcrumbItem onClick={() => navigate(PathConstants.MY_SEEDLOTS)} className="overflow-breadcrumb">
          My seedlots
        </BreadcrumbItem>
        <BreadcrumbItem onClick={() => navigate(addParamToPath(PathConstants.SEEDLOT_DETAILS, seedlotNumber ?? ''))}>
          {`Seedlot ${seedlotNumber}`}
        </BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
};

export default SeedlotRegistrationBreadcrumb;
