# Instruction for building the frontend

Based on README.md and PROMPT.md, we need to create a React frontend so that participants don't need to compile the excel manually, but the lists can be populated from a nice frontend.

## Data Collected in the Frontend

The ultimate goal of the frontend is to collect the ordered lists of goalkeepers (we collect the team names for that, not the individual players), defenders, centrals, and strikers, along with the bet selection and the role selection.

## Pre-populated data

Once accessing the frontend for the first time, the participant is presented with:

- The bet selection, composed of 23 bets, has every bet set to 26 initially. That makes the total bets 598 (remainder of 2).
- The role selection, at the beginning will be in this order:
  - A, A, A, C, C, C, D, D, D, D, P, A, A, A, C, C, C, C, C, D, D, D, D (the first 11 compose a standard 4-3-3 selection, then the other players are taken.)
- The players lists are pre-populated with a static list composed of the players in the csvs:
  - portieri.csv has the goalkeepers (group them by team and sort by the most valuable players in that team)
  - attaccanti.csv contains the strikers
  - difensori.csv contains the defenders
  - centrocampisti.csv contains the centrals

Each CSV has the same structure. We are interested in the name (Nome), team (squadra), value (Qt.A). The value is just an indicator and does not interfere with the actual bets.
In the final output, only the name is of our interest, but in the frontend we want to show the name, team, and value to ease the selection.

## Frontend look & feel

The frontend should look modern and reactive.

The player lists should be presented initially in order of pleayer value. (one list for each role).
When browsed from a desktop, I want:

- The bet and role selection to be shown side-to-side so it's clear which role pertains to which bet.
- The bet selection is a numeric, free input that can optionally be increased or decreased with 4 small buttons (+1, -1, +10, -10). The total can never exceed 600. The rest is shown on a counter below that list ("Remaining credits".)
- The players selections per role are displayed below the two lists above.
- The players selections and the role lists are shown as tiles and can be ordered using drag&drop. (This library looks great for that: https://clauderic.github.io/react-sortable-hoc/#/basic-configuration/basic-usage?_k=f59xkg)
- The players tiles display the following information:
  - Player's Name (Team) - Value
- On the top and on the bottom, a "Download selection" button allows to download the current selection as a JSON. Next to "Download", another "Import" button allows to import a previously downloaded JSON.

## Features of the frontend

The frontend has no backend. The selection is stored in the participant's browser and not persisted outside of it, except for the download action. Participants returning to the site with the same device can see the last changes they made.

## Changes to the backend

The auction python script should now allow both .xlsx and .json files to to the final auction.