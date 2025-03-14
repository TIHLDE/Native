import EventCard, { EventCardSkeleton } from "@/components/arrangement/eventCard";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/ui/pagewrapper";
import { useState } from "react";
import { BASE_URL } from "@/actions/constant";

type Event = {
    organizer: { slug: string | null; name: string; };
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    location?: string;
    image?: string;
};

export default function Arrangementer() {
    const resultsPerPage = 10;
    const queryClient = useQueryClient();

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        const startTime = Date.now();

        const handleFinish = () => {
            if (Date.now() - startTime < 1000) {
                setTimeout(() => {
                    setIsRefreshing(false);
                }, 400 - (Date.now() - startTime));
                return;
            }
            setIsRefreshing(false);
        };

        queryClient.invalidateQueries({ queryKey: ["events"] }).then(handleFinish);
    };

    const fetchEvents = async ({ pageParam }: { pageParam: number }): Promise<{ results: Event[] }> => {
        const queryParams = new URLSearchParams({
            page: pageParam.toString(),
            None: resultsPerPage.toString(),
        });
        const res = await fetch(`${BASE_URL}/events/?${queryParams}`);

        return res.json();
    }

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isPending,
        isFetchingNextPage,
        isError,
    } = useInfiniteQuery({
        queryKey: ["events"],
        queryFn: fetchEvents,
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (!lastPage.results || lastPage.results?.length === 0) {
                return undefined;
            }
            return lastPageParam + 1;
        },
    })

    if (isPending) {
        return (
            <PageWrapper hasScrollView={false}>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
            </PageWrapper>
        );
    }

    if (isError) {
        return (
            <PageWrapper refreshQueryKey={"events"}>
                <Text className="text-center mt-10 text-lg text-red-500">Feil: {error.message}</Text>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper hasScrollView={false}>
            <FlatList
                className="px-2 mt-2"
                data={data?.pages.flatMap((page) => {
                    if (!page.results) {
                        return [];
                    }
                    return page.results;
                })}
                renderItem={({ item: event }) => {
                    return (
                        <EventCard
                            key={event.id}
                            id={event.id}
                            title={event.title}
                            date={new Date(event.start_date)}
                            image={event.image ?? null}
                            onPress={() => router.push(`/arrangementer/${event.id}`)}
                            organizer={event.organizer}
                        />)
                }}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
                onEndReached={() => {
                    if (!hasNextPage) return;
                    fetchNextPage();
                }}
                ListFooterComponent={
                    <View className="mb-16">
                        {isFetchingNextPage && <ActivityIndicator />}
                        {!hasNextPage && <Text className="text-center mt-4 text-lg text-gray-600">Ingen flere arrangementer</Text>}
                    </View>

                }
            />
        </PageWrapper >
    );
}
