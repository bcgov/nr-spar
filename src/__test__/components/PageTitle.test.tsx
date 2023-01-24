/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import PageTitle from '../../components/PageTitle';
import '@testing-library/jest-dom';

describe('the page title component', () => {
  it('should render correctly', () => {
    render(
      <PageTitle title="Test title" subtitle="Test Subtitle" />
    );

    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should render correctly with favorite option', () => {
    render(
      <PageTitle title="Test title" subtitle="Test Subtitle" favorite />
    );

    expect(screen.getAllByRole('button')[0]).toBeInTheDocument();
  });
});
