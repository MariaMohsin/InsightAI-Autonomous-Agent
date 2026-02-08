---
name: architecture-reviewer-skill
description: Review architectural decisions, system design, and critical changes before implementation. Ensures quality and consistency.
---

# Architecture Reviewer Skill

## Purpose
Review and validate architectural decisions, system design changes, and critical file modifications BEFORE implementation. Ensures consistency, scalability, and adherence to best practices.

## Instructions

### 1. Pre-Implementation Review
- Review proposed architectural changes before code is written
- Validate design decisions against project requirements
- Identify potential issues, bottlenecks, or anti-patterns
- Ensure alignment with existing architecture

### 2. Critical File Analysis
- Review changes to core system files (config, auth, database, API routes)
- Assess impact on existing functionality
- Verify backwards compatibility when needed
- Check for security vulnerabilities

### 3. Design Pattern Validation
- Ensure appropriate design patterns are used
- Validate separation of concerns (frontend/backend/database)
- Review API design for RESTful compliance
- Check code organization and folder structure

### 4. Scalability Assessment
- Evaluate if design can handle growth (users, data, traffic)
- Review caching strategies
- Assess database query efficiency
- Check for N+1 query problems

### 5. Security Review
- Validate authentication and authorization logic
- Check for common vulnerabilities (SQL injection, XSS, CSRF)
- Review API endpoint security
- Verify sensitive data handling (passwords, tokens, PII)

### 6. Architecture Decision Records (ADRs)
- Create ADRs for significant architectural decisions
- Document trade-offs and alternatives considered
- Record context and reasoning behind choices
- Maintain decision history for future reference

## Review Checklist

### System Design
- [ ] Clear separation of concerns (frontend/backend/database)
- [ ] Appropriate use of design patterns
- [ ] Consistent naming conventions
- [ ] Proper error handling strategy
- [ ] Logging and monitoring approach defined

### API Design
- [ ] RESTful principles followed
- [ ] Proper HTTP methods (GET, POST, PUT, DELETE)
- [ ] Consistent URL structure
- [ ] Proper status codes
- [ ] Request/response validation
- [ ] API versioning strategy

### Database Architecture
- [ ] Normalized schema design
- [ ] Proper indexes for performance
- [ ] Foreign key constraints in place
- [ ] Migration strategy defined
- [ ] Data integrity measures

### Security
- [ ] Authentication properly implemented
- [ ] Authorization checks in place
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure password hashing
- [ ] Environment variables for secrets

### Performance
- [ ] Database queries optimized
- [ ] Caching strategy defined
- [ ] No N+1 query problems
- [ ] Connection pooling configured
- [ ] Rate limiting considered

### Maintainability
- [ ] Code is readable and well-organized
- [ ] Proper documentation
- [ ] Consistent code style
- [ ] Reusable components
- [ ] Clear folder structure

## Architecture Decision Record (ADR) Template

```markdown
# ADR-001: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue we're facing? What factors are driving this decision?

## Decision
What architectural decision are we making?

## Consequences

### Positive
- Benefit 1
- Benefit 2
- Benefit 3

### Negative
- Trade-off 1
- Trade-off 2
- Trade-off 3

### Neutral
- Other impacts

## Alternatives Considered
1. Alternative 1 - Why rejected
2. Alternative 2 - Why rejected

## References
- Link to relevant documentation
- Related ADRs
```

## Common Anti-Patterns to Catch

### Backend
❌ **No input validation** → ✅ Validate all inputs with Pydantic
❌ **Direct SQL queries** → ✅ Use ORM (SQLModel)
❌ **Hardcoded secrets** → ✅ Environment variables
❌ **No error handling** → ✅ Proper try/catch with meaningful errors
❌ **Missing authentication** → ✅ Protect all sensitive endpoints

### Frontend
❌ **API keys in frontend** → ✅ Backend proxy or server-side calls
❌ **No loading states** → ✅ Show loading indicators
❌ **No error handling** → ✅ User-friendly error messages
❌ **Inline styles everywhere** → ✅ Tailwind/CSS classes
❌ **Not responsive** → ✅ Mobile-first design

### Database
❌ **No indexes** → ✅ Index foreign keys and query columns
❌ **Missing constraints** → ✅ NOT NULL, UNIQUE, FOREIGN KEY
❌ **Storing passwords plaintext** → ✅ Hashed with bcrypt/argon2
❌ **No soft deletes** → ✅ deleted_at timestamp
❌ **No timestamps** → ✅ created_at, updated_at

## Review Process

### Phase 1: Requirements Analysis (5-10 min)
1. Read feature requirements thoroughly
2. Understand user stories and acceptance criteria
3. Identify technical constraints
4. List dependencies and integrations

### Phase 2: Design Review (10-15 min)
1. Review proposed architecture/design
2. Check against best practices checklist
3. Identify potential issues
4. Consider scalability and performance

### Phase 3: Security & Risk Assessment (5-10 min)
1. Review authentication/authorization
2. Check for common vulnerabilities
3. Assess data privacy concerns
4. Evaluate error handling approach

### Phase 4: Documentation & Approval (5 min)
1. Create ADR if significant decision
2. Document recommendations
3. List required changes (if any)
4. Request user approval before proceeding

## Output Deliverables

- **Review Report**: Summary of findings
- **Architecture Decision Records**: For major decisions
- **Recommendations**: Suggested improvements
- **Risk Assessment**: Potential issues identified
- **Approval Status**: ✅ Approved / ⚠️ Needs Changes / ❌ Rejected

## When to Use This Skill

✅ **Use Before:**
- Implementing new major features
- Modifying core system files (auth, config, database)
- Making architectural decisions (tech stack, patterns)
- Refactoring critical code
- Deploying to production

✅ **Use For:**
- Pre-implementation design review
- Architecture validation
- Security assessment
- Performance evaluation
- Best practices compliance

❌ **Don't Use For:**
- Simple bug fixes
- Minor UI tweaks
- Documentation updates
- Trivial changes
- Post-implementation code review (use different tool)

## Example Review Output

```markdown
# Architecture Review: Todo API Endpoints

## Summary
✅ APPROVED with minor recommendations

## Findings

### ✅ Strengths
- RESTful API design follows best practices
- Proper authentication using JWT tokens
- Input validation with Pydantic models
- SQLModel ORM prevents SQL injection

### ⚠️ Recommendations
1. Add rate limiting to prevent abuse
2. Implement pagination for GET /todos endpoint
3. Add database indexes on user_id and status columns
4. Consider caching for frequently accessed data

### 🔴 Critical Issues
None identified

## Architecture Decision

**Decision**: Use JWT tokens for stateless authentication
**Rationale**: Scales better than session-based auth for API
**Trade-offs**: Token revocation requires additional mechanism

## Approval Status
✅ Approved - Proceed with implementation
Recommendation: Address items 1-4 in follow-up iteration
```

## Best Practices

### Proactive Reviews
- Review BEFORE implementation, not after
- Catch issues early when they're cheaper to fix
- Prevent technical debt accumulation

### Constructive Feedback
- Focus on architecture, not code style
- Explain WHY something is an issue
- Suggest alternatives, not just problems
- Balance idealism with pragmatism

### Documentation
- Create ADRs for significant decisions
- Keep review reports concise but thorough
- Link to relevant documentation
- Track decisions over time

### Collaboration
- Involve user in major decisions
- Explain trade-offs clearly
- Seek approval before proceeding
- Be open to alternative approaches
