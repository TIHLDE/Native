import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams } from "expo-router";
import { View, Image, ScrollView } from "react-native";
import MarkdownView from "@/components/ui/MarkdownView";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import PageWrapper from "@/components/ui/pagewrapper";

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

    const event = useQuery({
        queryKey: ["event", id],
        queryFn: async (): Promise<Event> => {
            return fetch(`https://api.tihlde.org/events/${id}`).then((res) => res.json());
        },
    });

    if (event.isPending) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg">Laster arrangement...</Text>
            </View>
        );
    }

    if (event.error) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg text-red-500">Feil: {event.error.message}</Text>
            </View>
        );
    }

    if (!event) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg">Ingen data funnet.</Text>
            </View>
        );
    }

    return (
        <PageWrapper refreshQueryKey={["event", id as string]}>
            <Stack.Screen options={{ title: event.data.title }} />
            <View>
                {event.data.image && (
                    <Image
                        source={{ uri: event.data.image }}
                        className="w-full h-64"
                        resizeMode="contain"
                    />
                )}
            </View>
            <Card className="mx-auto w-[90%] shadow-lg rounded-lg mt-10 pl-10 pr-10 pt-5 pb-5">
                <Text className="text-2xl mb-6  font-bold">Detaljer</Text>
                <View className="flex flex-row justify-start items-start">
                    <View className="mr-10">
                        <Text className="text-md text-gray-400 mb-2">Fra:</Text>
                        <Text className="text-md text-gray-400 mb-2">Til:</Text>
                        <Text className="text-md text-gray-400 mb-2">Sted:</Text>
                        <Text className="text-md text-gray-400 mb-2">Arrangør:</Text>
                        <Text className="text-md text-gray-400 mb-2">Kontaktperson:</Text>
                        {event.data.paid_information?.price && (
                            <Text className="text-md text-gray-400">Pris:</Text>
                        )}
                    </View>
                    <View>
                        <Text className="text-md mb-2">
                            {new Date(event.data.start_date).toLocaleDateString("no-NO", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}{" "}
                            kl.{" "}
                            {new Date(event.data.start_date).toLocaleTimeString("no-NO", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                        <Text className="text-md mb-2">
                            {new Date(event.data.end_date).toLocaleDateString("no-NO", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}{" "}
                            kl.{" "}
                            {new Date(event.data.end_date).toLocaleTimeString("no-NO", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                        <Text className="text-md mb-2">{event.data.location || "Ikke oppgitt"}</Text>
                        <Text className="text-md mb-2">{event.data.organizer?.name || "Ikke oppgitt"}</Text>
                        <Text className="text-md mb-2">
                            {event.data.contact_person
                                ? `${event.data.contact_person.first_name} ${event.data.contact_person.last_name}`
                                : "Ikke oppgitt"}
                        </Text>
                        {event.data.paid_information?.price && (
                            <Text className="text-md">{event.data.paid_information.price}</Text>
                        )}
                    </View>
                </View>
            </Card>
            <Card className="mx-auto w-[90%] shadow-lg rounded-lg mt-10 pl-10 pr-10 pt-5 pb-5">
                <Text className="text-2xl mb-6 font-bold">Påmelding</Text>
                <View className="flex flex-row justify-start items-start">
                    <View className="mr-10">
                        <Text className="text-md text-gray-400 mb-2">Påmeldte:</Text>
                        <Text className="text-md text-gray-400 mb-2">Venteliste:</Text>
                        <Text className="text-md text-gray-400 mb-2">Avmeldingsfrist:</Text>
                    </View>
                    <View>
                        <Text className="text-md mb-2">
                            {event.data.list_count}/{event.data.limit}
                        </Text>
                        <Text className="text-md mb-2">
                            {event.data.waiting_list_count}
                        </Text>
                        <Text className="text-md mb-2">
                            {new Date(event.data.sign_off_deadline).toLocaleDateString("no-NO", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}{" "}
                            kl.{" "}
                            {new Date(event.data.sign_off_deadline).toLocaleTimeString("no-NO", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                    </View>
                </View>
            </Card>
            <Card className="mx-auto w-[90%] shadow-lg rounded-lg mt-10 pl-10 pr-10 pt-5 pb-5">
                <Text className="text-2xl font-bold mb-4">{event.data.title}</Text>
                <MarkdownView content={event.data.description || "Ingen beskrivelse tilgjengelig"} />
            </Card>
        </PageWrapper>

    );
}
