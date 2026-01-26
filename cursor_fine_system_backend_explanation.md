# Fine system backend explanation
_Exported on 26.1.2026 at 22:13:29 CET from Cursor (2.3.41)_

---

**User**

Explain to me how the system for giving fines are working so a different (app) project using the same backend

---

**Cursor**


Searching the codebase for fine/strike-related code to understand how fines are implemented.



Reviewing API endpoints and hooks to understand how fines are created and managed:



Checking API endpoints for strikes and URL constants:



There are two fine/strike systems in this codebase:

## 1. Strikes (Prikker) — Event-related

Strikes are tied to events and users.

### API endpoints
- **Create strike**: `POST /strikes/`
- **Get strikes**: `GET /strikes/` (with optional filters)
- **Delete strike**: `DELETE /strikes/{id}/`

### Data structure
```typescript
type StrikeCreate = {
  user_id: string;           // Required: User ID
  event_id?: string;         // Optional: Event ID
  strike_size: number;       // Required: Number of strikes (positive integer)
  enum?: StrikeReason;       // Optional: Predefined reason enum
  description: string;       // Required: Description (especially if custom)
}
```

### Strike reasons (enum)
- `PAST_DEADLINE` - Meldt av etter avmeldingsfrist (1 prikk)
- `NO_SHOW` - Møtte ikke (2 prikk)
- `LATE` - Møtte for sent (1 prikk)
- `BAD_BEHAVIOR` - Upassende oppførsel (1 prikk)
- `EVAL_FORM` - Ikke svart på evalueringsskjema (3 prikk)

You can use a predefined enum or set `enum` to `null` and provide a custom `description`.

### Example usage
```typescript
// Using predefined reason
POST /strikes/
{
  "user_id": "user-123",
  "event_id": "event-456",
  "strike_size": 2,
  "enum": "NO_SHOW"
}

// Using custom description
POST /strikes/
{
  "user_id": "user-123",
  "event_id": "event-456",
  "strike_size": 1,
  "description": "Custom reason here"
}
```

---

## 2. Group Fines (Boter) — Group-related

Fines are tied to groups and can reference group laws.

### API endpoints
- **Create fine**: `POST /groups/{groupSlug}/fines/`
- **Get fines**: `GET /groups/{groupSlug}/fines/` (with optional filters)
- **Get user fines**: `GET /groups/{groupSlug}/fines/users/{userId}/`
- **Get users fines**: `GET /groups/{groupSlug}/fines/users/` (aggregated by user)
- **Update fine**: `PUT /groups/{groupSlug}/fines/{fineId}/`
- **Update fine defense**: `PUT /groups/{groupSlug}/fines/{fineId}/defense/`
- **Batch update**: `PUT /groups/{groupSlug}/fines/batch-update/`
- **Delete fine**: `DELETE /groups/{groupSlug}/fines/{fineId}/`
- **Statistics**: `GET /groups/{groupSlug}/fines/statistics/`

### Data structure
```typescript
type GroupFineCreate = {
  user: string[];            // Required: Array of user IDs (can fine multiple users)
  amount: number;           // Required: Fine amount
  description: string;      // Required: Description (usually formatted law header)
  reason: string;           // Required: Reason/justification (markdown supported)
  image?: string | null;    // Optional: Image proof
}
```

### Group fine response
```typescript
type GroupFine = {
  id: string;
  user: UserBase;
  amount: number;
  approved: boolean;        // Whether fine is approved
  payed: boolean;           // Whether fine is paid
  description: string;
  reason: string;
  defense: string;          // User's defense/response
  image: string | null;
  created_by: UserBase;
  created_at: string;
}
```

### Group laws
Fines can reference group laws. Get laws with:
- `GET /groups/{groupSlug}/laws/`

Laws have:
- `id`, `title`, `paragraph`, `description`, `amount`

### Example usage
```typescript
// Create a fine for one or more users
POST /groups/my-group/fines/
{
  "user": ["user-123", "user-456"],  // Can fine multiple users at once
  "amount": 100,
  "description": "§1.1 - Brudd på regler",  // Usually formatted from law
  "reason": "Did not follow group rules during event",
  "image": "https://example.com/proof.jpg"  // Optional
}

// Update fine status
PUT /groups/my-group/fines/{fineId}/
{
  "approved": true,
  "payed": false
}

// User submits defense
PUT /groups/my-group/fines/{fineId}/defense/
{
  "defense": "I have a valid excuse..."
}
```

### Features
- Multiple users can be fined in one request
- Approval workflow (`approved`)
- Payment tracking (`payed`)
- User defense/response
- Image proof support
- Batch operations
- Statistics endpoint

---

## Differences

| Feature | Strikes | Group Fines |
|---------|---------|-------------|
| **Scope** | Event-related | Group-related |
| **Multiple users** | No (one at a time) | Yes (array of user IDs) |
| **Amount** | Strike count (integer) | Monetary amount |
| **Approval** | No | Yes (`approved` field) |
| **Payment tracking** | No | Yes (`payed` field) |
| **User defense** | No | Yes (`defense` field) |
| **Laws reference** | No | Yes (via group laws) |
| **Image proof** | No | Yes |

Both systems require authentication. Use the appropriate system based on whether the fine is event-related (strikes) or group-related (group fines).

