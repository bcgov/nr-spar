import { useCallback, useState } from 'react';

export const useActivityConflict = () => {
  const [isConflict, setIsConflict] = useState(false);
  const markConflict = useCallback(() => setIsConflict(true), []);
  const clearConflict = useCallback(() => setIsConflict(false), []);
  return { isConflict, markConflict, clearConflict };
};

export default useActivityConflict;
