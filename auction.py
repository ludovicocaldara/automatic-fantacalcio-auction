#!/usr/bin/env python3
"""
Automated fantasy football auction as specified in prompt.txt

Reads Excel files named <participant>.xlsx or JSON files named <participant>.json in the given folder. 

For Excel files, each file must have a sheet named 'Offerta' with the following columns (Excel columns):
B: bet (numeric)
D: role (A/C/D/P)
F: goalkeeper selection (team names)
H: defender selection (player names)
J: central selection (player names)
L: striker selection (player names)

For JSON files, the format is:
{
  "teamName": "string",
  "bets": [number],
  "roles": ["A"|"C"|"D"|"P"],
  "goalkeepers": [string],
  "defenders": [string],
  "centrals": [string],
  "strikers": [string]
}

Outputs iteration logs and final teams to stdout.
"""

import argparse
import json
import os
import random
from collections import defaultdict, deque
import numpy as np
import pandas as pd

# Team composition targets
TARGET_GK = 3
TARGET_DEF = 8
TARGET_CEN = 8
TARGET_ATT = 6

ROLE_MAP = {
    'P': 'gk',
    'D': 'def',
    'C': 'cen',
    'A': 'att',
}

class Participant:
    '''class representing a participant in the auction'''
    def __init__(self, name, bets, roles, gk_sel, def_sel, cen_sel, att_sel):
        self.name = name
        # Use deque for efficient popleft
        self.bets = deque(bets)
        self.roles = deque(roles)
        self.gk_sel = deque(gk_sel)
        self.def_sel = deque(def_sel)
        self.cen_sel = deque(cen_sel)
        self.att_sel = deque(att_sel)

        # Current team
        self.gk_team = None  # one team string
        self.defs = []  # list of (player, price)
        self.cens = []
        self.atts = []

        # Favorited counter for tie-biasing
        self.favored_count = 0

    def needs_players(self):
        '''return True if the participant still needs players to complete their team'''
        # Check if team is complete
        need_gks = self.gk_team is None
        need_defs = len(self.defs) < TARGET_DEF
        need_cens = len(self.cens) < TARGET_CEN
        need_atts = len(self.atts) < TARGET_ATT
        return need_gks or need_defs or need_cens or need_atts

    def current_bet(self):
        '''return the current top bet or None if no bets left'''
        return self.bets[0] if self.bets else None

    def pop_bet(self):
        '''pop and return the current top bet or None if no bets left'''
        if self.bets:
            return self.bets.popleft()
        return None

    def pop_role(self):
        '''pop and return the current top role or None if no roles left'''
        if self.roles:
            return self.roles.popleft()
        return None

    def top_desired_for_role(self, role):
        '''return the top desired player/team for the given role or None if none'''
        # return the top candidate for the role or None if none
        if role == 'P':
            return self.gk_sel[0] if self.gk_sel else None
        if role == 'D':
            return self.def_sel[0] if self.def_sel else None
        if role == 'C':
            return self.cen_sel[0] if self.cen_sel else None
        if role == 'A':
            return self.att_sel[0] if self.att_sel else None
        return None

    def remove_player_from_selections(self, player_name):
        '''remove the given player/team from all selection lists'''
        # Remove player/team from all selection lists if present
        def _remove(dq):
            # remove all occurrences
            new = deque([x for x in dq if x != player_name])
            return new
        self.gk_sel = _remove(self.gk_sel)
        self.def_sel = _remove(self.def_sel)
        self.cen_sel = _remove(self.cen_sel)
        self.att_sel = _remove(self.att_sel)

    def assign_player(self, role, player_name, price):
        '''assign the given player/team to the team for the given role at the given price'''
        if role == 'P':
            self.gk_team = (player_name, price)
        elif role == 'D':
            self.defs.append((player_name, price))
        elif role == 'C':
            self.cens.append((player_name, price))
        elif role == 'A':
            self.atts.append((player_name, price))

    def current_counts(self):
        '''return current counts of assigned players per role'''
        return {
            'P': 1 if self.gk_team else 0,
            'D': len(self.defs),
            'C': len(self.cens),
            'A': len(self.atts),
        }

    def has_slot_for_role(self, role):
        '''return True if there is still a slot for the given role'''
        counts = self.current_counts()
        if role == 'P':
            return counts['P'] < TARGET_GK and self.gk_team is None
        if role == 'D':
            return counts['D'] < TARGET_DEF
        if role == 'C':
            return counts['C'] < TARGET_CEN
        if role == 'A':
            return counts['A'] < TARGET_ATT
        return False

def read_participants_from_folder(folder):
    '''read participant Excel and JSON files from the given folder and return list of Participant objects'''
    participants = []

    def get_col_data(df, col):
        vals = df[col].tolist()
        cleaned = [str(x).strip() for x in vals if not pd.isna(x)]
        return cleaned

    def read_from_json(path, name):
        '''read participant data from JSON file'''
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Validate required fields
            required_fields = ['bets', 'roles', 'goalkeepers', 'defenders', 'centrals', 'strikers']
            if not all(field in data for field in required_fields):
                print(f"Warning: {name} JSON missing required fields. Skipping.")
                return None

            bets = data.get('bets', [])
            roles = [r.upper() for r in data.get('roles', [])]
            gk = data.get('goalkeepers', [])
            defs = data.get('defenders', [])
            cens = data.get('centrals', [])
            atts = data.get('strikers', [])

            return Participant(name, bets, roles, gk, defs, cens, atts)
        except Exception as e:
            print(f"Failed to read JSON {path}: {e}")
            return None

    def read_from_xlsx(path, name):
        '''read participant data from Excel file'''
        try:
            # Read specific columns by position: B=1, D=3, F=5, H=7, J=9, L=11 (0-based)
            df = pd.read_excel(path, sheet_name='Offerta', usecols=[1,3,5,7,9,11], skiprows=1, header=None, engine='openpyxl')
            df.columns = range(len(df.columns))
        except (FileNotFoundError, pd.errors.ParserError, ValueError, KeyError) as e:
            print(f"Failed to read {path}: {e}")
            return None

        # bets: try to parse numbers; empty or non-numeric entries removed
        raw_bets = get_col_data(df, 0)
        bets = []
        for v in raw_bets:
            try:
                # allow comma as decimal or thousands - sanitize
                vv = str(v).replace(',', '.')
                num = float(vv)
                # if it's integral, cast to int
                if abs(num - int(num)) < 1e-9:
                    num = int(num)
                bets.append(num)
            except Exception:
                # ignore non-numeric
                continue
        roles = [r.upper() for r in get_col_data(df, 1) if str(r).strip()]
        gk = get_col_data(df, 2)
        defs = get_col_data(df, 3)
        cens = get_col_data(df, 4)
        atts = get_col_data(df, 5)

        return Participant(name, bets, roles, gk, defs, cens, atts)

    for fname in os.listdir(folder):
        if fname.startswith('~'):
            continue

        path = os.path.join(folder, fname)
        name = os.path.splitext(fname)[0]

        if fname.lower().endswith('.json'):
            participant = read_from_json(path, name)
            if participant:
                participants.append(participant)
        elif fname.lower().endswith('.xlsx'):
            participant = read_from_xlsx(path, name)
            if participant:
                participants.append(participant)

    return participants


def auction(participants, seed=None):
    '''run the auction among the given participants'''
    if seed is not None:
        random.seed(seed)
        np.random.seed(seed)

    # Map player/team -> (winner_name, price, role)
    assigned = {}

    # Helper to remove a player from all participants' selections
    def remove_from_all(player_name):
        for p in participants:
            p.remove_player_from_selections(player_name)

    round_count = 0
    # Keep track of participants with completed teams to announce only once
    completed_announced = set()

    # Continue while at least one participant still needs players
    while any(p.needs_players() for p in participants):
        round_count += 1
        # Find initial active participants
        initial_active = [p for p in participants if p.needs_players() and p.current_bet() is not None]
        if not initial_active:
            print("No active participants with remaining bets but some teams are incomplete. Exiting.")
            break

        # Advance roles for all initial active participants
        for p in initial_active:
            while p.roles:
                top_role = p.roles[0]
                # if they already filled that slot, pop it and continue
                if not p.has_slot_for_role(top_role):
                    p.pop_role()
                    continue
                # if top_role == 'P' and gk list empty, pop role
                if top_role == 'P' and not p.gk_sel:
                    p.pop_role()
                    continue
                # for others, if selection empty, pop role
                if top_role in ('D', 'C', 'A'):
                    if (top_role == 'D' and not p.def_sel) or \
                       (top_role == 'C' and not p.cen_sel) or \
                       (top_role == 'A' and not p.att_sel):
                        p.pop_role()
                        continue
                break

        # Filter to active with remaining roles
        active = [p for p in initial_active if p.roles]
        if not active:
            print("No active participants with remaining roles. Exiting.")
            break

        max_bet = max((p.current_bet() for p in active))
        contenders = [p for p in active if p.current_bet() == max_bet]

        print(f"\nIteration {round_count}: highest bet = {max_bet}")
        print("Active participants:", ", ".join(p.name for p in active))
        print("Next moves:")
        for p in active:
            role = p.roles[0]
            player = p.top_desired_for_role(role)
            print(f"  {p.name}: bet={p.current_bet()}, role={role}, player={player or 'None'}")
        print("Contenders:", ", ".join(p.name for p in contenders))

        valid_contenders = contenders  # all have valid top roles

        if not valid_contenders:
            print("No valid contenders for the highest bet (roles exhausted or no candidates). Removing these bets temporarily.")
            # To avoid infinite loop, pop the bet for those original contenders who had no valid roles
            for p in contenders:
                if p.current_bet() == max_bet:
                    popped = p.pop_bet()
                    print(f"Removed bet {popped} from {p.name} (no valid roles/candidates)")
            continue

        # Determine desired players for each valid contender
        desired = {}
        for p in valid_contenders:
            role = p.roles[0]
            player = p.top_desired_for_role(role)
            desired[p] = (role, player)

        # Group by desired player name (None as its own group)
        groups = defaultdict(list)
        for p, (role, player) in desired.items():
            groups[player].append(p)

        winners_this_round = []

        # For groups where player is None (no candidate despite checks), skip
        for player, group in groups.items():
            if player is None:
                # These contenders cannot win (no candidate); skip: remove their role to move on next round
                for p in list(group):
                    popped_role = p.pop_role()
                    print(f"{p.name}'s top role {popped_role} had no candidate; role removed.")
                continue

            if len(group) == 1:
                # unique desired player -> winner
                p = group[0]
                winners_this_round.append((p, desired[p][0], player))
            else:
                # collision: choose among those with lowest favored_count
                min_fav = min(p.favored_count for p in group)
                candidates = [p for p in group if p.favored_count == min_fav]
                chosen = random.choice(candidates)
                # increment chosen's favored counter
                chosen.favored_count += 1
                print(f"Collision for '{player}' among {', '.join([x.name for x in group])}; chosen: {chosen.name} (fav_count now {chosen.favored_count})")
                winners_this_round.append((chosen, desired[chosen][0], player))
                # losers in this group do nothing (they keep their bet/role)

        # Now check if winners have conflicting players between them (shouldn't, since grouped by player)
        # Process winners: assign players, pop bets/roles, remove player from others
        # Note: multiple winners can occur in same iteration (when unique desired players)
        for p, role, player in winners_this_round:
            current_bet_value = p.pop_bet()
            popped_role = p.pop_role()
            # assign
            p.assign_player(role, player, current_bet_value)
            # record assignment
            assigned[player] = (p.name, current_bet_value, role)
            # remove from all participants
            remove_from_all(player)
            print(f"Winner: {p.name} won '{player}' for role {role} at price {current_bet_value}")

        # Announce participants who completed teams this round
        for p in participants:
            if not p.needs_players() and p.name not in completed_announced:
                print(f"Participant {p.name} has completed their team.")
                completed_announced.add(p.name)

    # After loop, print final teams in requested order
    print("\n===== FINAL TEAMS =====")
    for p in participants:
        print(f"\nParticipant: {p.name}")
        if p.gk_team:
            print(f"Goalkeeper team: {p.gk_team[0]}, winning price: {p.gk_team[1]}")
        else:
            print("Goalkeeper team: None")
        # Defenders sorted desc by price
        defs_sorted = sorted(p.defs, key=lambda x: (-float(x[1]), x[0]))
        cens_sorted = sorted(p.cens, key=lambda x: (-float(x[1]), x[0]))
        atts_sorted = sorted(p.atts, key=lambda x: (-float(x[1]), x[0]))

        print("Defenders (by price desc):")
        for name, price in defs_sorted:
            print(f"  {name} - {price}")
        print("Centrals (by price desc):")
        for name, price in cens_sorted:
            print(f"  {name} - {price}")
        print("Strikers (by price desc):")
        for name, price in atts_sorted:
            print(f"  {name} - {price}")


def main():
    '''main function to parse arguments and run the auction'''
    parser = argparse.ArgumentParser(description='Run fantasy auction from Excel Offerta sheets')
    parser.add_argument('--input-folder', '-i', default='.', help='Folder containing participant .xlsx files')
    parser.add_argument('--seed', type=int, default=None, help='Random seed for tie-breaking')
    args = parser.parse_args()

    participants = read_participants_from_folder(args.input_folder)
    if not participants:
        print('No participant Excel files found in', args.input_folder)
        return
    print(f"Loaded participants: {', '.join(p.name for p in participants)}")
    auction(participants, seed=args.seed)

if __name__ == '__main__':
    main()
