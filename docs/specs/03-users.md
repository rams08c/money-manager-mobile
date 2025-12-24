# Users

## Fields
- id (uuid)
- name
- email
- defaultCurrency
- createdAt
- updatedAt

## Rules
- Email must be unique
- Currency cannot change after transactions exist

## Endpoints
GET /users/me
PUT /users/me
