# Architectural Decision Records (ADR)

This directory contains Architectural Decision Records for the Todo Full-Stack Web Application.

## The Spec-Kit Plus Philosophy

ADRs are part of **Horizontal Intelligence** - YOUR learning across time within this project.

**Key Principles**:
- **Project-Scoped**: ADRs belong to THIS project and document decisions made here
- **Preserve Reasoning**: Capture the "WHY" behind significant decisions, not just "WHAT" was built
- **Context Matters**: Document the context, alternatives considered, and tradeoffs accepted
- **YOU Learn**: As you write ADRs, you develop better decision-making frameworks

## Purpose

ADRs document architectural decisions and their reasoning:
- **Decision Context**: What situation led to needing this decision?
- **Alternatives Considered**: What other options were evaluated?
- **Reasoning**: Why was this option chosen over alternatives?
- **Tradeoffs Accepted**: What disadvantages are we accepting?
- **Consequences**: How does this decision affect future work?

## ADR Structure

Each ADR follows this format:

```markdown
# ADR-###: [Decision Title]

**Status**: Proposed | Accepted | Deprecated | Superseded
**Date**: YYYY-MM-DD
**Deciders**: [Who made this decision]
**Related**: [Links to related ADRs, specs, or PRs]

## Context

[Describe the situation that requires a decision. What forces are at play?
What constraints exist? What requirements must be satisfied?]

## Decision

[State the decision clearly and concisely. Use active voice.]

## Alternatives Considered

### Option A: [Alternative name]
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]
- **Why rejected**: [Specific reason]

### Option B: [Alternative name]
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]
- **Why rejected**: [Specific reason]

## Reasoning

[Explain WHY the chosen decision is better than alternatives.
What factors were most important? What assumptions are we making?]

## Tradeoffs Accepted

[What disadvantages or limitations are we accepting with this decision?
Be honest about what we're giving up.]

## Consequences

[How does this decision affect:
- Future development work?
- Team workflow?
- System architecture?
- Other decisions?]

## Implementation Notes

[Optional: Any specific guidance for implementing this decision]
```

## Example: Good vs Bad ADRs

### ❌ Bad ADR (No Reasoning)
```
# ADR-001: Use PostgreSQL

We decided to use PostgreSQL for data storage.
```

**Problem**: No context, no alternatives, no reasoning. Future team members don't understand WHY.

### ✅ Good ADR (Preserves Reasoning)
```
# ADR-001: Use PostgreSQL for User Data Storage

**Context**:
- Application requires ACID guarantees for financial transactions
- Team has PostgreSQL expertise (no MongoDB learning curve)
- Schema is well-defined (no document-oriented benefits)

**Decision**: Use PostgreSQL instead of MongoDB

**Alternatives Considered**:
- MongoDB: More flexible schema, but no ACID guarantees
- MySQL: Similar to PostgreSQL, but team less familiar

**Reasoning**:
1. Transaction integrity: Financial data cannot tolerate eventual consistency
2. Operational knowledge: Team expertise reduces deployment risk
3. Cost: PostgreSQL license vs MongoDB enterprise features

**Tradeoffs Accepted**:
- Flexibility: SQL schema less flexible than document model
  (acceptable because schema is stable)
- Scalability: Horizontal scaling more complex
  (acceptable because vertical scaling sufficient for 5 years)

**Consequences**:
- Future financial features inherit this decision
- Team can start immediately without learning curve
- Migration to NoSQL would require significant refactoring
```

## When to Create an ADR

Create an ADR for:
- **Technology choices**: Database, framework, authentication method
- **Architecture patterns**: Microservices vs monolith, REST vs GraphQL
- **Security decisions**: Authentication approach, encryption strategy
- **Infrastructure**: Hosting platform, deployment strategy
- **Data modeling**: Schema design, normalization decisions
- **API design**: RESTful conventions, versioning strategy

Don't create ADRs for:
- Minor implementation details
- Temporary workarounds
- Standard practices (unless you're deviating from them)
- Trivial configuration choices

## Naming Convention

`ADR-###-brief-title.md`

Examples:
- `ADR-001-use-postgresql-for-storage.md`
- `ADR-002-jwt-authentication-over-sessions.md`
- `ADR-003-monorepo-structure.md`

## ADR Lifecycle

1. **Proposed**: Decision is being considered
2. **Accepted**: Decision is approved and being implemented
3. **Deprecated**: Decision is no longer recommended but still in use
4. **Superseded**: Decision has been replaced (link to new ADR)

## Integration with Spec-Kit Plus

ADRs are created during:
- `/sp.plan` - When making architectural decisions during planning
- `/sp.implement` - When implementation reveals need for architectural decision
- Manual creation - When significant decisions arise outside workflow

ADRs reference and are referenced by:
- **Specifications**: ADRs explain how to satisfy spec requirements
- **PHRs**: ADRs document decisions; PHRs document prompts that helped make them
- **Code**: Implementation comments can reference ADR numbers

---

**Version**: 1.0.0 | **Created**: 2026-01-12 | **Last Updated**: 2026-01-12
