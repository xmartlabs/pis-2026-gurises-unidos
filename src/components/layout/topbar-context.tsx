'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

export type ProjectTopbarConfig = {
  projectName: string;
  selectedYear: number;
  years: number[];
};

type TopbarContextValue = {
  projectConfig: ProjectTopbarConfig | null;
  setProjectConfig: Dispatch<SetStateAction<ProjectTopbarConfig | null>>;
};

const TopbarContext = createContext<TopbarContextValue | null>(null);

export function TopbarProvider({ children }: { children: ReactNode }) {
  const [projectConfig, setProjectConfig] = useState<ProjectTopbarConfig | null>(null);
  const value = useMemo(() => ({ projectConfig, setProjectConfig }), [projectConfig]);

  return <TopbarContext.Provider value={value}>{children}</TopbarContext.Provider>;
}

export function useTopbar() {
  const context = useContext(TopbarContext);

  if (!context) {
    throw new Error('useTopbar must be used within TopbarProvider');
  }

  return context;
}

export function ProjectTopbarRegistration({
  projectName,
  selectedYear,
  years,
}: ProjectTopbarConfig) {
  const { setProjectConfig } = useTopbar();
  const yearsKey = years.join(',');

  useEffect(() => {
    setProjectConfig({
      projectName,
      selectedYear,
      years: yearsKey.split(',').map(Number),
    });

    return () => setProjectConfig(null);
  }, [projectName, selectedYear, setProjectConfig, yearsKey]);

  return null;
}
