import { ClientTypeConfig } from './definitions';

export const ClientTypeIconMap: Record<string, ClientTypeConfig> = {
  // Association
  A: {
    isIcon: true,
    img: 'Feedback_02'
  },
  // First Nation Band
  B: {
    isIcon: true,
    img: 'EventsAlt'
  },
  // Corporation
  C: {
    isIcon: true,
    img: 'Building'
  },
  // Ministry of Forests and Range
  F: {
    isIcon: true,
    img: 'Tree'
  },
  // Government
  G: {
    isIcon: false,
    img: 'Government_01'
  },
  // Individual
  I: {
    isIcon: true,
    img: 'UserAvatar'
  },
  // Limited Partnership
  L: {
    isIcon: true,
    img: 'Group'
  },
  // General Partnership
  P: {
    isIcon: true,
    img: 'Events'
  },
  // First Nation Group
  R: {
    isIcon: true,
    img: 'EventsAlt'
  },
  // Society
  S: {
    isIcon: false,
    img: 'NycManhattan_01'
  },
  // First Nation Tribal Council
  T: {
    isIcon: true,
    img: 'GroupPresentation'
  },
  // Unregistered Company
  U: {
    isIcon: true,
    img: 'Enterprise'
  }
};

export const TEXT = {
  searchLabel: 'Search by organization name or ID',
  emptySearchPtOne: 'Please check the spelling or try a different search term.',
  emptySearchPtTwo: 'If you believe the organization should be listed, please contact support for assistance.'
};
