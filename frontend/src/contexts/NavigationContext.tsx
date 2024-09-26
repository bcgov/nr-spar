import React, { createContext, useContext, useMemo } from 'react';

interface NavigateContextType {
  redirectTo403: Function;
}

const NavigationContext = createContext<NavigateContextType | undefined>(undefined);

// This a navigation provider, where a a context will be used to access the useNavigate
// without necessarily being inside a router context
export const NavigateProvider: React.FC<{
  children: React.ReactNode,
  onRedirect: () => void
}> = ({ children, onRedirect }) => {
  const value = useMemo(() => ({ redirectTo403: onRedirect }), [onRedirect]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigateContext = () => {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error('useNavigateContext must be used within a NavigateProvider');
  }

  return context;
};
