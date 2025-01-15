import EventCard from "@/components/arrangement/eventCard";
import { Text } from "@/components/ui/text";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Arrangementer() {
    const eventsQuery = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const response = await fetch("https://api.tihlde.org/events/");
            if (!response.ok) {
                throw new Error(`Feil ved henting av arrangementer: ${response.statusText}`);
            }
            return response.json();
        },
    });

    if (eventsQuery.isLoading) {
        return <Text className="text-center mt-10 text-lg text-gray-600">Laster arrangementer...</Text>;
    }

    if (eventsQuery.isError) {
        return (
            <Text className="text-center mt-10 text-lg text-red-500">
                Feil: {eventsQuery.error.message}
            </Text>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <ScrollView className="w-full h-fit p-2">
                    <Text className="text-2xl text-center">Arrangementer</Text>
                    <View className="flex flex-col justify-center mt-5 gap-4">
                        {eventsQuery.data.results.map((event: any) => (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                title={event.title}
                                date={new Date(event.start_date)}
                                image={event.image || null}
                                onPress={() => router.push(`/arrangementer/${event.id}`)}
                                organizer={event.organizer.name}
                            />
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
