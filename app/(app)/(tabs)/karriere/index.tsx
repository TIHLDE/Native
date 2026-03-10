import { BASE_URL } from "@/actions/constant";
import JobPostCard, { JobPostCardSkeleton } from "@/components/karriere/jobpostcard";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { SectionHeader } from "@/components/ui/section-header";
import useRefresh from "@/lib/useRefresh";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { ScrollView, View } from "react-native";
import { BriefcaseBusiness } from "lucide-react-native";
import { useColorScheme } from "@/lib/useColorScheme";

export default function Karriere() {
    const { isDarkColorScheme } = useColorScheme();

    const jobposts = useQuery({
        queryKey: ["jobposts"],
        queryFn: async () => {
            return fetch(`${BASE_URL}/jobposts/`).then((res) => res.json());
        },
    });

    const refreshControl = useRefresh("jobposts");

    if (jobposts.isError) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-base text-destructive">{jobposts.error.message}</Text>
                </View>
            </PageWrapper>
        );
    }

    const resultCount = jobposts.data?.results?.length ?? 0;

    return (
        <PageWrapper className="flex-1 bg-background">
            <ScrollView
                refreshControl={refreshControl}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Header section */}
                {!jobposts.isPending && (
                    <View className="px-4 pt-4">
                        <SectionHeader
                            title={`${resultCount} ${resultCount === 1 ? 'stilling' : 'stillinger'} tilgjengelig`}
                        />
                    </View>
                )}

                {/* Job post list */}
                <View>
                    {jobposts.data?.results.map((jobpost: any) => (
                        <Link href={`/(tabs)/karriere/${jobpost.id}`} key={jobpost.id}>
                            <JobPostCard
                                title={jobpost.title}
                                jobType={jobpost.job_type}
                                deadline={jobpost.deadline}
                                location={jobpost.location}
                                image={jobpost.image}
                                company={jobpost.company}
                            />
                        </Link>
                    ))}
                    {jobposts.isPending && (
                        <>
                            <JobPostCardSkeleton />
                            <JobPostCardSkeleton />
                            <JobPostCardSkeleton />
                        </>
                    )}

                    {/* Empty state */}
                    {!jobposts.isPending && resultCount === 0 && (
                        <View className="py-16 items-center">
                            <View className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
                                <BriefcaseBusiness
                                    size={28}
                                    color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'}
                                />
                            </View>
                            <Text className="text-lg font-semibold text-foreground mb-1">
                                Ingen stillinger
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center px-8">
                                Det er ingen jobbannonser tilgjengelig akkurat nå. Sjekk igjen senere!
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </PageWrapper>
    );
}
