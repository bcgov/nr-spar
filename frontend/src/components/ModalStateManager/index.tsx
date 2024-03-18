import React, { useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalStateManagerProps {
  renderLauncher: any;
  children: any;
}

const ModalStateManager = (
  {
    renderLauncher: LauncherContent,
    children: ModalContent
  }: ModalStateManagerProps
) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!ModalContent || typeof document === 'undefined'
        ? null
        : ReactDOM.createPortal(
          <ModalContent open={open} setOpen={setOpen} />,
          document.body
        )}
      {LauncherContent && <LauncherContent open={open} setOpen={setOpen} />}
    </>
  );
};

export default ModalStateManager;
