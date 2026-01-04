import { createContext, useContext, useState, type ReactNode } from 'react';

interface GraphExploreContextType {
  activeExploreId: string | null;
  setActiveExploreId: (id: string | null) => void;
}

const GraphExploreContext = createContext<GraphExploreContextType | undefined>(undefined);

export const GraphExploreProvider = ({ children }: { children: ReactNode }) => {
  const [activeExploreId, setActiveExploreId] = useState<string | null>(null);

  return (
    <GraphExploreContext.Provider value={{ activeExploreId, setActiveExploreId }}>
      {children}
    </GraphExploreContext.Provider>
  );
};

export const useGraphExplore = (): GraphExploreContextType => {
  const context = useContext(GraphExploreContext);
  if (context === undefined) {
    throw new Error('useGraphExplore must be used within a GraphExploreProvider');
  }
  return context;
};
