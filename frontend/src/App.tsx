import React, { useEffect, useState } from 'react';
import { PlayersData, SelectionState } from './types';
import {
  createDefaultSelection,
  loadSelection,
  saveSelection,
  downloadSelection,
  importSelection,
} from './utils/storage';
import BetList from './components/BetList';
import RoleList from './components/RoleList';
import PlayerList from './components/PlayerList';
import './App.css';

const App: React.FC = () => {
  const [playersData, setPlayersData] = useState<PlayersData | null>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load players data from JSON
  useEffect(() => {
    const loadPlayersData = async () => {
      try {
        const response = await fetch('players-data.json');
        if (!response.ok) throw new Error('Failed to load players data');
        const data: PlayersData = await response.json();
        setPlayersData(data);

        // Now load or create selection
        const saved = loadSelection();
        if (saved) {
          setSelection(saved);
        } else {
          const playerNames = {
            strikers: data.strikers.map((p) => p.name),
            centrals: data.centrals.map((p) => p.name),
            defenders: data.defenders.map((p) => p.name),
            goalkeepers: data.goalkeepers.map((g) => g.team),
          };
          const defaultSelection = createDefaultSelection(playerNames);
          setSelection(defaultSelection);
          saveSelection(defaultSelection);
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    loadPlayersData();
  }, []);

  const handleBetChange = (index: number, newValue: number) => {
    if (!selection) return;
    const newBets = [...selection.bets];
    newBets[index] = newValue;
    const newSelection = { ...selection, bets: newBets };
    setSelection(newSelection);
    saveSelection(newSelection);
  };

  const handleRolesChange = (newRoles: ('A' | 'C' | 'D' | 'P')[]) => {
    if (!selection) return;
    const newSelection = { ...selection, roles: newRoles };
    setSelection(newSelection);
    saveSelection(newSelection);
  };

  const handlePlayersChange = (
    role: 'A' | 'C' | 'D' | 'P',
    newPlayers: string[]
  ) => {
    if (!selection) return;
    const newSelection = { ...selection };
    if (role === 'A') newSelection.strikers = newPlayers;
    else if (role === 'C') newSelection.centrals = newPlayers;
    else if (role === 'D') newSelection.defenders = newPlayers;
    else if (role === 'P') newSelection.goalkeepers = newPlayers;
    setSelection(newSelection);
    saveSelection(newSelection);
  };

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selection) return;
    const newSelection = { ...selection, teamName: e.target.value };
    setSelection(newSelection);
    saveSelection(newSelection);
  };

  const handleDownload = () => {
    if (!selection) return;
    const filename =
      selection.teamName && selection.teamName.trim()
        ? `${selection.teamName.replace(/\s+/g, '_')}.json`
        : 'fantacalcio-selection.json';
    downloadSelection(selection, filename);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importSelection(file);
      setSelection(imported);
      saveSelection(imported);
    } catch (err) {
      alert(
        `Errore nell'importazione: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    }

    // Reset file input
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="app loading">
        <div className="loader"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  if (error || !playersData || !selection) {
    return (
      <div className="app error">
        <h1>Errore</h1>
        <p>{error || 'Impossibile caricare i dati'}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚽ Asta Fantacalcio</h1>
        <div className="team-name-section">
          <input
            type="text"
            placeholder="Nome della tua squadra"
            value={selection.teamName}
            onChange={handleTeamNameChange}
            className="team-name-input"
          />
          <div className="action-buttons">
            <button onClick={handleDownload} className="btn btn-download">
              📥 Scarica
            </button>
            <label className="btn btn-import">
              📤 Importa
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="bets-roles-section">
          <BetList bets={selection.bets} onBetChange={handleBetChange} />
          <RoleList roles={selection.roles} onRolesChange={handleRolesChange} />
        </div>

        <div className="players-section">
          <PlayerList
            role="A"
            players={playersData.strikers}
            selectedPlayers={selection.strikers}
            onPlayersChange={(p) => handlePlayersChange('A', p)}
          />
          <PlayerList
            role="C"
            players={playersData.centrals}
            selectedPlayers={selection.centrals}
            onPlayersChange={(p) => handlePlayersChange('C', p)}
          />
          <PlayerList
            role="D"
            players={playersData.defenders}
            selectedPlayers={selection.defenders}
            onPlayersChange={(p) => handlePlayersChange('D', p)}
          />
          <PlayerList
            role="P"
            players={playersData.goalkeepers}
            selectedPlayers={selection.goalkeepers}
            onPlayersChange={(p) => handlePlayersChange('P', p)}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
