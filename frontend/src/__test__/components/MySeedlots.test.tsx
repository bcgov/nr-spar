/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import MySeedlots from '../../components/MySeedlots';
import '@testing-library/jest-dom';

//TODO test Empty Section
describe('MySeedlots Seedlot component', () => {
  it('should render title and subtitle correctly', () => {
    render(<MySeedlots />);

    expect(screen.getByRole('heading', { level: 2 }).textContent).toEqual('My seedlots');
    expect(screen.getByText('Check a summary of your recent seedlots')).toBeInTheDocument();
  });
});
