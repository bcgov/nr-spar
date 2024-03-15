import React from 'react';
import { render, screen } from '@testing-library/react';
import AvatarImage from '../../components/AvatarImage';
import '@testing-library/jest-dom';

describe('the avatar image component', () => {
  it('should render correctly', () => {
    render(
      <AvatarImage userName="Test" size="large" />
    );
    const logo = screen.getByRole('img');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', 'Test');
  });
});
