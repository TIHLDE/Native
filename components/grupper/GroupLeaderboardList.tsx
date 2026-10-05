import { ReactElement } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { ChevronRight, Users } from "lucide-react-native";
import { fetchFineLeaderboard } from "@/actions/fines/leaderboard";
import { FineStatus } from "@/actions/types";
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

/**
 * «Per medlem» i bøtefanen: hvert medlem med summen av bøtene sine, høyest
 * først. Var en egen «Toppliste»-fane før den ble flyttet inn under Bøter, slik
 * nettsida har den.
 *
 * Uten `status` teller Photon bare de aktive bøtene. Et trykk på en rad viser
 * bøtene til den personen i «Alle bøter».
 */
export function GroupLeaderboardList({
    groupSlug,
    status,
    onSelectUser,
    ListHeaderComponent,
}: {
    groupSlug: string;
    status?: FineStatus;
    onSelectUser: (user: { id: string; name: string }) => void;
    /** Ruller med lista, over medlemmene. Bøtefanen legger summene her. */
    ListHeaderComponent?: ReactElement;
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
        queryKey: ["fines", groupSlug, "leaderboard", { status }],
        queryFn: ({ pageParam }) =>
            fetchFineLeaderboard(groupSlug, pageParam, status),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    });

    // Samme par som bøtelista — se kommentaren der.
    const refreshControl = useRefresh([
        ["group", groupSlug],
        ["fines", groupSlug],
    ]);
    const entries = data?.pages.flatMap((page) => page.results) ?? [];

    return (
        <FlatList
            data={entries}
            className="flex-1"
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            refreshControl={refreshControl}
            ListHeaderComponent={ListHeaderComponent}
            renderItem={({ item, index }) => (
                <Pressable
                    onPress={() => onSelectUser({ id: item.id, name: item.name })}
                    accessibilityRole="button"
                    accessibilityLabel={`Vis bøtene til ${item.name}`}
                    className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center active:opacity-70"
                >
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
                    <View className="flex-1 ml-3">
                        <Text
                            className="text-base font-semibold text-foreground"
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>
                        <Text
                            className="text-sm text-muted-foreground mt-0.5"
                            numberOfLines={1}
                        >
                            {`${item.finesAmount} ${item.finesAmount === 1 ? "bot" : "bøter"} fordelt på ${item.finesCount} ${item.finesCount === 1 ? "hendelse" : "hendelser"}`}
                        </Text>
                    </View>
                    <ChevronRight
                        size={18}
                        color={colors.mutedForeground}
                        style={{ marginLeft: 8 }}
                    />
                </Pressable>
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
                        icon={Users}
                        title="Ingen medlemmer"
                        description="Gruppen har ingen medlemmer å vise bøter for."
                    />
                )
            }
        />
    );
}
