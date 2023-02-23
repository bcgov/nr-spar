/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusItem from '../../components/StatusItem';
import '@testing-library/jest-dom';

describe('Status item component', () => {
  it('should return the Pending status', () => {
    render(
      <StatusItem status={0} />
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should return the In progress status', () => {
    render(
      <StatusItem status={1} />
    );

    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('should return the Approved status', () => {
    render(
      <StatusItem status={2} />
    );

    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('should return the Canceled status', () => {
    render(
      <StatusItem status={3} />
    );

    expect(screen.getByText('Canceled')).toBeInTheDocument();
  });
});
