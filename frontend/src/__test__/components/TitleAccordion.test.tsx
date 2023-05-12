import React from 'react'
import { render, screen } from '@testing-library/react';
import TitleAccordion from '../../components/TitleAccordion/index';
import '@testing-library/jest-dom';

describe('Test the title accordion component', () => {
  it('should render correctly', () => {
    render(
      <TitleAccordion
        title="title test"
        description="a small description for testing"
      />
    );

    expect(screen.getByText('title test')).toBeInTheDocument();
    expect(screen.getByText('a small description for testing')).toBeInTheDocument();

  });
});
