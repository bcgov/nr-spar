import React from 'react'
import { render, screen } from '@testing-library/react';
import CreateAClass from '../../views/Seedlot/CreateAClass/index';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import makeServer from '../../mock-server/server';


describe('Test the Create A Class component', () => {
  it('should render correctly', () => {
    makeServer('jest-test');
    const qc = new QueryClient();
    render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <CreateAClass />
        </QueryClientProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Create A class seedlot')).toBeInTheDocument();
    expect(screen.getByText('Register a new A class seedlot')).toBeInTheDocument();
    expect(screen.getByText('Applicant agency')).toBeInTheDocument();
    expect(screen.getByText('Seedlot information')).toBeInTheDocument();
  })
});
