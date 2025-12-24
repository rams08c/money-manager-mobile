# Offline Sync

## Strategy
- Local-first writes
- Background sync
- Server is source of truth

## Conflict Resolution
- Latest updatedAt wins
- Soft deletes only

## Requirements
- App must function fully offline
- Sync must be idempotent
