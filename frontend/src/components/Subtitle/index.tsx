import React from 'react';

import './styles.scss';

interface SubtitleProps {
  text: string | React.ReactNode;
  className?: string;
}

const Subtitle = ({ text, className }: SubtitleProps) => (
  <p className={className ? `${className} subtitle-section` : 'subtitle-section'}>
    {text}
  </p>
);

export default Subtitle;
