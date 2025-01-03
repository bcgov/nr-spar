import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react';
import SeedlotRegistrationProgress from '../../components/SeedlotRegistrationProgress/index';
import { BrowserRouter } from 'react-router';

describe('Test the Form Progress component', () => {
  it('should render correctly', () => {
    render(
      <BrowserRouter>
        <SeedlotRegistrationProgress currentIndex={2}/>
      </BrowserRouter>
    );

    expect(screen.getByText('Collection')).toBeInTheDocument();
    expect(screen.getByText('Ownership')).toBeInTheDocument();
    expect(screen.getByText('Interim storage')).toBeInTheDocument();
    expect(screen.getByText('Orchard')).toBeInTheDocument();
    expect(screen.getByText('Parent tree and SMP')).toBeInTheDocument();
    expect(screen.getByText('Extraction and storage')).toBeInTheDocument();
  })

});
