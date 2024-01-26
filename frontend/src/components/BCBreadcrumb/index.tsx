import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  OverflowMenu
} from '@carbon/react';

import { useNavigate } from 'react-router-dom';

import './styles.scss';

interface BCBreadcrumbProps {
  breadcrumbData:
    {
      name: string,
      path: string
    }[];
}

const BCBreadcrumb = ({ breadcrumbData }:BCBreadcrumbProps) => {
  const navigate = useNavigate();

  const lastBreadcrumb = breadcrumbData.length - 1;
  const overflowData = breadcrumbData.slice(1, lastBreadcrumb);

  if (breadcrumbData.length >= 3) {
    return (
      <div className="breadcrumbs-container">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate(breadcrumbData[0].path)}>
            {breadcrumbData[0].name}
          </BreadcrumbItem>
          {overflowData.map((breadcrumb) => (
            <BreadcrumbItem
              onClick={() => navigate(breadcrumb.path)}
              className="overflow-breadcrumb"
              key={breadcrumb.name}
            >
              {breadcrumb.name}
            </BreadcrumbItem>
          ))}
          <BreadcrumbItem className="overflow-menu-container">
            <OverflowMenu>
              {overflowData.map((breadcrumb) => (
                <BreadcrumbItem
                  onClick={() => navigate(breadcrumb.path)}
                  key={breadcrumb.name}
                >
                  {breadcrumb.name}
                </BreadcrumbItem>
              ))}
            </OverflowMenu>
          </BreadcrumbItem>
          <BreadcrumbItem onClick={() => navigate(breadcrumbData[lastBreadcrumb].path)}>
            {breadcrumbData[lastBreadcrumb].name}
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
    );
  }
  return (
    <div className="breadcrumbs-container">
      <Breadcrumb>
        {breadcrumbData.map((breadcrumb) => (
          <BreadcrumbItem
            onClick={() => navigate(breadcrumb.path)}
            key={breadcrumb.name}
          >
            {breadcrumb.name}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </div>
  );
};

export default BCBreadcrumb;
