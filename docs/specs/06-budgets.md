# Budgets

## Type
- Monthly category budget

## Fields
- id
- userId
- categoryId
- amount
- month (YYYY-MM)

## Rules
- One budget per category per month
- Alerts are notifications only

## Budget Alerts

### Alert Thresholds
- 80% - Warning (approaching limit)
- 100% - At limit
- >100% - Over budget

### Alert Delivery
- Returned in transaction create/update response
- Field: budgetAlerts (array, optional)
- Informational only (never blocks transactions)
- Backend calculates all thresholds and percentages

### Alert Response Structure
```json
{
  "transaction": { ... },
  "budgetAlerts": [
    {
      "categoryId": "uuid",
      "categoryName": "Groceries",
      "budgetAmount": 1000.00,
      "actualAmount": 850.00,
      "percentageUsed": 85.0,
      "threshold": 80,
      "message": "You've used 85% of your Groceries budget"
    }
  ]
}
```

### Alert Rules
- Backend generates all alert messages
- One alert per threshold per budget per month
- Alerts reset on new month
- Mobile displays alerts, backend decides when to alert

### Endpoints
No new endpoints - alerts returned in:
- POST /transactions
- PUT /transactions/:id
