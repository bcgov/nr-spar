import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecentActivities from '../../components/RecentActivities';
import '@testing-library/jest-dom';
import makeServer from '../../mock-server/server';

// TODO test Empty Section
describe('Recent Activities component', () => {
  beforeAll(() => {
    makeServer('jest-test');
  });

  it('should render title and subtitle correctly', async () => {
    render(
      <BrowserRouter>
        <RecentActivities />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('My recent activities');
      expect(screen.getByText('Check your recent requests and files')).toBeInTheDocument();
    });
  });

  it('should change tabs when clicked', async () => {
    render(
      <BrowserRouter>
        <RecentActivities />
      </BrowserRouter>
    );

    await waitFor(() => {
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0].textContent).toEqual('Requests');
      expect(tabs[1].textContent).toEqual('Files & Docs.');

      const tabPanelBefore = screen.getByRole('tabpanel');
      expect(tabPanelBefore).toHaveTextContent('Seedling request');
      expect(tabPanelBefore).not.toHaveTextContent('Placeholder');

      fireEvent.click(tabs[1]);
      const tabPanelAfter = screen.getByRole('tabpanel');
      expect(tabPanelAfter).not.toHaveTextContent('Seedling request');
      expect(tabPanelAfter).toHaveTextContent('There is no files & docs to show yet!');
    });
  });
});
