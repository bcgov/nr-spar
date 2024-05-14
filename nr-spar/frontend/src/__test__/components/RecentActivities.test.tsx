import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecentActivities from '../../components/RecentActivities';
import '@testing-library/jest-dom';
import makeServer from '../../mock-server/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// TODO test Empty Section
describe('Recent Activities component', () => {
  beforeAll(() => {
    makeServer('jest-test');
  });

  it('should render title and subtitle correctly', async () => {
    const qc = new QueryClient();
    render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <RecentActivities />
        </QueryClientProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('My recent activities');
      expect(screen.getByText('Check your recent requests and files')).toBeInTheDocument();
    });
  });

  it('should change tabs when clicked', async () => {
    const qc = new QueryClient();
    render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <RecentActivities />
        </QueryClientProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0].textContent).toEqual('Requests');
      expect(tabs[1].textContent).toEqual('Files & Docs.');

      // Setting this small timeout so the component ends rendering
      // the loading status and render the content we want to test
      const tabPanelBefore = screen.getByRole('tabpanel');
      expect(tabPanelBefore).toHaveTextContent('Activity type');
      expect(tabPanelBefore).not.toHaveTextContent('File name');

      fireEvent.click(tabs[1]);
      const tabPanelAfter = screen.getByRole('tabpanel');
      expect(tabPanelAfter).not.toHaveTextContent('Activity type');
      expect(tabPanelAfter).toHaveTextContent('File name');

    });
  });
});
