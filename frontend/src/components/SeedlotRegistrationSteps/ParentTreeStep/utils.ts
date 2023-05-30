import { OrchardObj } from '../OrchardStep/definitions';
import { tabTypes } from './definitions';

export const getTabString = (selectedIndex: number) => {
  switch (selectedIndex) {
    case 0:
      return tabTypes.coneTab;
    case 1:
      return tabTypes.successTab;
    case 2:
      return tabTypes.mixTab;
    default:
      return tabTypes.coneTab;
  }
};

const getMergedOrchards = (orchards: Array<OrchardObj>) => {
  const obj = {};

  orchards.forEach((orchard) => {
    if (
      !Object.prototype.hasOwnProperty.call(obj, orchard.orchardId)
      && orchard.orchardId !== ''
      && orchard.orchardLabel !== ''
    ) {
      Object.assign(obj, {
        [orchard.orchardId]: orchard
      });
    }
  });

  return Object.values(obj);
};

export const processOrchardIDs = (orchards: Array<OrchardObj>) => {
  const mergedOrchards = getMergedOrchards(orchards);
  console.log(mergedOrchards);
};
