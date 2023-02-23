/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ExistingSeedlot from '../../components/ExistingSeedlot';
import '@testing-library/jest-dom';

//TODO test Empty Section
describe('Existing Seedlot component', () => {
  it('should render title and subtitle correctly', () => {
    render(<ExistingSeedlot />);

    expect(screen.getByRole('heading', { level: 2 }).textContent).toEqual('Existing seedlot');
    expect(screen.getByText('Check a summary of your recent seedlots')).toBeInTheDocument();
  });
});
