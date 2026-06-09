import React from 'react';
import { ToastNotification } from '@carbon/react';
import CustomToastProps from '../definitions';

const SuccessToast = ({
  title, subtitle
}: CustomToastProps) => (
  <ToastNotification
    className="toastception"
    lowContrast={false}
    kind="success"
    title={title}
    subtitle={subtitle}
  />
);

export default SuccessToast;
