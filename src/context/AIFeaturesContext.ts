import { createContext, useContext } from 'react';

export const AIFeaturesContext = createContext(true);
 
export function useAIFeatures() {
  return useContext(AIFeaturesContext);
} 