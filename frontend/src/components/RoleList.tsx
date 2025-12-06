import React, { memo } from 'react';
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
import SortableRoleItem from './SortableRoleItem';
import './RoleList.css';

interface RoleListProps {
  roles: ('A' | 'C' | 'D' | 'P')[];
  onRolesChange: (newRoles: ('A' | 'C' | 'D' | 'P')[]) => void;
}

const getRoleLabel = (role: 'A' | 'C' | 'D' | 'P'): string => {
  const labels: Record<'A' | 'C' | 'D' | 'P', string> = {
    A: 'Attaccante',
    C: 'Centrocampista',
    D: 'Difensore',
    P: 'Portiere',
  };
  return labels[role];
};

const RoleList: React.FC<RoleListProps> = memo(({ roles, onRolesChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = roles.findIndex((_, i) => `role-${i}` === active.id);
      const newIndex = roles.findIndex((_, i) => `role-${i}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onRolesChange(arrayMove(roles, oldIndex, newIndex));
      }
    }
  };

  const roleIds = roles.map((_, i) => `role-${i}`);

  return (
    <div className="role-list">
      <h3>Ruoli</h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={roleIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="roles-container">
            {roles.map((role, index) => (
              <SortableRoleItem
                key={`role-${index}`}
                id={`role-${index}`}
                index={index}
                role={role}
                roleLabel={getRoleLabel(role)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
});

RoleList.displayName = 'RoleList';

export default RoleList;
