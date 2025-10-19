/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import type { SurveyResponse } from "./SurveyResponse";

type SurveyContextType = readonly SurveyResponse[];

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider = SurveyContext.Provider;

export const useSurveyData = () => {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error("useSurveyData must be used within a SurveyProvider");
  }
  return context;
};
