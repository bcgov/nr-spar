/* eslint-disable no-undef */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FavouriteActivities from '../../components/FavouriteActivities/index';
import '@testing-library/jest-dom';

// empty section should be tested in the future
describe('the Favourite Activities component', () => {
  it('should render correctly', () => {
    const { container } = render(
      <FavouriteActivities />
    );

    expect(screen.getByText('My favourite activities')).toBeInTheDocument();
    expect(screen.getByText('Quick access to your favourite activities.')).toBeInTheDocument();
    expect(container.getElementsByTagName('svg')).toBeDefined();
  });

  it('should render exactly 8 cards', () => {
    const { container } = render(
      <FavouriteActivities />
    );

    const cards = container.getElementsByClassName('fav-card-main');
    expect(cards).toHaveLength(8);
  });

  it('should delete the card', () => {
    const { container } = render(
      <FavouriteActivities />
    );

    const cards = container.getElementsByClassName('fav-card-main');
    const buttonElement = container.getElementsByClassName('fav-card-overflow');
    fireEvent.click(buttonElement[3]);
    const deleteButton = screen.getByText('Delete shortcut');
    fireEvent.click(deleteButton);
    expect(cards).toHaveLength(7);
  });

  it('should highlight the card', () => {
    const { container } = render(
      <FavouriteActivities />
    );

    const buttonElement = container.getElementsByClassName('fav-card-overflow');
    fireEvent.click(buttonElement[3]);
    const highlightButton = screen.getByText('Highlight shortcut');
    fireEvent.click(highlightButton);
    const highlightedCard = container.getElementsByClassName('fav-card-main-highlighted');
    expect(highlightedCard).toHaveLength(1);
  });
});
