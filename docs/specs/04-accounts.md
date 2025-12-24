# Accounts

## Types
- CASH
- BANK
- WALLET
- CREDIT_CARD

## Fields
- id
- userId
- name
- type
- currency
- openingBalance
- createdAt

## Rules
- Account belongs to one user
- Currency is immutable
- Balance is derived, not stored

## Endpoints
POST /accounts
GET /accounts
PUT /accounts/:id
DELETE /accounts/:id
