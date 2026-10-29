import React, { useState } from 'react';
import {
  render, screen, fireEvent, waitFor, within
} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import BClassCollectionStep from '../../components/SeedlotRegistrationSteps/BClassCollectionStep';
import { initBClassCollectionState } from '../../components/SeedlotRegistrationSteps/BClassCollectionStep/utils';
import { applyCollectionAreaResult } from '../../components/SeedlotRegistrationSteps/BClassCollectionStep/mapIntegration';
import { BClassCollectionForm } from '../../components/SeedlotRegistrationSteps/BClassCollectionStep/definitions';
import ClassBContext, { ClassBContextType } from '../../views/Seedlot/ContextContainerClassB/context';
import { BClassAllStepData } from '../../views/Seedlot/ContextContainerClassB/definitions';
import type { CollectionAreaResult } from '../../types/SparMapTypes';

const ELEVATION_WARNING = /Elevation failed to auto-fill/;

vi.mock('../../api-service/coneCollectionMethodAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('../../api-service/captureMethodsAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('../../api-service/numberTreesCollectedAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('../../api-service/orgUnitDistrictsAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('../../api-service/becCatalogueAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('../../api-service/forestClientsAPI', () => ({
  getForestClientByNumberOrAcronym: vi.fn().mockResolvedValue([]),
  getForestClientLocation: vi.fn().mockResolvedValue({})
}));

const result: CollectionAreaResult = {
  geoJson: '{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[]},"properties":{}}',
  polygonCount: 1,
  areaHectares: 12.56,
  radiusKm: 2.3,
  meanLat: 48.5,
  meanLng: -123.25,
  elevationMinM: null,
  elevationMaxM: null,
  elevationLookupFailed: true,
  becZones: [],
  becVariant: null
};

const withCollectionArea = (): BClassCollectionForm => applyCollectionAreaResult(
  initBClassCollectionState('', ''),
  {
    ...result, elevationMinM: 100, elevationMaxM: 300, elevationLookupFailed: false
  },
  undefined
);

let latestCollectionStep: BClassCollectionForm | null = null;

const Harness = ({ initial }: { initial: BClassCollectionForm }) => {
  const [allStepData, setAllStepData] = useState({
    collectionStep: initial
  } as unknown as BClassAllStepData);
  latestCollectionStep = allStepData.collectionStep;
  const value = {
    allStepData,
    setStepData: (stepName: keyof BClassAllStepData, stepData: unknown) => {
      setAllStepData((prev) => ({ ...prev, [stepName]: stepData }));
    },
    defaultClientNumber: '',
    defaultCode: '',
    isFormSubmitted: false,
    seedlotNumber: '123'
  } as unknown as ClassBContextType;
  return (
    <ClassBContext.Provider value={value}>
      <BClassCollectionStep />
    </ClassBContext.Provider>
  );
};

const renderStep = (initial: BClassCollectionForm, routerState?: unknown) => render(
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter initialEntries={[{ pathname: '/reg', state: routerState }]}>
      <Routes>
        <Route path="/reg" element={<Harness initial={initial} />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);

const removeDialog = () => screen.getByRole('dialog', { name: 'Remove collection area?' });

const expectCollectionAreaCleared = async () => {
  await waitFor(() => {
    expect(latestCollectionStep?.collectionGeometry.value).toBe('');
  });
  expect(latestCollectionStep?.latDeg.value).toBe('');
  expect(latestCollectionStep?.elevationMin.value).toBe('');
  expect(latestCollectionStep?.collectionRadius.value).toBe('');
};

describe('BClassCollectionStep collection area', () => {
  beforeEach(() => {
    latestCollectionStep = null;
    document.documentElement.scrollTo = vi.fn();
  });

  it('shows the elevation warning from the map result and hides it when closed', async () => {
    renderStep(initBClassCollectionState('', ''), { collectionAreaResult: result });

    expect(await screen.findByText(ELEVATION_WARNING)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close notification/i }));
    await waitFor(() => {
      expect(screen.queryByText(ELEVATION_WARNING)).not.toBeInTheDocument();
    });
  });

  it('removes the collection area from the form after confirming the warning', async () => {
    const { container } = renderStep(withCollectionArea());
    expect(latestCollectionStep?.elevationMin.value).toBe('100');

    fireEvent.click(container.querySelector('.collection-area-remove')!);
    const dialog = removeDialog();
    expect(within(dialog).getByText(/also clears the latitude and longitude/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: /Remove collection area$/ }));

    await expectCollectionAreaCleared();
    expect(container.querySelector('.collection-area-remove')).toBeNull();
  });

  it('keeps the collection area when the warning is cancelled', () => {
    const { container } = renderStep(withCollectionArea());

    fireEvent.click(container.querySelector('.collection-area-remove')!);
    fireEvent.click(within(removeDialog()).getByRole('button', { name: 'Cancel' }));

    expect(latestCollectionStep?.collectionGeometry.value).not.toBe('');
  });

  it('clears the collection area when the map sends back a removal', async () => {
    renderStep(withCollectionArea(), { collectionAreaCleared: true });

    await expectCollectionAreaCleared();
  });
});
