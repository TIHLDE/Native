
import { JOBTYPES } from "@/components/karriere/jobpostcard";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import timeformat from "@/lib/timeformat";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Link } from "lucide-react-native";
import { Image, ScrollView, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from 'expo-web-browser';
import { Button } from "@/components/ui/button";
import MarkdownView from "@/components/ui/MarkdownView";
import PageWrapper from "@/components/ui/pagewrapper";

export default function Karriereside() {
    const params = useLocalSearchParams();
    const id = params.karriereId;

    const jobpost = useQuery({
        queryKey: ["jobpost", id],
        queryFn: async () => {
            return fetch(`https://api.tihlde.org/jobposts/${id}`).then((res) => res.json());
        },
    });
    if (jobpost.isPending) return (
        <>
            <Stack.Screen options={{ title: "" }} />
            <Text>Loading...</Text>
        </>
    )
    if (jobpost.isError) return <Text>Error: {jobpost.error.message}</Text>

    const handleApply = async () => {
        await WebBrowser.openBrowserAsync(jobpost.data.link);
    }

    return (
        <>
            <Stack.Screen options={{ title: jobpost.data.company }} />
            <PageWrapper refreshQueryKey={["jobpost", id as string]}>
                <Image className="w-full h-48" source={{ uri: jobpost.data.image }} resizeMode="cover" />
                <View className="flex flex-col text-3xl p-4">
                    <Text className="text-2xl font-semibold mb-2">{jobpost.data.title}</Text>
                    <Text className="text-lg font-light mt-2">Detaljer</Text>
                    <Card className="w-full h-fit border rounded-lg p-2 flex flex-col gap-2">
                        <View className="flex flex-col gap-2">
                            <View className="flex flex-row gap-2">
                                <Text className="text-lg w-28">Bedrift</Text>
                                <Text className="text-lg">{jobpost.data.company}</Text>
                            </View>
                            <View className="flex flex-row gap-2">
                                <Text className="text-lg w-28">Søknadsfrist</Text>
                                <Text className="text-lg">{timeformat(new Date(jobpost.data.deadline), { showTimeOfDay: true })}</Text>
                            </View>
                            <View className="flex flex-row gap-2">
                                <Text className="text-lg w-28">Årstrinn</Text>
                                <Text className="text-lg">{jobpost.data.class_start}. - {jobpost.data.class_end}.</Text>
                            </View>
                            <View className="flex flex-row gap-2">
                                <Text className="text-lg w-28">Stillingstype</Text>
                                <Text className="text-lg">{JOBTYPES[jobpost.data.job_type as keyof typeof JOBTYPES]}</Text>
                            </View>
                            <View className="flex flex-row gap-2">
                                <Text className="text-lg w-28">Sted</Text>
                                <Text className="text-lg">{jobpost.data.location}</Text>
                            </View>
                            {jobpost.data.email &&
                                <View className="flex flex-row gap-2">
                                    <Text className="text-lg w-28">Kontakt</Text>
                                    <Text className="text-lg">{jobpost.data.email}</Text>
                                </View>
                            }
                        </View>
                    </Card>
                    <Text className="text-lg font-light mt-2">Beskrivelse</Text>
                    <Card className="w-full h-fit border rounded-lg p-2">
                        <MarkdownView content={jobpost.data.body} />
                    </Card>
                </View>
                {jobpost.data.link &&
                    <Button onPress={handleApply} className="m-auto w-1/2 h-12 mt-2 mb-10" variant="default">
                        <Text>
                            Søk
                        </Text>
                    </Button>
                }
            </PageWrapper>
        </>
    );
}
