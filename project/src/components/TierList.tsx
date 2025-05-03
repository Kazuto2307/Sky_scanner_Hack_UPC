import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  rectIntersection,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useTravelContext } from '../context/TravelContext';
import Button from './Button';
import { 
  Utensils, 
  Landmark, 
  Moon, 
  Waves, 
  Mountain, 
  Compass, 
  Building2, 
  Map,
  Trophy
} from 'lucide-react';
import { TierType, TravelAspect } from '../types';

const travelAspects: TravelAspect[] = [
  { id: 'food', name: 'Food', icon: 'Utensils' },
  { id: 'culture', name: 'Culture', icon: 'Landmark' },
  { id: 'nightlife', name: 'Night Life', icon: 'Moon' },
  { id: 'beach', name: 'Beach', icon: 'Waves' },
  { id: 'mountain', name: 'Mountain', icon: 'Mountain' },
  { id: 'outdoor', name: 'Outdoor Adventures', icon: 'Compass' },
  { id: 'city', name: 'City Visit', icon: 'Building2' },
  { id: 'original', name: 'Original Destination', icon: 'Map' },
];

const iconMap = {
  Utensils,
  Landmark,
  Moon,
  Waves,
  Mountain,
  Compass,
  Building2,
  Map,
};

const DraggableItem = ({ aspect }: { aspect: TravelAspect }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: aspect.id,
  });
  
  const Icon = iconMap[aspect.icon as keyof typeof iconMap];
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : undefined,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`bg-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <Icon size={20} />
      <span>{aspect.name}</span>
    </div>
  );
};

const TierRow = ({ tier, color, sessionId }: { tier: TierType; color: string; sessionId: string }) => {
  const { setNodeRef, isOver } = useDroppable({ id: tier });
  const { getCurrentSession } = useTravelContext();
  const currentSession = getCurrentSession(sessionId);

  if (!currentSession) return null;

  return (
    <div className="flex items-center mb-4 gap-4">
      <div className={`w-16 h-16 ${color} rounded-lg flex items-center justify-center`}>
        {tier === 'S' ? <Trophy className="text-white" size={24} /> : (
          <span className="text-2xl font-bold text-white">{tier}</span>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[4rem] rounded-lg p-4 flex flex-wrap gap-2 transition-colors duration-200 ${
          isOver ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-100'
        }`}
      >
        {currentSession.tierList[tier].map(aspectId => {
          const aspect = travelAspects.find(a => a.id === aspectId);
          return aspect ? <DraggableItem key={aspectId} aspect={aspect} /> : null;
        })}
      </div>
    </div>
  );
};

const UnrankedDropArea = ({ sessionId }: { sessionId: string }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'unranked' });
  const { getCurrentSession } = useTravelContext();
  const currentSession = getCurrentSession(sessionId);

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[4rem] rounded-lg p-4 flex flex-wrap gap-2 transition-colors duration-200 ${
        isOver ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-100'
      }`}
    >
      {currentSession?.tierList.unranked.map(aspectId => {
        const aspect = travelAspects.find(a => a.id === aspectId);
        return aspect ? <DraggableItem key={aspectId} aspect={aspect} /> : null;
      })}
    </div>
  );
};

const TierList: React.FC = () => {
  const { getCurrentSession, moveToNextStep, updateTierList } = useTravelContext();
  const currentSession = getCurrentSession();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });
  
  const sensors = useSensors(mouseSensor, touchSensor);

  if (!currentSession) return null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && currentSession) {
      const aspectId = active.id as string;
      const tierId = over.id as TierType;
      
      const updatedTierList = { ...currentSession.tierList };
      
      // Remove from all tiers
      Object.keys(updatedTierList).forEach(tier => {
        updatedTierList[tier as TierType] = updatedTierList[tier as TierType].filter(
          id => id !== aspectId
        );
      });
      
      // Add to new tier
      updatedTierList[tierId].push(aspectId);
      
      updateTierList(currentSession.id, updatedTierList);
    }
    
    setActiveId(null);
  };

  const handleContinue = () => {
    if (currentSession) {
      moveToNextStep(currentSession.id);
    }
  };

  const allItemsRanked = currentSession.tierList.unranked.length === 0;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Rank Your Travel Preferences</h2>
          <p className="text-gray-600">
            Drag and drop each travel aspect into your preferred tier. S is the highest tier, and C is the lowest.
          </p>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
          collisionDetection={rectIntersection}
        >
          <TierRow tier="S" color="bg-yellow-500" sessionId={currentSession.id} />
          <TierRow tier="A" color="bg-red-500" sessionId={currentSession.id} />
          <TierRow tier="B" color="bg-blue-500" sessionId={currentSession.id} />
          <TierRow tier="C" color="bg-gray-500" sessionId={currentSession.id} />

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Unranked Items</h3>
            <UnrankedDropArea sessionId={currentSession.id} />
          </div>

          <DragOverlay dropAnimation={null} modifiers={[restrictToWindowEdges]}>
            {activeId ? (
              <div className="bg-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 cursor-grabbing">
                {(() => {
                  const aspect = travelAspects.find(a => a.id === activeId);
                  if (!aspect) return null;
                  const Icon = iconMap[aspect.icon as keyof typeof iconMap];
                  return (
                    <>
                      <Icon size={20} />
                      <span>{aspect.name}</span>
                    </>
                  );
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleContinue}
            disabled={!allItemsRanked}
            className="transition-all duration-300"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TierList;