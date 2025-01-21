import { useEffect } from 'react';
import { useLocation } from 'react-router';

interface ScrollToTopProps {
  enabled?: boolean
}

const ScrollToTop = ({ enabled = true }: ScrollToTopProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (enabled) {
      document.documentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
