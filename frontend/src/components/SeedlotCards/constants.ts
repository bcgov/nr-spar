import ROUTES from '../../routes/constants';

export const cards = [
  {
    id: '1',
    image: 'Agriculture',
    header: 'Register an A-class seedlot',
    description:
      'Register a seedlot which has been collected in an orchard from parent trees',
    link: ROUTES.SEEDLOTS_A_CLASS_CREATION,
    highlighted: false,
    isEmpty: false,
    emptyTitle: '',
    emptyDescription: '',
    displayForAdmin: false
  },
  // {
  //   id: '2',
  //   image: 'Farm_01',
  //   header: 'Register a B-class seedlot',
  //   description:
  //     'Register a seedlot which has been collected from a natural stand',
  //   link: '#',
  //   highlighted: false,
  //   isEmpty: false,
  //   emptyTitle: '',
  //   emptyDescription: ''
  // },
  {
    id: '3',
    image: 'Sprout',
    header: 'My seedlots',
    description:
      'Consult and manage your own seedlots',
    link: ROUTES.MY_SEEDLOTS,
    highlighted: false,
    isEmpty: false,
    emptyTitle: '',
    emptyDescription: '',
    displayForAdmin: false
  },
  {
    id: '4',
    image: 'Sprout',
    header: 'Review seedlots',
    description: 'Check all seedlots that are waiting for approval',
    link: ROUTES.TSC_SEEDLOTS_TABLE,
    highlighted: false,
    isEmpty: false,
    emptyTitle: '',
    emptyDescription: '',
    displayForAdmin: true
  }
];
