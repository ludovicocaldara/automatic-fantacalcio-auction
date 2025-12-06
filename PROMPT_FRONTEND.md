# Instruction for building the frontend

Based on README.md and PROMPT.md, we need to create a React frontend so that participants don't need to compile the excel manually, but the lists can be populated from a nice frontend.

## Data Collected in the Frontend

The ultimate goal of the frontend is to collect the ordered lists bets and roles selection, plus the ordered lists of defenders, centrals, strikers, and goalkeeper teams (the goalkeepers are not selected by their name, we just select the corresponding team).

## Pre-populated data

Once accessing the frontend for the first time, the participant is presented with:

- The bet selection, composed of 23 bets, is set to the following list initially:
  - 100, 80, 50, 40, 30, 30, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 5, 3, 1, 1
- The role selection, at the beginning will be in this order:
  - A, A, A, C, C, C, D, D, D, D, P, A, A, A, C, C, C, C, C, D, D, D, D (the first 11 compose a standard 4-3-3 selection, then the other players are taken.)
- The players lists are pre-populated with a static list composed of the players in the csvs:
  - attaccanti.csv contains the strikers
  - difensori.csv contains the defenders
  - centrocampisti.csv contains the centrals
  - portieri.csv has the goalkeepers
- for the goalkeepers, as explained, only display the distinct teams (no goalkeeper names) and are initially sorted by the value of the team's most valuable goalkeeper.

Each CSV has the same structure. We are interested in the name (Nome), team (squadra), value (Qt.A). The value is just an indicator and does not interfere with the actual bets. Again. for Goalkeepers we are only interested in team (squadra) and value (Qt.A)
In the final output, only the name is of our interest, but in the frontend we want to show the name (except for goalkeepers), team, and value to ease the selection.

## Persisting the data at every change and loading it when the frontend loads

At the beginning, the application checks if a custom selection has already been made and loads it accordingly. The selection is persisted in the browser's session (cookie?). If no existing customization exists, load the defauls as explained above.

At every change (team name, change of bets, role selection, player order for each role), the change is persisted so after a refresh of the page the changes are not lost (the application has no backend).

## Frontend look & feel

The frontend should look modern and reactive.

The player lists should be presented initially in order of player value if no customization exists, otherwise in the same order as specified by the previous customization. (one list for each role).

When browsed from a desktop I want:

- a Text field to enter the name of the user's selection (fanta squadra)
- The bet and role selection to be shown side-to-side so it's clear which role pertains to which bet.
- The bet selection is a list of non-sortable tiles containing the bet value that can be increased or decreased with 4 small buttons (-10, -1, +1, +10) appearing to the left and right of the tile (respectively the negative and positive increments). The following rules apply:
  - The sum of the bets can never exceed 600. If the user tries to increment a tile in a way that makes the sum greater than 600, nothing happens.
  - Tiles must always be ordered: you cannot increase a lower tile to a value higher than the tile above, and you cannot decrease a tile above to a value lower than a tile below it.
  - The rest of (600-sum(tile values)) is shown on a counter below the list ("Remaining credits".)
- The players lists per role are displayed below the two lists above.

- The players lists and the role list are shown as tiles and can be ordered using drag&drop. (This library looks great for that: https://clauderic.github.io/react-sortable-hoc/#/basic-configuration/basic-usage?_k=f59xkg)
- For the sortable lists, on the left of each tile there's a number that shows the actual ranking in that list.
  - e.g. I can have:
    - 1. name1
    - 2. name2
    - 3. name3
    and if the user drags name3 on the first place, I'll have:
    - 1. name3
    - 2. name1
    - 3. name2

- The players tiles display the following information:
  - Player's Name (Team) - Value
  except for the goalkeeper tile that shows:
  - Team (most valuable goalkeeper for that team) - Value (of its most valuable goalkeeper). Don't show the same team twice.
- On the top and on the bottom of the page, a "Download selection" button allows to download the current selection as a JSON. Next to "Download", another "Import" button allows to import a previously downloaded JSON.

## Features of the frontend

The frontend has no backend. The selection is stored in the participant's browser and not persisted outside of it, except for the download action. Participants returning to the site with the same device can see the last changes they made.

## Changes to the backend

The auction python script should now allow both .xlsx and .json files to to the final auction.