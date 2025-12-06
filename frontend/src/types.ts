// Type definitions for the application

export interface Bet {
  id: number;
  value: number;
}

export interface Role {
  id: number;
  role: 'A' | 'C' | 'D' | 'P';
}

export interface Player {
  name: string;
  team: string;
  value: number;
}

export interface Goalkeeper {
  team: string;
  value: number;
}

export interface PlayersData {
  strikers: Player[];
  centrals: Player[];
  defenders: Player[];
  goalkeepers: Goalkeeper[];
}

export interface SelectionState {
  teamName: string;
  bets: number[];
  roles: ('A' | 'C' | 'D' | 'P')[];
  strikers: string[]; // player names
  centrals: string[];
  defenders: string[];
  goalkeepers: string[]; // team names
}

export interface ExportedSelection extends SelectionState {
  exportedAt: string;
}
