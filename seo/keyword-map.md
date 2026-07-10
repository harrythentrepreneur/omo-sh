# Minecraft search map for Omo Research

Updated: 2026-07-10

## Scope and method

This is a topic-and-intent map, not a claim of measured search volume. Priorities combine Omo's fit (voice, space, presence), the apparent quality of current results, and whether Omo can publish something genuinely useful without pretending to have completed research. Validate demand with Google Search Console and a keyword-volume tool after the first pages are indexed.

Two labels are used throughout:

- **Evidence** means the topic is grounded in a primary source listed below.
- **Inference** means the opportunity or likely search intent is a strategic judgment based on live search-result review on 2026-07-10. It is not traffic data.

## Recommended information architecture

| Hub / page | Primary query | Supporting queries | Intent | Page type | Priority |
|---|---|---|---|---|---|
| `/notes/minecraft-ai-agents/` | minecraft AI agents | AI agents in Minecraft; autonomous Minecraft agent; Minecraft agent research | Learn / orient | Evergreen illustrated field guide and cluster hub | P0 |
| `/notes/minecraft-as-an-agent-interface/` | Minecraft AI agent interface | why Minecraft for AI research; Minecraft embodied AI | Understand / evaluate | Point-of-view essay grounded in prior work | P0 |
| `/notes/ai-npcs-vs-ai-agents-in-minecraft/` | Minecraft AI NPC | AI NPC Minecraft; intelligent NPC Minecraft; Minecraft generative AI NPC | Compare / understand | Definition and architecture comparison | P0 |
| `/notes/how-minecraft-ai-agents-work/` | how do Minecraft AI agents work | Minecraft agent architecture; LLM Minecraft bot; AI plays Minecraft | Learn / build | Technical explainer with perception-plan-action diagram | P0 |
| `/notes/minecraft-agent-stack/` | how to build a Minecraft AI agent | Mineflayer AI agent; Minecraft bot LLM; Minecraft agent tutorial | Build | Maintained implementation map, not a fake quick-start | P1 |
| `/notes/minecraft-agent-benchmarks/` | Minecraft AI benchmark | MineRL vs MineDojo; Minecraft embodied AI benchmark; TeamCraft benchmark | Research / compare | Benchmark taxonomy and selection guide | P1 |
| `/notes/voyager-explained/` | Voyager Minecraft AI | Voyager AI agent; Voyager vs MineDojo; Voyager skill library | Learn / cite | Primary-source reading note | P1 |
| `/notes/malmo-minerl-minedojo/` | Project Malmo vs MineRL vs MineDojo | Minecraft AI research platforms; Minecraft reinforcement learning environment | Compare / choose | Historical and practical comparison | P1 |
| `/notes/voice-agents-in-minecraft/` | voice AI Minecraft | talk to AI in Minecraft; voice-controlled Minecraft agent; Minecraft voice NPC | Explore / build | Design and systems explainer | P0 |
| `/notes/what-makes-an-agent-feel-present/` | AI agent presence | spatial voice AI agent; embodied conversational agent; virtual agent presence | Understand / research | Omo thesis note with falsifiable questions | P0 |
| `/notes/minecraft-agent-memory/` | Minecraft AI agent memory | lifelong learning Minecraft agent; persistent NPC memory; long-horizon agent Minecraft | Learn / design | Memory taxonomy and failure modes | P1 |
| `/notes/multi-agent-minecraft/` | multi-agent Minecraft AI | Minecraft agent society; collaborative Minecraft agents; 1000 AI agents Minecraft | Learn / evaluate | Evidence-led guide separating demos from evaluation | P1 |
| `/notes/testing-minecraft-ai-agents/` | test Minecraft AI agent | evaluate AI NPC; Minecraft agent failure modes; embodied agent evaluation | Build / validate | Reusable evaluation protocol | P1 |
| `/notes/local-ai-npcs/` | local AI Minecraft NPC | offline Minecraft AI companion; local LLM Minecraft mod; private AI NPC | Evaluate / build | Privacy, latency, hardware and capability trade-offs | P2 |
| `/notes/minecraft-ai-mods/` | best Minecraft AI mods | Minecraft AI companion mod; AI villager mod; AI NPC mods Minecraft | Compare / install | Tested, dated directory only after hands-on verification | P2 |
| `/notes/minecraft-agent-glossary/` | Minecraft AI agent glossary | embodied agent definition; NPC vs bot vs agent | Define | Short linked glossary | P2 |

## Cluster 1 — Minecraft as an agent environment

**Audience:** AI-curious builders, researchers entering the field, and journalists looking for a reliable orientation.

| Query family | Likely intent | Recommended answer | Priority | Basis |
|---|---|---|---|---|
| minecraft AI agents / AI agents in Minecraft | Broad orientation | Define the field, show the main system families, link to primary projects, explain what Minecraft exposes to an agent | P0 | Evidence + inference |
| why Minecraft for AI research | Understand the environment choice | Open-ended tasks, long horizons, compositional skills, human demonstrations, and controllable simulation—with limitations | P0 | Evidence |
| minecraft embodied AI | Understand a technical term | Explain perception, action, world state, body/interface, and why embodiment is more than an avatar | P0 | Evidence + inference |
| minecraft as AI testbed / sandbox | Research overview | Timeline from Malmo and MineRL to MineDojo, VPT, Voyager, MineStudio and multi-agent benchmarks | P1 | Evidence |
| AI learns to play Minecraft | News-to-concept orientation | Compare reinforcement learning, imitation learning, code generation, and multimodal policies | P1 | Evidence |
| minecraft agent research papers | Literature discovery | Curated reading path with short annotations, dates, code links, and limitations | P1 | Inference; publish as a reading list, never as Omo papers |
| open-ended AI agents | Conceptual learning | Use Minecraft examples to explain self-set curricula, skill reuse, exploration, and generalization | P1 | Evidence |

## Cluster 2 — Agent, NPC, bot, and companion

**Audience:** Minecraft players and game/agent designers who use overlapping language for different systems.

| Query family | Likely intent | Recommended answer | Priority | Basis |
|---|---|---|---|---|
| Minecraft AI NPC / AI NPC Minecraft | Find or understand conversational characters | Separate dialogue generation, memory, world awareness, movement, and autonomous action | P0 | Inference |
| AI companion Minecraft / Minecraft AI friend | Find a persistent co-player | Explain companionship as a design claim: continuity, initiative, cooperation, boundaries and failure recovery | P0 | Evidence + inference |
| talk to AI in Minecraft | Find voice or chat interaction | Compare text chat, push-to-talk, continuous listening, turn-taking and situated voice | P0 | Inference |
| autonomous NPC Minecraft | Find characters that act independently | Define autonomy levels, permissions, planning horizon and reversibility | P1 | Inference |
| Minecraft bot vs NPC vs AI agent | Compare terms | A crisp comparison table: embodiment, perception, goals, initiative, dialogue, learning and persistence | P0 | Inference |
| intelligent villagers / AI villager mod | Find gameplay enhancements | Explain scripted game AI versus model-driven dialogue/action; link only to verified current projects | P2 | Inference |
| generative AI NPCs in games | Broader industry learning | Use Minecraft as a concrete case, with voice, memory and safety constraints | P1 | Evidence + inference |

## Cluster 3 — Building and architecture

**Audience:** developers deciding how to prototype.

| Query family | Likely intent | Recommended answer | Priority | Basis |
|---|---|---|---|---|
| how to build a Minecraft AI agent | Implementation overview | Decision tree: direct game-state API vs pixels/keyboard; scripted policy vs learned policy vs LLM planner | P0 | Evidence + inference |
| Mineflayer AI agent / Mineflayer LLM | Build a JavaScript agent | Explain what Mineflayer provides, what it does not, and the observation-action loop | P0 | Evidence |
| Minecraft bot API / Minecraft agent API | Choose tooling | Compare Mineflayer, Malmo, MineRL/MineStudio and mod-based approaches by objective | P1 | Evidence |
| LLM Minecraft bot | Connect a language model | Show planner/tool boundary, structured actions, state compression, verification and cost/latency risks | P1 | Evidence + inference |
| Minecraft AI agent Python | Find a Python path | Map Python-accessible platforms and version constraints; avoid promising one universal stack | P2 | Evidence |
| Minecraft agent pathfinding | Solve navigation | Explain pathfinding as one capability beneath agency; point to maintained libraries | P2 | Evidence |
| Minecraft agent memory / skill library | Add persistence | Compare episodic history, semantic world memory, procedural skills and social memory | P1 | Evidence + inference |
| self-correcting Minecraft agent | Build robust loops | Observation, execution feedback, error classification, retry budgets and human escalation | P1 | Evidence + inference |
| multi-agent Minecraft architecture | Coordinate agents | Roles, shared state, communication, task allocation, conflict and evaluation | P1 | Evidence |

## Cluster 4 — Benchmarks and canonical projects

**Audience:** researchers, technical readers, students and builders choosing prior work.

| Query family | Likely intent | Recommended answer | Priority | Basis |
|---|---|---|---|---|
| Project Malmo | Learn / install / cite | Historical role, sensing/action API, research questions, current project status | P1 | Evidence |
| MineRL benchmark | Learn / compare | Human demonstration data, sample efficiency, ObtainDiamond and BASALT lineage | P1 | Evidence |
| MineDojo | Learn / compare | Simulation, open-ended tasks, internet-scale knowledge and MineCLIP | P1 | Evidence |
| Voyager Minecraft AI | Understand a widely cited agent | Curriculum, executable skill library, iterative prompting and reported evaluation | P1 | Evidence |
| OpenAI VPT Minecraft | Understand imitation learning | Inverse dynamics labeling, video pretraining, native mouse/keyboard interface | P1 | Evidence |
| MineStudio Minecraft | Find maintained development tooling | Seven-part engineering stack and benchmark support; disclose current version/date checked | P2 | Evidence |
| TeamCraft benchmark | Evaluate multi-agent systems | Multimodal collaboration, task specification, communication and coordination | P2 | Evidence |
| CraftAssist Minecraft | Understand dialogue-enabled agents | Human-bot dialogue, interactive building, language grounding | P2 | Evidence |
| STEVE / JARVIS-1 Minecraft agent | Literature discovery | Annotated comparison within a broader reading list, not one thin page per acronym | P2 | Evidence |

## Cluster 5 — Omo's defensible wedge: voice, space, presence

**Audience:** HCI researchers, interaction designers, game developers, agent builders and potential collaborators.

| Query family | Likely intent | Recommended answer | Priority | Basis |
|---|---|---|---|---|
| voice AI Minecraft / voice-controlled Minecraft agent | Find or design voice interaction | Architecture plus interaction trade-offs: latency, interruption, grounding, permissions and feedback | P0 | Evidence + inference |
| spatial voice AI agent | Understand situated audio | Explain direction, distance, occlusion, proximity, attention and social presence | P0 | Evidence + inference |
| AI agent presence | Understand why some agents feel “there” | Define presence through continuity, responsiveness, world effects and reciprocal attention | P0 | Inference; must be framed as Omo's working model |
| embodied conversational agent Minecraft | Find HCI research | Connect Microsoft user studies, CraftAssist, voice datasets and auditory embodiment research | P1 | Evidence |
| human AI collaboration Minecraft | Find teammate research | Compare assistant, teammate, companion and autonomous society evaluation goals | P1 | Evidence |
| persistent AI companion | Explore product/design pattern | Memory boundaries, re-entry, absence, consent and identity continuity | P1 | Inference |
| local AI NPC / offline AI companion | Evaluate private deployment | Latency, privacy, model size, capability and moderation trade-offs | P2 | Inference |
| ambient agents in virtual worlds | Explore a future interface | Ground claims in demonstrable design patterns and label scenarios as hypotheses | P2 | Inference |

## Query-to-page rules

1. **Do not create one page for every keyword variant.** One strong page should satisfy a coherent intent family and use natural synonyms.
2. **Use canonical project names only when the page adds synthesis.** A shallow “What is Voyager?” summary cannot outrank or out-serve the project page.
3. **Treat “best,” “mod,” “download,” and “install” as hands-on claims.** Omo should publish those only after installing and testing the named projects, recording Minecraft edition/version, loader, hardware, date, and failure notes.
4. **Keep Omo Notes distinct from research outputs.** Notes can interpret public work and state hypotheses; they must not imply Omo ran experiments it did not run.
5. **Lead with the reader's problem.** “How Minecraft agents perceive and act” is stronger than a page built around an acronym list.

## Primary-source evidence set

- Microsoft Research, Project Malmo: https://www.microsoft.com/en-us/research/project/project-malmo/
- MineRL repository and competition package: https://github.com/minerllabs/minerl
- MineRL 2019 paper: https://arxiv.org/abs/1904.10079
- NVIDIA, MineDojo technical overview: https://developer.nvidia.com/blog/building-generally-capable-ai-agents-with-minedojo/
- MineDojo paper: https://arxiv.org/abs/2206.08853
- Voyager project and paper: https://voyager.minedojo.org/ and https://arxiv.org/abs/2305.16291
- OpenAI, Video PreTraining: https://openai.com/index/vpt/
- PrismarineJS, Mineflayer: https://github.com/PrismarineJS/mineflayer
- Meta AI, CraftAssist: https://ai.meta.com/research/publications/craftassist-a-framework-for-dialogue-enabled-interactive-agents/
- Microsoft Research, embodied assistant interaction in Minecraft: https://www.microsoft.com/en-us/research/publication/spontaneous-interactions-virtually-embodied-intelligent-assistant-minecraft/
- MineStudio: https://github.com/CraftJarvis/MineStudio and https://arxiv.org/abs/2412.18293
- TeamCraft: https://teamcraft-bench.github.io/ and https://arxiv.org/abs/2412.05255
- PLAICraft voice/vision/action dataset: https://arxiv.org/abs/2505.12707
- STEVE-Audio: https://arxiv.org/abs/2412.00949
- Auditory embodiment at CHI 2026: https://make.kaist.ac.kr/project/2026-auditoryagents
- OpenAI profile of Altera's Minecraft agents: https://openai.com/index/altera/

## Measurement once pages launch

- In Search Console, group queries by the five clusters above; report impressions, clicks, CTR and average position by page and cluster, not isolated keyword “rankings.”
- Watch for unexpected intent. If a conceptual page attracts “download” queries, add a clear tested-tools section or route those readers to a maintained directory.
- Review cannibalization quarterly. Merge pages that repeatedly receive the same query set.
- Record the page's meaningful update date whenever tools, versions or project status are rechecked.

