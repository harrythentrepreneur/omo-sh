# Minecraft editorial roadmap

Updated: 2026-07-10

## Objective

Build a small, defensible body of Omo Notes that makes Omo Research useful at the intersection of Minecraft agents, embodied/spatial AI and voice presence—without inventing products, papers, experiments or hands-on experience.

The first success criterion is not traffic. It is a coherent cluster worth citing: each page answers a different question, cites original work, links to the next useful page and states its epistemic status.

## Publishing labels

Every page should show one label near the title:

- **Field guide:** maintained synthesis of public sources.
- **Reading note:** interpretation of named source material; no claim of replication.
- **Design hypothesis:** Omo's proposed model or question, explicitly untested.
- **Protocol:** a method published before use.
- **Experiment log:** only after Omo actually performs and documents the work.

Do not call a page a paper. Do not use “our research shows” unless Omo has published the method, observations and limitations.

## Phase 0 — foundation and editorial contract (week 0)

| Deliverable | What it contains | Exit condition |
|---|---|---|
| Notes hub at `/notes/` | Topic clusters, page labels, update dates and a short “how we know” explanation | Every note is reachable in two clicks from the home page |
| Source ledger | Title, author/org, publication date, canonical URL, access date, primary/secondary flag, claims supported | No factual claim ships without a ledger entry |
| Page template | Unique title/description/canonical, Article JSON-LD where accurate, author/reviewer, published/updated dates, sources, limitations, related notes | Template passes site SEO audit and mobile QA |
| Editorial disclosure | Omo Notes synthesize public work; Omo currently has no papers; AI assistance may be disclosed where material | Visible from Notes hub and reusable on every page |
| Measurement baseline | Search Console and Bing verification instructions; analytics decision; starting indexed-page count | Ownership access may remain manual, but setup is documented |

## Phase 1 — establish the category (weeks 1–2)

### 1. The Minecraft AI agents field guide

- **Route:** `/notes/minecraft-ai-agents/`
- **Label:** Field guide
- **Primary intent:** “minecraft AI agents”
- **Reader promise:** Understand the system families and choose the right next source in under ten minutes.
- **Outline:**
  1. What counts as an agent in Minecraft?
  2. The observation → memory → planning → action → verification loop.
  3. Five families: scripted bots, learned policies, LLM planners, dialogue/NPC systems, multi-agent environments.
  4. System map: Malmo, MineRL, MineDojo, VPT, Mineflayer, Voyager, CraftAssist, MineStudio, TeamCraft.
  5. What “autonomous” leaves unspecified.
  6. Where Omo's voice/space/presence questions begin.
- **Original artifact:** downloadable SVG system map with source links.
- **Quality gate:** each named project description checked against its primary page or paper.

### 2. Minecraft is not just a benchmark. It is an agent interface.

- **Route:** `/notes/minecraft-as-an-agent-interface/`
- **Label:** Design hypothesis
- **Primary intent:** “why Minecraft for AI research” / “Minecraft agent interface”
- **Reader promise:** See why a shared world changes how humans understand an agent, beyond benchmark performance.
- **Outline:** visible consequences; spatial reference; shared attention; reversible action; continuity; limitations of privileged game state; hypotheses Omo could test.
- **Original artifact:** a diagram contrasting chat-only and world-embedded interaction.
- **Required phrasing:** “We propose” and “we want to test,” not “we found.”

### 3. AI NPC, bot, agent, companion: the terms are not interchangeable

- **Route:** `/notes/ai-npcs-vs-ai-agents-in-minecraft/`
- **Label:** Field guide
- **Primary intent:** “Minecraft AI NPC” and comparison queries
- **Reader promise:** Evaluate a system by capabilities rather than its marketing label.
- **Original artifact:** comparison matrix covering body, perception, initiative, goals, memory, dialogue, learning, permissions and persistence.
- **Internal link targets:** field guide, voice note, evaluation protocol.

## Phase 2 — own the voice/presence wedge (weeks 3–4)

### 4. What makes a voice agent feel present in a shared world?

- **Route:** `/notes/what-makes-an-agent-feel-present/`
- **Label:** Design hypothesis
- **Primary intent:** “AI agent presence” / “spatial voice agent”
- **Working model:** presence may depend on locatability, responsiveness, continuity, reciprocal attention, consequential action and appropriate absence.
- **Primary foundations:** Microsoft embodied-assistant study, CraftAssist, PLAICraft, STEVE-Audio and CHI 2026 auditory embodiment work.
- **Original artifact:** six-dimension presence rubric, clearly marked unvalidated.

### 5. Voice agents in Minecraft: beyond speech-to-text plus a bot

- **Route:** `/notes/voice-agents-in-minecraft/`
- **Label:** Field guide
- **Primary intent:** “voice AI Minecraft” / “talk to AI in Minecraft”
- **Outline:** audio capture, speech recognition, turn detection, grounding, planner, action layer, feedback, speech synthesis, spatialization; interruption and consent; local/cloud trade-offs.
- **Original artifact:** end-to-end latency budget worksheet and architecture diagram.
- **Do not claim:** that Omo has tested a stack until it has.

## Phase 3 — earn technical trust (weeks 5–7)

### 6. How Minecraft AI agents work

- **Route:** `/notes/how-minecraft-ai-agents-work/`
- **Label:** Field guide
- **Primary intent:** architecture explainer
- **Differentiator:** compare privileged structured state with native visual/mouse/keyboard control; connect that decision to what evaluations mean.
- **Original artifact:** architecture patterns with failure points and verification loops.

### 7. Malmo, MineRL, MineDojo and MineStudio: choosing an environment

- **Route:** `/notes/malmo-minerl-minedojo/`
- **Label:** Field guide
- **Primary intent:** platform comparison
- **Include:** purpose, observation/action interface, data, task/benchmark focus, language/tooling, maintenance check date, strongest use case and limitation.
- **Original artifact:** maintained comparison table. Verify current install support before publishing setup advice.

### 8. Voyager, read closely

- **Route:** `/notes/voyager-explained/`
- **Label:** Reading note
- **Primary intent:** Voyager Minecraft AI
- **Outline:** what it claims; automatic curriculum; executable skill library; iterative prompting; evaluation; what direct state/code action implies; what it does not answer about human companionship.
- **Original artifact:** one annotated control-loop diagram.

## Phase 4 — publish the evaluation frame before results (weeks 8–9)

### 9. A protocol for testing a Minecraft AI companion

- **Route:** `/notes/testing-minecraft-ai-agents/`
- **Label:** Protocol
- **Primary intent:** evaluate/test Minecraft AI agents
- **Test dimensions:** setup/compatibility, perception, instruction grounding, action completion, latency, memory, interruption, permissions, recovery, multiplayer behavior, privacy, cost and subjective presence.
- **Evidence package:** fixed world seed, task list, environment versions, screen/audio capture plan, raw logs, scoring method and correction policy.
- **Why before testing:** publishing the rubric first reduces post-hoc scoring and makes future “best” claims defensible.

### 10. Minecraft agent benchmarks measure different kinds of success

- **Route:** `/notes/minecraft-agent-benchmarks/`
- **Label:** Field guide
- **Primary intent:** Minecraft AI benchmark
- **Taxonomy:** long-horizon progress, sample efficiency, fuzzy/human-preference tasks, multimodal control, collaboration, memory and human experience.
- **Original artifact:** benchmark-selection decision tree.

## Phase 5 — first original work (weeks 10–12, only if the work is actually done)

Choose one narrow experiment; do not attempt a sweeping “state of Minecraft AI.”

### Preferred experiment: spatial language and correction

- **Question:** How reliably can a voice-directed agent ground relational instructions such as “two blocks left of the door,” notice a mismatch and recover after a correction?
- **Why it fits Omo:** voice, space and presence are all observable.
- **Minimum evidence:** published setup, fixed tasks, raw transcripts, action traces/video, success definition, failures, model/tool versions, cost and latency.
- **Potential outputs:** one experiment log, one reusable task pack and one short demo. No paper label.

Alternative experiments:

- interruption timing for a voice-directed building task;
- memory after leaving and rejoining a world;
- whether spatialized voice improves locating an agent during collaboration;
- how visible action previews affect trust before destructive operations.

## Recurring maintenance

| Cadence | Action |
|---|---|
| On every publish | Validate links, schema, canonical, sitemap/feed inclusion, mobile layout and cited claim support |
| Monthly | Review Search Console queries and page-level impressions; add clarifications, not keyword padding |
| Quarterly | Recheck repository activity, game/version compatibility and redirected primary URLs |
| Every six months | Re-run the search-landscape sample and update the system map |
| After any experiment | Publish negative results and deviations alongside successes |

## Internal linking model

- The **field guide** is the cluster hub and links to every deeper note.
- Every deeper note links back to the field guide in the introduction or breadcrumb.
- Concept pages link to the most relevant technical page and protocol, not every page in the cluster.
- Reading notes link to the canonical paper/project before any Omo page.
- The Research page should point to Notes as public synthesis and later to Experiment Logs as original work; never merge the two labels.

## Editorial quality gate

Before publication, answer yes to all of these:

1. Is the reader's question explicit in the opening paragraph?
2. Is the page meaningfully different from the canonical sources it cites?
3. Are reported results attributed to the team that produced them?
4. Are Omo hypotheses visibly labeled as hypotheses?
5. Are hands-on or “best” claims supported by Omo's own reproducible evidence?
6. Does every diagram convey a relationship that prose alone would obscure?
7. Are limitations and version/check dates visible?
8. Does the page have one clear next step rather than a wall of links?
9. Has a human reviewer checked technical claims and tone?
10. Would the page remain useful if search engines sent no traffic?

## Primary sources for the first eight pages

- https://www.microsoft.com/en-us/research/project/project-malmo/
- https://github.com/minerllabs/minerl
- https://arxiv.org/abs/1904.10079
- https://developer.nvidia.com/blog/building-generally-capable-ai-agents-with-minedojo/
- https://arxiv.org/abs/2206.08853
- https://voyager.minedojo.org/
- https://arxiv.org/abs/2305.16291
- https://openai.com/index/vpt/
- https://github.com/PrismarineJS/mineflayer
- https://ai.meta.com/research/publications/craftassist-a-framework-for-dialogue-enabled-interactive-agents/
- https://www.microsoft.com/en-us/research/publication/spontaneous-interactions-virtually-embodied-intelligent-assistant-minecraft/
- https://github.com/CraftJarvis/MineStudio
- https://teamcraft-bench.github.io/
- https://arxiv.org/abs/2505.12707
- https://arxiv.org/abs/2412.00949
- https://make.kaist.ac.kr/project/2026-auditoryagents

