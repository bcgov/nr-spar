import React from 'react';
import { render, screen } from '@testing-library/react';
import RecentSeedlots from '../../components/RecentSeedlots';

//TODO test Empty Section
describe('MySeedlots Seedlot component', () => {
  it('should render title and subtitle correctly', () => {
    render(<RecentSeedlots />);

    expect(screen.getByRole('heading', { level: 2 }).textContent).toEqual('My seedlots');
    expect(screen.getByText('Check a summary of your recent seedlots')).toBeInTheDocument();
  });
});
