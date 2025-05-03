import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Session, TravelPreference, TierListData, GeographicalPreference } from '../types';
import { generateUniqueId } from '../utils';

interface TravelContextType {
  sessions: Session[];
  currentSessionId: string | null;
  createNewSession: () => void;
  switchSession: (sessionId: string) => void;
  updatePreferences: (sessionId: string, text: string) => void;
  updateCityandBudget: (sessionId: string, text: string) => void;
  updateTierList: (sessionId: string, tierList: TierListData) => void;
  updateGeographicalPreferences: (sessionId: string, preferences: GeographicalPreference) => void;
  moveToNextStep: (sessionId: string) => void;
  getCurrentSession: () => Session | null;
  validateAllSessionsComplete: () => boolean;
  getCompletedSessions: () => Session[];
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export const TravelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const createNewSession = () => {
    const newSessionId = generateUniqueId();

    const initialTierList: TierListData = {
      S: [],
      A: [],
      B: [],
      C: [],
      unranked: ['food', 'culture', 'nightlife', 'beach', 'mountain', 'outdoor', 'city', 'original'],
    };

    const newSession: Session = {
      id: newSessionId,
      preferences: null,
      currentStep: 'tierList',
      tierList: initialTierList,
      geographical: {
        homeCity: '',
        selectedContinent: null
      }
    };

    setSessions(prevSessions => [...prevSessions, newSession]);
    setCurrentSessionId(newSessionId);
    
    return newSessionId;
  };

  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const updateCityandBudget = (sessionId: string, text: string) => {
    setSessions(prevSessions => 
      prevSessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              budgetandcity: { id: generateUniqueId(), text },
            }

          : session

      )

    );

  };
  const updatePreferences = (sessionId: string, text: string) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              preferences: { id: generateUniqueId(), text },
            }
          : session
      )
    );
  };

  const updateTierList = (sessionId: string, tierList: TierListData) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              tierList,
            }
          : session
      )
    );
  };

  const updateGeographicalPreferences = (sessionId: string, preferences: GeographicalPreference) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              geographical: preferences,
            }
          : session
      )
    );
  };

  const moveToNextStep = (sessionId: string) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id !== sessionId) return session;

        const steps = ['tierList', 'preferences', 'geographical', 'results'] as const;
        const currentStepIndex = steps.indexOf(session.currentStep);
        
        if (currentStepIndex < steps.length - 1) {
          return {
            ...session,
            currentStep: steps[currentStepIndex + 1],
          };
        }
        
        return session;
      })
    );
  };

  const getCurrentSession = (): Session | null => {
    if (!currentSessionId) return null;
    return sessions.find(session => session.id === currentSessionId) || null;
  };
  const validateAllSessionsComplete = useCallback(() => {
    return sessions.every(session => 
      session.currentStep === 'results' &&
      session.tierList &&
      session.preferences &&
      session.geographical?.selectedContinents
    );
  }, [sessions]);

  const getCompletedSessions = useCallback(() => {
    return sessions.filter(session => 
      session.currentStep === 'results' &&
      session.tierList &&
      session.preferences &&
      session.geographical?.selectedContinents
    );
  }, [sessions]);

  const value = {
    sessions,
    currentSessionId,
    createNewSession,
    switchSession,
    updatePreferences,
    updateTierList,
    updateGeographicalPreferences,
    moveToNextStep,
    getCurrentSession,
    validateAllSessionsComplete,
    getCompletedSessions,
    updateCityandBudget
  };

  

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
};
export const useTravelContext = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravelContext debe ser usado dentro de un TravelProvider');
  }
  return context;
};