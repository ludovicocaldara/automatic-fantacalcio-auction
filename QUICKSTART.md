# Quick Start Guide

## Getting Started with the Fantacalcio Auction Frontend

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 14+ and npm (for development)

### Quick Start - Using the Frontend

1. **Start the Frontend Development Server**

   ```bash
   cd frontend
   npm start
   ```

   The app will open automatically at `http://localhost:3000`

2. **Enter Your Team Name**
   Type your fantasy team name in the text field at the top

3. **Manage Your Bets**
   - Click the ±1 and ±10 buttons to adjust bet values
   - The sum cannot exceed 600 credits
   - Bets must be ordered (decreasing from top to bottom)
   - Check the "Remaining Credits" counter

4. **Organize Your Roles**
   - Drag the role tiles to reorder them (A, C, D, P)
   - This determines the order in which you'll win players

5. **Organize Your Players**
   - Drag player tiles to reorder them within each role
   - Players are sorted by value by default
   - For goalkeepers, only team names are shown

6. **Save Your Selection**
   - Your selection is automatically saved to your browser
   - It persists even after closing the browser

7. **Download Your Selection**
   - Click the "📥 Scarica" (Download) button
   - This creates a JSON file with your complete selection
   - Share this file with the auction organizer

8. **Import a Previous Selection**
   - Click the "📤 Importa" (Import) button
   - Select a previously downloaded JSON file
   - Your selection will be restored

## Running the Auction

Once all participants have downloaded their selections:

1. **Collect JSON files** from all participants in a folder

2. **Run the auction:**

   ```bash
   python auction.py --input-folder /path/to/selections --seed 42
   ```

3. **View results** in the console output, which includes:
   - Detailed iteration logs
   - Who won each player and at what price
   - Final team compositions for each participant

## Features Explained

### Bet Management

- **Maximum Total**: 600 credits
- **Ordering Rule**: You can't make a lower bet higher than a higher bet
- **Increment Buttons**:
  - `-10`, `-1`: Decrease by 10 or 1
  - `+1`, `+10`: Increase by 1 or 10

### Drag and Drop

- **Roles**: Reorder which roles you prioritize
- **Players**: Reorder players within each role
- The number on the left shows the current ranking

### Data Persistence

- Selection is saved to browser localStorage
- No backend server needed
- Data persists across browser sessions
- You can manage multiple selections by downloading them

## Tips for Success

1. **Plan Your Formation**: Consider your 4-3-3 base formation (4 DEF, 3 CEN, 3 ATT, 1 GK)

2. **Budget Wisely**: 600 credits total - allocate more for key players you want

3. **Maintain Order**: Keep your bets in descending order to avoid mistakes

4. **Back Up Your Selection**: Download it regularly as backup

5. **Import Earlier Selections**: Use the import feature to build on previous work

## Troubleshooting

### My changes aren't saving

- Check that your browser allows localStorage
- Clear browser cache and try again
- Use a different browser if issues persist

### Players list is empty

- Make sure `parse_players.py` has been run
- Check that CSV files are in the root directory
- Refresh the page

### Import isn't working

- Verify the JSON file is from a valid export
- Check file format matches expected structure
- Try downloading and reimporting to validate

## File Locations

- **Frontend App**: `frontend/src/App.tsx`
- **Player Data**: `frontend/public/players-data.json` (auto-generated)
- **Auction Script**: `auction.py` (in root directory)
- **Player CSVs**: `attaccanti.csv`, `difensori.csv`, `centrocampisti.csv`, `portieri.csv`

Enjoy your auction! 🎉
