import React from 'react';

import './styles.scss';

interface SubtitleProps {
  text: string | React.ReactNode;
  className?: string;
  role?: string;
}

const Subtitle = ({ text, className }: SubtitleProps) => (
  <div className={className ? `${className} subtitle-section` : 'subtitle-section'}>
    {text}
  </div>
);

export default Subtitle;
