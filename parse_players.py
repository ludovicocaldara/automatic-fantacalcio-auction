#!/usr/bin/env python3
"""
Parse CSV player files and generate JSON for the frontend.
"""

import json
import pandas as pd
from pathlib import Path

def parse_players_csv(csv_path):
    """Parse a player CSV file and return list of players."""
    df = pd.read_csv(csv_path)
    players = []
    for _, row in df.iterrows():
        players.append({
            "name": row["Nome"],
            "team": row["Squadra"],
            "value": int(row["Qt.A"])
        })
    return players

def parse_goalkeepers_csv(csv_path):
    """Parse goalkeeper CSV and return list of teams with their top goalkeeper value."""
    df = pd.read_csv(csv_path)
    # Group by team and get the max value for each team
    team_values = {}
    for _, row in df.iterrows():
        team = row["Squadra"]
        value = int(row["Qt.A"])
        if team not in team_values or value > team_values[team]:
            team_values[team] = value
    
    # Return as list of dicts sorted by value (descending)
    teams = [{"team": team, "value": value} for team, value in team_values.items()]
    teams.sort(key=lambda x: x["value"], reverse=True)
    return teams

def generate_players_json():
    """Generate all player data as JSON."""
    base_path = Path(__file__).parent
    
    data = {
        "strikers": parse_players_csv(base_path / "attaccanti.csv"),
        "centrals": parse_players_csv(base_path / "centrocampisti.csv"),
        "defenders": parse_players_csv(base_path / "difensori.csv"),
        "goalkeepers": parse_goalkeepers_csv(base_path / "portieri.csv")
    }
    
    # Write to frontend public folder
    frontend_path = base_path / "frontend" / "public" / "players-data.json"
    frontend_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(frontend_path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Generated {frontend_path}")

if __name__ == "__main__":
    generate_players_json()
