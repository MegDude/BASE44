## Downtown Perks Homepage Operating Layer Instruction

This repo stays on the current Vite/Base44 architecture.

Do not rebuild this surface as a new Next.js app.
Do not create a second map system.
Do not turn the homepage into a static hero that leads somewhere else.

### Product rule

The homepage is the first live map state.

That means:
- the search field is the primary operating control
- the map is visible immediately
- prompt actions fill the search field and update the embedded map
- selection stays inside the same surface
- CTAs remain embedded in the user journey

### Required homepage behavior

- Show the approved homepage copy deck
- Keep the map and search in one visual surface
- Keep search UI and map engine separate in code
- Use plain-language prompts, not technical UI copy
- Use resident-friendly intent prompts such as:
  - Coffee now
  - Dinner tonight
  - Perk nearby
- Keep the current shared map stack and marker system
- Do not add page redirects for core map exploration from the hero

### Recommendation

Lock the current build, but upgrade the data and interaction layer before adding more visual polish.

Right now the product has a strong surface.
What it still needs is the decision layer:

- ranking
- radius
- intent
- clustering
- selection -> drawer behavior

The difference between a cool map and a useful city product is not more hero treatment.
It is whether the map can decide what matters now.

### Build order

1. Keep the homepage as the first live map state
2. Rank results by:
   - distance
   - category relevance
   - open now / live now state
   - perk value
3. Add a visible walk radius
4. Cluster pins when density rises
5. Keep marker click -> drawer, card click -> marker, new search -> clear selection

### Product standard

User expresses intent -> Ask the Map interprets it -> the map answers with ranked nearby choices.

That is the system to build.

### UX constraints

- mobile-first
- navy-led
- cool off-white surfaces
- restrained glass only where needed
- no warm beige drift
- no repeated boxed modules
- no decorative animation required for the hero to function

### Implementation note

The live hero field should communicate:

`What do you want to do right now?`

Prompt taps should:
- update the text field
- trigger Ask the Map behavior
- keep the result inside the embedded map surface

The helper line under the field should communicate, in plain language:

`Ask for what you want. We will show what is close, open, and worth going to.`
