# Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client-Side)                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │         React Frontend Application                    │    │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐ │    │
│  │  │   BetList    │  │  RoleList   │  │ PlayerLists  │ │    │
│  │  │  Component   │  │  Component  │  │  (4 roles)   │ │    │
│  │  └──────────────┘  └─────────────┘  └──────────────┘ │    │
│  │                                                        │    │
│  │  ┌──────────────────────────────────────────────┐    │    │
│  │  │    State Management & localStorage           │    │    │
│  │  │    (utils/storage.ts)                        │    │    │
│  │  └──────────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
              ↓                                    ↓
        ┌──────────────────────────────┬──────────────────┐
        │                              │                  │
   Download Selection           Import Selection     View Data
   (Save as JSON)               (Load JSON)       (players-data.json)
        │                              │                  │
        ↓                              ↓                  ↓
    ┌─────────────────────────────────────────────────────────┐
    │            File System & Data Files                      │
    │  ┌──────────────┐  ┌─────────────────┐ ┌─────────────┐  │
    │  │ *.json files │  │ players-data.   │ │ *.csv files │  │
    │  │ (downloaded  │  │ json            │ │ (source)    │  │
    │  │  selections) │  │                 │ │             │  │
    │  └──────────────┘  └─────────────────┘ └─────────────┘  │
    └─────────────────────────────────────────────────────────┘
              ↑
              │
    ┌─────────────────────────────────────────┐
    │  Python Backend: auction.py             │
    │  ┌─────────────────────────────────────┐│
    │  │ 1. Read JSON/XLSX files             ││
    │  │ 2. Parse into Participant objects   ││
    │  │ 3. Run auction algorithm            ││
    │  │ 4. Output final team assignments    ││
    │  └─────────────────────────────────────┘│
    └─────────────────────────────────────────┘
```

## Component Architecture

### React Components

```
App (Root)
├── Header Section
│   ├── Team Name Input
│   ├── Download Button
│   └── Import Button
├── Bets & Roles Section (Side-by-side)
│   ├── BetList
│   │   └── [BetItem, BetItem, ...]
│   └── RoleList (Sortable)
│       ├── SortableRoleItem (draggable)
│       ├── SortableRoleItem (draggable)
│       └── ...
└── Players Section (Grid)
    ├── PlayerList (Strikers)
    │   ├── SortablePlayerItem (draggable)
    │   ├── SortablePlayerItem (draggable)
    │   └── ...
    ├── PlayerList (Centrals)
    │   └── [SortablePlayerItem, ...]
    ├── PlayerList (Defenders)
    │   └── [SortablePlayerItem, ...]
    └── PlayerList (Goalkeepers)
        └── [SortablePlayerItem, ...]
```

### Data Flow

```
┌──────────────────────────────────────────────────────────┐
│ 1. INITIALIZATION                                        │
│    fetch('/players-data.json')                          │
│         ↓                                                │
│    setPlayersData() → state update                       │
│    loadSelection() from localStorage                     │
│         ↓                                                │
│    If no saved state, create defaults                   │
│    saveSelection() to localStorage                       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 2. USER INTERACTION                                      │
│    BetList change → handleBetChange()                    │
│         ↓                                                │
│    Validate (ordering, max 600)                         │
│         ↓                                                │
│    Update state → setSelection()                         │
│         ↓                                                │
│    saveSelection() to localStorage                       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 3. DRAG & DROP                                           │
│    User drags item in list (Role or Player)             │
│         ↓                                                │
│    @dnd-kit detects drag                                │
│         ↓                                                │
│    handleDragEnd() → arrayMove()                         │
│         ↓                                                │
│    Update state → setSelection()                         │
│         ↓                                                │
│    saveSelection() to localStorage                       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 4. DOWNLOAD                                              │
│    User clicks Download button                           │
│         ↓                                                │
│    handleDownload()                                      │
│         ↓                                                │
│    Create JSON blob with selection                       │
│         ↓                                                │
│    Trigger file download                                │
│    (filename: teamName.json or default)                 │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 5. IMPORT                                                │
│    User clicks Import button                             │
│         ↓                                                │
│    handleImport() → FileReader                           │
│         ↓                                                │
│    importSelection() → validate JSON                     │
│         ↓                                                │
│    setSelection() → restore state                        │
│         ↓                                                │
│    saveSelection() to localStorage                       │
└──────────────────────────────────────────────────────────┘
```

## State Management Strategy

### SelectionState Type
```typescript
interface SelectionState {
  teamName: string;              // User's team name
  bets: number[];               // 23 bet values
  roles: ('A'|'C'|'D'|'P')[];   // 23 roles
  strikers: string[];           // Player names (ordered)
  centrals: string[];           // Player names (ordered)
  defenders: string[];          // Player names (ordered)
  goalkeepers: string[];        // Team names (ordered)
}
```

### Storage Layer (utils/storage.ts)
- **saveSelection()**: Persists to localStorage
- **loadSelection()**: Retrieves from localStorage
- **createDefaultSelection()**: Creates initial state
- **downloadSelection()**: Exports to JSON file
- **importSelection()**: Validates and imports JSON

### Persistence Strategy
- Every state change triggers `saveSelection()`
- localStorage is queried on app mount
- If data exists, use it; otherwise use defaults
- All changes are immediately persisted

## Validation Rules

### Bet Management
```
1. Sum Rule
   ┌─ bets.reduce((a,b) => a+b) <= 600

2. Ordering Rule
   ┌─ bets[i] >= bets[i+1] (descending order)
   └─ Cannot increase lower bet above higher bet

3. Non-negative Rule
   └─ All bets >= 0
```

### Input Validation
```
On Change:
├─ Validate new value doesn't break ordering
├─ Validate total doesn't exceed 600
├─ Apply change if valid
└─ Update state if changed

Feedback:
├─ Remaining credits displayed in real-time
├─ Total sum shown
└─ Button click has no effect if invalid
```

## Drag & Drop Implementation

### Libraries
- **@dnd-kit/core**: Core drag-drop functionality
- **@dnd-kit/sortable**: Sortable list support
- **@dnd-kit/utilities**: Helper utilities

### Integration
```typescript
// In RoleList and PlayerList components:

1. useSensors() → Configure pointer & keyboard
2. DndContext → Wrap sortable lists
3. SortableContext → Manage list state
4. useSortable() → Enable drag on items
5. arrayMove() → Reorder on drop
6. onDragEnd() → Handle drop event
```

### Interaction Flow
```
User presses item
    ↓
Pointer detected (PointerSensor)
    ↓
DndContext notifies drag start
    ↓
Item opacity reduced (visual feedback)
    ↓
User moves pointer
    ↓
closestCenter collision detection
    ↓
Preview shows drop location
    ↓
User releases pointer
    ↓
onDragEnd() triggered
    ↓
arrayMove() reorders items
    ↓
setState() updates view
    ↓
saveSelection() persists change
```

## Backend Integration

### JSON File Format
```json
{
  "teamName": "string",
  "bets": [number, ...],
  "roles": ["A"|"C"|"D"|"P", ...],
  "goalkeepers": [string, ...],    // Team names
  "defenders": [string, ...],       // Player names
  "centrals": [string, ...],        // Player names
  "strikers": [string, ...]         // Player names
}
```

### auction.py Processing
```python
# New JSON reading function:
def read_from_json(path, name):
    with open(path, 'r') as f:
        data = json.load(f)
    
    # Validate fields
    required_fields = ['bets', 'roles', 'goalkeepers', 
                       'defenders', 'centrals', 'strikers']
    
    # Extract and create Participant
    return Participant(
        name,
        data['bets'],
        data['roles'],
        data['goalkeepers'],
        data['defenders'],
        data['centrals'],
        data['strikers']
    )

# Updated read_participants_from_folder:
for file in directory:
    if file.endswith('.json'):
        participant = read_from_json(path, name)
    elif file.endswith('.xlsx'):
        participant = read_from_xlsx(path, name)
```

## Performance Optimizations

### Frontend
- **React.memo**: Prevent unnecessary re-renders of components
- **useMemo**: Cache computed values (player lists)
- **useCallback**: Memoize event handlers (if added)
- **Lazy Loading**: Players data loaded once on mount

### Data Persistence
- **Debounced Saves**: Could be added for frequent updates
- **LocalStorage**: Instant access without network latency
- **Efficient JSON**: Only send required fields on download

### Build Size
- Production build: ~80KB gzipped (React + dnd-kit)
- CSS: ~2KB gzipped
- Players data: ~40KB (loaded once)

## Error Handling

### Frontend
```typescript
// File loading
try {
    const response = await fetch('/players-data.json');
    if (!response.ok) throw new Error(...);
    const data = await response.json();
} catch (err) {
    setError(err.message);
    // Display error state
}

// File import
try {
    const imported = await importSelection(file);
    // Validate structure
} catch (err) {
    alert('Errore: ' + err.message);
}
```

### Backend
```python
# JSON validation
if not all(field in data for field in required_fields):
    print(f"Warning: {name} JSON missing fields")
    return None

# File parsing
try:
    with open(path, 'r') as f:
        data = json.load(f)
except Exception as e:
    print(f"Failed to read {path}: {e}")
    return None
```

## Browser Compatibility

### Required Features
- ES2015+ JavaScript support
- LocalStorage API
- Fetch API
- FileReader API
- Blob API
- URL.createObjectURL()

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Deployment Considerations

### Frontend
```bash
# Build production version
npm run build

# Output: frontend/build/
# Deploy to: Static hosting (Vercel, Netlify, S3, etc.)

# Configuration
- No environment variables needed
- CORS not required (client-side only)
- Works offline after first load
```

### Backend
```bash
# Run locally or on server
python auction.py --input-folder ./selections --seed 42

# Requirements
- Python 3.8+
- pandas, numpy, openpyxl installed
- Read access to JSON/XLSX files
- Write access to console
```

## Security Considerations

### Data Privacy
- All data stays in user's browser (no transmission)
- JSON downloads are plaintext (not encrypted)
- No external API calls
- No cookies or tracking

### Input Validation
- Frontend validates all user inputs
- Backend validates imported JSON format
- No arbitrary code execution
- File names sanitized before saving

### Browser Storage
- Uses browser's localStorage (domain-specific)
- Not accessible to other sites
- Can be cleared by user
- Persists across sessions

---

**Document Version**: 1.0  
**Last Updated**: December 6, 2025  
**Technology Stack**: React 19, TypeScript 5, @dnd-kit, Python 3.8+
