import { SelectionState } from '../types';

const STORAGE_KEY = 'fantacalcio-selection';

export const DEFAULT_BETS = [100, 80, 50, 40, 30, 30, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 5, 3, 1, 1];
export const DEFAULT_ROLES = ['A', 'A', 'A', 'C', 'C', 'C', 'D', 'D', 'D', 'D', 'P', 'A', 'A', 'A', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'D', 'D'] as const;

export const createDefaultSelection = (playerNames: { strikers: string[]; centrals: string[]; defenders: string[]; goalkeepers: string[] }): SelectionState => {
  return {
    teamName: '',
    bets: DEFAULT_BETS,
    roles: [...DEFAULT_ROLES],
    strikers: playerNames.strikers,
    centrals: playerNames.centrals,
    defenders: playerNames.defenders,
    goalkeepers: playerNames.goalkeepers,
  };
};

export const saveSelection = (selection: SelectionState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch (e) {
    console.error('Failed to save selection:', e);
  }
};

export const loadSelection = (): SelectionState | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load selection:', e);
    return null;
  }
};

export const clearSelection = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear selection:', e);
  }
};

export const calculateRemainingCredits = (bets: number[]): number => {
  const total = bets.reduce((sum, bet) => sum + bet, 0);
  return 600 - total;
};

export const downloadSelection = (selection: SelectionState, filename: string = 'fantacalcio-selection.json'): void => {
  const exportData = {
    ...selection,
    exportedAt: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importSelection = (file: File): Promise<SelectionState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Validate required fields
        if (
          Array.isArray(data.bets) &&
          Array.isArray(data.roles) &&
          Array.isArray(data.strikers) &&
          Array.isArray(data.centrals) &&
          Array.isArray(data.defenders) &&
          Array.isArray(data.goalkeepers) &&
          typeof data.teamName === 'string'
        ) {
          const selection: SelectionState = {
            teamName: data.teamName,
            bets: data.bets,
            roles: data.roles,
            strikers: data.strikers,
            centrals: data.centrals,
            defenders: data.defenders,
            goalkeepers: data.goalkeepers,
          };
          resolve(selection);
        } else {
          reject(new Error('Invalid selection format'));
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
