# AI-driven solo adventures

Status: reviewed design proposal; implementation has not started.
Reviewed: 2026-10-24.

This document records the proposed architecture, the weaknesses found during
review, and the decisions needed before implementation. It is a durable reference,
not a claim that campaign play or a complete fifth-edition rules engine exists.
Provider choice, supported mechanics, and the first adventure still need approval.

## 1. Core design

The server owns the world state. The AI interprets actions and writes narration
using context assembled from that state. Generated prose, conversation history,
and model memory never directly change HP, inventory, movement, or quest progress.

Each turn combines an immutable adventure definition, the current campaign save,
relevant events and memories, and the player's action. An engine validates and
resolves the action. The AI narrates the resulting facts.

This should work with ordinary model APIs. It does not require training a model,
a separate agent for every NPC, or sending the whole campaign on every request.

## 2. Weaknesses found in the initial proposal

| Weak point | Decision |
| --- | --- |
| Narration can fail after a successful action | Commit resolved mechanics first; narration is a recoverable presentation step with a factual fallback. |
| Retrying can award items or roll dice twice | Deduplicate actions, persist outcomes, and return the existing turn on retries. |
| Two tabs can act on different versions of the world | Use a campaign version, one active turn per campaign, and conditional commits. |
| A crashed worker can leave the campaign locked | Persist turn status and a renewable lease; fence out expired workers and recover unfinished turns. |
| Character data can exist in two places | Separate the roster character template from the campaign actor's live sheet. |
| AI can invent consequential items, NPC promises, or clues | Establish an explicit canon policy; require typed, validated proposals for lasting additions. |
| A summary can forget a debt or overwrite a fact | Keep important facts in structured records; summaries remain derived context. |
| The narrator can reveal secrets | Build separate private planning, NPC knowledge, and player-facing contexts. |
| NPCs can know events they never witnessed | Track knowledge and its cause separately from objective truth. |
| An apparently small feature becomes a full RPG engine | Start with a defined action/rules subset and one short adventure. |
| The main quest can become impossible after one failed check | Author alternative paths, retry conditions, and fail-forward consequences. |
| JSON/schema validation appears to guarantee good narration | It guarantees structure, not truthful prose; retain UI facts, fallback narration, and playthrough checks. |

## 3. Requirements and first scope

A player should be able to start a solo campaign, choose a character, explore
connected locations, inspect objects, speak with NPCs, make supported checks,
change inventory, and progress a short quest. Closing the browser or restarting
the server must preserve the exact committed world and recorded outcomes.

Use the existing dark game UI: scene/map in the center, live character sheet,
nearby interactables, quest information, an adventure log, and an action composer.
Buttons and typed actions go through the same server action pipeline.

The first adventure should have roughly five to eight locations, a few NPCs,
one main quest, and a small number of optional discoveries. It needs at least
two viable approaches to important obstacles and an ending that can be reached
without following one exact conversation script.

Start with a location graph and authored scene assets. Locations have explicit
exits, access conditions, and reachable objects. Defer tile-based movement,
line-of-sight simulation, autonomous NPC societies, multiplayer turn arbitration,
and generated artwork on every turn.

Do not promise full fifth-edition combat in the first release. Enumerate the
supported checks, spells, resource changes, and encounter rules before building.
Unsupported actions need a useful explanation or clarification, not fabricated
mechanics. An eventual combat phase must define initiative, movement, action
costs, targeting, damage, saving throws, and resource use together.

Local setup, rules lookup, and viewing saved campaigns remain offline-capable.
Cloud AI narration requires connectivity and configured server credentials.
Existing saves remain available if AI is unavailable. A mock provider should
support local development and deterministic tests without network access.

## 4. Adventure definitions

Store authored adventures as versioned JSON plus prose and local asset references.
Every location, NPC, quest, item instance, and interactable has a stable ID.

| Definition | Required information |
| --- | --- |
| Adventure | Premise, opening situation, tone, supported level/rules, starting state, endings |
| Location | Description, exits, accessibility, scene/map assets, encounter references |
| Interactable | Visibility, reachability, current-state defaults, supported interactions, consequences |
| NPC | Goals, personality, starting location, knowledge, secrets, dialogue constraints, story stages |
| Quest | Stages, transition predicates, objective IDs, rewards, failure/alternative paths |
| Encounter | Trigger, participants, supported resolution rules, outcomes |
| Development | Preconditions, resulting events, world-time or action trigger |

Write situations and motivations rather than a mandatory sequence of scenes.
Quest rewards and decisive clues must be explicit. AI dialogue can vary how an
NPC expresses a known fact, but cannot silently replace that fact.

Validate definitions before starting a campaign: references resolve, IDs are
unique, graph connections exist, starting states are legal, transitions have
valid targets, and declared rewards reference supported items. Playtest paths
through locks, NPC death, consumed quest items, and failed checks.

Pin each campaign to an adventure revision/content hash and an engine/rules
version. Keep that content available for existing saves. Updating repository
adventure files must not silently rewrite an active campaign. Save migrations
must be explicit and backed up.

## 5. Canon and improvisation

Treat the following as persistent canon: entity identity/location, exits,
physical access, item ownership/counts, mechanical resources, established clues,
NPC knowledge, obligations, quest stages, and resolved events.

The AI may freely vary non-consequential presentation: phrasing, sensory detail,
and an NPC's manner of speaking within its authored characterization.

A lasting invention needs an allowed proposal with a stable server-assigned ID,
a cause, visibility, and validated effects. A minor NPC promise is still state:
record it as an obligation instead of trusting the conversation to preserve it.
Do not allow arbitrary JSON patches, SQL, invented spell effects, new exits, or
valuable items through free-form narration.

For version one, keep improvisation narrow. Novel actions can be mapped to
supported intents or a bounded check proposal. The server chooses/validates the
applicable skill, difficulty policy, allowed outcome, resource cost, and target.
If adjudication is ambiguous or consequential, ask a specific clarification.

No text-only validator can prove that rich narration never contradicts canon.
Keep mechanics visible in the UI, exclude unsupported facts from narration
context, constrain output, and use factual templates for sensitive reveals and
failure recovery. More elaborate improvisation remains a later design decision.

## 6. State, knowledge, and character ownership

The campaign save is authoritative. Use typed structures rather than growing
`customData` into an unvalidated collection of flags.

```ts
interface CampaignState {
  schemaVersion: number;
  worldTurn: number;
  worldTimeMinutes: number;
  activeActorId: string;
  locationId: string;
  entities: Record<string, EntityState>;
  quests: Record<string, QuestState>;
  npcs: Record<string, NpcState>;
  discoveries: DiscoveryState;
  obligations: ObligationState[];
}
```

The names above describe a proposed contract, not existing repository types.
Store the optimistic concurrency version in a database column so commits can
compare it atomically. State also records the last committed event sequence.

Maintain three separate concepts:

- Objective truth: the gate is locked and a warden is behind it.
- Player knowledge: the gate is visible; the warden has not been discovered.
- NPC knowledge/belief: the warden heard a noise but does not know who made it.

Knowledge changes have causes: observation, a report, inference from an allowed
rule, or an authored trigger. Beliefs may be wrong without changing world truth.
NPC story progression should use named stages and obligations; a single
friendliness score is not enough.

Use the existing `characters` row as a roster/build template. At adventure start,
create a campaign actor with a validated copy of the starting sheet. Its runtime
sheet becomes the authority for HP, inventory, conditions, spell slots, and
progression in that playthrough. Do not also update a competing live sheet on
the template. The campaign page must display the actor's sheet.

The existing schema has one `characters.campaign_id`. Version one should enforce
one active campaign binding per character and make the template/runtime
relationship explicit. Multiple simultaneous runs and exporting progression
back to the roster need a later policy; do not assume they already work.

Existing character data may omit fields or contain values outside the intended
adventure rules. Validate starting sheets, identify missing/defaulted fields,
and request correction where necessary. Never silently alter a player's build.

## 7. Action and turn lifecycle

A client submits a request ID, expected campaign version, and action text or a
structured interaction. The server derives identity from Better Auth and checks
ownership, solo mode, actor membership, and access. Never trust client-supplied
stats, rolls, quest stages, target visibility, or claimed ownership.

### A. Reserve the request

In a short transaction, deduplicate `(campaign_id, request_id)` and store a hash
of the submitted action. Reusing an ID with different content is a conflict.
An existing request returns its stored result or current status.

Check the expected version and claim the campaign's single active-turn slot.
Use a persisted lease with an ownership/fencing token. An in-memory mutex is
insufficient across restarts or multiple server processes. A stale tab receives
a conflict and refreshes; do not silently execute its action against a new scene.

### B. Interpret and validate

Build bounded context from the pinned definition and current save. Ask the AI
for a schema-constrained intent using known IDs and allowed action types.
Validate it with Zod and engine checks. Reject malformed/unsupported output or
request clarification with no mechanical changes.

Compound input such as “open the chest, drink the potion, and attack” needs an
explicit policy. Version one resolves one consequential action at a time and
asks the player to choose or confirm the first action. It must not silently
spend several turns or resources.

Persist the accepted intent so recovery does not reinterpret it differently.

### C. Resolve and commit mechanics

Resolve rules server-side, including randomness, time costs, resources, and
bounded causal triggers. Examples: opening a noisy gate alerts a nearby NPC;
spending ten minutes advances an authored clock. Avoid AI calls for routine
arithmetic, passive clock changes, and every off-screen NPC tick.

In one short transaction, verify the lease/fencing token and expected version,
then commit state, actor resource changes, ordered events, recorded rolls, and
the turn's `resolved` status. Increment the campaign version once. A conditional
version update must affect exactly one row or the transaction rolls back.

Never publish dice before they are durably recorded. Retries reuse committed
rolls/outcomes. A process that dies before any resolution commit may recompute
an unpublished result; it must never replace an already committed one.

Limit trigger chains and detect cycles. Define repeat-check policy: an unchanged
failed inspection cannot be farmed for fresh rolls without a meaningful new
approach, cost, or changed circumstance. Essential progress needs alternate paths.

### D. Narrate the resolved facts

Build player-safe narration context from the recorded resolution and the state
as of that turn. Generate dialogue and narration, then save the accepted text.
No additional effects are authorized by this response.

If generation fails, timeouts expire, or the output is invalid, publish a factual
engine-generated fallback and complete the turn. Mechanics remain committed.
Record that fallback delivery occurred so recovery returns the same response.
A “retry narration” operation must never rerun the action. Initially allow prose
regeneration only before the next consequential turn, to avoid rewriting facts
that later dialogue already references.

### E. Complete and deliver

All lifecycle writes, including narration and completion, must check current
lease ownership/fencing. Only the current owner may release the active slot.
Persist completion and release that slot. Return the public state/version,
public events, interaction choices, and narration. Until completion or fallback,
show a resolving state and reject overlapping actions rather than queueing stale
clicks. Reconnecting clients can query turn status using the same request ID.

Cancellation before the mechanical commit can stop the action. After that commit,
cancellation can stop generation but must deliver the committed outcome through
a fallback. It cannot mean “undo.” Undo/checkpoint branching is outside version one.

Never hold a SQLite transaction open during a model request. SQLite permits one
simultaneous writer, so leases and transactions must stay short. The provider
may charge for a request whose response was lost; exactly-once game effects do
not guarantee exactly-once external billing. Bound retries and record usage.

## 8. Context construction and memory

Construct context on the server each turn. Use explicit sections for instructions,
trusted state, authored content, quoted player input, memories, and resolved facts.
Treat player text, NPC speech, and retrieved prose as data rather than authority
to change the system's rules or reveal private information.

Always include the active actor's relevant capabilities/resources, current
location, reachable interactions/exits, relevant quests/obligations, current
world time, and a bounded recent event window. Include only the rules necessary
for the requested action, retrieved from the pinned local SRD version.

Retrieve older memories by campaign, entity/location/quest IDs, relevance, recency,
and significance. Important facts such as debts and promises are exact structured
lookups. Start with indexed SQLite queries; optional FTS can help narrative
search. A vector database is not a prerequisite and must not replace exact state.

Use separate context projections:

| Consumer | Context allowed |
| --- | --- |
| Intent planner / private director | Relevant private facts needed to propose permitted actions; no authority to reveal them |
| NPC dialogue | NPC identity/goals plus that NPC's knowledge and what is observable now |
| Player-facing narrator | Resolved public consequences and authorized revelations |
| Client/UI | Public state and explicitly discovered information only |

Omit hidden entities and facts entirely from client payloads; a `visible: false`
flag on a secret object still leaks it. Tool/intent proposals must not provide a
way to query arbitrary hidden IDs. Enemy inventories, full private saves, and
unfiltered event logs never belong in browser payloads.

Use a measured context budget. Exact actionable facts take priority over older
prose. Record selected context IDs and token usage so missing-context failures
can be diagnosed. Do not assume a larger context window fixes consistency.

Generate summaries asynchronously at scene boundaries or after enough new events.
A summary records its source event range and is never canonical. If it is stale,
add the uncovered events; if it is missing or invalid, use exact facts and recent
events. Summary failure must not block play or roll back a committed action.

## 9. Persistence in this repository

Existing `campaigns.game_state` is a useful snapshot location, but `GameState` in
`server/db/types.ts` currently covers only a few combat/note fields. It does not
implement the proposed adventure model. Existing messages contain text and types;
they are a display log, not an adequate mechanical event history.

Proposed additions:

| Storage | Purpose |
| --- | --- |
| Adventure files / immutable revision registry | Definitions, schemas, content hash, asset/rules references |
| Campaign columns | Solo mode, adventure revision, engine/schema versions, state version, active-turn lease |
| `campaign_actors` | Template reference and authoritative per-run runtime sheet |
| `campaign_turns` | Request deduplication, action hash, accepted intent, lifecycle, outcome, narration, failure/usage metadata |
| `campaign_events` | Ordered typed events with turn/cause/entity references and visibility metadata |
| `campaign_summaries` | Derived summaries with source event ranges |

Store small entity/quest/NPC maps inside the typed snapshot initially. Normalize
specific parts later if query volume or contention warrants it. Do not build a
full event-sourcing framework first: the snapshot serves normal reads, and the
event ledger provides causality and recovery evidence.

Mechanical writes use the shared app connection and prepared statements in
existing datastore/service layers. Recheck schema constraints and foreign-key
settings; Better Auth uses a separate connection. Test backup/restore and save
schema migrations instead of assuming WAL alone makes every power loss harmless.

Proposed server responsibilities: adventure loading/validation, turn orchestration,
context building, rules resolution, visibility projection, and an AI provider
adapter. Keep provider request formats out of domain state and UI components.

Useful endpoint contracts include starting a solo run, reading public state,
submitting an action, and reading turn status. Each route enforces session and
campaign access. Plan the concrete URLs and response schemas during implementation.

## 10. Operational bounds

Use one provider adapter with a mock implementation first. Keep credentials and
private prompts server-side. Set input/output limits, call timeouts, retry caps,
turn-rate limits, and per-campaign usage accounting. Reject oversized input before
calling the provider. A malformed output gets a bounded repair attempt, not an
unlimited self-correction loop.

Interpretation and narration may normally require two calls. Supported structured
interactions can skip interpretation. Do not add reflection/planning calls for
every NPC every turn. Measure actual turn latency and cost before expanding scope.

For version one, return completed turn responses/status polling before introducing
provisional token streaming. Streaming text that implies an uncommitted or invalid
outcome creates another consistency problem. Later streaming must remain tied to
a recorded resolution and have clear handling for incomplete prose.

On restart, recover expired turns by persisted stage: resume accepted interpretation,
finish an uncommitted action only with valid ownership/version, or narrate/fallback
an already resolved turn. Never interpret a resolved request as a new action.
Use fencing tokens so an old worker cannot commit after its lease was reassigned.

## 11. Validation and acceptance criteria

Before a playable release, verify:

1. The same request submitted twice changes the world once and returns the same outcome.
2. The same request ID with different input is rejected.
3. Competing tabs cannot both spend a resource from the same state version.
4. A crash at each turn stage resumes without duplicating committed rolls/rewards.
5. An expired worker cannot overwrite a recovered turn.
6. Narration failure still returns the exact committed mechanical outcome.
7. Cancellation has distinct behavior before and after the resolution commit.
8. A player cannot inspect hidden objects, unrevealed exits, or another user's save through IDs or payloads.
9. An NPC cannot react to an event without an authored or recorded knowledge path.
10. Invalid intents cannot create items, teleport, alter arbitrary state, or consume unavailable resources.
11. Map clicks and equivalent typed actions use the same resolution rules.
12. A scene transition updates movement, time, NPC triggers, discoveries, and relevant quests together.
13. Quest rewards are awarded once, with alternate progress paths after failed checks.
14. Long-term obligations survive summary replacement and a new login.
15. All model calls can be mocked; local setup and saved-state viewing work offline.
16. Starting an adventure validates legacy character sheets and does not overwrite the roster template.
17. A save resumes with its pinned adventure/rules version after repository content changes.
18. A complete short adventure can be played, interrupted, resumed, and finished without a manual state repair.

Use deterministic fixture providers and supplied dice outcomes for engine/turn
contract tests. Test actual provider outputs through a small set of manual
playthroughs focused on ambiguity, secret leakage, and narrative contradictions.
Model prose will remain less predictable than the state machine; document failures
and keep important game facts explicit in the UI.

## 12. Implementation sequence

1. Approve the first adventure, action/rules subset, character policy, and provider budget.
2. Author and validate the adventure; create a deterministic non-AI engine slice.
3. Add actor saves, versioned turns/events, idempotency, recovery, and public projections.
4. Build the campaign page against the mock provider and saved world state.
5. Add bounded AI interpretation, adjudication, and narration through the adapter.
6. Add memory retrieval and derived summaries after a complete adventure works.
7. Add real-provider playthroughs, authoring checks, and failure recovery acceptance checks.
8. Consider combat, streaming, larger adventures, and multiplayer separately.

Do not start by building a general-purpose autonomous game master. The first
milestone is a small adventure whose state survives interruptions and whose
consequences remain consistent regardless of how the narrator phrases them.

## 13. Open decisions and remaining risks

- AI provider/model, expected turn latency, per-session budget, and deployment access limits.
- Exact fifth-edition rules subset, check difficulty policy, death/failure behavior, and supported spells.
- The first adventure's content, assets, authored alternative paths, and license notices.
- How much new NPC/quest content AI may propose after version one.
- Whether and how campaign progression can be copied back into roster characters.
- Local model support, save export/import, and a later multiplayer ownership model.

The architecture prevents many state and retry errors. It does not guarantee
that every generated sentence is coherent, entertaining, spoiler-free, or
consistent. Context projections, bounded improvisation, visible authoritative
facts, and playtesting reduce those risks; they do not eliminate them.

## References

- Repository evidence: `server/db/types.ts`, `server/db/migrations/001_initial.sql`,
  `server/db/connection.ts`, `server/datastores/message.datastore.ts`,
  `server/services/campaign.service.ts`, and `ROADMAP.md`.
- [SQLite transactions](https://www.sqlite.org/lang_transaction.html): transaction
  scope, concurrent writers, and busy handling.
- [SQLite FTS5](https://www.sqlite.org/fts5.html): optional local full-text retrieval.
- [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442):
  research on retrieving and summarizing agent memories. It motivates the memory
  layer; it does not establish correctness guarantees for this game's state engine.
