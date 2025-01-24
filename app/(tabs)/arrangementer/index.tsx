import EventCard from "@/components/arrangement/eventCard";
import { Text } from "@/components/ui/text";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View, ScrollView } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/ui/pagewrapper";
import React from "react";

type Event = {
    organizer: { slug: string | null; };
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
        const res = await fetch(`https://api.tihlde.org/events/?${queryParams}`)
        return res.json();
    }

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
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

    if (status === "pending") {
        <Text className="text-center mt-10 text-lg text-gray-600">Laster arrangementer...</Text>;
    }

    if (status === "error") {
        return <Text className="text-center mt-10 text-lg text-red-500">Feil: {error.message}</Text>;
    }

    return (
        <PageWrapper className="px-2" refreshQueryKey={"events"}>

            {data?.pages.map((group, i) => (
                < React.Fragment key={i} >
                    {Array.isArray(group?.results) &&
                        group.results.map((event) => (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                title={event.title}
                                date={new Date(event.start_date)}
                                image={event.image || null}
                                onPress={() => router.push(`/arrangementer/${event.id}`)}
                                organizer={event.organizer}
                            />
                        ))
                    }
                </React.Fragment>
            ))
            }
            <View className="mb-16">
                {isFetchingNextPage && <Text className="text-center mt-4 text-lg text-gray-600">Laster flere arrangementer...</Text>}
                {
                    (hasNextPage && !isFetchingNextPage) && (
                        <Button
                            onPress={() => fetchNextPage()}
                            variant={"link"}
                        >
                            <Text>
                                Last flere arrangementer
                            </Text>
                        </Button>
                    )
                }
                {!hasNextPage && <Text className="text-center mt-4 text-lg text-gray-600">Ingen flere arrangementer</Text>}
            </View>
        </PageWrapper >
    );
}
