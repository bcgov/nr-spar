import ApiConfig from './ApiConfig';
import api from './api';

export type BecCatalogueItem = {
  becZoneCode: string;
  becZoneName: string;
  becSubzoneCode: string;
  becSubzoneName: string;
  variant: string | null;
  variantName: string | null;
};

const getBecCatalogue = () => {
  const url = ApiConfig.becCatalogue;
  return api.get(url).then((res): BecCatalogueItem[] => res.data);
};

export default getBecCatalogue;
