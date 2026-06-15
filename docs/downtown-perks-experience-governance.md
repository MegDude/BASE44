# Downtown Perks Final Experience Governance

This document overrides previous UI guidance when conflicts appear.

## Governing Philosophy

Start with the philosophy before applying any component, layout, copy, map, drawer, report, campaign, or partner rule:

[Downtown Perks Experience Philosophy V2](./downtown-perks-experience-philosophy-v2.md)

Downtown Perks is not software about downtown. It is a simpler way to experience downtown itself.

The product succeeds when someone forgets they are using software and simply feels like downtown became easier to use.

Every surface must answer:

```txt
What is happening?
Why does it matter?
What should I do next?
```

If a screen feels like a platform, simplify it. If a screen feels like software, simplify it. If a screen feels like a neighborhood guide, keep going.

## Rule Zero

Every component must answer one question:

```txt
What decision does this help someone make?
```

If the answer is unclear, the component should not exist.

## One Component, One Purpose

Do not combine search, filters, insights, metrics, recommendations, and actions in the same component.

Allowed structures:

```txt
Question -> Answer
Context -> Action
Story -> Meaning
```

## Map First

The map is the product. Everything supports the map. Nothing competes with it.

## AI First

The search console is the primary interface. It should feel like a conversation with downtown, not a database search.

The AI layer must never return database dumps, raw property descriptions, raw venue descriptions, raw event descriptions, or raw partner descriptions unless specifically requested.

Every answer must synthesize intent, timing, location, proximity, audience, relevance, saved state, and map context before responding.

## Map Answer Architecture

Every map answer follows:

```txt
Question
Best Answer
Why
Alternatives
Action
```

Answers must support decisions, not dump results.

## Entity Hierarchy

Rank entities by:

```txt
Immediate
Relevant
Nearby
Useful
```

before popularity, rating, or view count.

## Drawer Architecture

Every drawer follows:

```txt
Context
Story
Meaning
Primary Action
Related Places
Nearby
Next Best Action
```

Property, listing, residential building, and brokerage drawers must include an in-drawer interest flow:

```txt
Interested?
Name
Email
Phone
Move Timeline
Submit Interest
```

The map captures the lead. It must not rely on redirect-only contact flows.

## Surface Rules

Only three surface types are allowed:

```txt
Editorial Surface
Directory Surface
Glass Surface
```

Glass Surface is only for search, navigation, drawers, panels, and controls. Content and recommendations live on the white canvas.

## Typography And Spacing

Allowed type sizes:

```txt
10, 12, 14, 16, 20, 22, 28, 34, 42
```

Allowed spacing tokens:

```txt
8, 12, 16, 24, 32
```

Avoid arbitrary sizes and spacing in new components.

## Rollup Governance

Major surfaces must support expanded and condensed states:

```txt
Show More ->
Show Less ->
```

Only this wording is allowed.

## Future Component Audit

Before approving any new component, answer:

1. What decision does this help someone make?
2. Is it Editorial, Directory, or Glass?
3. Can it be removed without hurting the user?
4. Does it create a new visual language?
5. Does it reintroduce dashboard behavior?

If any answer fails, do not build the component.

## North Star

A user should never feel they are navigating software.

The map is not a feature. The map is the product.

The AI is not a chatbot. The AI is the guide.

The drawer is not a panel. The drawer is the explanation.

The search is not a filter system. The search is the conversation.
