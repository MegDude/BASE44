# Downtown Perks — Resident Governance Platform

## Product Requirements Document and Implementation Guide

Version: 2.0

Status: Experience specification

Audience: Product, design, content, engineering, civic partners, privacy, accessibility, and QA

Applies to: Downtown Perks residents, DANA, Downtown Austin Alliance, Waterloo Greenway, and future civic partners

## 1. Product decision

Build governance as a living civic experience, not a collection of forms.

Each consultation connects a resident question or observation to a place, a public conversation, a responsible organization, a decision, and a visible outcome.

```text
Campaign
→ Resident input
→ Place
→ Related questions and discussion
→ Human-reviewed AI analysis
→ Board and partner action
→ Resident update
→ Published outcome
```

Structured surveys remain available when comparable answers are needed. They are one input method inside a larger civic project.

## 2. Objective

Help a resident move from:

```text
I noticed something
→ I understand where it belongs
→ I can contribute without learning a government process
→ I can see who is responsible
→ I can follow what happens next
```

The experience must make participation useful even when a resident has only a minute. It must also support richer evidence, discussion, and follow-through when a resident wants to contribute more.

## 3. Product principles

1. **Place before paperwork.** Ask where something is happening when location improves the decision.
2. **Conversation before form logic.** Use plain follow-up questions instead of exposing branching rules.
3. **A visible next step.** Every submission shows who reviews it and what happens next.
4. **No dead-end participation.** Residents can follow an issue, project, question, meeting, or place after contributing.
5. **AI assists; people decide.** AI may organize, summarize, suggest, or detect similarity. It may not silently reject, rank, publish, or assign civic responsibility.
6. **Evidence stays traceable.** Summaries link back to the underlying, permission-appropriate source material.
7. **Confidence is explained.** Every generated theme, cluster, or recommendation shows its basis and limitations.
8. **Privacy is the default.** Public identity, exact home location, contact information, and photo metadata are never exposed by default.
9. **Accessible by design.** Every map task has an equivalent address, intersection, landmark, or list-based path.
10. **Progress is part of the product.** Residents should be able to see movement after a consultation closes.

## 4. Scope

### In scope

- Resident governance home
- Current consultations
- Multi-step surveys with branching
- Map-based issue and idea capture
- Civic conversation and question builder
- Similar-question detection and support
- Resident civic profile
- Followed projects, places, questions, and meetings
- Civic campaign timelines
- Meeting agendas, resident input, summaries, and actions
- Human-reviewed AI analysis
- DANA, DAA, and Waterloo Greenway work areas
- Resident notifications and public progress reports
- Moderation, consent, accessibility, analytics, and audit requirements

### Not in this volume

- Production database tables or migrations
- Final API endpoints
- Automated city-service requests
- Automated government records classification
- Binding votes or elections
- Identity verification beyond the existing resident account contract
- Public release of raw submissions
- AI-generated decisions, official minutes, or policy positions without approval
- Marketing-site implementation

## 5. Audiences and permissions

### Resident

Can discover, contribute, attach a place, support a similar question, follow progress, control attribution, and manage notifications.

### Anonymous visitor

Can read approved public campaigns, reports, meetings, and outcomes. Participation requires the appropriate consent and verification gate selected by the campaign owner.

### Civic editor

Can create campaigns, review submissions, correct AI categories, merge or separate suggested clusters, prepare reports, and publish approved updates.

### Board or committee member

Can review evidence, see resident questions tied to agenda items, record decisions and actions, and approve summaries within assigned organizations.

### Partner contributor

Can respond to assigned questions, add project updates, upload approved documents, and collaborate without seeing unrelated private resident data.

### Platform administrator

Can manage organizations, roles, safety escalations, retention rules, audit history, model configuration, and integrations. Admin access does not imply unrestricted reuse of resident data.

## 6. Resident information architecture

```text
Governance
├── For you
├── Consultations
├── Map
├── Questions
├── Projects
├── Meetings
└── Following
```

Mobile navigation must not add a sixth permanent bottom destination. Governance opens from Home, the resident profile, a relevant map moment, or an existing More destination. Inside Governance, use a compact section switcher or native push navigation.

## 7. Core resident journey

### Entry

A resident enters from a nearby project, building update, map result, notification, meeting, partner campaign, or Governance home.

The first screen answers:

1. What is happening?
2. Why does it matter here?
3. What can I do now?

### Contribution

The resident chooses one clear action:

- Answer a few questions
- Add a place to the map
- Ask a question
- Support an existing question
- Follow the project

### Confirmation

After contributing, show:

- What was received
- Whether it is private, shared with a named organization, or eligible for publication
- Who reviews it
- The expected next update
- A direct action to follow progress

### Return

The resident returns to a timeline showing reviewed, discussed, assigned, updated, and completed milestones. Never imply that submission guarantees implementation.

## 8. Screen requirements

### 8.1 Governance home

**Purpose:** See what needs resident input nearby and what has changed since the last visit.

**Order:**

1. One locally relevant priority
2. Current consultations
3. Questions gaining support
4. Projects near saved places or the resident's building
5. Upcoming meetings
6. Recent outcomes
7. Following

**Primary action:** `See what needs your input`

**States:** personalized, signed-out public, no nearby work, loading, unavailable, and notification-return.

Do not present an administrative dashboard or metric grid.

### 8.2 Consultation overview

**Purpose:** Understand the decision before being asked for input.

Required content:

- Specific title and place
- Organization responsible
- What is being considered
- What is already decided
- What resident input can still influence
- Closing date and estimated time
- Privacy and publication choices
- Timeline and next planned update

**Primary action:** `Share your perspective`

### 8.3 Resident survey

Use one decision per step. Show estimated time and meaningful progress.

```text
About 5 minutes
Step 2 of 6
```

Requirements:

- Back, save-and-return, and exit without losing completed answers
- Branching based on prior answers and campaign rules
- Review before submission
- Prefer not to answer for sensitive optional questions
- Explanation when a response opens a map, photo, or follow-up step
- No deceptive progress; hidden branches must not make progress move backward
- Screen-reader announcement when the step changes

### 8.4 Place step

**Prompt:** `Where is this happening?`

Residents may:

- Drop a pin
- Search an address or intersection
- Choose a nearby landmark
- Use current location after explicit permission
- Mark the report as area-wide
- Continue without a location when the campaign permits it

Categories:

```text
Accessibility
Construction
Crosswalk
Lighting
Noise
Traffic
Bike route
Development
Local business
Park or trail
Other
```

The map must explain why location is requested. Do not store continuous location history. Reduce precision for publicly displayed residential or sensitive submissions.

### 8.5 Photo and evidence step

Allow up to the campaign-defined limit. Before upload:

- Explain who can view the file
- Strip EXIF location metadata
- Check file type and size
- Scan for malware
- Warn against including faces, license plates, apartment numbers, or private information
- Provide an accessible text description field

AI may suggest an image description or category. The resident confirms it before submission.

### 8.6 Civic conversation

The resident writes naturally. The assistant may ask one relevant follow-up at a time.

Example:

```text
Resident: The curb is too steep for my chair near the crossing.

Assistant: Would you like to mark the crossing so the accessibility team can review the right place?
```

The assistant must not claim an issue is verified, promise a resolution, provide legal conclusions, or pressure the resident to disclose sensitive information.

Before submission, show the resident's original words separately from any suggested category or summary.

### 8.7 Civic question builder

Flow:

```text
Write a question
→ Choose or confirm a topic
→ Review similar questions
→ Support one or keep writing
→ Choose attribution
→ Submit
```

Duplicate suggestions must include the matched wording and why it appears related. Residents always retain `Submit my question separately`.

Support counts are not votes unless the campaign explicitly defines them as such. Explain who is eligible to support and how duplicate or abusive support is handled.

### 8.8 Question detail

Show:

- The approved public question
- Topic and place
- Support count with meaning
- Responsible organization or `Finding the right owner`
- Current status
- Related project, consultation, or meeting
- Official response when published
- Timeline

**Primary action:** `Support this question` or `Follow updates`

### 8.9 Resident civic profile

Use the resident-facing title `Your community activity`.

Sections:

- Contributions completed
- Topics the resident chose to follow
- Places and projects followed
- Questions supported
- Upcoming meetings saved
- Updates received
- Privacy and notification settings

Do not assign political labels, inferred ideology, vulnerability categories, or an opaque civic score.

### 8.10 Campaign timeline

Canonical public stages:

```text
Listening
Reviewing what we heard
Discussing options
Preparing a recommendation
Decision recorded
Work underway
Complete
Closed without action
```

Each milestone includes a date, owner, plain-language explanation, source link when public, and next expected update. Internal operational states must never leak into resident copy.

### 8.11 Meeting detail

Order:

1. Date, place, access information, and participation options
2. What will be discussed
3. Related projects and consultations
4. Approved resident questions
5. Agenda and supporting documents
6. After the meeting: approved summary, decisions, actions, and next dates

AI may create a draft summary and action list. A named human owner must approve it before publication. Official minutes remain clearly distinguished from a plain-language summary.

### 8.12 Resident report

Every closed consultation receives a public, readable report when appropriate:

- Who was invited and who participated
- What was asked
- What residents said
- Where responses came from at a safe level of geographic precision
- What the organization learned
- What will change
- What will not change and why
- What happens next
- Method, limitations, and publication date

Do not publish raw free text, exact private locations, or small demographic slices that could identify a person.

## 9. Shared interaction components

Use existing primitives before creating new ones. Governance-specific components may include:

- `ConsultationHeader`
- `ParticipationProgress`
- `QuestionStep`
- `PlacePicker`
- `EvidenceUploader`
- `AttributionChoice`
- `SimilarQuestionList`
- `CivicTimeline`
- `ResponsibilityRow`
- `ResidentUpdate`
- `SourceEvidenceDrawer`
- `AnalysisConfidence`
- `HumanReviewStatus`

All components use bright white primary surfaces, navy text, restrained gold accents, Inter for operational UI, minimum 44px targets, and one primary action per decision. Avoid bento layouts, pill filter systems, nested cards, decorative outlines, and gray content blocks.

## 10. State model

### Campaign

```text
Draft
Scheduled
Open
Paused
Analysis in review
Report ready for approval
Published
Closed
Archived
```

### Contribution

```text
Draft
Submitted
Consent check
Safety review
Accepted
Needs clarification
Combined with related input
Referred
Published in summary
Closed
Withdrawn
```

### Question

```text
Draft
Submitted
Under review
Open for support
Assigned
Scheduled for discussion
Answered
Closed
Archived
```

### Project update

```text
Draft
Awaiting approval
Published
Corrected
Withdrawn
```

Residents see plain-language equivalents and a correction history for material public changes.

## 11. AI experience contract

### Specialist capabilities

**Survey assistant:** Suggests questions and branches from the campaign purpose.

**Resident insights assistant:** Groups recurring themes and highlights underrepresented views.

**Meeting assistant:** Drafts summaries, action lists, newsletters, and resident updates.

**Accessibility assistant:** Identifies possible location clusters without diagnosing compliance.

**Communications assistant:** Adapts approved facts into channel-specific drafts.

**Governance guide:** Explains projects, meetings, responsibilities, and next steps to residents.

These may be separate prompts and permissions behind one coherent experience. Do not expose an unnecessary agent selector to residents.

### Required AI output contract

Every generated analysis includes:

- Purpose
- Source population and date range
- Included and excluded inputs
- Themes with counts, not invented percentages
- Representative excerpts only when consent permits
- Confidence: high, medium, or low
- Why that confidence applies
- Contradictory or minority perspectives
- Known limitations
- Suggested next actions
- Human reviewer and approval status

### Prohibited behavior

AI must not:

- Treat sentiment as resident intent
- Infer protected traits or political affiliation
- Suppress a submission only because it differs from a dominant theme
- Present a cluster as verified fact
- Fabricate support counts, locations, ownership, dates, or official positions
- Publish resident text or images without the applicable consent
- Make an official commitment
- Replace legally required meeting records or accessibility review

### Human review gates

Human approval is required before:

- Publishing an AI summary
- Assigning an external partner publicly
- Combining materially different questions
- Closing a high-support question
- Sending a broad notification
- Publishing a recommended action as an organizational commitment
- Exporting resident-level data

## 12. Map integration

Governance is a context layer in the existing resident map, not a separate map product.

Supported map objects:

- Consultation area
- Resident-reported location
- Public issue cluster
- Project boundary
- Meeting place
- Completed improvement

Map rules:

- Public clusters show aggregated counts and safe precision
- A single private submission never creates a public pin automatically
- Historic and resolved items remain distinguishable from active work
- Selecting an object opens one native sheet with explanation, evidence, status, and next action
- Filters remain contextual and temporary; do not add permanent organization tabs
- Map and list views provide equivalent participation paths

## 13. Organization experiences

### DANA

Priorities: board and committees, meetings, resident questions, consultations, neighborhood projects, transparency, approved documents, newsletters, and follow-through.

### Downtown Austin Alliance

Priorities: public realm, access, cleanliness, safety, business impact, transportation, district projects, partner coordination, and measurable progress.

### Waterloo Greenway

Priorities: trails, ecology, trees, construction, accessibility, volunteer work, events, public-space feedback, and project milestones.

Each organization receives its own content, permissions, responsible teams, service expectations, and reporting language. Do not create one generic civic workspace with a logo swap.

## 14. Board and partner review experience

The review view follows:

```text
What residents are telling us
→ Where it is happening
→ What is confirmed and unconfirmed
→ Which views differ
→ What needs a decision
→ Who owns the next step
→ What residents will be told
```

Required controls:

- Filter by campaign, place, topic, date, consent, and status
- Open underlying evidence within permission boundaries
- Correct AI categories
- Separate or combine suggested clusters with a reason
- Assign an owner and due date
- Link an item to a meeting, project, or partner
- Draft and approve a resident update
- Record no-action decisions with an explanation
- Export only permission-appropriate aggregates

## 15. Notifications

Residents choose email, push, or in-app delivery by topic and followed item.

Notification moments:

- Consultation opening or closing soon
- Submission reviewed or clarification requested
- Question receives an official response
- Followed project changes stage
- Related meeting scheduled
- Meeting summary published
- Final report published
- Material correction issued

Every notification states what changed and opens the exact relevant screen. Avoid engagement reminders without new information.

## 16. Privacy, consent, and moderation

Before submitting, residents choose:

```text
Private to the reviewing team
Anonymous in public reporting
Named in public reporting
```

Campaign owners may restrict choices when law or safety requires it, but the reason must be explained before contribution.

Requirements:

- Separate contact consent from participation consent
- Record the version of consent shown
- Allow withdrawal where applicable
- Apply retention rules by campaign and data class
- Redact personal information before analysis or publication
- Maintain an immutable audit trail for moderation and published corrections
- Provide abuse reporting and appeal paths
- Escalate credible threats or urgent safety issues under an approved policy
- Never market to residents from civic submissions without separate permission

## 17. Accessibility

- WCAG 2.2 AA minimum
- Full keyboard and switch access
- Screen-reader landmarks and step announcements
- Visible focus using the approved gold accent
- Reduced-motion support
- Text alternatives for every map interaction
- Address, intersection, or landmark input instead of mandatory pin placement
- Captions and transcripts for meeting media
- Accessible document alternatives for uploaded PDFs
- Error summaries plus field-level guidance
- No meaning conveyed by color alone
- Minimum 44px controls and safe-area-aware mobile layouts

Accessibility-related submissions must be reviewed by qualified people. AI clustering is decision support, not an accessibility determination.

## 18. Measurement

### Resident outcomes

- Residents who understand what input can influence
- Consultation completion rate by step
- Saved-and-returned participation
- Questions supported instead of unnecessarily duplicated
- Residents following an item after contributing
- Residents who receive a later outcome update
- Time from contribution to first meaningful update

### Civic outcomes

- Contributions reviewed within the stated period
- Questions assigned to a responsible owner
- Meetings connected to relevant resident input
- Published reports with clear next actions
- Actions completed or closed with an explanation
- Participation coverage across place and audience, reported with privacy-safe thresholds

Do not optimize for raw submission volume. High volume without review, response, or representative coverage is not success.

## 19. Analytics events

Track only what supports product quality and accountable follow-through:

```text
governance_opened
consultation_opened
consultation_started
consultation_step_completed
consultation_saved
consultation_submitted
place_added
evidence_added
similar_question_shown
question_supported
question_submitted
project_followed
meeting_saved
resident_report_opened
outcome_update_opened
notification_preference_changed
```

Events include campaign and organization identifiers, entry surface, and coarse place context where appropriate. They must not copy free text, exact sensitive coordinates, or uploaded evidence into general analytics.

## 20. Empty, loading, error, and safety states

Every core screen must specify:

- First use
- Nothing nearby
- Nothing currently open
- Draft saved offline or waiting to sync
- Upload in progress
- Location denied
- AI suggestion unavailable
- Similarity check unavailable
- Submission received but analysis delayed
- Campaign paused or closed while a resident is answering
- Content removed after moderation
- Service unavailable

Core participation must remain possible when AI is unavailable. AI failure may reduce assistance; it must not erase or block a valid resident submission.

## 21. Mobile interaction contract

- iPhone-first responsive behavior at 320, 375, 390/393, and 430px
- One scroll owner per screen or sheet
- No content behind the bottom dock
- Native push navigation for deep tasks
- A sheet only when the map must remain visible
- Compact controls; no oversized back or close buttons
- Persistent draft recovery after interruption
- Camera, photo library, and location permissions requested at the moment of use
- Upload progress that survives temporary network loss
- No PDFs or downloads required to complete a resident task

## 22. Content contract

Every resident screen follows:

```text
What this is
→ Why it matters here
→ What the resident can do
→ What happens after they act
```

Use `Share your perspective`, `Add this place`, `Ask your question`, `Support this question`, `Follow updates`, and `See what changed`.

Avoid `Submit payload`, `Open module`, `Engagement`, `Civic intelligence`, `Workflow`, `Ticket`, and `Case` in resident-facing copy.

Partner and board copy must describe decisions and responsibilities rather than algorithms or system features.

## 23. Delivery sequence

### Phase 1 — Experience prototype

- Governance home
- Consultation overview
- Multi-step survey
- Place picker and list alternative
- Question builder and similar-question choice
- Confirmation and following
- Timeline and resident report prototypes
- Complete mobile, accessibility, privacy, and failure-state testing

### Phase 2 — Human review prototype

- Contribution review
- Suggested theme correction
- Assignment and due dates
- Meeting linkage
- Resident update approval
- Audit and correction history

### Phase 3 — Technical design

Only after Phases 1 and 2 are approved:

- Canonical domain model
- Authorization matrix
- API contracts
- AI evaluation set and prompt/version registry
- Moderation and retention architecture
- Map aggregation and privacy thresholds
- Notification delivery contracts
- Integration boundaries for DANA, DAA, Waterloo Greenway, and city systems

### Phase 4 — Limited pilot

Launch one consultation with one organization, a named review team, published response expectations, and no automatic public AI output.

### Phase 5 — Expansion

Add meetings, partner collaboration, broader campaign templates, and additional organizations only after the pilot demonstrates review capacity and resident follow-through.

## 24. QA matrix

Verify:

- 320, 375, 390/393, 430px, tablet, and desktop
- Signed out, signed in, new resident, returning resident, and staff roles
- Keyboard, screen reader, reduced motion, high contrast, and 200% zoom
- Map permission accepted, denied, and unavailable
- AI available, slow, unsafe output, and unavailable
- Online, intermittent, offline draft, and recovered session
- Empty, loading, success, error, paused, closed, moderated, and corrected states
- Private, anonymous-public, and named-public consent paths
- No exact sensitive location or personal data in analytics, public reports, or AI prompts outside the approved boundary
- Source traceability for every published AI-assisted summary
- Human approval recorded for every public generated output

## 25. Release acceptance criteria

- A resident can understand a consultation before participating.
- A resident can complete the task without using a map or AI.
- Branching never exposes irrelevant questions.
- Progress is accurate and resumable.
- A resident can add a place and evidence with clear consent.
- Similar-question suggestions never remove the option to submit separately.
- The original resident contribution remains distinguishable from AI labels and summaries.
- Every submission explains who reviews it and what happens next.
- Every public analysis shows method, evidence, confidence, limitations, and approval.
- Every campaign has a named owner and response expectation before launch.
- Every meeting summary is approved by a person before publication.
- Every public map object meets aggregation and location-privacy rules.
- Every contribution can be traced through review, action, resident update, and closure.
- Governance adds no permanent sixth bottom-navigation destination.
- The interface remains consistent with the resident map and native mobile design system.

## 26. Decisions required before technical design

1. Which organization owns the first pilot and who is accountable for response times?
2. Which consultations permit anonymous participation?
3. What geographic and count thresholds are safe for public map clusters?
4. Which content may be published verbatim and under what consent?
5. What retention periods apply to drafts, submissions, photos, and analysis artifacts?
6. What constitutes an urgent safety escalation and who receives it?
7. Which meeting record is authoritative when an AI summary and official minutes differ?
8. How are residents notified when a contribution is merged, referred, corrected, or closed?
9. What service expectation can each partner realistically maintain?
10. Which measures demonstrate that participation changed understanding or action rather than only increasing activity?

## 27. North-star test

A resident should never feel that they submitted information into a system and lost sight of it.

They should understand the place, the decision, the people responsible, and the next visible step.
