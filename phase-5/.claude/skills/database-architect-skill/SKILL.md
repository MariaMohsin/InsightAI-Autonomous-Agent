---
name: database-architect-skill
description: Design comprehensive database architecture, ERD diagrams, and schema planning before implementation. Use for database architectural decisions and planning.
---

# Database Architecture Skill

## Purpose
Plan and design database architecture, create ERD diagrams, define data models, and make architectural decisions BEFORE implementing actual database code.

## Instructions

### 1. Requirements Analysis
- Understand business requirements and data relationships
- Identify all entities and their attributes
- Map relationships (one-to-one, one-to-many, many-to-many)
- Define data access patterns and query requirements

### 2. Entity-Relationship Diagrams (ERD)
- Create visual ERD diagrams showing all entities
- Document relationships with cardinality
- Show primary keys, foreign keys, and unique constraints
- Include indexes and composite keys where needed

### 3. Schema Design Planning
- Design normalized database schema (3NF or higher)
- Plan table structures with appropriate data types
- Define constraints (NOT NULL, UNIQUE, CHECK, FOREIGN KEY)
- Plan indexing strategy for performance optimization

### 4. Data Architecture Decisions
- Choose between normalization vs denormalization based on use case
- Plan for scalability (partitioning, sharding strategies)
- Design audit trails and soft delete mechanisms
- Plan migration strategy and versioning approach

### 5. Documentation
- Document all architectural decisions (ADRs)
- Create schema documentation with field descriptions
- Document relationships and business rules
- Provide migration roadmap

## Best Practices

### Normalization
- Eliminate data redundancy
- Ensure data integrity through proper relationships
- Balance normalization with query performance

### Performance Planning
- Index frequently queried columns
- Avoid over-indexing (impacts write performance)
- Plan for composite indexes on multi-column queries
- Consider partial indexes for filtered queries

### Security & Integrity
- Never store sensitive data without encryption planning
- Plan row-level security where needed
- Define clear access patterns and permissions
- Implement proper foreign key constraints

### Scalability
- Design with future growth in mind
- Plan for horizontal scaling if needed
- Consider read replicas for read-heavy workloads
- Plan archival strategy for historical data

## Example ERD Structure

```
Users Table
┌─────────────┬──────────────┬─────────────┐
│ id          │ PRIMARY KEY  │ UUID/SERIAL │
│ email       │ UNIQUE       │ VARCHAR     │
│ password    │ NOT NULL     │ VARCHAR     │
│ created_at  │ NOT NULL     │ TIMESTAMP   │
│ updated_at  │              │ TIMESTAMP   │
└─────────────┴──────────────┴─────────────┘
         │
         │ One-to-Many
         ▼
Todos Table
┌─────────────┬──────────────┬─────────────┐
│ id          │ PRIMARY KEY  │ UUID/SERIAL │
│ user_id     │ FOREIGN KEY  │ UUID/INT    │
│ title       │ NOT NULL     │ VARCHAR     │
│ description │              │ TEXT        │
│ status      │ NOT NULL     │ ENUM/VARCHAR│
│ priority    │ DEFAULT LOW  │ ENUM/VARCHAR│
│ due_date    │              │ DATE        │
│ created_at  │ NOT NULL     │ TIMESTAMP   │
│ updated_at  │              │ TIMESTAMP   │
│ deleted_at  │ (soft delete)│ TIMESTAMP   │
└─────────────┴──────────────┴─────────────┘

Indexes:
- idx_todos_user_id ON todos(user_id)
- idx_todos_status ON todos(status)
- idx_todos_due_date ON todos(due_date)
- idx_todos_user_status ON todos(user_id, status)
```

## Workflow

1. **Analyze**: Gather requirements and understand data relationships
2. **Design**: Create ERD and schema design documents
3. **Review**: Validate design against requirements and best practices
4. **Document**: Write comprehensive architecture documentation
5. **Approve**: Get user approval before implementation
6. **Handoff**: Provide clear specs to database-skill for implementation

## Output Deliverables

- ERD diagram (ASCII or Mermaid format)
- Schema design document
- Architecture Decision Records (ADRs)
- Migration strategy document
- Performance optimization plan
- Security and access control plan

## When to Use This Skill

✅ Use when:
- Starting a new project and need database design
- Adding new features that require schema changes
- Refactoring existing database structure
- Performance issues requiring architectural review
- Planning multi-tenant database strategy

❌ Don't use for:
- Implementing actual database code (use database-skill)
- Writing SQL queries (use backend-skill)
- Database administration tasks
- Simple CRUD operations on existing schema
