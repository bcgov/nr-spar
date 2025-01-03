import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  OverflowMenu,
  OverflowMenuItem
} from '@carbon/react';

import useWindowSize from '../../hooks/UseWindowSize';
import { MEDIUM_SCREEN_WIDTH, SMALL_SCREEN_WIDTH } from '../../shared-constants/shared-constants';

import { BreadcrumbsProps, CrumbType } from './definitions';
import { DEFAULT_MAX_CRUMBS, DEFAULT_MAX_CRUMBS_MD, DEFAULT_MAX_CRUMBS_SM } from './constants';

import './styles.scss';

const Breadcrumbs = ({ crumbs }: BreadcrumbsProps) => {
  if (!crumbs.length) {
    return null;
  }

  const navigate = useNavigate();
  const windowSize = useWindowSize();
  const [displayedCrumbs, setDisplayedCrumbs] = useState<CrumbType[]>(() => crumbs);
  const [overflowCrumbs, setOverflowCrumbs] = useState<CrumbType[]>([]);

  /**
   * Adjust the config of breadcrumbs every time the window size changes.
   */
  useEffect(() => {
    const width = windowSize.innerWidth;
    let maxCrumbs = DEFAULT_MAX_CRUMBS;

    if (width <= MEDIUM_SCREEN_WIDTH) {
      maxCrumbs = DEFAULT_MAX_CRUMBS_MD;
    }

    if (width <= SMALL_SCREEN_WIDTH) {
      maxCrumbs = DEFAULT_MAX_CRUMBS_SM;
    }

    const crumbsLen = crumbs.length;

    if (crumbsLen > maxCrumbs) {
      const diff = crumbsLen - maxCrumbs;
      setOverflowCrumbs(crumbs.slice(1, diff + 1));
      setDisplayedCrumbs(crumbs.slice(0, 1).concat(crumbs.slice(diff + 1)));
    } else {
      setOverflowCrumbs([]);
      setDisplayedCrumbs(crumbs);
    }
  }, [windowSize.innerWidth, crumbs]);

  if (overflowCrumbs.length === 0) {
    return (
      <div className="breadcrumbs-container">
        <Breadcrumb>
          {
            displayedCrumbs.map((crumb) => (
              <BreadcrumbItem
                onClick={() => navigate(crumb.path)}
                key={crumb.name}
              >
                {crumb.name}
              </BreadcrumbItem>
            ))
          }
        </Breadcrumb>
      </div>
    );
  }

  return (
    <div className="breadcrumbs-container">
      <Breadcrumb>
        <BreadcrumbItem
          onClick={() => navigate(displayedCrumbs[0].path)}
        >
          {displayedCrumbs[0].name}
        </BreadcrumbItem>
        <BreadcrumbItem>
          <OverflowMenu>
            {
              overflowCrumbs.map((overflowCrumb) => (
                <OverflowMenuItem
                  key={overflowCrumb.name}
                  itemText={overflowCrumb.name}
                  onClick={() => navigate(overflowCrumb.path)}
                />
              ))
            }
          </OverflowMenu>
        </BreadcrumbItem>
        {
          displayedCrumbs.slice(1).map((crumb) => (
            <BreadcrumbItem
              onClick={() => navigate(crumb.path)}
              key={crumb.name}
            >
              {crumb.name}
            </BreadcrumbItem>
          ))
        }
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
