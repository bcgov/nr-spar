import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateBClass from '../../views/Seedlot/CreateBClass/index';

vi.mock('../../api-service/forestClientsAPI', () => ({
  getForestClientByNumberOrAcronym: vi.fn().mockResolvedValue({ data: {} })
}));
vi.mock('../../api-service/vegetationCodeAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('../../api-service/SeedlotSourcesAPI', () => ({ default: vi.fn().mockResolvedValue([]) }));

describe('Test the Create B Class component', () => {
  it('should render correctly', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <CreateBClass />
        </QueryClientProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Create B class seedlot')).toBeInTheDocument();
    expect(screen.getByText('Register a seedlot which has been collected from a natural stand.')).toBeInTheDocument();
    expect(screen.getByText('Applicant agency')).toBeInTheDocument();
    expect(screen.getByText('Seedlot information')).toBeInTheDocument();
    expect(screen.getByText('Create seedlot number')).toBeInTheDocument();
  });
});
