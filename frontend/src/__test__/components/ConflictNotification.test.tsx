import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConflictNotification from '../../components/CONSEP/ConflictNotification';

describe('ConflictNotification', () => {
  it('renders the conflict title and discard warning', () => {
    render(<ConflictNotification onReload={() => {}} />);
    expect(screen.getByText('Conflict detected')).toBeInTheDocument();
    expect(screen.getByText(/unsaved changes will be lost/i)).toBeInTheDocument();
  });

  it('calls onReload when the Reload button is clicked', async () => {
    const onReload = vi.fn();
    render(<ConflictNotification onReload={onReload} />);
    await userEvent.click(screen.getByRole('button', { name: /reload/i }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
