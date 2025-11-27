# Fantasy Football Auction Automator

## What this is

A single Python script (`auction.py`) that reads each participant's Excel file (sheet `Offerta`) and runs an automated auction according to the rules in `prompt.txt`.

## Requirements

- Python 3.8+
- Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

Place every participant Excel file (`<participant>.xlsx`) in a folder. Each file must contain a sheet named `Offerta`. Columns must be arranged as follows (in the workbook columns):

- B: bet (numeric)
- D: role (A/C/D/P)
- F: goalkeeper selection (team names)
- H: defender selection (player names)
- J: central selection (player names)
- L: striker selection (player names)

Run the auction:

```bash
python auction.py --input-folder /path/to/folder --seed 42
```

## Output

- Iteration logs (who had best bet and what player/team they won). If ties occur, the decision path is printed.
- When a participant completes their team, a completion message is printed.
- Final teams are printed at the end in the requested order and sorted by winning price where applicable.

## Notes and assumptions

- Both the bet list and role list are expected to be provided in column order (top-to-bottom) and read as sequences. Empty cells are ignored.
- If a role in the role-selection points to an empty player list (no candidates left), the role entry is skipped.
- When multiple tied highest bets exist:
  - If their desired players (top choice for the role) are different, all those participants win simultaneously.
  - If two or more desire the same player/team, the winner is randomly chosen among the tied participants with the lowest "favorited" counter (a fairness counter). The winner's counter is incremented.
  - 
