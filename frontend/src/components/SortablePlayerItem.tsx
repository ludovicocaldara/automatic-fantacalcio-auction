import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Player {
  name: string;
  team: string;
  value: number;
}

interface Goalkeeper {
  team: string;
  value: number;
}

interface SortablePlayerItemProps {
  id: string;
  index: number;
  player: Player | Goalkeeper | undefined;
  playerKey: string;
  isGoalkeeper: boolean;
}

const SortablePlayerItem: React.FC<SortablePlayerItemProps> = ({
  id,
  index,
  player,
  playerKey,
  isGoalkeeper,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getDisplayText = (): string => {
    if (!player) return playerKey;
    if (isGoalkeeper) {
      const gk = player as Goalkeeper;
      return `${gk.team} (${gk.value})`;
    } else {
      const p = player as Player;
      return `${p.name} (${p.team}) - ${p.value}`;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="player-item"
      {...attributes}
      {...listeners}
    >
      <span className="player-index">{index + 1}</span>
      <span className="player-info">{getDisplayText()}</span>
      <span className="drag-handle">⋮⋮</span>
    </div>
  );
};

export default SortablePlayerItem;
