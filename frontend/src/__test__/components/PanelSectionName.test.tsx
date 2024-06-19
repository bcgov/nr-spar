import React from 'react';
import { render, screen } from '@testing-library/react';
import PanelSectionName from '../../components/PanelSectionName/index';

describe('Test the panel section name component', () => {
  it('should render correctly', () => {
    render(
      <PanelSectionName title="Main Activities" />
    );

    expect(screen.getByText('Main Activities')).toBeInTheDocument();
  });
});
