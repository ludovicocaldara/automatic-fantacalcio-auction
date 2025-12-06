import React, { memo, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortablePlayerItem from './SortablePlayerItem';
import './PlayerList.css';

interface Player {
  name: string;
  team: string;
  value: number;
}

interface Goalkeeper {
  team: string;
  value: number;
}

interface PlayerListProps {
  role: 'A' | 'C' | 'D' | 'P';
  players: Player[] | Goalkeeper[];
  selectedPlayers: string[];
  onPlayersChange: (newPlayers: string[]) => void;
}

const getRoleTitle = (role: 'A' | 'C' | 'D' | 'P'): string => {
  const titles: Record<'A' | 'C' | 'D' | 'P', string> = {
    A: 'Attaccanti',
    C: 'Centrocampisti',
    D: 'Difensori',
    P: 'Portieri',
  };
  return titles[role];
};

const isGoalkeeper = (item: Player | Goalkeeper): item is Goalkeeper => {
  return 'team' in item && !('name' in item);
};

const PlayerList: React.FC<PlayerListProps> = memo(
  ({ role, players, selectedPlayers, onPlayersChange }) => {
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    // Find player details for display
    const playerDetails = useMemo(() => {
      return selectedPlayers.map((playerKey) => {
        const player = players.find((p) => {
          if (isGoalkeeper(p)) {
            return (p as Goalkeeper).team === playerKey;
          }
          return (p as Player).name === playerKey;
        });
        return { key: playerKey, player };
      });
    }, [selectedPlayers, players]);

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = selectedPlayers.findIndex(
          (_, i) => `player-${i}` === active.id
        );
        const newIndex = selectedPlayers.findIndex(
          (_, i) => `player-${i}` === over.id
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          onPlayersChange(arrayMove(selectedPlayers, oldIndex, newIndex));
        }
      }
    };

    const playerIds = selectedPlayers.map((_, i) => `player-${i}`);

    return (
      <div className="player-list">
        <h4>{getRoleTitle(role)}</h4>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={playerIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="players-container">
              {playerDetails.map(({ key, player }, index) => (
                <SortablePlayerItem
                  key={`player-${index}`}
                  id={`player-${index}`}
                  index={index}
                  player={player}
                  playerKey={key}
                  isGoalkeeper={role === 'P'}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  }
);

PlayerList.displayName = 'PlayerList';

export default PlayerList;
