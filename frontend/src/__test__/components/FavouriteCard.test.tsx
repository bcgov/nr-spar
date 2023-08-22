import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import FavouriteCard from '../../components/Card/FavouriteCard';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const testActivity = {
  id: 0,
  image: 'Unknown',
  header: 'TestHeader',
  description: 'TestDescription',
  link: '#',
  highlighted: false,
  activity: 'SEEDLING_REQUEST'
}

describe('the favourite card component', () => {
  it('should render correctly with headers', async () => {
    const qc = new QueryClient();
    const { container } = render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <FavouriteCard
            activity={testActivity}
            index={0}
          />
        </QueryClientProvider>
      </BrowserRouter>
    );

    const headers = await screen.findAllByText('TestHeader');
    expect(headers[0]).toHaveClass('fav-card-title-small');
    expect(headers[1]).toHaveClass('fav-card-title-large');
    const icon = container.getElementsByClassName('fav-card-icon');
    expect(icon[0]).toBeInTheDocument();
  });

  it('should render card highlighted with different style', () => {
    const highlightedAct = { ...testActivity }
    highlightedAct.highlighted = true;
    const qc = new QueryClient();
    const { container } = render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <FavouriteCard
            activity={highlightedAct}
            index={0}
          />
        </QueryClientProvider>
      </BrowserRouter>
    );

    expect(container.firstChild).not.toHaveClass('fav-card-main');
    expect(container.firstChild).toHaveClass('fav-card-main-highlighted');
  });

  it('should click in the button and open the options', () => {
    const qc = new QueryClient();
    const { container } = render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <FavouriteCard
            activity={testActivity}
            index={0}
          />
        </QueryClientProvider>
      </BrowserRouter>
    );

    const buttonElement = container.getElementsByClassName('fav-card-overflow');
    fireEvent.click(buttonElement[0]);
    expect(screen.getByText('Highlight shortcut')).toBeInTheDocument();
    expect(screen.getByText('Delete shortcut')).toBeInTheDocument();
  });

  it('should close the dropdown menu when click outside', () => {
    const qc = new QueryClient();
    const { container } = render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <FavouriteCard
            activity={testActivity}
            index={0}
          />
        </QueryClientProvider>
      </BrowserRouter>
    );

    const buttonElement = container.getElementsByClassName('fav-card-overflow');
    fireEvent.click(buttonElement[0]);
    fireEvent.click(document);
    expect(screen.queryByText('Highlight shortcut')).toBeNull();
    expect(screen.queryByText('Delete shortcut')).toBeNull();
  });
});
