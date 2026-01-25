import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GraphId } from '../hooks/useGraphDescription';

interface GraphExploreContextType {
  activeExploreId: GraphId | null;
  setActiveExploreId: (id: GraphId | null) => void;
}

const GraphExploreContext = createContext<GraphExploreContextType | undefined>(undefined);

export const GraphExploreProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state directly from URL
  const activeExploreId = (searchParams.get('explore') as GraphId) || null;

  const setActiveExploreId = (id: GraphId | null) => {
    if (id) {
      // Set URL param
      setSearchParams({ explore: id }, { replace: false });
    } else {
      // Remove URL param to go back
      searchParams.delete('explore');
      setSearchParams(searchParams, { replace: false });
    }
  };

  const value = useMemo(
    () => ({ activeExploreId, setActiveExploreId }),
    [activeExploreId, setSearchParams] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <GraphExploreContext.Provider value={value}>{children}</GraphExploreContext.Provider>;
};

export const useGraphExplore = () => {
  const context = useContext(GraphExploreContext);
  if (!context) {
    throw new Error('useGraphExplore must be used within a GraphExploreProvider');
  }
  return context;
};
