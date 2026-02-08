---
name: integration-test-architect-skill
description: Design comprehensive integration testing strategies for distributed systems, APIs, and multi-tier applications. Planning and test design only.
---

# Integration Test Architect Skill

## Purpose
Plan and design comprehensive integration testing strategies for distributed systems, microservices, and multi-tier applications. Creates test specifications, test data strategies, and quality assurance plans WITHOUT writing actual test implementation code.

## Instructions

### 1. System Analysis
- Understand application architecture (frontend, backend, database, external services)
- Map all integration points and dependencies
- Identify critical user flows and business processes
- Analyze data flow across system boundaries

### 2. Test Strategy Design
- Define integration testing scope and objectives
- Identify what to test (API contracts, data flows, service communication)
- Plan test environments (dev, staging, production-like)
- Define success criteria and acceptance thresholds

### 3. Test Case Planning
- Design test scenarios for each integration point
- Plan positive and negative test cases
- Design edge cases and error scenarios
- Plan data validation across system boundaries

### 4. Test Data Management
- Plan test data creation strategy
- Design data cleanup and isolation approach
- Plan for realistic test data (production-like)
- Design data seeding and teardown processes

### 5. Environment Architecture
- Design test environment topology
- Plan service mocking and stubbing strategy
- Design test isolation mechanisms
- Plan for parallel test execution

### 6. Quality Gates
- Define quality metrics (coverage, pass rate, performance)
- Plan regression testing strategy
- Design smoke tests for quick validation
- Plan continuous integration hooks

## Integration Testing Levels

### Level 1: Component Integration (Unit → Component)
```
Test individual components with their dependencies
Example: TodoService + Database
Focus: Data access layer, ORM queries, transactions
```

### Level 2: Service Integration (Component → Service)
```
Test API endpoints with backend logic
Example: FastAPI endpoints + Business logic + Database
Focus: Request/response, validation, error handling
```

### Level 3: System Integration (Service → System)
```
Test frontend + backend + database together
Example: Next.js → FastAPI → PostgreSQL
Focus: End-to-end user flows, authentication, data consistency
```

### Level 4: External Integration (System → External Services)
```
Test integration with third-party services
Example: App → Email service, Payment gateway, Cloud storage
Focus: API contracts, timeouts, retries, error handling
```

## Test Architecture Template

### Todo Application Integration Test Plan

```
┌─────────────────────────────────────────────────────┐
│         Integration Test Architecture               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 1: API Integration Tests                    │
│  ┌────────────────────────────────────────┐        │
│  │ Test: FastAPI Endpoints                │        │
│  │ - POST /auth/signup                    │        │
│  │ - POST /auth/login                     │        │
│  │ - GET /todos                           │        │
│  │ - POST /todos                          │        │
│  │ - PUT /todos/:id                       │        │
│  │ - DELETE /todos/:id                    │        │
│  └────────────────────────────────────────┘        │
│           │                                         │
│           ▼                                         │
│  Layer 2: Database Integration Tests               │
│  ┌────────────────────────────────────────┐        │
│  │ Test: SQLModel + PostgreSQL            │        │
│  │ - Create user                          │        │
│  │ - Create todo with relationships       │        │
│  │ - Query with filters                   │        │
│  │ - Update operations                    │        │
│  │ - Soft delete                          │        │
│  │ - Foreign key constraints              │        │
│  └────────────────────────────────────────┘        │
│           │                                         │
│           ▼                                         │
│  Layer 3: End-to-End Integration Tests             │
│  ┌────────────────────────────────────────┐        │
│  │ Test: Full User Flows                  │        │
│  │ - User signup → login → create todo    │        │
│  │ - Create todo with tags and category   │        │
│  │ - Filter todos by status               │        │
│  │ - Update todo and verify changes       │        │
│  │ - Delete todo and verify soft delete   │        │
│  └────────────────────────────────────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Test Scenarios Specification

### Scenario 1: User Authentication Flow
```
Test Name: test_user_signup_login_flow

Objective: Verify complete authentication flow from signup to authenticated request

Steps:
1. POST /auth/signup with user data
   - Verify 201 Created response
   - Verify user created in database
   - Verify password is hashed

2. POST /auth/login with credentials
   - Verify 200 OK response
   - Verify JWT token received
   - Verify token contains user data

3. GET /todos with JWT token
   - Verify 200 OK response
   - Verify authentication successful
   - Verify user-specific data returned

Expected Results:
✅ User created successfully
✅ Login returns valid JWT token
✅ Token authenticates API requests
✅ User can access protected endpoints

Error Scenarios:
❌ Signup with existing email → 400 Bad Request
❌ Login with wrong password → 401 Unauthorized
❌ Request without token → 401 Unauthorized
❌ Request with invalid token → 401 Unauthorized
```

### Scenario 2: Todo CRUD Operations
```
Test Name: test_todo_crud_with_relationships

Objective: Verify complete todo lifecycle with categories and tags

Setup:
- Create test user
- Create test category "Work"
- Create test tags "urgent", "bug"

Steps:
1. POST /todos with category and tags
   {
     "title": "Fix critical bug",
     "category_id": <category_id>,
     "tag_ids": [<tag1_id>, <tag2_id>],
     "priority": "high",
     "status": "pending"
   }
   - Verify 201 Created
   - Verify todo in database
   - Verify category relationship
   - Verify tags relationship (junction table)

2. GET /todos/:id
   - Verify 200 OK
   - Verify todo includes category data
   - Verify todo includes tags data
   - Verify all fields correct

3. PUT /todos/:id (update status)
   {
     "status": "completed"
   }
   - Verify 200 OK
   - Verify status updated
   - Verify completed_at timestamp set
   - Verify updated_at timestamp changed

4. DELETE /todos/:id
   - Verify 200 OK
   - Verify deleted_at timestamp set (soft delete)
   - Verify todo not in active queries
   - Verify todo still in database

Expected Results:
✅ Todo created with relationships
✅ Relationships persisted correctly
✅ Updates reflected in database
✅ Soft delete works correctly

Error Scenarios:
❌ Create todo with invalid category_id → 400 Bad Request
❌ Create todo with invalid tag_id → 400 Bad Request
❌ Update non-existent todo → 404 Not Found
❌ Delete already deleted todo → 404 Not Found
```

### Scenario 3: Data Filtering and Search
```
Test Name: test_todo_filtering_and_search

Objective: Verify filtering, searching, and pagination work correctly

Setup:
- Create test user
- Create 20 todos with various statuses, priorities, categories

Test Cases:

1. Filter by status
   GET /todos?status=pending
   - Verify only pending todos returned
   - Verify count accurate

2. Filter by priority
   GET /todos?priority=high
   - Verify only high priority todos returned

3. Filter by category
   GET /todos?category_id=<id>
   - Verify only todos in category returned

4. Filter by tag
   GET /todos?tag_id=<id>
   - Verify only todos with tag returned

5. Search by title
   GET /todos?search=bug
   - Verify todos matching search term

6. Combined filters
   GET /todos?status=pending&priority=high
   - Verify AND logic works correctly

7. Pagination
   GET /todos?page=1&limit=10
   - Verify correct number of results
   - Verify pagination metadata

Expected Results:
✅ Filters work independently
✅ Filters can be combined
✅ Search works on title and description
✅ Pagination returns correct subset
✅ Empty results handled gracefully
```

### Scenario 4: Concurrent Operations
```
Test Name: test_concurrent_todo_updates

Objective: Verify system handles concurrent operations correctly

Steps:
1. Create test todo
2. Simulate 10 concurrent update requests
3. Verify all updates processed
4. Verify no data corruption
5. Verify final state is consistent

Expected Results:
✅ No race conditions
✅ No data loss
✅ Database constraints maintained
✅ Proper transaction handling
```

### Scenario 5: Error Handling and Recovery
```
Test Name: test_error_scenarios

Objective: Verify system handles errors gracefully

Test Cases:

1. Invalid Input Validation
   - Missing required fields → 400 Bad Request
   - Invalid data types → 422 Unprocessable Entity
   - Out of range values → 400 Bad Request

2. Authentication Errors
   - No token → 401 Unauthorized
   - Expired token → 401 Unauthorized
   - Invalid token → 401 Unauthorized

3. Authorization Errors
   - Access other user's todos → 403 Forbidden
   - Delete other user's category → 403 Forbidden

4. Database Errors
   - Foreign key violation → 400 Bad Request
   - Unique constraint violation → 409 Conflict
   - Connection timeout → 503 Service Unavailable

5. Rate Limiting (if implemented)
   - Too many requests → 429 Too Many Requests

Expected Results:
✅ Proper HTTP status codes
✅ Meaningful error messages
✅ No sensitive data in errors
✅ Consistent error response format
```

## Test Data Strategy

### Test Data Categories

**1. Minimal Test Data (Quick Tests)**
```
Users: 1 test user
Todos: 5 todos (varying status/priority)
Categories: 2 categories
Tags: 3 tags
Purpose: Fast smoke tests, basic validation
```

**2. Representative Test Data (Standard Tests)**
```
Users: 5 test users
Todos: 50 todos per user (250 total)
Categories: 5 per user
Tags: 10 per user
Purpose: Realistic scenarios, filter testing
```

**3. Stress Test Data (Performance Tests)**
```
Users: 100 test users
Todos: 1000 per user (100K total)
Categories: 10 per user
Tags: 20 per user
Purpose: Performance testing, pagination, indexing
```

### Test Data Management

**Setup (Before Tests)**
```python
@pytest.fixture(scope="function")
async def test_db():
    # Create test database
    # Run migrations
    # Seed test data
    yield db
    # Cleanup test data
    # Drop test database
```

**Isolation Strategy**
```
Option 1: Database per test (slowest, most isolated)
Option 2: Transaction rollback per test (fast, isolated)
Option 3: Cleanup after each test (medium, simple)

Recommendation: Transaction rollback for speed + isolation
```

**Test Data Builders**
```python
class TodoFactory:
    @staticmethod
    def create_todo(**overrides):
        defaults = {
            "title": "Test Todo",
            "status": "pending",
            "priority": "medium"
        }
        return {**defaults, **overrides}

class UserFactory:
    @staticmethod
    def create_user(**overrides):
        defaults = {
            "email": f"test_{uuid4()}@example.com",
            "password": "TestPass123!"
        }
        return {**defaults, **overrides}
```

## Test Environment Architecture

### Environment 1: Local Development
```
Purpose: Developer testing during development
Components:
  - Backend: FastAPI (local)
  - Database: PostgreSQL (Docker)
  - Frontend: Next.js (local)

Characteristics:
  - Fast feedback loop
  - Easy debugging
  - Hot reload enabled
```

### Environment 2: CI/CD Pipeline
```
Purpose: Automated testing on every commit
Components:
  - Backend: FastAPI (container)
  - Database: PostgreSQL (container)
  - Frontend: Next.js (container)

Characteristics:
  - Clean state every run
  - Parallel test execution
  - Test result reporting
```

### Environment 3: Staging
```
Purpose: Pre-production validation
Components:
  - Backend: FastAPI (cloud)
  - Database: Neon PostgreSQL (cloud)
  - Frontend: Next.js (cloud)

Characteristics:
  - Production-like environment
  - Real external services
  - Performance testing
```

## Quality Gates and Metrics

### Code Coverage Targets
```
Unit Tests:        80%+ coverage
Integration Tests: 70%+ coverage
E2E Tests:         50%+ critical flows

Focus Areas:
  - API endpoints: 90%+ coverage
  - Database operations: 85%+ coverage
  - Authentication: 95%+ coverage
```

### Performance Benchmarks
```
API Response Time:
  - GET requests: < 100ms (p95)
  - POST requests: < 200ms (p95)
  - Complex queries: < 500ms (p95)

Database Queries:
  - Simple selects: < 10ms
  - Joins: < 50ms
  - Aggregations: < 100ms
```

### Success Criteria
```
✅ All critical paths tested
✅ 90%+ pass rate
✅ Zero P0/P1 bugs
✅ Performance benchmarks met
✅ Security tests passed
```

## CI/CD Integration Plan

### Test Execution Stages

**Stage 1: Fast Tests (< 2 min)**
```
- Unit tests
- API contract tests
- Basic smoke tests

Trigger: Every commit
Goal: Fast feedback
```

**Stage 2: Integration Tests (< 10 min)**
```
- Database integration tests
- API integration tests
- Authentication flow tests

Trigger: Pull request
Goal: Validate integration points
```

**Stage 3: E2E Tests (< 30 min)**
```
- Complete user flows
- Cross-service integration
- Performance tests

Trigger: Before merge to main
Goal: Validate entire system
```

**Stage 4: Extended Tests (< 2 hours)**
```
- Stress tests
- Load tests
- Security scans

Trigger: Nightly or weekly
Goal: Long-term quality assurance
```

## Test Reporting and Monitoring

### Test Reports Should Include
```
✅ Pass/Fail summary
✅ Coverage metrics
✅ Performance benchmarks
✅ Failed test details with logs
✅ Flaky test identification
✅ Trend analysis over time
```

### Monitoring Integration
```
- Send test results to monitoring dashboard
- Alert on test failures
- Track test execution time trends
- Identify slow or flaky tests
```

## Documentation Deliverables

### 1. Test Strategy Document
```
- Testing scope and objectives
- Test levels and types
- Environment architecture
- Test data strategy
- Quality gates and metrics
```

### 2. Test Case Specifications
```
For each integration point:
  - Test scenario description
  - Setup requirements
  - Step-by-step test steps
  - Expected results
  - Error scenarios
```

### 3. Test Data Plan
```
- Test data categories
- Data creation strategy
- Cleanup and isolation approach
- Data builders and factories
```

### 4. Environment Setup Guide
```
- Environment configurations
- Service dependencies
- Database setup
- Test execution instructions
```

### 5. CI/CD Integration Plan
```
- Test execution stages
- Trigger conditions
- Quality gates
- Reporting and alerts
```

## When to Use This Skill

✅ **Use For:**
- Planning integration testing strategy for new features
- Designing test cases for API endpoints
- Planning test data management approach
- Designing test environment architecture
- Creating quality assurance plans

✅ **Use Before:**
- Writing actual test code
- Setting up test infrastructure
- Implementing test automation
- Deploying to production

❌ **Don't Use For:**
- Writing actual test implementation code
- Debugging failing tests
- Running tests
- Test execution or reporting

## Example Output

```markdown
# Integration Test Plan: Todo Application

## Test Strategy Overview
Multi-layered integration testing approach covering API, database, and end-to-end flows.

## Test Layers

### Layer 1: API Integration (15 test scenarios)
- Authentication endpoints (signup, login, logout)
- Todo CRUD operations
- Filtering and search
- Error handling

### Layer 2: Database Integration (10 test scenarios)
- SQLModel ORM operations
- Foreign key relationships
- Soft delete mechanism
- Transaction handling

### Layer 3: E2E Integration (8 critical flows)
- Complete user journey: signup → login → create/manage todos
- Multi-user data isolation
- Concurrent operations

## Test Data Strategy
- Transaction rollback for isolation
- Factory pattern for test data creation
- 3 data sets: minimal (5 todos), standard (50 todos), stress (1000 todos)

## Environment Architecture
- Local: Docker PostgreSQL + local FastAPI
- CI/CD: Containerized services
- Staging: Cloud services (Neon DB)

## Quality Gates
- 70%+ integration test coverage
- API response time < 200ms (p95)
- 95%+ pass rate
- Zero P0 bugs before deployment

## Test Execution Plan
Stage 1 (2 min): Smoke tests on every commit
Stage 2 (10 min): Integration tests on PR
Stage 3 (30 min): E2E tests before merge

## Next Steps
1. Approve test strategy
2. Implement test infrastructure
3. Write test cases
4. Integrate with CI/CD
5. Execute and monitor
```

## Best Practices

### Planning Phase
- Understand complete system architecture first
- Identify all integration points
- Prioritize critical user flows
- Plan for test data management upfront

### Test Design
- Test contracts, not implementation
- Cover happy paths AND error scenarios
- Design for test isolation
- Plan for parallel execution

### Quality Assurance
- Define clear success criteria
- Set realistic coverage targets
- Focus on critical paths
- Plan for regression testing

### Documentation
- Document test scenarios clearly
- Provide setup instructions
- Include expected results
- Document known limitations
