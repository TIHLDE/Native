import { useInfiniteQuery } from "@tanstack/react-query";
import { ActivityIndicator, FlatList, View } from "react-native";
import { Trophy } from "lucide-react-native";
import { fetchFineLeaderboard } from "@/actions/fines/leaderboard";
import { Text } from "@/components/ui/text";
import { themeColors } from "@/lib/theme/colors";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { GroupEmptyState } from "./GroupEmptyState";
import { PersonAvatar } from "./PersonAvatar";

function LeaderboardRowSkeleton() {
    return (
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center">
            <View className="w-6 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse ml-3" />
            <View className="flex-1 ml-3">
                <View className="w-28 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            </View>
        </View>
    );
}

export function GroupLeaderboardList({
    groupSlug,
    finesActivated,
}: {
    groupSlug: string;
    finesActivated: boolean;
}) {
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isPending,
        isError,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["fines", groupSlug, "leaderboard"],
        queryFn: ({ pageParam }) => fetchFineLeaderboard(groupSlug, pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.next ?? undefined,
        // Samme 404 som bøtelista — se kommentaren der.
        enabled: finesActivated,
    });

    const refreshControl = useRefresh(["fines", groupSlug, "leaderboard"]);
    const entries = data?.pages.flatMap((page) => page.results) ?? [];

    if (!finesActivated) {
        return (
            <GroupEmptyState
                icon={Trophy}
                title="Bøter er ikke aktivert"
                description="Denne gruppen bruker ikke bøtesystemet."
            />
        );
    }

    return (
        <FlatList
            data={entries}
            className="flex-1"
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            refreshControl={refreshControl}
            renderItem={({ item, index }) => (
                <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center">
                    {/* Photon sorterer høyest først, så plasseringen er
                        listeindeksen — den regnes ikke ut på nytt her. */}
                    <Text className="w-6 text-base font-bold text-muted-foreground">
                        {index + 1}
                    </Text>
                    <PersonAvatar
                        name={item.name}
                        image={item.image}
                        className="ml-3"
                    />
                    <Text
                        className="flex-1 ml-3 text-base font-semibold text-foreground"
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    <View className="items-end ml-2">
                        <Text className="text-base font-semibold text-foreground">
                            {`${item.finesAmount} ${item.finesAmount === 1 ? "bot" : "bøter"}`}
                        </Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                            {`${item.finesCount} ${item.finesCount === 1 ? "gang" : "ganger"}`}
                        </Text>
                    </View>
                </View>
            )}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListFooterComponent={
                isFetchingNextPage ? (
                    <ActivityIndicator
                        className="my-4"
                        color={colors.mutedForeground}
                    />
                ) : null
            }
            ListEmptyComponent={
                isPending ? (
                    <View>
                        <LeaderboardRowSkeleton />
                        <LeaderboardRowSkeleton />
                        <LeaderboardRowSkeleton />
                    </View>
                ) : isError ? (
                    <View className="items-center px-6 pt-16">
                        <Text className="text-base text-destructive text-center">
                            {error.message}
                        </Text>
                    </View>
                ) : (
                    <GroupEmptyState
                        icon={Trophy}
                        title="Ingen på topplisten"
                        description="Denne gruppen har ingen medlemmer å vise."
                    />
                )
            }
        />
    );
}
