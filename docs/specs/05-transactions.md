# Transactions

## Types
- INCOME
- EXPENSE
- TRANSFER

## Fields
- id
- userId
- accountId
- categoryId
- type
- amount (Decimal 14,2)
- note
- transactionDate
- createdAt
- updatedAt

## Rules
- Amount must be greater than zero
- TRANSFER creates two linked records
- All writes must be atomic

## Errors
- ACCOUNT_NOT_FOUND
- INVALID_AMOUNT
- UNAUTHORIZED_ACCESS

## Endpoints
POST /transactions
GET /transactions
PUT /transactions/:id
DELETE /transactions/:id
