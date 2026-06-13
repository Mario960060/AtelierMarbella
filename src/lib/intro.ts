import { createContext, useContext } from 'react';

export const IntroContext = createContext(true);

export function useIntro() {
  return useContext(IntroContext);
}
