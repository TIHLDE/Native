import React, { useEffect, useState } from "react";
import EventCard from "@/components/ui/eventCard";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { View, ScrollView } from "react-native";

type Event = {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    location?: string;
    image?: string;
};

export default function Arrangementer() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const resultsPerPage = 10;

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                page: page.toString(),
                None: resultsPerPage.toString(),
            });

            const response = await fetch(`https://api.tihlde.org/events/?${queryParams}`);
            if (!response.ok) {
                throw new Error(`Feil ved henting av arrangementer: ${response.statusText}`);
            }

            const data = await response.json();
            setEvents((prevEvents) => [...prevEvents, ...data.results]);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("En ukjent feil oppstod");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [page]);

    const loadMoreEvents = () => {
        setPage((prevPage) => prevPage + 1);
    };

    if (loading && page === 1) {
        return <Text className="text-center mt-10 text-lg text-gray-600">Laster arrangementer...</Text>;
    }

    if (error) {
        return <Text className="text-center mt-10 text-lg text-red-500">Feil: {error}</Text>;
    }

    return (
        <ScrollView className="p-10 shadow-lg rounded-lg mt-10">
            <Text className="text-2xl font-bold text-center mb-6">Arrangementer</Text>
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    date={new Date(event.start_date)}
                    image={event.image || null}
                    onPress={() => router.push(`/arrangementer/${event.id}`)}
                />
            ))}
            {loading && <Text className="text-center mt-4 text-lg text-gray-600">Laster flere arrangementer...</Text>}
            {!loading && (
                <Text
                    onPress={loadMoreEvents}
                    className="text-center text-lg text-blue-500 underline mt-4"
                >
                    Last flere arrangementer
                </Text>
            )}
        </ScrollView>
    );
}
