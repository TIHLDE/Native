# Frontend fine group determination
_Exported on 26.1.2026 at 23:11:07 CET from Cursor (2.3.41)_

---

**User**

Explain how the frontend findes the group I am able to give fines in from the fines page

---

**Cursor**


Tracing how the frontend determines which group a user can give fines in. Searching the codebase for the fines page and related logic.



Reviewing the fines page and related navigation/routing logic:



Checking how the group details page determines permissions and how navigation works:



Checking the API call to see what group data is returned:



## How the Frontend Finds the Group for Giving Fines

### 1. **URL-based group identification**
The fines page route is `/grupper/$slug/boter` (line 14 in `fines/index.tsx`). The group slug comes from the URL parameter:

```31:33:src/pages/Groups/fines/index.tsx
  const { slug } = useParams({ strict: false });
  const { data: user } = useUser();
  const { data: group } = useGroup(slug || '-');
```

### 2. **Fetching group data**
The `useGroup(slug)` hook calls `API.getGroup(slug)`, which fetches the group from the backend:

```342:342:src/api/api.ts
  getGroup: (slug: Group['slug']) => IFetch<Group>({ method: 'GET', url: `${GROUPS_ENDPOINT}/${slug}/` }),
```

### 3. **Group data includes permission information**
The backend returns a `Group` object with:
- `fines_admin`: The user who is the fines admin (can be `null`)
- `fines_activated`: Whether fines are enabled for this group
- `permissions.write`: Whether the current user has write permissions
- `viewer_is_member`: Whether the viewer is a member of the group

### 4. **Permission check for giving fines**
The frontend determines if the user can give fines using this check:

```51:51:src/pages/Groups/fines/index.tsx
  const isAdmin = (Boolean(user) && group?.fines_admin?.user_id === user?.user_id) || group?.permissions.write;
```

A user can give fines if:
- They are the `fines_admin` for the group, or
- They have `write` permissions on the group

### 5. **Visibility control**
The "Bøter" tab is shown only if:
- Fines are activated (`fines_activated` is `true`), and
- The user is a member or has write access

```50:50:src/pages/Groups/GroupDetails.tsx
  const showFinesAndLaws = isFinesActive && (isMemberOfGroup || hasWriteAcccess);
```

Summary: The group is identified from the URL slug, and permissions are determined from the group data returned by the API. The backend includes the necessary permission fields in the group response.

