import React from 'react';
import { useTravelContext } from '../context/TravelContext';
import Button from './Button';
import { PlusCircle, LayoutDashboard } from 'lucide-react';

const SessionManager: React.FC = () => {
  const { sessions, currentSessionId, createNewSession, switchSession } = useTravelContext();
  
  const [isOpen, setIsOpen] = React.useState(false);
  
  const toggleOpen = () => setIsOpen(!isOpen);
  
  const handleCreateSession = () => {
    createNewSession();
    setIsOpen(false);
  };
  
  const handleSwitchSession = (sessionId: string) => {
    switchSession(sessionId);
    setIsOpen(false);
  };
  
  return (
    <div className="relative z-10">
      <div className="fixed top-4 right-4">
        <Button
          onClick={toggleOpen}
          variant="secondary"
          className="flex items-center"
        >
          <LayoutDashboard className="mr-2" size={16} />
          Sessions
        </Button>
      </div>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={toggleOpen}
          ></div>
          
          {/* Panel */}
          <div className="fixed right-4 top-16 w-72 bg-white rounded-lg shadow-xl overflow-hidden transform transition-all">
            <div className="p-4 bg-blue-900 text-white">
              <h3 className="font-medium">Travel Sessions</h3>
            </div>
            
            <div className="p-4">
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-sm">No sessions yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessions.map((session, index) => (
                    <button
                      key={session.id}
                      onClick={() => handleSwitchSession(session.id)}
                      className={`w-full text-left p-2 rounded transition-colors ${
                        session.id === currentSessionId 
                          ? 'bg-blue-50 text-blue-900' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">Session {index + 1}</div>
                      <div className="text-xs text-gray-500">
                        Status: {session.currentStep === 'results' ? 'Complete' : 'In Progress'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <button
                onClick={handleCreateSession}
                className="mt-4 w-full flex items-center justify-center p-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
              >
                <PlusCircle className="mr-2" size={16} />
                New Session
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SessionManager;