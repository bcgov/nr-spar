import React from 'react';

import './styles.css';

interface SubtitleProps {
  text: string;
  className?: string;
}

const Subtitle = ({ text, className }: SubtitleProps) => (
  <h4 className={className ? `${className}  subtitle-section` : 'subtitle-section'}>
    {text}
  </h4>
);

export default Subtitle;
