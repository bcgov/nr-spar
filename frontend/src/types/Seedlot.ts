import MultiOptionsObj from './MultiOptionsObject';

type Seedlot = {
  number: number;
  class: string;
  lot_species: MultiOptionsObj;
  form_step: string;
  status: number;
  participants: string[];
  created_at: string;
  last_modified: string;
  approved_at: string;
}

export default Seedlot;
