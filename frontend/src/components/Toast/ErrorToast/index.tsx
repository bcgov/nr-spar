/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { ToastNotification } from '@carbon/react';
import CustomToastProps from '../definitions';

const ErrorToast = ({
  closeToast, toastProps, title, subtitle
}: CustomToastProps) => (
  <ToastNotification
    className="toastception"
    lowContrast={false}
    kind="error"
    title={title}
    subtitle={subtitle}
  />
);

export default ErrorToast;
