import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { fetchMemberships } from "@/actions/fines/memberships";
import { Membership } from "@/actions/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FlatList, Image, Pressable, View } from "react-native";
import { ChevronRight, Users } from "lucide-react-native";

function MembershipCardSkeleton() {
    return (
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="flex-1 ml-3">
                <View className="w-32 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mb-2" />
                <View className="w-20 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            </View>
        </View>
    );
}

export default function MembershipSelection() {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = isDarkColorScheme ? "#9ca3af" : "#6b7280";

    const memberships = useQuery({
        queryKey: ["memberships"],
        queryFn: fetchMemberships,
    });

    const refreshControl = useRefresh("memberships");

    const finesGroups =
        memberships.data?.filter((m: Membership) => m.group.fines_activated) ?? [];

    return (
        <PageWrapper className="flex-1 bg-background">
            <FlatList
                data={finesGroups}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
                refreshControl={refreshControl}
                keyExtractor={(item) => item.group.slug}
                renderItem={({ item: membership }) => (
                    <Pressable
                        onPress={() =>
                            router.push(`/(modals)/boter/${membership.group.slug}`)
                        }
                        className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center active:opacity-70"
                    >
                        {membership.group.image ? (
                            <Image
                                source={{ uri: membership.group.image }}
                                className="w-12 h-12 rounded-full"
                            />
                        ) : (
                            <View className="w-12 h-12 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                                <Users
                                    size={20}
                                    color={
                                        isDarkColorScheme ? "#8ba3d4" : "#2d5dab"
                                    }
                                />
                            </View>
                        )}
                        <View className="flex-1 ml-3">
                            <Text className="text-base font-semibold text-foreground">
                                {membership.group.name}
                            </Text>
                            <Text className="text-sm text-muted-foreground mt-0.5">
                                {membership.membership_type === "MEMBER"
                                    ? "Medlem"
                                    : membership.membership_type}
                            </Text>
                        </View>
                        <ChevronRight size={20} color={mutedColor} />
                    </Pressable>
                )}
                ListEmptyComponent={
                    memberships.isPending ? (
                        <View>
                            <MembershipCardSkeleton />
                            <MembershipCardSkeleton />
                            <MembershipCardSkeleton />
                        </View>
                    ) : memberships.isError ? (
                        <View className="flex-1 items-center justify-center px-6 pt-16">
                            <Text className="text-base text-destructive">
                                {memberships.error.message}
                            </Text>
                        </View>
                    ) : (
                        <View className="py-16 items-center">
                            <View className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
                                <Users
                                    size={28}
                                    color={
                                        isDarkColorScheme ? "#8ba3d4" : "#2d5dab"
                                    }
                                />
                            </View>
                            <Text className="text-lg font-semibold text-foreground mb-1">
                                Ingen grupper
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center px-8">
                                Du er ikke medlem av noen grupper med bøter
                                aktivert.
                            </Text>
                        </View>
                    )
                }
            />
        </PageWrapper>
    );
}
