import React from 'react';
import { render, screen } from '@testing-library/react';
import PageTitle from '../../components/PageTitle';
import '@testing-library/jest-dom';
import makeServer from '../../mock-server/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('the page title component', () => {
  beforeAll(() => {
    makeServer('jest-test');
  });

  it('should render correctly', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PageTitle title="Test title" subtitle="Test Subtitle" />
      </QueryClientProvider>
    );

    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should render correctly with favourite option', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PageTitle
          title="Test title"
          subtitle="Test Subtitle"
          enableFavourite
          activity="SEEDLING_REQUEST"
        />
      </QueryClientProvider>
    );

    expect(screen.getAllByRole('button')[0]).toBeInTheDocument();
  });
});
