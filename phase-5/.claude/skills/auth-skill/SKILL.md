---
name: auth-skill
description: Implement secure user authentication flows including signup, signin, password hashing, JWT tokens, and Better Auth integration. Use for auth-related features.
---
Auth Skill – Secure Authentication
Instructions

Signup flow

Collect and validate user credentials

Hash passwords using bcrypt or argon2

Prevent duplicate accounts

Store credentials securely

Signin flow

Verify user credentials

Compare hashed passwords securely

Handle invalid login attempts safely

Implement account lockout or rate limiting

Password security

Never store plaintext passwords

Use salted and hashed passwords

Support password reset flows

Enforce strong password policies

JWT token handling

Generate access and refresh tokens

Set secure expiration times

Validate and decode tokens

Rotate and revoke tokens when required

Better Auth integration

Configure Better Auth providers correctly

Integrate with existing auth flows

Handle sessions and callbacks securely

Follow Better Auth best practices

Best Practices

Always validate and sanitize user input

Use HTTPS and secure cookies

Apply least-privilege access

Follow OWASP authentication guidelines

Log auth events without exposing secrets