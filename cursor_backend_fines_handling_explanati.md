# Backend fines handling explanation
_Exported on 26.1.2026 at 22:42:47 CET from Cursor (2.3.41)_

---

**User**

Explain to me how fines are handled so i can implement it in a different project using this backend

---

**Cursor**


Searching the codebase for fine-related code.



Reviewing key files to understand the fines implementation:



Checking URL routing and related mixins:



Checking the Law model to understand how laws relate to fines:



## Overview

Fines are tied to groups. A group must have fines activated and can have a fines admin (fines master) who manages them.

## Core Components

### 1. **Group Configuration** (`app/group/models/group.py`)

Groups have two fields for fines:
- `fines_activated` (Boolean): Enables fines for the group
- `fines_admin` (ForeignKey to User): The user who manages fines (can approve, mark as paid, edit, delete)
- `fine_info` (TextField): Optional info about the fine system

```23:28:app/group/models/group.py
    fine_info = models.TextField(default="", blank=True)
    type = models.CharField(
        max_length=50, choices=GroupType.choices, default=GroupType.OTHER
    )
    fines_activated = models.BooleanField(default=False)
```

### 2. **Laws** (`app/group/models/law.py`)

Laws define violations that can result in fines. Each law has:
- `paragraph`: Number (e.g., "§1.1")
- `title`: Short title
- `description`: Full description
- `amount`: Default fine amount for this violation

Fines reference laws via the `description` field (stores the paragraph number).

### 3. **Fine Model** (`app/group/models/fine.py`)

The `Fine` model includes:

```13:34:app/group/models/fine.py
class Fine(BaseModel, OptionalImage, BasePermissionModel):

    access = AdminGroup.admin()
    id = models.UUIDField(
        auto_created=True,
        primary_key=True,
        default=uuid.uuid4,
        serialize=False,
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="fines")
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="fines_created"
    )
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="fines")
    amount = models.IntegerField(default=1)
    approved = models.BooleanField(default=False)
    payed = models.BooleanField(default=False)
    description = models.CharField(default="", blank=True, max_length=100)
    reason = models.TextField(default="", blank=True)
    defense = models.TextField(default="", blank=True)
    starred = models.BooleanField(default=False)
```

Fields:
- `user`: The fined user
- `created_by`: Who created the fine
- `group`: The group
- `amount`: Fine amount
- `approved`: Whether the fines admin approved it
- `payed`: Whether it's been paid
- `description`: Law paragraph reference
- `reason`: Why the fine was issued
- `defense`: User's defense (only the fined user can update)
- `starred`: Flag for important fines

### 4. **Permissions**

- Read: Group members can view fines
- Create: Group members can create fines
- Update/Delete: Only fines admin, group leader, or site admin

```54:95:app/group/models/fine.py
    @classmethod
    def has_read_permission(cls, request):
        if not Group.check_context(request):
            return check_has_access(cls.access, request)
        return request.user and (
            check_has_access(cls.access, request)
            or request.user.is_member_of(
                Group.get_group_from_permission_context(request)
            )
        )

    @classmethod
    def has_create_permission(cls, request):
        if not Group.check_context(request):
            return check_has_access(cls.access, request)
        return check_has_access(cls.access, request) or request.user.is_member_of(
            Group.get_group_from_permission_context(request)
        )

    @classmethod
    def has_update_permission(cls, request):
        if not Group.check_context(request):
            return check_has_access(cls.access, request)
        return request.user and (
            Group.check_user_is_fine_master(request)
            or check_has_access(cls.access, request)
            or Group.check_request_user_is_leader(request)
        )

    @classmethod
    def has_destroy_permission(cls, request):
        return cls.has_update_permission(request)

    def has_object_update_permission(self, request):
        return self.has_update_permission(request)

    def has_object_destroy_permission(self, request):
        return self.has_destroy_permission(request)

    def has_object_update_defense_permission(self, request):
        return self.user == request.user
```

## API Endpoints

All endpoints are under `/groups/{slug}/fines/`:

1. `GET /groups/{slug}/fines/` - List all fines (filterable by `payed`, `approved`, `starred`)
2. `POST /groups/{slug}/fines/` - Create fine(s) for one or more users
3. `GET /groups/{slug}/fines/{id}/` - Get specific fine
4. `PUT /groups/{slug}/fines/{id}/` - Update fine (fines admin/leader only)
5. `DELETE /groups/{slug}/fines/{id}/` - Delete fine (fines admin/leader only)
6. `PUT /groups/{slug}/fines/{id}/defense/` - User adds/updates defense
7. `PUT /groups/{slug}/fines/{id}/starred/` - Toggle starred status
8. `GET /groups/{slug}/fines/users/` - List users with their total fine amounts
9. `GET /groups/{slug}/fines/users/{user_id}/` - Get all fines for a specific user
10. `PUT /groups/{slug}/fines/batch-update/` - Update multiple fines at once
11. `PUT /groups/{slug}/fines/batch-update/{user_id}/` - Update all fines for a user
12. `GET /groups/{slug}/fines/statistics/` - Get fine statistics (paid, approved but not paid, not approved)

## Key Features

### 1. **Batch Creation**
Fines can be created for multiple users at once:

```46:83:app/group/views/fine.py
    # noinspection PyShadowingNames
    def create(self, request, *args, **kwargs):
        context = {
            "group_slug": kwargs["slug"],
            "created_by": request.id,
            "user_ids": request.data["user"],
            "request": request,
        }

        serializer = FineUpdateCreateSerializer(
            many=True, partial=True, data=[request.data], context=context
        )

        if serializer.is_valid():
            fines = super().perform_create(serializer)

            if len(fines):
                fine = fines[0]
                users = list(map(lambda fine: fine.user, fines))

                from app.communication.notifier import Notify

                Notify(
                    users,
                    f'Du har fått en bot i "{fine.group.name}"',
                    UserNotificationSettingType.FINE,
                ).add_paragraph(
                    f'{fine.created_by.first_name} {fine.created_by.last_name} har gitt deg {fine.amount} bøter for å ha brutt paragraf "{fine.description}" i gruppen {fine.group.name}'
                ).add_link(
                    "Gå til bøter",
                    f"{fine.group.website_url}boter/",
                ).send()

            return Response(data=serializer.data, status=status.HTTP_200_OK)
        return Response(
            {"detail": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
```

### 2. **Notifications**
Users are notified when they receive a fine.

### 3. **Validation**
Fines validate that the user is a group member:

```43:52:app/group/models/fine.py
    def clean(self):
        if not self.user.is_member_of(self.group):
            raise UserIsNotInGroup(
                f"{self.user.first_name} {self.user.last_name} er ikke medlem i gruppen"
            )

    def save(self, *args, **kwargs):
        self.full_clean()

        return super().save(*args, **kwargs)
```

### 4. **Statistics**
Aggregated statistics for a group:

```145:167:app/group/serializers/fine.py
class FineStatisticsSerializer(BaseModelSerializer):

    payed = serializers.SerializerMethodField()
    approved_and_not_payed = serializers.SerializerMethodField()
    not_approved = serializers.SerializerMethodField()

    class Meta:
        model = Group

        fields = ("payed", "approved_and_not_payed", "not_approved")

    def get_sum(self, obj, *args, **kwargs):
        sum = obj.fines.filter(*args, **kwargs).aggregate(sum=Sum("amount"))["sum"]
        return sum if sum else 0

    def get_payed(self, obj):
        return self.get_sum(obj, payed=True)

    def get_approved_and_not_payed(self, obj):
        return self.get_sum(obj, payed=False, approved=True)

    def get_not_approved(self, obj):
        return self.get_sum(obj, approved=False)
```

## Workflow

1. Group setup: Enable `fines_activated` and optionally set a `fines_admin`
2. Create laws: Define violations with paragraph numbers
3. Create fines: Members create fines referencing law paragraphs
4. Approval: Fines admin approves fines
5. Defense: Users can add defenses
6. Payment: Fines admin marks fines as paid
7. Statistics: Track totals by status

## Implementation Notes

- Fines are only accessible if `group.fines_activated = True`
- The `description` field stores the law paragraph reference (e.g., "§1.1")
- Batch operations use transactions for consistency
- Filtering supports `payed`, `approved`, and `starred`
- Users can only update their own `defense` field

This provides a complete fine management system with permissions, notifications, and statistics.

```python
    fine_info = models.TextField(default="", blank=True)
    type = models.CharField(
        max_length=50, choices=GroupType.choices, default=GroupType.OTHER
    )
    fines_activated = models.BooleanField(default=False)
```

```python
class Fine(BaseModel, OptionalImage, BasePermissionModel):

    access = AdminGroup.admin()
    id = models.UUIDField(
        auto_created=True,
        primary_key=True,
        default=uuid.uuid4,
        serialize=False,
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="fines")
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="fines_created"
    )
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="fines")
    amount = models.IntegerField(default=1)
    approved = models.BooleanField(default=False)
    payed = models.BooleanField(default=False)
    description = models.CharField(default="", blank=True, max_length=100)
    reason = models.TextField(default="", blank=True)
    defense = models.TextField(default="", blank=True)
    starred = models.BooleanField(default=False)
```

```python
    @classmethod
    def has_read_permission(cls, request):
        if not Group.check_context(request):
            return check_has_access(cls.access, request)
        return request.user and (
            check_has_access(cls.access, request)
            or request.user.is_member_of(
                Group.get_group_from_permission_context(request)
            )
        )

    @classmethod
    def has_create_permission(cls, request):
        if not Group.check_context(request):
            return check_has_access(cls.access, request)
        return check_has_access(cls.access, request) or request.user.is_member_of(
            Group.get_group_from_permission_context(request)
        )

    @classmethod
    def has_update_permission(cls, request):
        if not Group.check_context(request):
            return check_has_access(cls.access, request)
        return request.user and (
            Group.check_user_is_fine_master(request)
            or check_has_access(cls.access, request)
            or Group.check_request_user_is_leader(request)
        )

    @classmethod
    def has_destroy_permission(cls, request):
        return cls.has_update_permission(request)

    def has_object_update_permission(self, request):
        return self.has_update_permission(request)

    def has_object_destroy_permission(self, request):
        return self.has_destroy_permission(request)

    def has_object_update_defense_permission(self, request):
        return self.user == request.user
```

```python
    # noinspection PyShadowingNames
    def create(self, request, *args, **kwargs):
        context = {
            "group_slug": kwargs["slug"],
            "created_by": request.id,
            "user_ids": request.data["user"],
            "request": request,
        }

        serializer = FineUpdateCreateSerializer(
            many=True, partial=True, data=[request.data], context=context
        )

        if serializer.is_valid():
            fines = super().perform_create(serializer)

            if len(fines):
                fine = fines[0]
                users = list(map(lambda fine: fine.user, fines))

                from app.communication.notifier import Notify

                Notify(
                    users,
                    f'Du har fått en bot i "{fine.group.name}"',
                    UserNotificationSettingType.FINE,
                ).add_paragraph(
                    f'{fine.created_by.first_name} {fine.created_by.last_name} har gitt deg {fine.amount} bøter for å ha brutt paragraf "{fine.description}" i gruppen {fine.group.name}'
                ).add_link(
                    "Gå til bøter",
                    f"{fine.group.website_url}boter/",
                ).send()

            return Response(data=serializer.data, status=status.HTTP_200_OK)
        return Response(
            {"detail": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
```

```python
    def clean(self):
        if not self.user.is_member_of(self.group):
            raise UserIsNotInGroup(
                f"{self.user.first_name} {self.user.last_name} er ikke medlem i gruppen"
            )

    def save(self, *args, **kwargs):
        self.full_clean()

        return super().save(*args, **kwargs)
```

```python
class FineStatisticsSerializer(BaseModelSerializer):

    payed = serializers.SerializerMethodField()
    approved_and_not_payed = serializers.SerializerMethodField()
    not_approved = serializers.SerializerMethodField()

    class Meta:
        model = Group

        fields = ("payed", "approved_and_not_payed", "not_approved")

    def get_sum(self, obj, *args, **kwargs):
        sum = obj.fines.filter(*args, **kwargs).aggregate(sum=Sum("amount"))["sum"]
        return sum if sum else 0

    def get_payed(self, obj):
        return self.get_sum(obj, payed=True)

    def get_approved_and_not_payed(self, obj):
        return self.get_sum(obj, payed=False, approved=True)

    def get_not_approved(self, obj):
        return self.get_sum(obj, approved=False)
```

