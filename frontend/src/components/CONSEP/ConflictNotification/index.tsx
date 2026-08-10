import React from 'react';
import { ActionableNotification } from '@carbon/react';
import { conflictText } from './constants';

type ConflictNotificationProps = {
  onReload: () => void;
  className?: string;
};

const ConflictNotification = ({ onReload, className }: ConflictNotificationProps) => (
  <ActionableNotification
    lowContrast
    inline
    kind="warning"
    className={className}
    title={conflictText.title}
    actionButtonLabel={conflictText.reload}
    onActionButtonClick={onReload}
    hideCloseButton
    subtitle={(
      <ul className="conflict-notification-bullets">
        {conflictText.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    )}
  />
);

export default ConflictNotification;
