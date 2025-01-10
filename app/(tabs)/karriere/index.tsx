import JobPostCard from "@/components/karriere/jobpostcard";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Link } from "expo-router";
import { useColorScheme } from "nativewind";
import { ScrollView, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Karriere() {

    const jobposts = useQuery({
        queryKey: ["jobposts"],
        queryFn: async () => {
            return fetch("https://api.tihlde.org/jobposts/").then((res) => res.json());
        },
    });

    if (jobposts.isPending) return <Text>Loading...</Text>
    if (jobposts.isError) return <Text>Error: {jobposts.error.message}</Text>

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <ScrollView className="w-full h-fit p-2">
                    <Text className="text-2xl text-center">Karriere</Text>
                    <View className="flex flex-col justify-center mt-5 gap-4">
                        {
                            jobposts.data.results.map((jobpost: any) => (
                                <Link href={`/(tabs)/karriere/${jobpost.id}`} key={jobpost.id}>
                                    <JobPostCard
                                        title={jobpost.title}
                                        jobType={jobpost.job_type}
                                        deadline={jobpost.deadline}
                                        location={jobpost.location}
                                        image={jobpost.image}
                                    />
                                </Link>
                            ))
                        }
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
