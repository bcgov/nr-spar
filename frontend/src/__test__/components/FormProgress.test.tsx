import React from 'react'
import { render, screen } from '@testing-library/react';
import FormProgress from '../../components/FormProgress/index';
import { BrowserRouter } from 'react-router';

describe('Test the Form Progress component', () => {
  it('should render correctly', () => {
    render(
      <BrowserRouter>
        <FormProgress seedlotNumber={2} />
      </BrowserRouter>
    );

    expect(screen.getByText('Form progress')).toBeInTheDocument();
    expect(screen.getByText('Where you are in the registration process')).toBeInTheDocument();

  })
});
