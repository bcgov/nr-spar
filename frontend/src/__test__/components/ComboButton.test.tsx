import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react';
import ComboButton from '../../components/ComboButton/index';
import '@testing-library/jest-dom';

const manageOptions = [
  {
    text: 'Edit seedlot applicant',
    onClickFunction: () => null
  },
  {
    text: 'Print seedlot',
    onClickFunction: () => null
  },
  {
    text: 'Duplicate seedlot',
    onClickFunction: () => null
  },
  {
    text: 'Delete seedlot',
    onClickFunction: () => null
  }
];

describe('Test the combo button component', () => {
  it('should render correctly', () => {
    render(
      <ComboButton title="Test Combo Button" items={manageOptions} />
    );

    expect(screen.getByText('Test Combo Button')).toBeInTheDocument();
  });

  it('should show options on click', () => {
    const { container } = render(
      <ComboButton title="Test Combo Button" items={manageOptions} />
    );
    const comboButtonElement = container.getElementsByClassName('combo-options');
    fireEvent.click(comboButtonElement[0]);
    expect(screen.getByText('Edit seedlot applicant')).toBeInTheDocument();
  });
});
