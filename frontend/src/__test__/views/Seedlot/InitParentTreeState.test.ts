import { describe, expect, it } from 'vitest';

import { initParentTreeState } from '../../../views/Seedlot/ContextContainerClassA/utils';
import { ParentTreeFormSubmitType } from '../../../types/SeedlotType';

const parentTree = (
  overrides: Partial<ParentTreeFormSubmitType>
): ParentTreeFormSubmitType => ({
  seedlotNumber: '63037',
  parentTreeId: 1001,
  parentTreeNumber: '212',
  coneCount: 1,
  pollenCount: 1,
  smpSuccessPct: 0,
  nonOrchardPollenContamPct: 0,
  amountOfMaterial: 0,
  proportion: 0,
  parentTreeGeneticQualities: [],
  ...overrides
});

describe('initParentTreeState', () => {
  // #2616: review mode restores SMP mix rows from the saved form. The weighted
  // gw columns (w_*) feed both the "Breeding value of SMP mix used on parent"
  // display and the smpBv sent on Recalculate — leaving them empty makes the
  // whole SMP contribution read as zero after submission.
  it('restores weighted gw values on SMP mix rows', () => {
    const smpMix = [
      parentTree({
        amountOfMaterial: 90,
        proportion: 0.6,
        parentTreeGeneticQualities: [
          { geneticTypeCode: 'BV', geneticWorthCode: 'GVO', geneticQualityValue: 20 }
        ]
      }),
      parentTree({
        parentTreeNumber: '213',
        amountOfMaterial: 60,
        proportion: 0.4,
        parentTreeGeneticQualities: [
          { geneticTypeCode: 'BV', geneticWorthCode: 'GVO', geneticQualityValue: 10 },
          { geneticTypeCode: 'BV', geneticWorthCode: 'WDU', geneticQualityValue: 5 }
        ]
      })
    ];

    const state = initParentTreeState([parentTree({})], smpMix);

    const rows = Object.values(state.mixTabData);
    expect(rows[0].w_gvo.value).toBe('12.000');
    expect(rows[1].w_gvo.value).toBe('4.000');
    expect(rows[1].w_wdu.value).toBe('2.000');
    // untouched weighted columns keep the template default
    expect(rows[0].w_wdu.value).toBe('');
  });
});
