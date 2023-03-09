/* eslint-disable no-undef */
import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import FavouriteActivities from '../../components/FavouriteActivities/index';
import '@testing-library/jest-dom';
import makeServer from '../../mock-api/server';
import { BrowserRouter } from 'react-router-dom';

jest.setTimeout(10000);

// empty section should be tested in the future
describe('the Favourite Activities component', () => {
  beforeAll(() => {
    makeServer('test');
  });

  it('should render correctly', () => {
    const { container } = render(
      <BrowserRouter>
        <FavouriteActivities />
      </BrowserRouter>
    );

    expect(screen.getByText('My favourite activities')).toBeInTheDocument();
    expect(screen.getByText('Quick access to your favourite activities.')).toBeInTheDocument();
    expect(container.getElementsByTagName('svg')).toBeDefined();
  });

  it('should render exactly 8 cards', async () => {
    const { container } = render(
      <BrowserRouter>
        <FavouriteActivities />
      </BrowserRouter>
    );

    const cards = container.getElementsByClassName('fav-card-main');
    await waitFor(() => {
      expect(cards).toHaveLength(8);
    });
  });

  it('should delete the card', async () => {
    const { container } = render(
      <BrowserRouter>
        <FavouriteActivities />
      </BrowserRouter>
    );

    const cards = container.getElementsByClassName('fav-card-main');
    const buttonElement = container.getElementsByClassName('fav-card-overflow');
    await waitFor(() => {
      fireEvent.click(buttonElement[3]);
    });
    const deleteButton = screen.getByText('Delete shortcut');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(cards).toHaveLength(7);
    });
  });

  it('should highlight the card', async () => {
    const { container } = render(
      <BrowserRouter>
        <FavouriteActivities />
      </BrowserRouter>
    );

    const buttonElement = container.getElementsByClassName('fav-card-overflow');
    await waitFor(() => {
      fireEvent.click(buttonElement[1]);
    });
    const highlightButton = screen.getByText('Highlight shortcut');
    fireEvent.click(highlightButton);
    const highlightedCard = container.getElementsByClassName('fav-card-main-highlighted');
    await waitFor(() => {
      expect(highlightedCard).toHaveLength(1);
    });
  });
});
