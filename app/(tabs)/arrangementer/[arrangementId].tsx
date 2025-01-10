import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams } from "expo-router";
import { View, Image, ScrollView } from "react-native";
import { useState, useEffect } from "react";

type Event = {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    location?: string;
    description?: string;
    image?: string;
    category?: {
        id: number;
        text: string;
    };
    organizer?: {
        name: string;
        slug: string;
    };
    contact_person?: {
        first_name: string;
        last_name: string;
    };
    paid_information: {
        price: string;
    };
    limit: number;
    list_count: string;
    waiting_list_count: string;
    sign_off_deadline: string;
};

export default function ArrangementSide() {
    const params = useLocalSearchParams();
    const id = params.arrangementId;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`https://api.tihlde.org/events/${id}`);
                if (!response.ok) {
                    throw new Error(`Feil ved henting av data`);
                }
                const data: Event = await response.json();
                setEvent(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Ukjent feil");
                }
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchEvents();
        }
    }, [id]);

    if (loading) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg text-gray-600">Laster arrangement...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg text-red-500">Feil: {error}</Text>
            </View>
        );
    }

    if (!event) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg text-gray-600">Ingen data funnet.</Text>
            </View>
        );
    }

    return (
        <ScrollView>
            <Stack.Screen options={{ title: event.title }} />
            <View>
                {event.image && (
                    <Image
                        source={{ uri: event.image }}
                        className="w-full h-64"
                        resizeMode="contain"
                    />
                )}
            </View>
            <View className="mx-auto w-[90%] shadow-lg rounded-lg mt-10 bg-gray-900 pl-10 pr-10 pt-5 pb-5">
                <Text className="text-2xl mb-6 text-white font-bold">Detaljer</Text>
                <View className="flex flex-row justify-start items-start">
                    <View className="mr-10">
                        <Text className="text-md text-gray-400 mb-2">Fra:</Text>
                        <Text className="text-md text-gray-400 mb-2">Til:</Text>
                        <Text className="text-md text-gray-400 mb-2">Sted:</Text>
                        <Text className="text-md text-gray-400 mb-2">Arrangør:</Text>
                        <Text className="text-md text-gray-400 mb-2">Kontaktperson:</Text>
                        {event.paid_information?.price && (
                            <Text className="text-md text-gray-400">Pris:</Text>
                        )}
                    </View>
                    <View>
                        <Text className="text-md mb-2">
                            {new Date(event.start_date).toLocaleDateString("no-NO", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}{" "}
                            kl.{" "}
                            {new Date(event.start_date).toLocaleTimeString("no-NO", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                        <Text className="text-md mb-2">
                            {new Date(event.end_date).toLocaleDateString("no-NO", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}{" "}
                            kl.{" "}
                            {new Date(event.end_date).toLocaleTimeString("no-NO", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                        <Text className="text-md mb-2">{event.location || "Ikke oppgitt"}</Text>
                        <Text className="text-md mb-2">{event.organizer?.name || "Ikke oppgitt"}</Text>
                        <Text className="text-md mb-2">
                            {event.contact_person
                                ? `${event.contact_person.first_name} ${event.contact_person.last_name}`
                                : "Ikke oppgitt"}
                        </Text>
                        {event.paid_information?.price && (
                            <Text className="text-md">{event.paid_information.price}</Text>
                        )}
                    </View>
                </View>
            </View>
            <View className="mx-auto w-[90%] shadow-lg rounded-lg mt-10 bg-gray-900 pl-10 pr-10 pt-5 pb-5">
                <Text className="text-2xl mb-6 text-white font-bold">Påmelding</Text>
                <View className="flex flex-row justify-start items-start">
                    <View className="mr-10">
                        <Text className="text-md text-gray-400 mb-2">Påmeldte:</Text>
                        <Text className="text-md text-gray-400 mb-2">Venteliste:</Text>
                        <Text className="text-md text-gray-400 mb-2">Avmeldingsfrist:</Text>
                    </View>
                    <View>
                        <Text className="text-md mb-2">
                            {event.list_count}/{event.limit}
                        </Text>
                        <Text className="text-md mb-2">
                            {event.waiting_list_count}
                        </Text>
                        <Text className="text-md mb-2">
                            {new Date(event.sign_off_deadline).toLocaleDateString("no-NO", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}{" "}
                            kl.{" "}
                            {new Date(event.sign_off_deadline).toLocaleTimeString("no-NO", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                    </View>
                </View>

            </View>
            <View className="mx-auto w-[90%] shadow-lg rounded-lg mt-10 bg-gray-900 pl-10 pr-10 pt-5 pb-5">
                <Text className="text-2xl font-bold text-white mb-4">{event.title}</Text>
                <Text className="text-white">{event.description}</Text>
            </View>
        </ScrollView>

    );
}
