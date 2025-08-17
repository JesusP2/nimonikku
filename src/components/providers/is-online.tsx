import { createContext, useContext, useEffect, useState } from "react";

type IsOnlineProviderProps = {
  children: React.ReactNode;
};

type IsOnlineProviderState = {
  isOnline: boolean;
};

const initialState: IsOnlineProviderState = {
  isOnline: navigator.onLine,
};

const IsOnlineProviderContext =
  createContext<IsOnlineProviderState>(initialState);

export function IsOnlineProvider({
  children,
  ...props
}: IsOnlineProviderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const id = setInterval(() => {
      setIsOnline(navigator.onLine);
    }, 30_000);
    return () => clearInterval(id);
  }, []);
  const value = {
    isOnline: isOnline,
  };

  return (
    <IsOnlineProviderContext.Provider {...props} value={value}>
      {children}
    </IsOnlineProviderContext.Provider>
  );
}

export const useIsOnline = () => {
  const context = useContext(IsOnlineProviderContext);

  if (context === undefined)
    throw new Error("useIsOnline must be used within an IsOnlineProvider");

  return context;
};
