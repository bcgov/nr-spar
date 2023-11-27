/*
 * These configs are intended to use along with carbon toast,
 * see usage in src/components/ApplicantInformationForm/index.tsx.
 */

import { ToastOptions, toast } from 'react-toastify';
import { SEVEN_SECONDS } from './TimeUnits';

export const ErrToastOption: ToastOptions = {
  position: toast.POSITION.TOP_RIGHT,
  icon: false,
  closeButton: false,
  theme: 'dark',
  hideProgressBar: true,
  style: { padding: 0, background: 'none', boxShadow: 'none' },
  autoClose: SEVEN_SECONDS
};
