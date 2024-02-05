import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  OverflowMenu
} from '@carbon/react';

import { useNavigate } from 'react-router-dom';

import './styles.scss';

interface DisplayBreadcrumbProps {
  breadcrumbData:
    {
      name: string,
      path: string
    }[];
}

const DisplayBreadcrumb = ({ breadcrumbData }:DisplayBreadcrumbProps) => {
  const navigate = useNavigate();

  const lastBreadcrumb = breadcrumbData.length - 1;
  const middleBreadcrumbs = breadcrumbData.slice(1, lastBreadcrumb);
  return (
    <div className="breadcrumbs-container">
      <Breadcrumb>
        <BreadcrumbItem onClick={() => navigate(breadcrumbData[0].path)}>
          {breadcrumbData[0].name}
        </BreadcrumbItem>
        {(breadcrumbData.length >= 3) ? (middleBreadcrumbs.map((breadcrumb) => (
          <BreadcrumbItem
            onClick={() => navigate(breadcrumb.path)}
            className="overflow-breadcrumb"
            key={breadcrumb.name}
          >
            {breadcrumb.name}
          </BreadcrumbItem>
        ))) : null }
        {(breadcrumbData.length >= 3) ? (
          <BreadcrumbItem className="overflow-menu-container">
            <OverflowMenu>
              {middleBreadcrumbs.map((breadcrumb) => (
                <BreadcrumbItem
                  onClick={() => navigate(breadcrumb.path)}
                  key={breadcrumb.name}
                >
                  {breadcrumb.name}
                </BreadcrumbItem>
              ))}
            </OverflowMenu>
          </BreadcrumbItem>
        ) : null}
        {lastBreadcrumb ? (
          <BreadcrumbItem onClick={() => navigate(breadcrumbData[lastBreadcrumb].path)}>
            {breadcrumbData[lastBreadcrumb].name}
          </BreadcrumbItem>
        ) : null}
      </Breadcrumb>
    </div>
  );
};

export default DisplayBreadcrumb;
