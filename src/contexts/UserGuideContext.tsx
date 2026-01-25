import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface UserGuideContextType {
  isHelpVisible: boolean;
  toggleHelp: () => void;
}

const UserGuideContext = createContext<UserGuideContextType | undefined>(undefined);

export const UserGuideProvider = ({ children }: { children: ReactNode }) => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasSeenGuide = localStorage.getItem('ireb-has-seen-guide');
    if (!hasSeenGuide) {
      setIsHelpVisible(true);
    }
  }, []);

  const toggleHelp = () => {
    const newState = !isHelpVisible;
    setIsHelpVisible(newState);

    // Once they toggle it (interact with it), mark as seen so it doesn't auto-open next time
    if (!newState) {
      localStorage.setItem('ireb-has-seen-guide', 'true');
    }
  };

  return (
    <UserGuideContext.Provider value={{ isHelpVisible, toggleHelp }}>
      {children}
    </UserGuideContext.Provider>
  );
};

export const useUserGuide = () => {
  const context = useContext(UserGuideContext);
  if (!context) throw new Error('useUserGuide must be used within a UserGuideProvider');
  return context;
};
