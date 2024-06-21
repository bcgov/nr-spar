import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import RightPanelTitle from '../../components/RightPanelTitle';

describe('the right panel title component', () => {
  const func = vi.fn();
  it('should render correctly', () => {
    const { container } = render(
      <RightPanelTitle title="Test Title" closeFn={func} />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    const buttons = container.getElementsByClassName('right-title-buttons');
    expect(buttons[0]).toBeInTheDocument();
  });

  it('should call the function', () => {
    render(
      <RightPanelTitle title="Test Title" closeFn={func} />
    );

    const button = screen.getAllByRole('button')[1];
    fireEvent.click(button);
    expect(func).toBeCalled();
  });
});
