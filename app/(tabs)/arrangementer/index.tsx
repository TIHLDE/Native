import React, { useEffect, useState } from "react";
import EventCard from "@/components/ui/eventCard";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { View, ScrollView } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/ui/pagewrapper";
import { BASE_URL } from "@/actions/constant";

type Event = {
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
        const res = await fetch(`${BASE_URL}/events/?${queryParams}`)
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
        return (
            <PageWrapper refreshQueryKey={"events"}>
                <Text className="text-center mt-10 text-lg text-red-500">Feil: {error.message}</Text>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="w-full h-fit px-4" refreshQueryKey={"events"}>
            <Text className="flex flex-col justify-center text-2xl font-bold text-center mb-6">Arrangementer</Text>

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
