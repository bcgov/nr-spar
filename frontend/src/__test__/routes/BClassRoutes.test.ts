import { describe, expect, it } from 'vitest';
import ROUTES from '../../routes/constants';
import { buildRoutes } from '../../routes';

const B_CLASS_PATHS = [
  ROUTES.SEEDLOTS_B_CLASS_CREATION,
  ROUTES.SEEDLOT_B_CLASS_REGISTRATION,
  ROUTES.SEEDLOT_B_CLASS_REVIEW,
  ROUTES.SEEDLOT_B_CLASS_EDIT
];

const pathsFor = (seedlotBEnabled: boolean) => buildRoutes(seedlotBEnabled).map((route) => route.path);

describe('B-class routes', () => {
  it('are registered while the feature is enabled', () => {
    const paths = pathsFor(true);
    B_CLASS_PATHS.forEach((path) => expect(paths).toContain(path));
  });

  it('are dropped while the feature is disabled, leaving A-class untouched', () => {
    const paths = pathsFor(false);
    B_CLASS_PATHS.forEach((path) => expect(paths).not.toContain(path));
    expect(paths).toContain(ROUTES.SEEDLOTS_A_CLASS_CREATION);
    expect(paths).toContain(ROUTES.SEEDLOT_A_CLASS_REGISTRATION);
    expect(paths).toContain(ROUTES.SEEDLOT_A_CLASS_REVIEW);
  });
});
