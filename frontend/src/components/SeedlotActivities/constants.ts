import PathConstants from '../../routes/pathConstants';

export const cards = [
  {
    id: '1',
    image: 'Agriculture',
    header: 'Register an A-class seedlot',
    description:
      'Register a seedlot which has been collected in an orchard from parent trees',
    link: PathConstants.SEEDLOTS_A_CLASS_CREATION,
    highlighted: false,
    isEmpty: false,
    emptyTitle: '',
    emptyDescription: ''
  },
  {
    id: '2',
    image: 'Farm_01',
    header: 'Register a B-class seedlot',
    description:
      'Register a seedlot which has been collected from a natural stand',
    link: '#',
    highlighted: false,
    isEmpty: false,
    emptyTitle: '',
    emptyDescription: ''
  },
  {
    id: '3',
    image: 'Sprout',
    header: 'My seedlots',
    description:
      'Consult and manage your own seedlots',
    link: PathConstants.MY_SEEDLOTS,
    highlighted: false,
    isEmpty: false,
    emptyTitle: '',
    emptyDescription: ''
  },
  {
    id: '4',
    image: 'TimeLapse',
    header: 'Activity history',
    description:
      'Get updates your latest seedlot related activities',
    link: '#',
    highlighted: false,
    isEmpty: false,
    emptyTitle: '',
    emptyDescription: ''
  }
];
