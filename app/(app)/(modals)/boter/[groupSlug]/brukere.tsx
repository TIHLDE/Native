import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import { useColorScheme } from "@/lib/useColorScheme";
import useDebounce from "@/lib/useDebounce";
import { fetchGroupUsers } from "@/actions/fines/users";
import { GroupUser } from "@/actions/types";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    TextInput,
    View,
} from "react-native";
import { Check, Search, X } from "lucide-react-native";

function UserCardSkeleton() {
    return (
        <View className="mx-4 mb-2 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-3.5 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="flex-1 ml-3">
                <View className="w-28 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            </View>
        </View>
    );
}

export default function UserSelection() {
    const router = useRouter();
    const {
        groupSlug,
        lawId,
        lawTitle,
        lawParagraph,
        lawAmount,
        lawDescription,
    } = useLocalSearchParams<{
        groupSlug: string;
        lawId: string;
        lawTitle: string;
        lawParagraph: string;
        lawAmount: string;
        lawDescription: string;
    }>();

    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = isDarkColorScheme ? "#9ca3af" : "#6b7280";

    const [searchText, setSearchText] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<GroupUser[]>([]);
    const debouncedSearch = useDebounce(searchText, 500);

    const users = useQuery({
        queryKey: ["group-users", groupSlug, debouncedSearch],
        queryFn: () => fetchGroupUsers(groupSlug, debouncedSearch),
    });

    const toggleUser = (user: GroupUser) => {
        setSelectedUsers((prev) => {
            const exists = prev.find((u) => u.user_id === user.user_id);
            if (exists) {
                return prev.filter((u) => u.user_id !== user.user_id);
            }
            return [...prev, user];
        });
    };

    const isSelected = (userId: string) =>
        selectedUsers.some((u) => u.user_id === userId);

    const handleNext = () => {
        router.push({
            pathname: "/(modals)/boter/[groupSlug]/bekreft",
            params: {
                groupSlug,
                lawId,
                lawTitle,
                lawParagraph,
                lawAmount,
                lawDescription,
                selectedUsers: JSON.stringify(
                    selectedUsers.map((u) => ({
                        user_id: u.user_id,
                        first_name: u.first_name,
                        last_name: u.last_name,
                        image: u.image,
                    }))
                ),
            },
        });
    };

    return (
        <PageWrapper className="flex-1 bg-background">
            <FlatList
                data={users.data?.results ?? []}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardDismissMode="on-drag"
                keyExtractor={(item) => item.user_id}
                ListHeaderComponent={
                    <View>
                        {/* Search bar */}
                        <View className="px-4 pt-3 pb-3">
                            <View className="flex-row items-center bg-gray-100 dark:bg-secondary/30 rounded-2xl px-4 h-12">
                                <Search size={18} color={mutedColor} />
                                <TextInput
                                    className="flex-1 ml-3 text-foreground"
                                    placeholder="Søk etter brukere..."
                                    placeholderTextColor={mutedColor}
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    style={{
                                        fontFamily: "Inter",
                                        fontSize: 16,
                                        lineHeight: 20,
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                    }}
                                />
                                {searchText.length > 0 && (
                                    <Pressable
                                        onPress={() => setSearchText("")}
                                        className="p-1"
                                    >
                                        <X size={16} color={mutedColor} />
                                    </Pressable>
                                )}
                                {users.isFetching && !users.isPending && (
                                    <ActivityIndicator
                                        size="small"
                                        className="ml-2"
                                    />
                                )}
                            </View>
                        </View>

                        {/* Selected count */}
                        {selectedUsers.length > 0 && (
                            <View className="px-4 pb-2">
                                <Text className="text-sm text-muted-foreground">
                                    {selectedUsers.length} bruker
                                    {selectedUsers.length !== 1 ? "e" : ""} valgt
                                </Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item: user }) => {
                    const selected = isSelected(user.user_id);
                    return (
                        <Pressable
                            onPress={() => toggleUser(user)}
                            className={`mx-4 mb-2 rounded-2xl p-3.5 flex-row items-center active:opacity-70 ${
                                selected
                                    ? "bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40"
                                    : "bg-gray-100 dark:bg-secondary/30"
                            }`}
                        >
                            {user.image ? (
                                <Image
                                    source={{ uri: user.image }}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <View className="w-10 h-10 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                                    <Text className="text-sm font-bold text-primary dark:text-accent">
                                        {user.first_name[0]}
                                        {user.last_name[0]}
                                    </Text>
                                </View>
                            )}
                            <Text className="flex-1 ml-3 text-base text-foreground">
                                {user.first_name} {user.last_name}
                            </Text>
                            {selected && (
                                <View className="w-7 h-7 rounded-full bg-primary dark:bg-[#1C5ECA] items-center justify-center">
                                    <Check size={16} color="white" />
                                </View>
                            )}
                        </Pressable>
                    );
                }}
                ListEmptyComponent={
                    users.isPending ? (
                        <View>
                            <UserCardSkeleton />
                            <UserCardSkeleton />
                            <UserCardSkeleton />
                            <UserCardSkeleton />
                            <UserCardSkeleton />
                        </View>
                    ) : users.isError ? (
                        <View className="flex-1 items-center justify-center px-6 pt-16">
                            <Text className="text-base text-destructive">
                                {users.error.message}
                            </Text>
                        </View>
                    ) : (
                        <View className="py-16 items-center">
                            <Text className="text-lg font-semibold text-foreground mb-1">
                                Ingen brukere funnet
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center px-8">
                                Prøv å endre søket ditt.
                            </Text>
                        </View>
                    )
                }
            />

            {/* Bottom action bar */}
            <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-3 bg-background border-t border-border">
                <Pressable
                    onPress={handleNext}
                    disabled={selectedUsers.length === 0}
                    className={`h-14 rounded-2xl flex-row items-center justify-center ${
                        selectedUsers.length > 0
                            ? "bg-primary dark:bg-[#1C5ECA] active:opacity-80"
                            : "bg-gray-200 dark:bg-secondary/30"
                    }`}
                >
                    <Text
                        className={`text-base font-semibold ${
                            selectedUsers.length > 0
                                ? "text-white"
                                : "text-muted-foreground"
                        }`}
                        style={{ fontFamily: "Inter" }}
                    >
                        {selectedUsers.length > 0
                            ? `Neste (${selectedUsers.length} valgt)`
                            : "Velg minst én bruker"}
                    </Text>
                </Pressable>
            </View>
        </PageWrapper>
    );
}
