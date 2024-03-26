import { useEffect, useState } from 'react';

type windowSizeType = {
  innerWidth: number,
  innerHeight: number
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<windowSizeType>({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight
  });

  useEffect(() => {
    const windowSizeHandler = () => {
      const { innerWidth, innerHeight } = window;
      setWindowSize({ innerWidth, innerHeight });
    };
    window.addEventListener('resize', windowSizeHandler);

    return () => {
      window.removeEventListener('resize', windowSizeHandler);
    };
  }, []);

  return windowSize;
};

export default useWindowSize;
