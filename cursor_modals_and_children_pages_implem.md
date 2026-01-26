**User**

Explain to me how the modals/children pages are implemented in this project

---

**Cursor**


Reviewing the modal layout and example modal pages to understand the implementation.



Checking how modals are invoked from other parts of the app:



Checking how modals are invoked from other components:



## Modal Implementation Overview

Modals are implemented using Expo Router's file-based routing with a route group pattern.

### 1. **Route Group Structure**

The modals live in `app/(app)/(modals)/`:
- `(modals)` is a route group (parentheses don't create a URL segment)
- All modal screens are children of this group

### 2. **Layout Configuration**

**Parent Layout** (`app/(app)/_layout.tsx`):
```73:80:app/(app)/_layout.tsx
      <Stack.Screen
        name="(modals)"
        options={{
          headerShown: false,
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
```

**Modal Layout** (`app/(app)/(modals)/_layout.tsx`):
- Uses a `Stack` navigator
- Each screen configured with `presentation: "card"` and `animation: "slide_from_right"`
- Transparent background for overlay effect

### 3. **Modal Types**

The project includes:
- `notifications.tsx` - Notifications list
- `post/[postId].tsx` - Individual post detail
- `post/[postId]/comments.tsx` - Post comments
- `post/[postId]/edit.tsx` - Edit post
- `restaurant/[restaurantId].tsx` - Restaurant details
- `user/[userId].tsx` - User profile
- `settings.tsx` - Settings page

### 4. **How Modals Are Opened**

Modals are opened using `router.push()` with the `/(modals)/` path:

```typescript
// From Post component
router.push(`/(modals)/post/${id}`)

// From feed
router.push(`/(modals)/user/${userId}`)

// From header
router.push("/(modals)/notifications")
```

### 5. **Navigation Patterns**

- Opening: `router.push("/(modals)/...")`
- Closing: `router.back()` or custom back handlers
- Parameters: Dynamic routes like `[postId]` and `[userId]` use `useLocalSearchParams()`

### 6. **Key Features**

- Full-screen pages that slide in from the right
- Custom headers with back buttons
- Support for nested navigation (e.g., post → comments)
- Return navigation handling (e.g., `returnTo` parameter in post edit)

This uses Expo Router's native navigation, so modals are full screens in the navigation stack, not overlays. The `presentation: "card"` style gives them a modal-like appearance.

