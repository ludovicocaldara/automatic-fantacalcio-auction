import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableRoleItemProps {
  id: string;
  index: number;
  role: 'A' | 'C' | 'D' | 'P';
  roleLabel: string;
}

const SortableRoleItem: React.FC<SortableRoleItemProps> = ({
  id,
  index,
  role,
  roleLabel,
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

  const roleColors: Record<'A' | 'C' | 'D' | 'P', string> = {
    A: '#FF6B6B',
    C: '#4ECDC4',
    D: '#45B7D1',
    P: '#F9CA24',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="role-item"
      {...attributes}
      {...listeners}
    >
      <span className="role-index">{index + 1}</span>
      <div className="role-badge" style={{ backgroundColor: roleColors[role] }}>
        {role}
      </div>
      <span className="role-label">{roleLabel}</span>
      <span className="drag-handle">⋮⋮</span>
    </div>
  );
};

export default SortableRoleItem;
