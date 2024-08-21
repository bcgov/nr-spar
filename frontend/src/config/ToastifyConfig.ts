/*
 * These configs are intended to use along with carbon toast,
 * see usage in src/components/ApplicantInformationForm/index.tsx.
 */

import { ToastOptions } from 'react-toastify';

export const ErrToastOption: ToastOptions = {
  position: 'top-right',
  icon: false,
  closeButton: false,
  theme: 'dark',
  hideProgressBar: true,
  style: { padding: 0, background: 'none', boxShadow: 'none' }
};
