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

  it('should return the Submited status', () => {
    render(
      <StatusItem status={1} />
    );

    expect(screen.getByText('Submited')).toBeInTheDocument();
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

  it('should return the Expired status', () => {
    render(
      <StatusItem status={4} />
    );

    expect(screen.getByText('Incomplete')).toBeInTheDocument();
  });

  it('should return the Expired status', () => {
    render(
      <StatusItem status={5} />
    );

    expect(screen.getByText('Expired')).toBeInTheDocument();
  });
});
