"use client";

import { createContext, useContext } from "react";
import type { Experience } from "@web/types";

interface ExperiencesContextType {
  experiences: Experience[];
  isLoading: boolean;
  error: string | null;
}

const ExperiencesContext = createContext<ExperiencesContextType | undefined>(undefined);

export function useExperiencesContext() {
  const context = useContext(ExperiencesContext);
  if (context === undefined) {
    throw new Error("useExperiencesContext must be used within an ExperiencesProvider");
  }
  return context;
}

export function ExperiencesProvider({ 
  children, 
  experiences, 
  isLoading, 
  error 
}: { 
  children: React.ReactNode;
  experiences: Experience[];
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <ExperiencesContext.Provider value={{ experiences, isLoading, error }}>
      {children}
    </ExperiencesContext.Provider>
  );
}