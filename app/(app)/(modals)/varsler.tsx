import {
    fetchNotifications,
    markNotificationRead,
} from "@/actions/notifications/notifications";
import type { Notification } from "@/actions/types";
import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import { toAppRoute } from "@/lib/notifications/link";
import { decrementUnreadCount, notificationKeys } from "@/lib/notifications/queries";
import { themeColors } from "@/lib/theme/colors";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";
import { useRouter } from "expo-router";
import { BellOff } from "lucide-react-native";
import { useCallback, useEffect, useRef } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    View,
    type ViewToken,
} from "react-native";

/** Hvor mye av raden som må være synlig, og hvor lenge, før den er «sett». */
const VIEWABILITY = {
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 400,
};

export default function Varsler() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isDarkColorScheme } = useColorScheme();
    const refreshControl = useRefresh([...notificationKeys.list]);

    const {
        data,
        isPending,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: notificationKeys.list,
        queryFn: ({ pageParam }) => fetchNotifications(pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    const notifications = data?.pages.flatMap((page) => page.items) ?? [];

    /**
     * Hvilke varsler som var uleste da skjermen ble åpnet.
     *
     * Prikken tegnes fra dette settet og ikke fra `isRead`. Ellers ville den
     * forsvunnet under fingeren idet varselet ble markert som lest — brukeren
     * skal rekke å se hva som var nytt, og prikken skal først være borte
     * neste gang lista åpnes.
     */
    const unreadAtOpen = useRef(new Set<string>());
    for (const notification of notifications) {
        if (!notification.isRead) unreadAtOpen.current.add(notification.id);
    }

    /** Varsler vi allerede har sendt lesekvittering for, så det skjer én gang. */
    const marked = useRef(new Set<string>());

    const markSeen = useCallback(
        (notification: Notification) => {
            if (notification.isRead || marked.current.has(notification.id)) return;
            marked.current.add(notification.id);

            markNotificationRead(notification.id)
                .then(() => decrementUnreadCount(queryClient))
                // Et mislykket kall skal kunne prøves på nytt når raden ses
                // igjen — å bli stående ulest er bedre enn en prikk som er
                // borte lokalt, men fortsatt telles av serveren.
                .catch(() => marked.current.delete(notification.id));
        },
        [queryClient],
    );

    // FlatList godtar ikke at `onViewableItemsChanged` bytter identitet, så
    // den stabile funksjonen leser den ferske handleren gjennom en ref.
    const handleViewable = useRef<(items: ViewToken[]) => void>(() => {});
    handleViewable.current = (viewableItems) => {
        for (const entry of viewableItems) {
            if (entry.item) markSeen(entry.item as Notification);
        }
    };
    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) =>
            handleViewable.current(viewableItems),
    ).current;

    // Lista holdes urørt mens skjermen er åpen (se `unreadAtOpen`). Sannheten
    // hentes når brukeren går ut igjen.
    useEffect(
        () => () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list });
        },
        [queryClient],
    );

    const openNotification = async (notification: Notification) => {
        markSeen(notification);

        const route = await toAppRoute(notification.link);
        if (route) router.push(route as never);
    };

    if (isPending) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <View className="px-4 pt-4">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <NotificationSkeleton key={i} />
                    ))}
                </View>
            </PageWrapper>
        );
    }

    if (isError) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-base text-destructive text-center">
                        {error.message}
                    </Text>
                    <Pressable
                        onPress={() => refetch()}
                        className="mt-6 h-12 px-6 rounded-2xl items-center justify-center bg-primary active:opacity-80"
                    >
                        <Text className="text-white text-base font-semibold">
                            Prøv igjen
                        </Text>
                    </Pressable>
                </View>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex-1 bg-background">
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                refreshControl={refreshControl}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 40,
                    flexGrow: 1,
                }}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={VIEWABILITY}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.4}
                ItemSeparatorComponent={() => (
                    <View className="h-px bg-border dark:bg-muted ml-4" />
                )}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center px-10">
                        <BellOff
                            size={40}
                            color={themeColors(isDarkColorScheme).mutedForeground}
                        />
                        <Text className="text-base font-semibold text-foreground mt-4">
                            Ingen varsler
                        </Text>
                        <Text className="text-sm text-muted-foreground text-center mt-1">
                            Her dukker det opp beskjeder om arrangementer, bøter
                            og søknader.
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View className="py-6">
                            <ActivityIndicator size="small" />
                        </View>
                    ) : null
                }
                renderItem={({ item }) => (
                    <NotificationRow
                        notification={item}
                        isNew={unreadAtOpen.current.has(item.id)}
                        onPress={() => openNotification(item)}
                    />
                )}
            />
        </PageWrapper>
    );
}

function NotificationRow({
    notification,
    isNew,
    onPress,
}: {
    notification: Notification;
    isNew: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            className={`flex-row px-4 py-4 active:opacity-70 ${isNew ? "bg-primary/5 dark:bg-primary/10" : ""}`}
        >
            {/* Prikken har sin egen kolonne, slik at teksten står på linje
                enten varselet er nytt eller ikke. */}
            <View className="w-4 pt-1.5">
                {isNew ? (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                ) : null}
            </View>

            <View className="flex-1">
                <Text
                    className={`text-base text-foreground ${isNew ? "font-semibold" : ""}`}
                >
                    {notification.title}
                </Text>
                <Text className="text-sm text-muted-foreground mt-0.5">
                    {notification.description}
                </Text>
                <Text className="text-xs text-muted-foreground mt-1.5">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                        locale: nb,
                        addSuffix: true,
                    })}
                </Text>
            </View>
        </Pressable>
    );
}

function NotificationSkeleton() {
    return (
        <View className="flex-row py-4">
            <View className="w-4 pt-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-muted animate-pulse" />
            </View>
            <View className="flex-1">
                <View className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                <View className="h-3 w-full rounded bg-muted animate-pulse mt-2.5" />
                <View className="h-3 w-1/4 rounded bg-muted animate-pulse mt-2.5" />
            </View>
        </View>
    );
}
