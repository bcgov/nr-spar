import React from 'react';
import { render, screen } from '@testing-library/react';
import Subtitle from '../../components/Subtitle';

describe('the subtitle component', () => {
  it('should render correctly', () => {
    render(
      <Subtitle text="test" />
    );

    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
