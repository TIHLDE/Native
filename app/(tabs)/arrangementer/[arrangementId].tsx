import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams } from "expo-router";
import { View, Image, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import Markdown from "react-native-markdown-display";
import { Button } from "@/components/ui/button";

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

    const { data: event, isLoading, isError, error } = useQuery<Event>({
        queryKey: ["event", id],
        queryFn: async () => {
            const response = await fetch(`https://api.tihlde.org/events/${id}`);
            if (!response.ok) {
                throw new Error("Feil ved henting av data");
            }
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg text-gray-600">Laster arrangement...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg text-red-500">Feil: {error.message}</Text>
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

    const borderColor =
        event.organizer?.name === "Sosialen"
            ? "border-orange-500"
            : event.organizer?.name === "Næringsliv og Kurs"
                ? "border-sky-500"
                : "border-gray-300";


    return (
        <ScrollView className="w-full h-fit">
            <Stack.Screen options={{ title: event.title }} />
            {event.image && (
                <Image
                    className="w-full h-48"
                    source={{ uri: event.image }}
                    resizeMode="cover"
                />
            )}
            <View className="flex flex-col text-3xl p-2">
                <Text className="text-2xl font-semibold mb-2">{event.title}</Text>
                <View
                    className={`rounded-full border-2 px-4 py-1 self-start mt-2 ${borderColor}`}
                >
                    <Text className="text-md text-white">
                        {event.organizer?.name || "Organisator"}
                    </Text>
                </View>
                <Text className="text-xl font-medium mt-5">Detaljer</Text>
                <Card className="w-full h-fit border rounded-lg p-2 flex flex-col gap-4">
                    <View className="flex flex-row">
                        <View className="mr-16">
                            <Text className="text-lg text-gray-400 mb-2">Fra</Text>
                            <Text className="text-lg text-gray-400 mb-2">Til</Text>
                            <Text className="text-lg text-gray-400 mb-2">Sted</Text>
                            <Text className="text-lg text-gray-400 mb-2">Arrangør</Text>
                            {event.contact_person && (
                                <Text className="text-lg text-gray-400 mb-2">Kontaktperson</Text>
                            )}
                            {event.paid_information?.price && (
                                <Text className="text-lg text-gray-400">Pris</Text>
                            )}
                        </View>
                        <View>
                            <Text className="text-lg mb-2">
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
                            <Text className="text-lg mb-2">
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
                            <Text className="text-lg mb-2">{event.location || "Ikke oppgitt"}</Text>
                            <Text className="text-lg mb-2">{event.organizer?.name || "Ikke oppgitt"}</Text>
                            {event.contact_person && (
                                <Text className="text-lg mb-2">
                                    {`${event.contact_person.first_name} ${event.contact_person.last_name}`}
                                </Text>
                            )}
                            {event.paid_information?.price && (
                                <Text className="text-lg">{event.paid_information.price}</Text>
                            )}
                        </View>
                    </View>
                </Card>
                <Text className="text-xl font-medium mt-5">Påmelding</Text>
                <Card className="w-full h-fit border rounded-lg p-2 flex flex-col gap-4">
                    <View className="flex flex-row">
                        <View className="mr-16">
                            <Text className="text-lg text-gray-400 mb-2">Påmeldte</Text>
                            <Text className="text-lg text-gray-400 mb-2">Venteliste</Text>
                            <Text className="text-lg text-gray-400 mb-2">Avmeldingsfrist</Text>
                        </View>
                        <View>
                            <Text className="text-lg mb-2">
                                {event.list_count}/{event.limit}
                            </Text>
                            <Text className="text-lg mb-2">{event.waiting_list_count}</Text>
                            <Text className="text-lg mb-2">
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
                </Card>

                <Button className="mt-5 mb-5">
                    <Text>Meld deg på</Text>
                </Button>

                <Text className="text-xl font-medium mt-5">Beskrivelse</Text>
                <Card className="w-full h-fit border rounded-lg p-4 bg-transparent">
                    <Markdown
                        style={{
                            body: {
                                fontSize: 16,
                                color: "#FFFFFF",
                                lineHeight: 24,
                            },
                            heading1: {
                                fontSize: 22,
                                fontWeight: "bold",
                                marginBottom: 16,
                                color: "#FFFFFF",
                            },
                            heading2: {
                                fontSize: 20,
                                fontWeight: "bold",
                                marginBottom: 12,
                                color: "#FFFFFF",
                            },
                            bullet_list: {
                                marginLeft: 16,
                                marginBottom: 20,
                            },
                            blockquote: {
                                borderLeftWidth: 4,
                                borderLeftColor: "#5A91F7",
                                paddingLeft: 16,
                                color: "#FFFFFF",
                                fontStyle: "italic",
                                backgroundColor: "rgba(255, 255, 255, 0.05)", // Gjør bakgrunnen diskret grå/transparant
                                marginBottom: 20,
                                marginTop: 20,
                                borderRadius: 6, // Gir myke kanter som i ønsket utseende
                                paddingVertical: 10, // Ekstra vertikal padding
                            },
                        }}
                    >
                        {event.description || "Ingen beskrivelse tilgjengelig."}
                    </Markdown>
                </Card>

            </View>
        </ScrollView>
    );
}
