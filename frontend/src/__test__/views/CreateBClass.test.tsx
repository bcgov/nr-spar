import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import makeServer from '../../mock-server/server';
import CreateBClass from '../../views/Seedlot/CreateBClass/index';

describe('Test the Create B Class component', () => {
  it('should render correctly', () => {
    makeServer('jest-test');
    const qc = new QueryClient();
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
