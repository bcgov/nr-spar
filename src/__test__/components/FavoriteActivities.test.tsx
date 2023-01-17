/* eslint-disable no-undef */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FavoriteActivities from '../../components/FavoriteActivities/index';
import '@testing-library/jest-dom';

// empty section should be tested in the future
describe('Test the Favorite Activities component', () => {
  it('should render correctly', () => {
    const { container } = render(
      <FavoriteActivities />
    );

    expect(screen.getByText('My favorite activities')).toBeInTheDocument();
    expect(screen.getByText('Quick access to your favorite activities.')).toBeInTheDocument();
    expect(container.getElementsByTagName('svg')).toBeDefined();
  });

  it('should render exactly 8 cards', () => {
    const { container } = render(
      <FavoriteActivities />
    );

    const cards = container.getElementsByClassName('card-main');
    expect(cards).toHaveLength(8);
  });

  it('should delete the card', () => {
    const { container } = render(
      <FavoriteActivities />
    );

    const cards = container.getElementsByClassName('card-main');
    const buttonElement = container.getElementsByClassName('card-overflow');
    fireEvent.click(buttonElement[3]);
    const deleteButton = screen.getByText('Delete shortcut');
    fireEvent.click(deleteButton);
    expect(cards).toHaveLength(7);
  });

  it('should highlight the card', () => {
    const { container } = render(
      <FavoriteActivities />
    );

    const buttonElement = container.getElementsByClassName('card-overflow');
    fireEvent.click(buttonElement[3]);
    const highlightButton = screen.getByText('Highlight shortcut');
    fireEvent.click(highlightButton);
    const highlightedCard = container.getElementsByClassName('card-main-highlighted');
    expect(highlightedCard).toHaveLength(1);
  });
});
