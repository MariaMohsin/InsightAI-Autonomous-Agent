---
name: database-skill
description: Design and manage database schemas, tables, and migrations. Use for backend data modeling and persistence.
---
Database Skill
Instructions

Schema Design

Identify entities and relationships

Normalize tables appropriately

Define primary and foreign keys

Choose correct data types and constraints

Table Creation

Create scalable, well-structured tables

Apply indexes for performance

Enforce uniqueness and referential integrity

Support soft deletes and timestamps where needed

Migrations

Generate forward and rollback migrations

Handle schema evolution safely

Avoid destructive changes without safeguards

Maintain migration order and consistency

Data Integrity & Performance

Use constraints (NOT NULL, UNIQUE, CHECK)

Optimize queries with indexing

Prevent orphan records

Plan for future scaling

Best Practices

Prefer explicit schemas over implicit structure

Never modify production data without migrations

Keep migrations small and reversible

Use snake_case or consistent naming conventions

Document schema decisions clearly

Design with read/write patterns in mind