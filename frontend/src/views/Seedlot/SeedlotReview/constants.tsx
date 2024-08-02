import React from 'react';
import { GenWorthValType, GeoInfoValType } from './definitions';

export const INITIAL_GEO_INFO_VALS: GeoInfoValType = {
  meanElevation: {
    id: 'geo-info-mean-elevation',
    isInvalid: false,
    value: ''
  },
  meanLatDeg: {
    id: 'geo-info-mean-lat-deg',
    isInvalid: false,
    value: ''
  },
  meanLatMinute: {
    id: 'geo-info-mean-lat-minute',
    isInvalid: false,
    value: ''
  },
  meanLatSec: {
    id: 'geo-info-mean-lat-sec',
    isInvalid: false,
    value: ''
  },
  meanLongDeg: {
    id: 'geo-info-mean-long-deg',
    isInvalid: false,
    value: ''
  },
  meanLongMinute: {
    id: 'geo-info-mean-long-minute',
    isInvalid: false,
    value: ''
  },
  meanLongSec: {
    id: 'geo-info-mean-long-sec',
    isInvalid: false,
    value: ''
  },
  effectivePopSize: {
    id: 'geo-info-effective-pop-size',
    isInvalid: false,
    value: ''
  }
};

export const INITIAL_GEN_WORTH_VALS: GenWorthValType = {
  ad: {
    id: 'gen-worth-ad',
    isInvalid: false,
    value: ''
  },
  dfs: {
    id: 'gen-worth-dfs',
    isInvalid: false,
    value: ''
  },
  dfu: {
    id: 'gen-worth-dfu',
    isInvalid: false,
    value: ''
  },
  dfw: {
    id: 'gen-worth-dfw',
    isInvalid: false,
    value: ''
  },
  dsb: {
    id: 'gen-worth-dsb',
    isInvalid: false,
    value: ''
  },
  dsc: {
    id: 'gen-worth-dsc',
    isInvalid: false,
    value: ''
  },
  gvo: {
    id: 'gen-worth-gvo',
    isInvalid: false,
    value: ''
  },
  wdu: {
    id: 'gen-worth-wdu',
    isInvalid: false,
    value: ''
  },
  wwd: {
    id: 'gen-worth-wwd',
    isInvalid: false,
    value: ''
  },
  dsg: {
    id: 'gen-worth-dsg',
    isInvalid: false,
    value: ''
  },
  iws: {
    id: 'gen-worth-iws',
    isInvalid: false,
    value: ''
  },
  wve: {
    id: 'gen-worth-wve',
    isInvalid: false,
    value: ''
  }
};

export const SaveStatusModalText = {
  pendingHeader: (
    <h5 className="modal-header">
      Send seedlot back to pending
    </h5>
  ),
  pendingBody: (
    <p>
      Confirm this action if there is something wrong with this seedlot,
      this will change the seedlot status from submitted back to pending,
      allowing the applicant agency to edit the form again.
    </p>
  ),
  approveHeader: (
    <h5 className="modal-header">
      Are you sure you want to approve this seedlot?
      <br />
      This seedlot status will change from submitted to approved.
    </h5>
  )
};
