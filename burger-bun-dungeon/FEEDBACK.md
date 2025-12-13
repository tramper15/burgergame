# Feedback Tracking

## Format
- Keep feedback word-for-word
- Simple feature notes
- Status: Included/Not Included
- No verbose descriptions

---

## Feedback Log

### From Butter
**Feedback:** "Add an option to linger in silence (Just sad reflection text)"

**Status:** Included

**Implementation:** Added "Linger in Silence" choice to 8 scenes. Shows random sad reflections with melancholic text based on ingredient count.

---

**Feedback:** "If you linger in all the silences change the final screen to be more melancholy like the silences as a hand reaches towards you, you are now whole but at what cost."

**Status:** Included

**Implementation:** When all 5 unique silence messages are seen, ending changes to: "A hand reaches towards you. You are now whole. But at what cost? 🧈"

---

**Feedback:** "If you get the creepy ending but have the avocado it should be a good ending. The hand comes to you but goes away. You hear loud overhead ew."

**Status:** Included

**Implementation:** Added avocado to window_sill room in living_room. If player has avocado and triggers secret ending (lingered in all silences), the hand pulls back with "Ew" reaction overhead, resulting in a good ending where the player remains whole and free.

---

### From Katie
**Feedback:** "No meat Patty Scene - All ends go to your not a real buger if you don't ahve a meat patty"

**Status:** Included

**Implementation:** Added meat patty ingredient to hallway scene as a neutral ingredient (no synergy bonuses/penalties). If player reaches the ending without collecting the meat patty, they are sent to a special "not_a_real_burger" ending that shows all their collected ingredients with 0 points each, 0 base score, 0 synergies, and 0 total. The message reads "You gather yourself together, but something is wrong. Without a meat patty, you are not a real burger. You are incomplete. You are nothing."

---

### From James
**Feedback:** "It would be funny to die of dysentery somewhere along the way"

**Status:** Included

**Implementation:** Added bathroom off hallway with questionable water ingredient. If player takes the water and completes the game, they get a dysentery death ending with Oregon Trail reference: "You have died of dysentery. You should have caulked the wagon and floated it across." Questionable water has -5 points and negative synergy with all other ingredients.
