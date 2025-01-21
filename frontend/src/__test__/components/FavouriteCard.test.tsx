import React from 'react';
import { BrowserRouter } from 'react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import FavouriteCard from '../../components/Card/FavouriteCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavActivityType } from '../../types/FavActivityTypes';

const testActivity: FavActivityType = {
  id: 0,
  type: 'Unknown',
  image: 'Unknown',
  header: 'TestHeader',
  description: 'TestDescription',
  link: '#',
  highlighted: false
}

describe('the favourite card component', () => {
  it('should render correctly with headers', async () => {
    const qc = new QueryClient();
    const { container } = render(
      <BrowserRouter>
        <QueryClientProvider client={qc}>
          <FavouriteCard
            favObject={testActivity}
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
            favObject={highlightedAct}
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
            favObject={testActivity}
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
            favObject={testActivity}
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
