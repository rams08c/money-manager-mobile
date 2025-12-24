# Reports

## Purpose
Provide financial insights and analytics

## Report Types

### 1. Monthly Summary
**Endpoint:** GET /reports/monthly

**Query Parameters:**
- month (YYYY-MM) - required
- accountId - optional (filter by specific account)

**Response:**
```json
{
  "totalIncome": "5000.00",
  "totalExpense": "3500.00",
  "netAmount": "1500.00",
  "transactionCount": 45
}
```

### 2. Category Breakdown
**Endpoint:** GET /reports/categories

**Query Parameters:**
- startDate (YYYY-MM-DD) - required
- endDate (YYYY-MM-DD) - required
- type (INCOME | EXPENSE) - optional
- categoryId - optional (filter by specific category)

**Response:**
```json
[
  {
    "categoryId": "uuid",
    "categoryName": "Groceries",
    "totalAmount": 850.00,
    "transactionCount": 12,
    "percentage": 45.5
  }
]
```

### 3. Budget vs Actual
**Endpoint:** GET /reports/budget-vs-actual

**Query Parameters:**
- month (YYYY-MM) - required

**Response:**
```json
[
  {
    "categoryId": "uuid",
    "categoryName": "Groceries",
    "budgetAmount": 1000.00,
    "actualAmount": 850.00,
    "difference": 150.00,
    "percentageUsed": 85.0,
    "status": "under"
  }
]
```

**Status Values:**
- `under`: percentageUsed < 90%
- `near`: 90% ≤ percentageUsed ≤ 100%
- `over`: percentageUsed > 100%

## Rules
- All reports filtered by userId (from JWT)
- Amounts in Decimal(14,2)
- Percentages calculated server-side
- Date ranges validated (startDate ≤ endDate)
- Month format: YYYY-MM
- Date format: YYYY-MM-DD

## Calculations

### Category Breakdown Percentage
```
percentage = (categoryTotal / grandTotal) * 100
```

### Budget Percentage Used
```
percentageUsed = (actualAmount / budgetAmount) * 100
```

### Budget Difference
```
difference = budgetAmount - actualAmount
```
(Positive = remaining, Negative = overspent)

## Errors
- INVALID_DATE_RANGE
- INVALID_MONTH_FORMAT
- INVALID_DATE_FORMAT
- UNAUTHORIZED_ACCESS
