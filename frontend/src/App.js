import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import playersData from './players.json';
import './App.css';

const ROLES_INITIAL = ['A', 'A', 'A', 'C', 'C', 'C', 'D', 'D', 'D', 'D', 'P', 'A', 'A', 'A', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'D', 'D'];
const BETS_INITIAL = new Array(23).fill(1);
const TOTAL_BUDGET = 600;

function BetInput({ value, onChange, index, remaining, dragListeners, dragAttributes }) {
  const adjust = (delta) => {
    const newVal = value + delta;
    if (newVal >= 0 && (delta <= 0 || remaining >= delta)) {
      onChange(newVal, index);
    }
  };

  return (
    <div className="bet-input">
      <button onClick={(e) => { e.stopPropagation(); adjust(-10); }} disabled={value < 10}>-10</button>
      <button onClick={(e) => { e.stopPropagation(); adjust(-1); }} disabled={value < 1}>-1</button>
      <span className="bet-value" {...dragAttributes} {...dragListeners}>{value}</span>
      <button onClick={(e) => { e.stopPropagation(); adjust(1); }} disabled={remaining < 1}>+1</button>
      <button onClick={(e) => { e.stopPropagation(); adjust(10); }} disabled={remaining < 10}>+10</button>
    </div>
  );
}

function SortableBet({ id, value, onChange, remaining }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-bet">
      <BetInput value={value} onChange={onChange} index={id} remaining={remaining} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  );
}

function SortableRole({ id, role }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="sortable-role">
      <div className="role-tile">{role}</div>
    </div>
  );
}

function PlayerTile({ player, onSelect, role }) {
  const roleClass = role ? role.toLowerCase() : 'def'; // default to def if no role specified
  return (
    <div className={`player-tile ${roleClass}`} onClick={() => onSelect(player)}>
      {player.Nome} ({player.squadra}) - {player.Qt.A}
    </div>
  );
}

function TeamList({ role, players, onReorder, onSelect }) {
  const items = players.map((p, i) => `${role}-${i}`);

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onReorder}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className={`team-list ${role.toLowerCase()}`}>
          <h3>{role}</h3>
          {players.map((player, index) => (
            <SortablePlayer key={`${role}-${index}`} id={`${role}-${index}`} player={player} onSelect={onSelect} role={role} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortablePlayer({ id, player, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="sortable-player">
      <PlayerTile player={player} onSelect={() => {}} />
    </div>
  );
}

function SortableTeam({ id, team, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="sortable-team">
      <div className="team-tile" onClick={() => onSelect(null, team)}>
        {team}
      </div>
    </div>
  );
}

function GkTeams({ gkOrder, onReorder, selectedGks, onSelect }) {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onReorder}>
      <SortableContext items={gkOrder} strategy={verticalListSortingStrategy}>
        <div className="gk-teams">
          <h3>Portieri (per squadra) in ordine di preferenza</h3>
          {gkOrder.map((team) => (
            <SortableTeam key={team} id={team} team={team} onSelect={onSelect} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function App() {
  const [bets, setBets] = useState(BETS_INITIAL);
  const [roles, setRoles] = useState(ROLES_INITIAL);
  const [gkOrder, setGkOrder] = useState(Object.keys(playersData.gk));
  const [selections, setSelections] = useState({
    gk: [],
    def: [],
    cen: [],
    att: [],
  });
  const [availablePlayers, setAvailablePlayers] = useState({
    gk: playersData.gk,
    def: playersData.def,
    cen: playersData.cen,
    att: playersData.att,
  });

  useEffect(() => {
    const saved = localStorage.getItem('fantacalcioSelection');
    if (saved) {
      const parsed = JSON.parse(saved);
      setBets(parsed.bets || BETS_INITIAL);
      setRoles(parsed.roles || ROLES_INITIAL);
      setGkOrder(parsed.gkOrder || Object.keys(playersData.gk));
      setSelections(parsed.selections || { gk: [], def: [], cen: [], att: [] });
    }
  }, []);



  const totalBets = bets.reduce((a, b) => a + b, 0);
  const remaining = TOTAL_BUDGET - totalBets;

  const handleBetChange = (value, index) => {
    const newBets = [...bets];
    newBets[index] = value;
    const newTotal = newBets.reduce((a, b) => a + b, 0);
    if (newTotal <= TOTAL_BUDGET) {
      setBets(newBets);
      const currentData = {
        bets: newBets,
        roles,
        gkOrder,
        selections
      };
      localStorage.setItem('fantacalcioSelection', JSON.stringify(currentData));
    }
  };

  const handleBetReorder = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setBets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newBets = arrayMove(items, oldIndex, newIndex);
        const currentData = {
          bets: newBets,
          roles,
          gkOrder,
          selections
        };
        localStorage.setItem('fantacalcioSelection', JSON.stringify(currentData));
        return newBets;
      });
    }
  };

  const handleRoleReorder = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setRoles((items) => {
        const oldIndex = active.id;
        const newIndex = over.id;
        const newRoles = arrayMove(items, oldIndex, newIndex);
        const currentData = {
          bets,
          roles: newRoles,
          gkOrder,
          selections
        };
        localStorage.setItem('fantacalcioSelection', JSON.stringify(currentData));
        return newRoles;
      });
    }
  };

  const handleGkReorder = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setGkOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newGkOrder = arrayMove(items, oldIndex, newIndex);
        const currentData = {
          bets,
          roles,
          gkOrder: newGkOrder,
          selections
        };
        localStorage.setItem('fantacalcioSelection', JSON.stringify(currentData));
        return newGkOrder;
      });
    }
  };

  const handlePlayerSelect = (player, team = null) => {
    const role = roles[0]; // Assume first role for simplicity; in full impl, match to role
    if (role === 'P') {
      if (!selections.gk.includes(team)) {
        const newSelections = { ...selections, gk: [...selections.gk, team] };
        setSelections(newSelections);
        const currentData = {
          bets,
          roles,
          gkOrder,
          selections: newSelections
        };
        localStorage.setItem('fantacalcioSelection', JSON.stringify(currentData));
        // Remove team from available? But since GK is team, not individual
      }
    } else {
      const key = role.toLowerCase();
      if (!selections[key].includes(player.Nome)) {
        const newSelections = { ...selections, [key]: [...selections[key], player.Nome] };
        setSelections(newSelections);
        const currentData = {
          bets,
          roles,
          gkOrder,
          selections: newSelections
        };
        localStorage.setItem('fantacalcioSelection', JSON.stringify(currentData));
        // Remove from available
        setAvailablePlayers(prev => ({
          ...prev,
          [key]: prev[key].filter(p => p.Nome !== player.Nome)
        }));
      }
    }
  };

  const handleSelectionReorder = (role) => (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const key = role.toLowerCase();
      setSelections(prev => {
        const newSelections = {
          ...prev,
          [key]: arrayMove(prev[key], active.id, over.id)
        };
        const currentData = {
          bets,
          roles,
          gkOrder,
          selections: newSelections
        };
        localStorage.setItem('fantacalcioSelection', JSON.stringify(currentData));
        return newSelections;
      });
    }
  };

  const downloadSelection = () => {
    const data = {
      name: 'participant',
      bets,
      roles,
      gkOrder,
      availablePlayers,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selection.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const parsed = JSON.parse(event.target.result);
        setBets(parsed.bets || BETS_INITIAL);
        setRoles(parsed.roles || ROLES_INITIAL);
        setGkOrder(parsed.gkOrder || Object.keys(playersData.gk));
        setSelections(parsed.selections || selections);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fantacalcio Auction Selection</h1>
        <div className="controls">
          <button onClick={downloadSelection}>Download Selection</button>
          <label>
            Import:
            <input type="file" accept=".json" onChange={importSelection} />
          </label>
        </div>
        <div className="main-content">
          <div className="bets-section">
            <h2>Mettete qui le vostre puntate dalla piu alta alla piu bassa</h2>
            <DndContext onDragEnd={handleBetReorder}>
              <SortableContext items={bets.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                {bets.map((bet, index) => (
                  <SortableBet key={index} id={index} value={bet} onChange={handleBetChange} remaining={remaining} />
                ))}
              </SortableContext>
            </DndContext>
            <div className="total">Total: {totalBets} - Remaining: {remaining}</div>
          </div>
          <div className="roles-section">
            <h2>Ordinate i ruoli (drag & drop) nell'ordine in cui volete che siano assegnati:</h2>
            <DndContext onDragEnd={handleRoleReorder}>
              <SortableContext items={roles.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                {roles.map((role, index) => (
                  <SortableRole key={index} id={index} role={role} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <div className="player-sections">
          <GkTeams gkOrder={gkOrder} onReorder={handleGkReorder} selectedGks={selections.gk} onSelect={handlePlayerSelect} />
          <TeamList role="Difensori in ordine di preferenza" players={availablePlayers.def} onReorder={handleSelectionReorder('Def')} onSelect={handlePlayerSelect} />
          <TeamList role="Centrali in ordine di preferenza" players={availablePlayers.cen} onReorder={handleSelectionReorder('Cen')} onSelect={handlePlayerSelect} />
          <TeamList role="Attaccanti in ordine di preferenza" players={availablePlayers.att} onReorder={handleSelectionReorder('Att')} onSelect={handlePlayerSelect} />
        </div>
        <div className="selection-sections">
          <h2>Selections</h2>
          {Object.entries(selections).map(([role, players]) => (
            <div key={role} className={`selection-list ${role}`}>
              <h3>{role.toUpperCase()}</h3>
              {players.length > 0 && (
                <DndContext onDragEnd={handleSelectionReorder(role.toUpperCase())}>
                  <SortableContext items={players.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                    {players.map((player, index) => (
                      <div key={index} className="selected-player">
                        {typeof player === 'string' ? player : `${player.Nome} (${player.squadra})`}
                      </div>
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
