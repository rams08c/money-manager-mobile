# Categories Specification

## Purpose
Categories are used to classify transactions and budgets.
This system supports both **system-defined categories** (shared by all users)
and **user-defined categories** (custom per user).

---

## Category Types

Categories are of two ownership types:

### 1. System Categories
- Shared across all users
- Created and managed by the system
- Available immediately for every user
- Cannot be edited or deleted by any user

### 2. User Categories
- Created by individual users
- Visible only to the owning user
- Can be edited or deleted (with restrictions)

---

## Entity Definition

### Category Entity

Fields:
- `id` (uuid)
- `name` (string)
- `type` (enum: INCOME | EXPENSE)
- `userId` (uuid | null)
- `isSystem` (boolean)
- `isDeleted` (boolean)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

---

## Ownership Rules

### System Categories
- `isSystem = true`
- `userId = null`
- Read-only for all users
- Must never be updated or deleted
- Created only via database seed
- Returned in all category queries

### User Categories
- `isSystem = false`
- `userId` is required
- Belongs strictly to one user
- Can be updated or deleted if unused

---

## Default System Categories

### INCOME
- Salary
- Freelance
- Business
- Investment
- Interest
- Other Income

### EXPENSE
- Groceries
- Dining Out
- Transportation
- Utilities
- Rent
- Entertainment
- Healthcare
- Education
- Shopping
- Travel
- Other Expense

These categories:
- Must be created once
- Must exist for all users
- Must never be deleted or modified

---

## API Endpoints

### Create Category (User Category Only)
