import { createContext, useContext } from 'react';

type YearContextType = string;

const YearContext = createContext<YearContextType | undefined>(undefined);

export const YearProvider = YearContext.Provider;

export const useYear = () => {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
};
