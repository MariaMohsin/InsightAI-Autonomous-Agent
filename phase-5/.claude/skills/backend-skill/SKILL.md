---
name: backend-skill
description: Generate backend routes, handle requests/responses, and connect to databases efficiently. Use for building server-side logic and APIs.
---

# Backend Skill

## Instructions

1. **Route Generation**
   - Create RESTful or GraphQL endpoints
   - Follow proper naming conventions (e.g., `/users`, `/products/:id`)
   - Handle route parameters and query strings correctly

2. **Request & Response Handling**
   - Validate incoming requests
   - Return proper HTTP status codes (200, 201, 400, 401, 404, 500)
   - Format responses consistently (JSON, with clear messages)
   - Handle errors gracefully and log them

3. **Database Integration**
   - Connect to relational or NoSQL databases
   - Use secure queries / parameterized statements
   - Implement CRUD operations
   - Manage database connections efficiently (pooling, closing)

4. **Security & Best Practices**
   - Sanitize user input to prevent injection attacks
   - Handle authentication/authorization where needed
   - Implement logging and error monitoring
   - Ensure scalability and maintainable code structure

## Best Practices
- Keep route handlers small and focused
- Reuse middleware for authentication, validation, and error handling
- Follow framework conventions (Express, FastAPI, Next.js API routes)
- Write clean, readable, and documented code
- Test endpoints with Postman / curl / automated tests

## Example Structure (Express.js)
```javascript
const express = require('express');
const router = express.Router();
const { getUsers, createUser } = require('../controllers/userController');
const { validateUser } = require('../middleware/validation');

router.get('/users', getUsers);

router.post('/users', validateUser, createUser);

module.exports = router;
