import React from 'react';
import { render, screen } from '@testing-library/react';
import BCGovLogo from '../../components/BCGovLogo';

describe('BCGovLogo component', () => {
  it('should render correctly', () => {
    render(<BCGovLogo />);
    const logo = screen.getByRole('img');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', 'BCGov Logo');
  });
});
