import React from 'react';
import { render, screen } from '@testing-library/react';
import PageTitle from '../../components/PageTitle';
import '@testing-library/jest-dom';
import makeServer from '../../mock-server/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, beforeAll, it, expect } from 'vitest';

describe('the page title component', () => {
  beforeAll(() => {
    makeServer('jest-test');
  });

  const qc = new QueryClient();

  it('should render correctly', () => {
    render(
      <QueryClientProvider client={qc}>
        <PageTitle title="Test title" subtitle="Test Subtitle" />
      </QueryClientProvider>
    );

    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should render correctly with favourite option', () => {
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
