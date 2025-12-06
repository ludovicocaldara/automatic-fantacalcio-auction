# Fantasy Football Auction Automator

A complete fantasy football auction system with both a modern React frontend for building participant selections and a Python backend for running the automated auction.

## What this is

1. **React Frontend** (`frontend/`) - A modern, interactive web interface for participants to manage their player selections, bets, and roles
2. **Python Backend** (`auction.py`) - An automated auction script that processes participant selections and determines winners

## Features

### Frontend

- 🎯 Interactive bet management with constraints (max 600 credits, ordering rules)
- 🎭 Drag-and-drop reordering of roles and players
- 💾 Automatic local storage persistence (no backend needed)
- 📥/📤 Download and import selection as JSON
- 📱 Fully responsive design (desktop, tablet, mobile)
- ⚡ Real-time validation and UI feedback

### Backend

- ✅ Supports both Excel (.xlsx) and JSON (.json) input formats
- 🎲 Fair tie-breaking with "favorited counter" system
- 📊 Detailed auction logs and final team reports
- 🔧 Configurable random seed for reproducibility

## Requirements

### Frontend Requirements

- Node.js 14+
- npm or yarn

### Backend Requirements

- Python 3.8+
- pandas, openpyxl, numpy

## Installation

### Backend Setup

```bash
pip install -r requirements.txt
python parse_players.py  # Generate players-data.json
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Usage

### Frontend - Development

```bash
cd frontend
npm start
```

The frontend will open at `http://localhost:3000`. Participants can:

1. Enter their team name
2. Adjust bet values (±1, ±10 buttons)
3. Reorder roles by dragging
4. Reorder players by dragging
5. Download their selection as JSON
6. Import a previously saved selection

Selections are automatically saved to browser localStorage.

### Frontend - Production Build

```bash
cd frontend
npm run build
```

Deploy the `build/` folder to a static hosting service.

### Backend - Running the Auction

Prepare participant selections in one of these formats:

**Option 1: JSON files** (recommended - output from frontend)
Place `<participant>.json` files in a folder:

```json
{
  "teamName": "AS Roma",
  "bets": [100, 80, 50, ...],
  "roles": ["A", "A", "A", "C", ...],
  "goalkeepers": ["Roma", "Milan", ...],
  "defenders": ["Player1", "Player2", ...],
  "centrals": ["Player3", "Player4", ...],
  "strikers": ["Player5", "Player6", ...]
}
```

**Option 2: Excel files** (legacy format)
Each file must have a sheet named "Offerta" with columns:

- B: bet (numeric)
- D: role (A/C/D/P)
- F: goalkeeper selection (team names)
- H: defender selection (player names)
- J: central selection (player names)
- L: striker selection (player names)

Run the auction:

```bash
python auction.py --input-folder /path/to/participants --seed 42
```

## Project Structure

```text
/
├── auction.py                 # Main auction script
├── parse_players.py          # CSV to JSON converter
├── requirements.txt          # Python dependencies
├── *.csv                      # Player data files
├── frontend/                 # React application
│   ├── src/
│   │   ├── App.tsx          # Main component
│   │   ├── types.ts         # TypeScript definitions
│   │   ├── components/      # React components
│   │   └── utils/           # Utility functions
│   ├── public/
│   │   └── players-data.json # Generated player data
│   └── package.json         # Frontend dependencies
└── README.md                # This file
```

## Frontend Components

- **BetList** - Manages bet values with increment/decrement buttons
- **RoleList** - Sortable list of player roles
- **PlayerList** - Sortable lists of players per role
- **SortableRoleItem** - Individual draggable role item
- **SortablePlayerItem** - Individual draggable player item

## Data Flow

1. CSV files are parsed to `players-data.json`
2. Frontend loads player data and displays interface
3. Participants build their selections via UI
4. Selections are downloaded as JSON files
5. Python script reads JSON files and runs auction
6. Final team assignments are printed

## Notes

- Bets must sum to ≤ 600 credits
- Bet values must be ordered (can't increase lower bets above upper bets)
- Roles cannot be reordered after auction starts
- All player data is pre-populated from CSV files
- For goalkeepers, only team names are used (no individual player names)

## Troubleshooting

### Frontend won't load

- Clear browser cache and localStorage
- Check that `public/players-data.json` exists
- Run `python parse_players.py` to regenerate

### Auction errors

- Verify JSON files have correct format
- Check that player names/teams match CSV exactly
- Use `--seed` parameter for reproducible results
