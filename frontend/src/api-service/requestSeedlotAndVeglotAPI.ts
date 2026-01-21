import ApiConfig from './ApiConfig';
import api from './api';

const isCommitmentChecked = (requestSkey: number, itemId: string) => {
  const url = `${ApiConfig.requestSeedLotAndVegLot}/commitment/${requestSkey}/${itemId}`;
  return api.get(url).then((res: { data: boolean }) => res.data);
};

export default isCommitmentChecked;
