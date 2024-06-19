import React from 'react';
import { render, screen } from '@testing-library/react';
import Participants from '../../components/Participants';

describe('Participants component', () => {
  const number = 12456;
  it('should render 3 participants correctly', () => {
    const elements = ['Participant 1', 'Participant 2', 'Participant 3'];
    render(<Participants elements={elements} number={number} />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(images[0]).toBeInTheDocument();
    expect(images[0]).toHaveAttribute('alt', 'Participant 1');
    expect(images[1]).toBeInTheDocument();
    expect(images[1]).toHaveAttribute('alt', 'Participant 2');
    expect(images[2]).toBeInTheDocument();
    expect(images[2]).toHaveAttribute('alt', 'Participant 3');
  });

  it('should render 2 participants correctly', () => {
    const elements = ['Participant 1', 'Participant 2'];
    render(<Participants elements={elements} number={number} />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toBeInTheDocument();
    expect(images[0]).toHaveAttribute('alt', 'Participant 1');
    expect(images[1]).toBeInTheDocument();
    expect(images[1]).toHaveAttribute('alt', 'Participant 2');
  });

  it('should render 1 participant correctly', () => {
    const elements = ['Participant 1'];
    render(<Participants elements={elements} number={number} />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
    expect(images[0]).toBeInTheDocument();
    expect(images[0]).toHaveAttribute('alt', 'Participant 1');
  });
});
