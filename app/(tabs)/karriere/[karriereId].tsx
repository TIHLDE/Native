import { JOBTYPES } from "@/components/karriere/jobpostcard";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, View } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { Button } from "@/components/ui/button";
import MarkdownView from "@/components/ui/MarkdownView";
import PageWrapper from "@/components/ui/pagewrapper";
import { BASE_URL } from "@/actions/constant";
import useRefresh from "@/lib/useRefresh";

export default function Karriereside() {
    const params = useLocalSearchParams();
    const id = params.karriereId;

    const jobpost = useQuery({
        queryKey: ["jobpost", id],
        queryFn: async () => {
            return fetch(`${BASE_URL}/jobposts/${id}`).then((res) => res.json());
        },
    });

    const refreshControl = useRefresh(["jobpost", id as string]);

    if (jobpost.isPending) return (
        <View>
            <Stack.Screen options={{ title: "" }} />
            <Text>Loading...</Text>
        </View>
    )
    if (jobpost.isError) return <Text>Error: {jobpost.error.message}</Text>

    const handleApply = async () => {
        await WebBrowser.openBrowserAsync(jobpost.data.link);
    }

    return (
        <>
            <Stack.Screen options={{ title: jobpost.data.company }} />
            <PageWrapper>
                <ScrollView refreshControl={refreshControl}>
                    <View>
                        <Image className="w-full h-48" resizeMode="cover" source={{ uri: jobpost.data.image }} />
                    </View>
                    <View className="flex flex-col text-3xl px-2 py-5">
                        <Text className="text-4xl font-semibold pl-2">{jobpost.data.title}</Text>
                        <Card className="mx-auto w-[100%] border-2 border-gray-200 dark:border-gray-900 bg-card rounded-lg mt-5 px-3 py-2">
                            <Text className="text-2xl mb-4 font-bold">Detaljer</Text>
                            <View className="flex flex-row justify-start items-start">
                                <View className="ml-2 mr-10">
                                    <Text className="text-md text-muted-foreground mb-2">Bedrift:</Text>
                                    <Text className="text-md text-muted-foreground mb-2">Søknadsfrist</Text>
                                    <Text className="text-md text-muted-foreground mb-2">Årstrinn:</Text>
                                    <Text className="text-md text-muted-foreground mb-2">Stillingstype:</Text>
                                    <Text className="text-md text-muted-foreground mb-2">Sted:</Text>
                                    <Text className="text-md text-muted-foreground mb-2">Kontakt:</Text>
                                </View>
                                <View>
                                    <Text className="text-md mb-2">{jobpost.data.company}</Text>
                                    <Text className="text-md mb-2">{jobpost.data.company}</Text>
                                    <Text className="text-md mb-2">{new Date(jobpost.data.deadline).toLocaleDateString("no-NO", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}</Text>
                                    <Text className="text-md mb-2">{jobpost.data.class_start}. - {jobpost.data.class_end}.</Text>
                                    <Text className="text-md mb-2">{JOBTYPES[jobpost.data.job_type as keyof typeof JOBTYPES]}</Text>
                                    <Text className="text-md mb-2">{jobpost.data.location}</Text>
                                    {jobpost.data.email &&
                                        <Text className="text-md mb-2">{jobpost.data.email}</Text>
                                    }
                                </View>

                            </View>
                        </Card>
                        {jobpost.data.link &&
                            <Button onPress={handleApply} className="w-full mt-5 mb-6" size="lg" variant="default">
                                <Text className="font-medium">
                                    Søk nå!
                                </Text>
                            </Button>
                        }
                        <MarkdownView content={jobpost.data.body} />
                    </View>
                </ScrollView>
            </PageWrapper>
        </>
    );
}
