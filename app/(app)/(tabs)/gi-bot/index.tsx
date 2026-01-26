import me, { usePermissions, myMemberships } from "@/actions/users/me";
import { getGroupLaws, createFine, getGroupMembers, getGroup } from "@/actions/groups/fines";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserCard from "@/components/ui/userCard";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { ScrollView, View, ActivityIndicator, Pressable } from "react-native";
import Toast from "react-native-toast-message";
import { useState, useEffect, useRef } from "react";
import { GroupLaw, GroupFineCreate, GroupFine, User as UserType, Group } from "@/actions/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Modal } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function GiBot() {
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
    const [selectedLaw, setSelectedLaw] = useState<GroupLaw | null>(null);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [reason, setReason] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    const user = useQuery({
        queryKey: ["users", "me"],
        queryFn: me,
    });

    const permissions = usePermissions();

    const memberships = useQuery({
        queryKey: ["users", "me", "memberships"],
        queryFn: myMemberships,
    });

    // Debug logging for memberships
    useEffect(() => {
        console.log("=== MEMBERSHIPS DEBUG ===");
        console.log("Memberships data:", memberships.data);
        console.log("Memberships count:", memberships.data?.length ?? 0);
        if (memberships.data) {
            memberships.data.forEach((group, index) => {
                console.log(`Group ${index}:`, {
                    slug: group.slug,
                    name: group.name,
                    fines_activated: group.fines_activated,
                    fines_activated_type: typeof group.fines_activated,
                    all_keys: Object.keys(group),
                    full_group: JSON.stringify(group, null, 2),
                });
            });
        }
    }, [memberships.data]);

    // Filter memberships to only groups with fines_activated
    const groupsWithFinesActivated = memberships.data?.filter(group => {
        const hasFinesActivated = group.fines_activated === true;
        console.log(`[Filter] Group ${group.slug} (${group.name}): fines_activated = ${group.fines_activated} (type: ${typeof group.fines_activated}), included: ${hasFinesActivated}`);
        return hasFinesActivated;
    }) ?? [];

    // Debug logging
    useEffect(() => {
        console.log("=== FINE GROUP DEBUG ===");
        console.log("Groups with fines activated:", groupsWithFinesActivated.map(g => ({ slug: g.slug, name: g.name })));
        console.log("Current user:", user.data ? { user_id: user.data.user_id, name: `${user.data.first_name} ${user.data.last_name}` } : "Not loaded");
    }, [groupsWithFinesActivated, user.data]);

    // Fetch full group data for each group to get permissions
    const groupQueries = useQueries({
        queries: groupsWithFinesActivated.map((group) => ({
            queryKey: ["groups", group.slug],
            queryFn: () => getGroup(group.slug),
            enabled: !!group.slug,
        })),
    });

    // Create a map of slug -> query result for reliable lookup
    const groupDataMap = new Map<string, { data?: Group; error?: Error; isPending: boolean }>();
    groupsWithFinesActivated.forEach((group, index) => {
        const query = groupQueries[index];
        if (query) {
            groupDataMap.set(group.slug, {
                data: query.data,
                error: query.error as Error | undefined,
                isPending: query.isPending,
            });
        }
    });

    // Debug logging for group queries
    useEffect(() => {
        console.log("=== GROUP QUERIES DEBUG ===");
        groupsWithFinesActivated.forEach((group, index) => {
            const query = groupQueries[index];
            if (query) {
                console.log(`Group ${group.slug} (${group.name}):`, {
                    status: query.isPending ? "loading" : query.isError ? "error" : "success",
                    hasData: !!query.data,
                    error: query.error?.message,
                    data: query.data ? {
                        fines_activated: query.data.fines_activated,
                        fines_admin: query.data.fines_admin,
                        permissions: query.data.permissions,
                    } : null,
                });
            }
        });
    }, [groupQueries, groupsWithFinesActivated]);

    // Helper function to check if user can give fines for a group
    const canGiveFines = (group: Group, currentUser: UserType | undefined): boolean => {
        if (!group.fines_activated) {
            console.log(`[canGiveFines] Group ${group.slug}: fines_activated is false`);
            return false;
        }
        if (!currentUser) {
            console.log(`[canGiveFines] Group ${group.slug}: No current user`);
            return false;
        }
        
        // User can give fines if they are a member of the group
        const isMember = group.viewer_is_member === true;
        
        console.log(`[canGiveFines] Group ${group.slug}:`, {
            viewer_is_member: group.viewer_is_member,
            user_id: currentUser.user_id,
            result: isMember,
        });
        
        return isMember;
    };

    // Get full group data for groups where user can actually give fines
    // Use slug-based lookup instead of index mapping
    const groupsWithFines: Group[] = groupsWithFinesActivated
        .map((group) => {
            const queryResult = groupDataMap.get(group.slug);
            if (!queryResult) return null;
            
            // If query failed, log the error but don't filter out yet
            if (queryResult.error) {
                console.error(`[groupsWithFines] Error loading group ${group.slug}:`, queryResult.error);
                return null;
            }
            
            // If still loading, return null (will be handled in loading state)
            if (queryResult.isPending || !queryResult.data) {
                return null;
            }
            
            const fullGroupData = queryResult.data;
            if (canGiveFines(fullGroupData, user.data)) {
                return fullGroupData;
            }
            return null;
        })
        .filter((group): group is Group => group !== null);

    // Track which groups have errors
    const groupsWithErrors = groupsWithFinesActivated
        .map((group) => {
            const queryResult = groupDataMap.get(group.slug);
            if (queryResult?.error) {
                return { group, error: queryResult.error };
            }
            return null;
        })
        .filter((item): item is { group: Group; error: Error } => item !== null);

    // Auto-select first group if only one available
    useEffect(() => {
        if (groupsWithFines.length === 1 && !selectedGroup) {
            setSelectedGroup(groupsWithFines[0]);
        }
    }, [groupsWithFines, selectedGroup]);

    const groupSlug = selectedGroup?.slug;

    const laws = useQuery({
        queryKey: ["groups", groupSlug, "laws"],
        queryFn: () => getGroupLaws(groupSlug!),
        enabled: !!groupSlug,
    });

    const groupMembers = useQuery({
        queryKey: ["groups", groupSlug, "members"],
        queryFn: () => getGroupMembers(groupSlug!),
        enabled: !!groupSlug,
    });

    const createFineMutation = useMutation({
        mutationFn: (fine: GroupFineCreate) => createFine(groupSlug!, fine),
        onSuccess: (fines: GroupFine[]) => {
            // Backend returns an array of fines (one per user)
            queryClient.invalidateQueries({ queryKey: ["groups", groupSlug, "fines"] });
            const fineCount = fines.length;
            const userCount = fineCount > 1 ? `${fineCount} brukere` : "bruker";
            Toast.show({
                type: "success",
                text1: "Suksess",
                text2: `Bot gitt til ${userCount}!`,
            });
            // Reset form
            setSelectedUsers([]);
            setSelectedLaw(null);
            setAmount("");
            setDescription("");
            setReason("");
        },
        onError: (error: Error) => {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: error.message || "Kunne ikke gi bot",
            });
        },
    });

    // Auto-fill description and amount when law is selected
    useEffect(() => {
        if (selectedLaw) {
            // Backend expects only the paragraph reference (e.g., "§1.1" or "1.1")
            setDescription(selectedLaw.paragraph.startsWith('§') ? selectedLaw.paragraph : `§${selectedLaw.paragraph}`);
            setAmount(selectedLaw.amount.toString());
        }
    }, [selectedLaw]);

    const handleToggleUser = (user: UserType) => {
        const isSelected = selectedUsers.find(u => u.user_id === user.user_id);
        if (isSelected) {
            handleRemoveUser(user.user_id);
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(u => u.user_id !== userId));
    };


    const handleSubmit = () => {
        if (selectedUsers.length === 0) {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: "Velg minst én bruker",
            });
            return;
        }

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: "Angi et gyldig antall",
            });
            return;
        }

        if (!description.trim()) {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: "Beskrivelse er påkrevd",
            });
            return;
        }

        if (!reason.trim()) {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: "Årsak er påkrevd",
            });
            return;
        }

        const fineData: GroupFineCreate = {
            user: selectedUsers.map(u => u.user_id),
            amount: Number(amount),
            description: description.trim(),
            reason: reason.trim(),
            image: null,
        };

        createFineMutation.mutate(fineData);
    };

    if (user.isError) {
        return (
            <PageWrapper className="flex-1">
                <ScrollView>
                    <View className="flex-1 justify-center items-center p-4">
                        <Text className="text-lg text-red-500">
                            Feil: {user.error.message}
                        </Text>
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    // Check if any group queries are still loading
    const groupsLoading = groupQueries.some(query => query.isPending);
    const hasLoadedGroups = groupsWithFines.length > 0;
    const allGroupsLoaded = !groupsLoading && groupQueries.every(query => !query.isPending);

    if (user.isPending || permissions.isPending || memberships.isPending) {
        return (
            <PageWrapper className="flex-1">
                <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-lg">Laster...</Text>
                </View>
            </PageWrapper>
        );
    }

    if (memberships.isError) {
        return (
            <PageWrapper className="flex-1">
                <ScrollView>
                    <View className="flex-1 justify-center items-center p-4" style={{ paddingTop: insets.top + 100 }}>
                        <Text className="text-lg text-red-500 text-center">
                            Feil: {memberships.error.message}
                        </Text>
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    // Show error messages for groups that failed to load
    if (groupsWithErrors.length > 0 && allGroupsLoaded) {
        return (
            <PageWrapper className="flex-1">
                <ScrollView>
                    <View className="flex-1 justify-center items-center p-4" style={{ paddingTop: insets.top + 100 }}>
                        <Text className="text-lg text-red-500 text-center mb-4">
                            Kunne ikke laste gruppetilganger:
                        </Text>
                        {groupsWithErrors.map(({ group, error }) => (
                            <Text key={group.slug} className="text-sm text-red-500 text-center mb-2">
                                {group.name}: {error.message}
                            </Text>
                        ))}
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    // Show message if no groups available (only after all queries have completed)
    if (groupsWithFines.length === 0 && allGroupsLoaded) {
        return (
            <PageWrapper className="flex-1">
                <ScrollView>
                    <View className="flex-1 justify-center items-center p-4" style={{ paddingTop: insets.top + 100 }}>
                        <Text className="text-lg text-center mb-4">
                            Du må være medlem av en gruppe med bøter aktivert for å kunne gi bot.
                        </Text>
                        {groupsWithFinesActivated.length > 0 && (
                            <View className="mt-4">
                                <Text className="text-sm text-muted-foreground text-center mb-2">
                                    Grupper med bøter aktivert ({groupsWithFinesActivated.length}):
                                </Text>
                                {groupsWithFinesActivated.map((group) => {
                                    const queryResult = groupDataMap.get(group.slug);
                                    return (
                                        <Text key={group.slug} className="text-xs text-muted-foreground text-center">
                                            • {group.name} - {queryResult?.isPending ? "Laster..." : queryResult?.error ? `Feil: ${queryResult.error.message}` : "Ingen tilgang"}
                                        </Text>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    // Show loading state only if we have no groups yet and queries are still loading
    if (groupsWithFines.length === 0 && groupsLoading) {
        return (
            <PageWrapper className="flex-1">
                <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-lg">Laster gruppetilganger...</Text>
                </View>
            </PageWrapper>
        );
    }

    // If no group selected, show group selection screen
    if (!groupSlug || groupsWithFines.length === 0) {
        return (
            <PageWrapper className="flex-1">
                <ScrollView>
                    <View className="flex-1 justify-center items-center p-4" style={{ paddingTop: insets.top + 100, minHeight: '100%' }}>
                        <View className="flex flex-col gap-4 items-center w-full max-w-md">
                            <Text className="text-xl font-semibold text-center mb-4">
                                Velg en gruppe for å gi bot
                            </Text>
                            
                            <Pressable
                                onPress={() => setShowGroupDropdown(true)}
                                className="border border-muted-foreground rounded-lg p-4 flex flex-row items-center justify-between w-full"
                            >
                                <Text className="text-base">
                                    {selectedGroup 
                                        ? selectedGroup.name
                                        : "Trykk for å velge gruppe"}
                                </Text>
                                <Text className="text-muted-foreground">▼</Text>
                            </Pressable>

                            {/* Group Selection Modal */}
                            <Modal
                                visible={showGroupDropdown}
                                transparent={true}
                                animationType="fade"
                                onRequestClose={() => setShowGroupDropdown(false)}
                            >
                                <View className="flex-1 justify-center items-center p-4">
                                    <Pressable 
                                        className="absolute inset-0 bg-black/50"
                                        onPress={() => setShowGroupDropdown(false)}
                                    />
                                    <View 
                                        className="bg-background rounded-2xl w-full max-w-md"
                                        style={{ 
                                            maxHeight: "75%",
                                            zIndex: 1,
                                        }}
                                    >
                                        <View className="flex flex-row items-center justify-between p-4 border-b border-muted-foreground">
                                            <Text className="text-xl font-semibold">Velg gruppe</Text>
                                            <Pressable onPress={() => setShowGroupDropdown(false)}>
                                                <Text className="text-primary text-lg">Lukk</Text>
                                            </Pressable>
                                        </View>
                                        <ScrollView 
                                            className="flex-1"
                                            style={{ maxHeight: 400 }}
                                            nestedScrollEnabled={true}
                                        >
                                            {groupsWithFinesActivated.length === 0 ? (
                                                <View className="p-4">
                                                    <Text className="text-center text-muted-foreground">
                                                        Ingen grupper med bøter aktivert
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View className="p-2">
                                                    {groupsWithFinesActivated.map((group) => {
                                                        const queryResult = groupDataMap.get(group.slug);
                                                        const isPending = queryResult?.isPending ?? false;
                                                        const hasError = !!queryResult?.error;
                                                        const fullGroupData = queryResult?.data;
                                                        const canSelect = fullGroupData && canGiveFines(fullGroupData, user.data);
                                                        const isSelected = selectedGroup?.slug === group.slug;
                                                        
                                                        return (
                                                            <Pressable
                                                                key={group.slug}
                                                                onPress={() => {
                                                                    if (canSelect && fullGroupData) {
                                                                        setSelectedGroup(fullGroupData);
                                                                        setShowGroupDropdown(false);
                                                                        // Reset form when changing group
                                                                        setSelectedUsers([]);
                                                                        setSelectedLaw(null);
                                                                    }
                                                                }}
                                                                disabled={!canSelect}
                                                                className={`p-4 border-b border-muted-foreground flex flex-row items-center ${
                                                                    isSelected ? "bg-primary/20" : ""
                                                                } ${!canSelect ? "opacity-50" : ""}`}
                                                            >
                                                                <View className="flex-1">
                                                                    <View className="flex flex-row items-center gap-2">
                                                                        <Text className="text-base font-medium">{group.name}</Text>
                                                                        {isPending && <ActivityIndicator size="small" />}
                                                                        {hasError && (
                                                                            <Text className="text-xs text-red-500">Feil</Text>
                                                                        )}
                                                                    </View>
                                                                    {group.slug && (
                                                                        <Text className="text-sm text-muted-foreground">{group.slug}</Text>
                                                                    )}
                                                                    {isPending && (
                                                                        <Text className="text-xs text-muted-foreground mt-1">Laster tilganger...</Text>
                                                                    )}
                                                                    {hasError && queryResult?.error && (
                                                                        <Text className="text-xs text-red-500 mt-1">{queryResult.error.message}</Text>
                                                                    )}
                                                                    {fullGroupData && !canSelect && !isPending && !hasError && (
                                                                        <Text className="text-xs text-muted-foreground mt-1">Ingen tilgang</Text>
                                                                    )}
                                                                </View>
                                                                {isSelected && canSelect && (
                                                                    <Text className="text-primary text-lg">✓</Text>
                                                                )}
                                                            </Pressable>
                                                        );
                                                    })}
                                                </View>
                                            )}
                                        </ScrollView>
                                    </View>
                                </View>
                            </Modal>
                        </View>
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <PageWrapper className="flex-1">
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ paddingTop: 100 }}
            >
                <View className="flex flex-col gap-6 p-4">
                    {/* Group Selection Section */}
                    <View className="flex flex-col gap-2">
                        <Label>Velg gruppe</Label>
                        <Pressable
                            onPress={() => setShowGroupDropdown(true)}
                            className="border border-muted-foreground rounded-lg p-3 flex flex-row items-center justify-between"
                        >
                            <Text className="text-base">
                                {selectedGroup ? selectedGroup.name : "Trykk for å velge gruppe"}
                            </Text>
                            <Text className="text-muted-foreground">▼</Text>
                        </Pressable>

                        {/* Group Selection Modal */}
                        <Modal
                            visible={showGroupDropdown}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setShowGroupDropdown(false)}
                        >
                            <View className="flex-1 justify-center items-center p-4">
                                <Pressable 
                                    className="absolute inset-0 bg-black/50"
                                    onPress={() => setShowGroupDropdown(false)}
                                />
                                <View 
                                    className="bg-background rounded-2xl w-full max-w-md"
                                    style={{ 
                                        maxHeight: "75%",
                                        zIndex: 1,
                                    }}
                                >
                                    <View className="flex flex-row items-center justify-between p-4 border-b border-muted-foreground">
                                        <Text className="text-xl font-semibold">Velg gruppe</Text>
                                        <Pressable onPress={() => setShowGroupDropdown(false)}>
                                            <Text className="text-primary text-lg">Lukk</Text>
                                        </Pressable>
                                    </View>
                                    <ScrollView 
                                        className="flex-1"
                                        style={{ maxHeight: 400 }}
                                        nestedScrollEnabled={true}
                                    >
                                        {groupsWithFinesActivated.length === 0 ? (
                                            <View className="p-4">
                                                <Text className="text-center text-muted-foreground">
                                                    Ingen grupper med bøter aktivert
                                                </Text>
                                            </View>
                                        ) : (
                                            <View className="p-2">
                                                {groupsWithFinesActivated.map((group) => {
                                                    const queryResult = groupDataMap.get(group.slug);
                                                    const isPending = queryResult?.isPending ?? false;
                                                    const hasError = !!queryResult?.error;
                                                    const fullGroupData = queryResult?.data;
                                                    const canSelect = fullGroupData && canGiveFines(fullGroupData, user.data);
                                                    const isSelected = selectedGroup?.slug === group.slug;
                                                    
                                                    return (
                                                        <Pressable
                                                            key={group.slug}
                                                            onPress={() => {
                                                                if (canSelect && fullGroupData) {
                                                                    setSelectedGroup(fullGroupData);
                                                                    setShowGroupDropdown(false);
                                                                    // Reset form when changing group
                                                                    setSelectedUsers([]);
                                                                    setSelectedLaw(null);
                                                                }
                                                            }}
                                                            disabled={!canSelect}
                                                            className={`p-4 border-b border-muted-foreground flex flex-row items-center ${
                                                                isSelected ? "bg-primary/20" : ""
                                                            } ${!canSelect ? "opacity-50" : ""}`}
                                                        >
                                                            <View className="flex-1">
                                                                <View className="flex flex-row items-center gap-2">
                                                                    <Text className="text-base font-medium">{group.name}</Text>
                                                                    {isPending && <ActivityIndicator size="small" />}
                                                                    {hasError && (
                                                                        <Text className="text-xs text-red-500">Feil</Text>
                                                                    )}
                                                                </View>
                                                                {group.slug && (
                                                                    <Text className="text-sm text-muted-foreground">{group.slug}</Text>
                                                                )}
                                                                {isPending && (
                                                                    <Text className="text-xs text-muted-foreground mt-1">Laster tilganger...</Text>
                                                                )}
                                                                {hasError && queryResult?.error && (
                                                                    <Text className="text-xs text-red-500 mt-1">{queryResult.error.message}</Text>
                                                                )}
                                                                {fullGroupData && !canSelect && !isPending && !hasError && (
                                                                    <Text className="text-xs text-muted-foreground mt-1">Ingen tilgang</Text>
                                                                )}
                                                            </View>
                                                            {isSelected && canSelect && (
                                                                <Text className="text-primary text-lg">✓</Text>
                                                            )}
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>
                                        )}
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>

                        {/* Show error messages for groups that failed */}
                        {groupsWithErrors.length > 0 && (
                            <View className="mt-2">
                                {groupsWithErrors.map(({ group, error }) => (
                                    <Text key={group.slug} className="text-xs text-red-500">
                                        {group.name}: {error.message}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* User Selection Section */}
                    <View className="flex flex-col gap-4">
                        <Text className="text-xl font-semibold">Velg brukere</Text>
                        
                        <View className="flex flex-col gap-2">
                            <Label>Velg fra gruppen</Label>
                            <Pressable
                                onPress={() => setShowUserDropdown(true)}
                                className="border border-muted-foreground rounded-lg p-3 flex flex-row items-center justify-between"
                            >
                                <Text className="text-base">
                                    {selectedUsers.length > 0 
                                        ? `${selectedUsers.length} bruker${selectedUsers.length > 1 ? 'e' : ''} valgt`
                                        : "Trykk for å velge brukere"}
                                </Text>
                                <Text className="text-muted-foreground">▼</Text>
                            </Pressable>
                            
                            {groupMembers.isError && (
                                <Text className="text-red-500 text-sm">
                                    Kunne ikke laste medlemmer
                                </Text>
                            )}
                        </View>

                        {/* User Selection Modal */}
                        <Modal
                            visible={showUserDropdown}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setShowUserDropdown(false)}
                        >
                            <View className="flex-1 justify-end">
                                <Pressable 
                                    className="absolute inset-0 bg-black/50"
                                    onPress={() => setShowUserDropdown(false)}
                                />
                                <View 
                                    className="bg-background rounded-t-3xl"
                                    style={{ 
                                        maxHeight: "75%",
                                        paddingBottom: insets.bottom,
                                        zIndex: 1,
                                        minHeight: 200,
                                    }}
                                >
                                    <View className="flex flex-row items-center justify-between p-4 border-b border-muted-foreground">
                                        <Text className="text-xl font-semibold">Velg brukere</Text>
                                        <Pressable onPress={() => setShowUserDropdown(false)}>
                                            <Text className="text-primary text-lg">Ferdig</Text>
                                        </Pressable>
                                    </View>
                                    <ScrollView 
                                        style={{ flex: 1 }}
                                        contentContainerStyle={{ flexGrow: 1 }}
                                        nestedScrollEnabled={true}
                                    >
                                        {groupMembers.isPending ? (
                                            <View className="p-4">
                                                <ActivityIndicator />
                                            </View>
                                        ) : groupMembers.isError ? (
                                            <View className="p-4">
                                                <Text className="text-red-500 text-center">
                                                    Kunne ikke laste medlemmer
                                                </Text>
                                                {groupMembers.error && (
                                                    <Text className="text-red-500 text-center text-sm mt-2">
                                                        {groupMembers.error.message}
                                                    </Text>
                                                )}
                                            </View>
                                        ) : !groupMembers.data || groupMembers.data.length === 0 ? (
                                            <View className="p-4">
                                                <Text className="text-muted-foreground text-center">
                                                    Ingen medlemmer funnet i denne gruppen
                                                </Text>
                                            </View>
                                        ) : (
                                            <View className="p-2">
                                                {groupMembers.data.map((user) => {
                                                    const isSelected = selectedUsers.find(u => u.user_id === user.user_id);
                                                    return (
                                                        <Pressable
                                                            key={user.user_id}
                                                            onPress={() => handleToggleUser(user)}
                                                            className={`p-3 border-b border-muted-foreground flex flex-row items-center ${isSelected ? "bg-primary/20" : ""}`}
                                                        >
                                                            <View className="flex-1">
                                                                <UserCard user={user} />
                                                            </View>
                                                            {isSelected && (
                                                                <Text className="text-primary text-lg">✓</Text>
                                                            )}
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>
                                        )}
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>

                        {/* Selected Users */}
                        {selectedUsers.length > 0 && (
                            <View className="flex flex-col gap-2">
                                <Text className="text-sm font-medium">Valgte brukere:</Text>
                                {selectedUsers.map((user) => (
                                    <View key={user.user_id} className="flex flex-row items-center justify-between border border-muted-foreground rounded-lg p-2">
                                        <UserCard user={user} />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onPress={() => handleRemoveUser(user.user_id)}
                                        >
                                            <Text>Fjern</Text>
                                        </Button>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Law Selection */}
                    <View className="flex flex-col gap-2">
                        <Label>Velg lov (valgfritt)</Label>
                        {laws.isPending ? (
                            <ActivityIndicator />
                        ) : laws.isError ? (
                            <Text className="text-red-500 text-sm">
                                Kunne ikke laste lover
                            </Text>
                        ) : (
                            <View className="flex flex-col gap-2">
                                <Button
                                    variant={selectedLaw === null ? "default" : "outline"}
                                    onPress={() => setSelectedLaw(null)}
                                >
                                    <Text>Ingen lov valgt</Text>
                                </Button>
                                <ScrollView className="max-h-48">
                                    {laws.data?.map((law) => (
                                        <Button
                                            key={law.id}
                                            variant={selectedLaw?.id === law.id ? "default" : "outline"}
                                            onPress={() => setSelectedLaw(law)}
                                            className="mb-2"
                                        >
                                            <Text className="text-sm">
                                                §{law.paragraph} - {law.title} ({law.amount} bøter)
                                            </Text>
                                        </Button>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* Amount */}
                    <View className="flex flex-col gap-2">
                        <Label>Antall bøter *</Label>
                        <Input
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Description */}
                    <View className="flex flex-col gap-2">
                        <Label>Beskrivelse *</Label>
                        <Input
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Beskrivelse av boten"
                            multiline
                            numberOfLines={2}
                        />
                    </View>

                    {/* Reason */}
                    <View className="flex flex-col gap-2">
                        <Label>Årsak *</Label>
                        <Input
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Beskriv årsaken til boten (støtter markdown)"
                            multiline
                            numberOfLines={4}
                            className="min-h-[100px]"
                        />
                    </View>

                    {/* Submit Button */}
                    <Button
                        onPress={handleSubmit}
                        disabled={createFineMutation.isPending || selectedUsers.length === 0}
                        className="mt-4"
                    >
                        <Text>
                            {createFineMutation.isPending ? "Gir bot..." : "Gi bot"}
                        </Text>
                    </Button>
                </View>
            </ScrollView>
        </PageWrapper>
        </GestureHandlerRootView>
    );
}
