import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import CollectionRead from '../../views/Seedlot/SeedlotReviewClassB/read/CollectionRead';
import { initBClassCollectionState } from '../../components/SeedlotRegistrationSteps/BClassCollectionStep/utils';
import ClassBContext, { ClassBContextType } from '../../views/Seedlot/ContextContainerClassB/context';
import { BClassAllStepData } from '../../views/Seedlot/ContextContainerClassB/definitions';

vi.mock('../../api-service/forestClientsAPI', () => ({
  getForestClientByNumberOrAcronym: vi.fn().mockResolvedValue([])
}));
vi.mock('../../api-service/coneCollectionMethodAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('../../api-service/captureMethodsAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('../../api-service/numberTreesCollectedAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('../../api-service/orgUnitDistrictsAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('../../api-service/areaOfUseAPI', () => ({
  getSpzByVegCodeList: vi.fn().mockResolvedValue([
    { code: 'M', description: 'Maritime', isPrimary: null }
  ])
}));
vi.mock('../../api-service/seedCoastAreaAPI', () => ({
  default: vi.fn().mockResolvedValue([{ code: '001', description: 'Georgia Strait' }])
}));

const renderRead = (seedlotData: ClassBContextType['seedlotData'], zone = 'M', coast = '001') => {
  const collectionStep = initBClassCollectionState('', '');
  collectionStep.seedPlanZone.value = { code: zone, description: '', label: zone };
  collectionStep.seedCoastArea.value = { code: coast, description: '', label: coast };
  const value = {
    allStepData: { collectionStep } as unknown as BClassAllStepData,
    isFetchingData: false,
    seedlotData
  } as unknown as ClassBContextType;

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ClassBContext.Provider value={value}>
        <CollectionRead />
      </ClassBContext.Provider>
    </QueryClientProvider>
  );
};

describe('CollectionRead seed planning zone', () => {
  it('shows the zone label and the geographic area when the zone is M', async () => {
    renderRead({ sourceInBc: true, vegetationCode: 'FDC' } as ClassBContextType['seedlotData']);

    expect(await screen.findByDisplayValue('M - Maritime')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('001 - Georgia Strait')).toBeInTheDocument();
  });

  it('hides the zone and geographic area when the lot was not collected in B.C.', async () => {
    renderRead(
      { sourceInBc: false, vegetationCode: 'FDC' } as ClassBContextType['seedlotData'],
      'M',
      '001'
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Seed planning zone of collection area')).toHaveValue('--');
    });
    expect(screen.queryByLabelText('Geographic area')).not.toBeInTheDocument();
  });
});
