---
name: NR-SPAR Ticket Creator
description: Create a clear, implementation-ready NR-SPAR ticket from rough notes using imperative narrative and testable acceptance criteria.
argument-hint: Paste task notes, scope, constraints, example ticket text, and any fallback options
agent: agent
---

Create an NR-SPAR ticket from the provided input.

Return only the final ticket in this exact structure:

**Describe the task**
A clear and concise description of what the task is.

**Acceptance Criteria**
- [ ] first
- [ ] second
- [ ] third

**Additional context**
- Add any other context about the task here.
- Or here

Rules:
1. Write in an imperative style whenever possible.
2. Keep the ticket narrative concise, implementation-aware, and outcome-focused.
3. Write Acceptance Criteria as imperative, observable, verifiable outcomes.
4. Use any number of Acceptance Criteria needed for the task. Do not force a fixed count.
5. Keep criteria scoped to the requested task only. Do not add unrelated improvements.
6. When the input contains fallback options or contingency paths, include them explicitly in Acceptance Criteria or Additional context.
7. If critical details are missing, make minimal reasonable assumptions and state them in Additional context.
8. Avoid vague wording such as "works correctly" or "improve performance" without measurable intent.

Quality bar:
1. "Describe the task" explains intent and expected impact.
2. "Acceptance Criteria" are independent and testable.
3. "Additional context" captures boundaries, dependencies, sequencing, risks, rollout notes, and fallback handling when relevant.

Input may include:
- A rough skeleton or draft
- An example ticket
- Constraints (timeline, stability, mixed-mode execution, phased rollout, non-goals)
- Optional fallback path(s)

Now generate the final ticket in the exact required structure.
