import EventCard, { EventCardSkeleton } from "@/components/arrangement/eventCard";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, ScrollView, View } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import PageWrapper from "@/components/ui/pagewrapper";
import { BASE_URL } from "@/actions/constant";
import useRefresh from "@/lib/useRefresh";

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
    });

    const refreshControl = useRefresh("events");

    if (isPending) {
        return (
            <PageWrapper>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
            </PageWrapper>
        );
    }

    if (isError) {
        return (
            <PageWrapper>
                <ScrollView refreshControl={refreshControl}>
                    <Text className="text-center mt-10 text-lg text-red-500">Feil: {error.message}</Text>
                </ScrollView>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
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
                refreshControl={refreshControl}
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
