import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptySection from '../../components/EmptySection/index';

describe('the Empty Section component', () => {
  it('should render correctly', () => {
    const { container } = render(
      <EmptySection
        title="Test"
        description="For testing"
        icon="SoilMoistureField"
      />
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('For testing')).toBeInTheDocument();
    const icon = container.getElementsByClassName('empty-section-icon');
    expect(icon[0]).toBeInTheDocument();
  });
});
