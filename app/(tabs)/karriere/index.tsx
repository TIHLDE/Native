import { BASE_URL } from "@/actions/constant";
import JobPostCard, { JobPostCardSkeleton } from "@/components/karriere/jobpostcard";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { View } from "react-native";

export default function Karriere() {

    const jobposts = useQuery({
        queryKey: ["jobposts"],
        queryFn: async () => {
            return fetch(`${BASE_URL}/jobposts/`).then((res) => res.json());
        },
    });

    if (jobposts.isError) return <Text>Error: {jobposts.error.message}</Text>

    return (
        <PageWrapper className="w-full h-fit px-4" refreshQueryKey="jobposts">
            <View className="flex flex-col pb-20 justify-center mt-5 gap-4">
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
        </PageWrapper>
    );
}
