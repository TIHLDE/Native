import { useQuery } from "@tanstack/react-query";
import { FlatList, View } from "react-native";
import { Users } from "lucide-react-native";
import { fetchGroupMembers } from "@/actions/groups/members";
import { Text } from "@/components/ui/text";
import { sortMembers } from "@/lib/groups/groupPage";
import useRefresh from "@/lib/useRefresh";
import { GroupEmptyState } from "./GroupEmptyState";
import { PersonAvatar } from "./PersonAvatar";

function MemberRowSkeleton() {
    return (
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="flex-1 ml-3">
                <View className="w-32 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mb-2" />
                <View className="w-20 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            </View>
        </View>
    );
}

/**
 * Alle i gruppa, med lederne øverst.
 *
 * `["group", groupSlug, "members"]` deles med summene i bøtefanen, som regner
 * snitt per medlem — så den som har åpnet én av fanene har allerede lastet den
 * andre.
 */
export function GroupMembersList({
    groupSlug,
    leaderTitle,
}: {
    groupSlug: string;
    /** Hva gruppa kaller lederen sin. Null eller tom gir «Leder». */
    leaderTitle?: string | null;
}) {
    const { data, error, isPending, isError } = useQuery({
        queryKey: ["group", groupSlug, "members"],
        queryFn: () => fetchGroupMembers(groupSlug),
    });

    // Bøtene med: lederen og snittet per medlem i bøtefanen leser herfra, og
    // de skal ikke vise tall fra hvert sitt tidspunkt.
    const refreshControl = useRefresh([
        ["group", groupSlug],
        ["fines", groupSlug],
    ]);
    const members = sortMembers(data ?? []);

    return (
        <FlatList
            data={members}
            className="flex-1"
            keyExtractor={(item) => item.user.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            refreshControl={refreshControl}
            ListHeaderComponent={
                members.length > 0 ? (
                    <Text className="mx-4 mb-3 text-sm text-muted-foreground">
                        {`${members.length} ${members.length === 1 ? "medlem" : "medlemmer"}`}
                    </Text>
                ) : null
            }
            renderItem={({ item }) => {
                const name = `${item.user.firstName} ${item.user.lastName}`.trim();
                const isLeader = item.membershipType === "LEADER";

                return (
                    <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center">
                        <PersonAvatar name={name} image={item.user.image ?? null} />
                        <View className="flex-1 ml-3">
                            <Text
                                className="text-base font-semibold text-foreground"
                                numberOfLines={1}
                            >
                                {name}
                            </Text>
                            {item.user.userId ? (
                                <Text
                                    className="text-sm text-muted-foreground mt-0.5"
                                    numberOfLines={1}
                                >
                                    {`@${item.user.userId}`}
                                </Text>
                            ) : null}
                        </View>
                        {isLeader ? (
                            <View className="ml-2 px-2 py-0.5 rounded-full bg-primary/15 dark:bg-primary/25">
                                <Text
                                    className="text-xs font-semibold text-foreground"
                                    numberOfLines={1}
                                >
                                    {leaderTitle || "Leder"}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                );
            }}
            ListEmptyComponent={
                isPending ? (
                    <View>
                        <MemberRowSkeleton />
                        <MemberRowSkeleton />
                        <MemberRowSkeleton />
                    </View>
                ) : isError ? (
                    <View className="items-center px-6 pt-16">
                        <Text className="text-base text-destructive text-center">
                            {error.message}
                        </Text>
                    </View>
                ) : (
                    <GroupEmptyState
                        icon={Users}
                        title="Ingen medlemmer"
                        description="Denne gruppen har ingen medlemmer ennå."
                    />
                )
            }
        />
    );
}
