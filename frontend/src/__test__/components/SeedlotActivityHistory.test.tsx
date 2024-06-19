import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react';
import SeedlotActivityHistory from '../../components/SeedlotActivityHistory/index';
import { BrowserRouter } from 'react-router-dom';

describe('Test the Form Progress component', () => {
  it('should render correctly', () => {
    render(
      <BrowserRouter>
        <SeedlotActivityHistory />
      </BrowserRouter>
    );

    expect(screen.getByText('Keep track of activity history')).toBeInTheDocument();
    expect(screen.getByText('Get updates on seedlot related activities')).toBeInTheDocument();

  })

  it('should open dropdown', () => {
    render(
      <BrowserRouter>
        <SeedlotActivityHistory />
      </BrowserRouter>
    );

  
    const dropdownElement = screen.getAllByRole('combobox');
    fireEvent.click(dropdownElement[0]);
    expect(screen.getByText('Own activity')).toBeInTheDocument();
  })
});
