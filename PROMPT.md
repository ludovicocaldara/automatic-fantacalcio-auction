# Fantasy Football Auction Automation

We are developing an algorithm to automate a fantasy football auction.

Each participant must complete a soccer team composed of 25 players:

- 3 goalkeepers - portieri (P)
- 8 defenders - difensori (D)
- 8 centrals - centrali (C)
- 6 strikers - attaccanti (A)

The participants have a total of 600 credits to complete the team.

One important aspect is that, while for all the other roles each player is selected individually, for the goalkeeper we only bet on the team it belongs to. The three goalkeepers of that team will be assigned to the participant.

To automate the auction, each participant splits the total credits into 23 bets (22 non-goalkeepers plus one team for the goalkeepers). We'll refer to it as the **bet selection**.

Each participant also has a preferred sequence of 23 roles that they want to win. We refer to it as the **role selection**.

For example, the bet list might be:

```text
100
80
50
40
30
30
20
20
20
20
20
20
20
20
20
20
20
20
20
5
3
1
1
```

while the role selection could be:

```text
A
P
A
C
C
A
D
D
A
C
C
C
D
A
D
C
A
D
D
C
C
D
D
```

The role selection shows in which order I want to bet for my best players. e.g., for the first bet I win, I want to get a striker (A), for the second the goalkeepers (P), then another striker, and so on.

Each participant also has four lists to order their preferences for the goalkeeper team (**goalkeeper selection**), the defenders (**defenders selection**), etc.

E.g, the defender selection might be:

```text
Dumfries
Dimarco
Gosens
Bastoni
Zortea
Angelino
Wesley
Cambiaso
Di Lorenzo
Bellanova
Bremer
Buongiorno
Zappacosta
Dodò
Estupinan
Tavares N.
Mancini
N'Dicka
Rrahmani
Solet
Carlos Augusto
Hien
Martin
Olivera
Valeri
Vasquez
Acerbi
```

(the number of players in a selection might be anywhere from the strict minimum to a hundred or more. Don't limit this selection).

Only the bet selection and role selection will be strictly 23.

## Specifying Selections

Here's how each participant specify their selections:

Each participant sent an Excel document with their selections. The participant's name is the Excel file name (without extension). In each Excel document, the sheet named "Offerta" contains the selections.

You will open each one and populate for each participant the 6 arrays with their selections: bet, role, goalkeeper, defender, central, striker. They are respectively on columns B, D, F, H, J, L.

## Auction Process

Now, here's how the auction takes place.

Take the participant that has the highest bet: he will be the one that wins the first choice:

- the first choice will be taken from the selection for the role that ranks highest in the participant's role selection. e.g. in the previous example, if 100 is the highest bet among the participants, you will get the role "A" (striker) as specified in the participant's role selection, so the player he wins will be his first striker in the striker selection. at that point:

  - you add the player to the team of the participant that won it
  - you remove the winning bet from the participant's bet selection so that at the next iteration he will use the next bet
  - you remove the first item in the role selection so that at the next iteration he will bet for the second role in the role selection
  - you remove the player from every participant's selection, as a player can only be assigned to one team

If there's a tie between two participants, verify if their preferred role and player collide. If not, each wins his favorite player. If they do collide, randomly pick a winner and increase a counter for that participant that says how many times he's been favorited. When other ties occur, randomly pick only among the participants that share the lowest number for this counter.

When a participant completes his team, continue with the remaining participants. Exit when all the teams are completed.

## Additional Instructions

- For each iteration, print who had the best bet and what player he won. If there's a tie, print the decision process to assign the players
- When a participant completes the team, print that the participant has completed the team. Don't print the resulting team straight away, we'll do that at the end.
- At the end, print, for each participant, his team in this order:
  - Goalkeeper team, winning price
  - List of defenders ordered by price descending, winning price
  - List of centrals ordered by price descending, winning price
  - List of strikers ordered by price descending, winning price

All this must be a single python script.

Don't alter any excel file. Just read them.
