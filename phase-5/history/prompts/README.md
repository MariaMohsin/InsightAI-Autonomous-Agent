# Prompt History Records (PHR)

This directory contains structured records of all significant AI collaboration sessions during the development of the Todo Full-Stack Web Application.

## The Spec-Kit Plus Philosophy

PHRs are part of **Horizontal Intelligence** - YOUR learning across time within this project.

**Key Principles**:
- **Project-Scoped**: PHRs belong to THIS project and stay here. They do NOT transfer to your next project.
- **YOU Learn**: The value is in YOUR internalized learning. As you work with AI, you learn what prompts succeed vs fail.
- **Wisdom Lives in YOU**: Six months from now, YOU remember "specific prompts work better than generic ones" because you've internalized it through practice.
- **Automatic Creation**: PHRs are automatically created during `/sp.specify`, `/sp.plan`, and `/sp.implement` phases.

## Purpose

Prompt History Records capture what prompts work vs what fails:
- **Prompt Quality**: Document which prompt structures produce better results
- **Learning Patterns**: Track YOUR evolution in crafting effective AI collaboration
- **Failure Modes**: Identify what doesn't work to avoid repeating mistakes
- **Success Patterns**: Preserve prompts that consistently produce quality outputs

## File Naming Convention

`<ID>-<brief-description>.md`

Examples:
- `0001-claude-agent-guide.md`
- `0002-project-constitution.md`
- `0003-user-authentication-spec.md`

## PHR Structure

Each PHR file uses the following format:

### Frontmatter (YAML)
```yaml
---
id: 0001                                    # Sequential ID
title: Brief descriptive title
stage: setup|spec|plan|tasks|implementation # Development stage
date: YYYY-MM-DD                            # Creation date
surface: agent|cli|api                      # Interface used
model: claude-sonnet-4-5-20250929          # Model version
feature: feature-name                       # Related feature
branch: branch-name                         # Git branch
user: User                                  # User identifier
command: /sp.command or manual              # Command used
labels: ["label1", "label2"]               # Categorization tags
links:
  spec: path/to/spec.md                    # Related spec
  ticket: url                              # Issue tracker link
  adr: path/to/adr.md                      # Architecture decision record
  pr: url                                  # Pull request link
files:
  - file1.md                               # Files created/modified
  - file2.py
tests:
  - test-description                       # Associated tests
---
```

### Content Sections

1. **Prompt**: The exact user input provided to Claude
2. **Response snapshot**: Summary of Claude's response and actions taken
3. **Outcome**: Structured summary with emojis
   - ✅ Impact: What was accomplished
   - 🧪 Tests: Testing results or validation
   - 📁 Files: Files created or modified
   - 🔁 Next prompts: Suggested follow-up actions
   - 🧠 Reflection: Insights and learnings
4. **Evaluation notes (flywheel)**: For continuous improvement
   - Failure modes observed
   - Graders run and results
   - Prompt variant (if applicable)
   - Next experiment

## Usage Guidelines

### When to Create a PHR

Create a new PHR for:
- Spec-Kit commands (`/sp.specify`, `/sp.plan`, `/sp.tasks`, etc.)
- Significant feature implementations
- Architecture decisions
- Problem-solving sessions that led to important insights
- Failed attempts that provide learning value

### When NOT to Create a PHR

Skip PHRs for:
- Simple file reads or searches
- Minor typo fixes
- Routine code formatting
- Trivial clarifications

### Writing Quality PHRs

**Good PHR characteristics**:
- Captures the actual prompt, not a sanitized version
- Includes context about why the prompt was structured that way
- Documents unexpected outcomes or surprises
- Notes what could be improved next time
- Provides enough detail for someone else to understand the decision

**Poor PHR characteristics**:
- Generic descriptions without specifics
- Missing context about the problem being solved
- No reflection on what worked or didn't work
- Incomplete file lists or outcome descriptions

## Integration with Development Workflow

1. **During work**: PHRs are automatically created by `/sp.specify`, `/sp.plan`, `/sp.implement`
2. **Review session**: Periodically review your PHRs to identify what prompts work consistently
3. **Internalize patterns**: Notice which prompt structures produce better results
4. **Apply learning**: Use successful patterns in future AI collaborations

## Indexing and Search

To find relevant PHRs:

```bash
# Search by label
grep -r "label1" history/prompts/

# Search by feature
grep -r "feature: feature-name" history/prompts/

# Search by stage
grep -r "stage: implementation" history/prompts/

# List all PHRs chronologically
ls -lt history/prompts/*.md
```

## Contributing

When adding new PHRs:
1. Use the next sequential ID number
2. Fill in all frontmatter fields (use `null` if not applicable)
3. Include all required sections
4. Be honest about failures and challenges
5. Commit the PHR along with the code changes it documents

---

**Version**: 1.0.0 | **Created**: 2026-01-12 | **Last Updated**: 2026-01-12
