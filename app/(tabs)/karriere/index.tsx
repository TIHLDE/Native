import { BASE_URL } from "@/actions/constant";
import JobPostCard, { JobPostCardSkeleton } from "@/components/karriere/jobpostcard";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import useRefresh from "@/lib/useRefresh";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { ScrollView, View } from "react-native";

export default function Karriere() {

    const jobposts = useQuery({
        queryKey: ["jobposts"],
        queryFn: async () => {
            return fetch(`${BASE_URL}/jobposts/`).then((res) => res.json());
        },
    });

    const refreshControl = useRefresh("jobposts");

    if (jobposts.isError) return <Text>Error: {jobposts.error.message}</Text>

    return (
        <PageWrapper className="w-full h-fit px-2">
            <ScrollView refreshControl={refreshControl}>
                <View className="flex flex-col justify-center mt-5 gap-4">
                    {
                        jobposts.data?.results.map((jobpost: any) => (
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
                    {jobposts.isPending &&
                        <>
                            <JobPostCardSkeleton />
                            <JobPostCardSkeleton />
                            <JobPostCardSkeleton />
                        </>
                    }
                </View>
            </ScrollView>
        </PageWrapper>
    );
}
