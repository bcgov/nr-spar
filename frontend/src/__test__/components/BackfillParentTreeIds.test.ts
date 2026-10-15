import { describe, expect, it } from 'vitest';

import {
  backfillParentTreeIds, getRequiredParentTreeId, hasUnresolvedParentTreeIds
} from '../../components/SeedlotRegistrationSteps/ParentTreeStep/utils';
import { rowTemplate } from '../../components/SeedlotRegistrationSteps/ParentTreeStep/constants';
import { RowItem } from '../../components/SeedlotRegistrationSteps/ParentTreeStep/definitions';
import { ParentTreeStepDataObj } from '../../views/Seedlot/ContextContainerClassA/definitions';
import { ParentTreeByVegCodeResType } from '../../types/ParentTreeTypes';
import { getSeedlotSubmitErrDescription } from '../../views/Seedlot/ContextContainerClassA/utils';

const row = (ptNumber: string, parentTreeId?: number | null): RowItem => {
  const r: RowItem = structuredClone(rowTemplate);
  r.parentTreeNumber.value = ptNumber;
  // Drafts saved before #2638 have no parentTreeId key at all.
  if (parentTreeId === undefined) delete (r as Partial<RowItem>).parentTreeId;
  else r.parentTreeId = parentTreeId;
  return r;
};

const catalog = {
  37: { parentTreeId: 1037 },
  38: { parentTreeId: 1038 }
} as unknown as ParentTreeByVegCodeResType;

const stateWith = (
  tableRowData: ParentTreeStepDataObj['tableRowData'],
  mixTabData: ParentTreeStepDataObj['mixTabData'] = {}
) => ({ tableRowData, mixTabData } as ParentTreeStepDataObj);

describe('backfillParentTreeIds', () => {
  it('fills ids missing from pre-#2638 draft rows on both tabs', () => {
    const result = backfillParentTreeIds(
      stateWith({ 37: row('37') }, { 0: row('38', null) }),
      catalog
    );
    expect(result?.tableRowData[37].parentTreeId).toBe(1037);
    expect(result?.mixTabData[0].parentTreeId).toBe(1038);
  });

  it('never overwrites an existing stamp (#2595)', () => {
    const result = backfillParentTreeIds(stateWith({ 37: row('37', 999), 38: row('38') }), catalog);
    expect(result?.tableRowData[37].parentTreeId).toBe(999);
    expect(result?.tableRowData[38].parentTreeId).toBe(1038);
  });

  it('returns null when nothing can be filled, so the effect does not loop', () => {
    expect(backfillParentTreeIds(stateWith({ 37: row('37', 1037) }), catalog)).toBeNull();
    expect(backfillParentTreeIds(stateWith({ 99: row('99') }), catalog)).toBeNull();
  });
});

describe('hasUnresolvedParentTreeIds', () => {
  it('is true while a main-table row has no id', () => {
    expect(hasUnresolvedParentTreeIds(stateWith({ 37: row('37') }))).toBe(true);
    expect(hasUnresolvedParentTreeIds(stateWith({ 37: row('37', null) }))).toBe(true);
  });

  it('ignores empty mix rows but not a named mix row without an id', () => {
    const filled = { 37: row('37', 1037) };
    expect(hasUnresolvedParentTreeIds(stateWith(filled, { 0: row('', null) }))).toBe(false);
    expect(hasUnresolvedParentTreeIds(stateWith(filled, { 0: row('38', null) }))).toBe(true);
    expect(hasUnresolvedParentTreeIds(stateWith(filled, { 0: row('38', 1038) }))).toBe(false);
  });
});

describe('getRequiredParentTreeId', () => {
  it('throws when the parentTreeId key is absent, not only when null', () => {
    expect(() => getRequiredParentTreeId(row('37'))).toThrow('"37"');
    expect(() => getRequiredParentTreeId(row('37', null))).toThrow('"37"');
    expect(getRequiredParentTreeId(row('37', 1037))).toBe(1037);
  });
});

describe('getSeedlotSubmitErrDescription', () => {
  it('shows a payload validation error without a bogus error code', () => {
    const err = new Error('Parent tree "37" is missing its parent tree id.');
    expect(getSeedlotSubmitErrDescription(err as never).description)
      .toBe('Parent tree "37" is missing its parent tree id.');
  });
});
