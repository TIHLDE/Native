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

    // Filter memberships to only groups with fines_activated
    const groupsWithFinesActivated = memberships.data?.filter(group => group.fines_activated) ?? [];

    // Fetch full group data for each group to get permissions
    const groupQueries = useQueries({
        queries: groupsWithFinesActivated.map((group) => ({
            queryKey: ["groups", group.slug],
            queryFn: () => getGroup(group.slug),
            enabled: !!group.slug,
        })),
    });

    // Helper function to check if user can give fines for a group
    const canGiveFines = (group: Group, currentUser: UserType | undefined): boolean => {
        if (!group.fines_activated) return false;
        if (!currentUser) return false;
        
        // User can give fines if they are the fines_admin OR have write permissions
        const isFinesAdmin = group.fines_admin?.user_id === currentUser.user_id;
        const hasWritePermission = group.permissions?.write === true;
        
        return isFinesAdmin || hasWritePermission;
    };

    // Get full group data for groups where user can actually give fines
    const groupsWithFines: Group[] = groupQueries
        .map((query, index) => {
            const fullGroupData = query.data;
            if (!fullGroupData) return null;
            if (canGiveFines(fullGroupData, user.data)) {
                return fullGroupData;
            }
            return null;
        })
        .filter((group): group is Group => group !== null);

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

    if (user.isPending || permissions.isPending || memberships.isPending || groupsLoading) {
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

    if (groupsWithFines.length === 0) {
        return (
            <PageWrapper className="flex-1">
                <ScrollView>
                    <View className="flex-1 justify-center items-center p-4" style={{ paddingTop: insets.top + 100 }}>
                        <Text className="text-lg text-center">
                            Du må være medlem av en gruppe med bøter aktivert og ha tilgang til å gi bot for å kunne gi bot.
                        </Text>
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    if (!groupSlug) {
        return (
            <PageWrapper className="flex-1">
                <ScrollView>
                    <View className="flex-1 justify-center items-center p-4" style={{ paddingTop: insets.top + 100 }}>
                        <Text className="text-lg text-center">
                            Velg en gruppe for å gi bot.
                        </Text>
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
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                            {groupsWithFines.map((group) => (
                                <Button
                                    key={group.slug}
                                    variant={selectedGroup?.slug === group.slug ? "default" : "outline"}
                                    onPress={() => {
                                        setSelectedGroup(group);
                                        // Reset form when changing group
                                        setSelectedUsers([]);
                                        setSelectedLaw(null);
                                    }}
                                    className="mr-2"
                                >
                                    <Text className="text-sm">{group.name}</Text>
                                </Button>
                            ))}
                        </ScrollView>
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
                            <View className="flex-1 bg-black/50 justify-end">
                                <View 
                                    className="bg-background rounded-t-3xl"
                                    style={{ 
                                        maxHeight: "75%",
                                        paddingBottom: insets.bottom 
                                    }}
                                >
                                    <View className="flex flex-row items-center justify-between p-4 border-b border-muted-foreground">
                                        <Text className="text-xl font-semibold">Velg brukere</Text>
                                        <Pressable onPress={() => setShowUserDropdown(false)}>
                                            <Text className="text-primary text-lg">Ferdig</Text>
                                        </Pressable>
                                    </View>
                                    <ScrollView className="flex-1">
                                        {groupMembers.isPending ? (
                                            <View className="p-4">
                                                <ActivityIndicator />
                                            </View>
                                        ) : groupMembers.isError ? (
                                            <View className="p-4">
                                                <Text className="text-red-500 text-center">
                                                    Kunne ikke laste medlemmer
                                                </Text>
                                            </View>
                                        ) : (
                                            <View className="p-2">
                                                {groupMembers.data?.map((user) => {
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
                                                §{law.paragraph} - {law.title} ({law.amount} kr)
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
