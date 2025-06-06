import React from 'react';

import './styles.scss';

interface SubtitleProps {
  text: string | React.ReactNode;
  className?: string;
}

const Subtitle = ({ text, className }: SubtitleProps) => (
  <div role="heading" aria-level={2} className={className ? `${className} subtitle-section` : 'subtitle-section'}>
    {text}
  </div>
);

export default Subtitle;
