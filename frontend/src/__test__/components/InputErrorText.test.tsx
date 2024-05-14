import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputErrorText from '../../components/InputErrorText';

describe('InputErrorText component tests', () => {
  const textToRender = "hello I'm @ b1G err0r";
  it('should render input error text correctly', () => {
    render(
      <InputErrorText
        description={textToRender}
      />
    );

    expect(screen.getByText(textToRender)).toBeInTheDocument();
  });
});
