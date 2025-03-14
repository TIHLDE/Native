import { JOBTYPES } from "@/components/karriere/jobpostcard";
import { Text } from "@/components/ui/text";
import timeformat from "@/lib/timeformat";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image, View } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { Button } from "@/components/ui/button";
import MarkdownView from "@/components/ui/MarkdownView";
import PageWrapper from "@/components/ui/pagewrapper";
import { BASE_URL } from "@/actions/constant";

export default function Karriereside() {
    const params = useLocalSearchParams();
    const id = params.karriereId;

    const jobpost = useQuery({
        queryKey: ["jobpost", id],
        queryFn: async () => {
            return fetch(`${BASE_URL}/jobposts/${id}`).then((res) => res.json());
        },
    });
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
            <PageWrapper refreshQueryKey={["jobpost", id as string]}>
                <View className="px-3 pt-4">
                    <Image className="rounded-lg w-full aspect-[16/7] object-cover" source={{ uri: jobpost.data.image }} />
                </View>
                <View className="w-full h-[1px] bg-gray-950 my-6" />

                <View className="flex flex-col px-3 gap-10 pb-12">
                    <Text className="text-4xl font-semibold">{jobpost.data.title}</Text>
                    <View className="w-full border bg-card dark:bg-[#020817] border-gray-300 dark:border-gray-800 rounded-lg p-2 flex flex-col gap-2 shadow-sm">
                        <View className="flex flex-col gap-2">
                            <View className="flex flex-row gap-4">
                                <Text className="text-lg w-28 font-medium">Bedrift:</Text>
                                <Text className="text-lg">{jobpost.data.company}</Text>
                            </View>
                            <View className="flex flex-row gap-4">
                                <Text className="text-lg w-28 font-medium">Søknadsfrist:</Text>
                                <Text className="text-lg">{timeformat(new Date(jobpost.data.deadline))}</Text>
                            </View>
                            <View className="flex flex-row gap-4">
                                <Text className="text-lg w-28 font-medium">Årstrinn:</Text>
                                <Text className="text-lg">{jobpost.data.class_start}. - {jobpost.data.class_end}.</Text>
                            </View>
                            <View className="flex flex-row gap-4">
                                <Text className="text-lg w-28 font-medium">Stillingstype:</Text>
                                <Text className="text-lg">{JOBTYPES[jobpost.data.job_type as keyof typeof JOBTYPES]}</Text>
                            </View>
                            <View className="flex flex-row gap-4">
                                <Text className="text-lg w-28 font-medium">Sted:</Text>
                                <Text className="text-lg">{jobpost.data.location}</Text>
                            </View>
                            {jobpost.data.email &&
                                <View className="flex flex-row gap-4 overflow-hidden">
                                    <Text className="text-lg w-28 font-medium">Kontakt:</Text>
                                    <Text className="text-lg line-clamp-1">{jobpost.data.email}</Text>
                                </View>
                            }
                        </View>
                    </View>
                    {jobpost.data.link &&
                        <Button onPress={handleApply} className="w-full" size="lg" variant="default">
                            <Text className="font-medium">
                                Søk nå!
                            </Text>
                        </Button>
                    }
                    <MarkdownView content={jobpost.data.body} />
                </View>
            </PageWrapper>
        </>
    );
}
