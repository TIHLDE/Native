import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { fetchLaws } from "@/actions/fines/laws";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, View } from "react-native";
import { ChevronRight, Scale } from "lucide-react-native";

function LawCardSkeleton() {
    return (
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center">
            <View className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="flex-1 ml-3">
                <View className="w-24 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mb-2" />
                <View className="w-40 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            </View>
        </View>
    );
}

export default function LawSelection() {
    const router = useRouter();
    const { groupSlug } = useLocalSearchParams<{ groupSlug: string }>();
    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = isDarkColorScheme ? "#9ca3af" : "#6b7280";

    const laws = useQuery({
        queryKey: ["laws", groupSlug],
        queryFn: () => fetchLaws(groupSlug),
    });

    const refreshControl = useRefresh(["laws", groupSlug]);

    return (
        <PageWrapper className="flex-1 bg-background">
            <FlatList
                data={laws.data ?? []}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
                refreshControl={refreshControl}
                keyExtractor={(item) => item.id}
                renderItem={({ item: law }) => (
                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: "/(modals)/boter/[groupSlug]/brukere",
                                params: {
                                    groupSlug,
                                    lawId: law.id,
                                    lawTitle: law.title,
                                    lawParagraph: law.paragraph,
                                    lawAmount: law.amount.toString(),
                                    lawDescription: law.description,
                                },
                            })
                        }
                        className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center active:opacity-70"
                    >
                        <View className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 items-center justify-center">
                            <Text className="text-sm font-bold text-primary dark:text-accent">
                                §{law.paragraph}
                            </Text>
                        </View>
                        <View className="flex-1 ml-3 mr-2">
                            <Text className="text-base font-semibold text-foreground">
                                {law.title}
                            </Text>
                            <Text
                                className="text-sm text-muted-foreground mt-0.5"
                                numberOfLines={2}
                            >
                                {law.description}
                            </Text>
                        </View>
                        <View className="items-center">
                            <View className="bg-primary/10 dark:bg-primary/20 rounded-full px-2.5 py-1 mb-1">
                                <Text className="text-xs font-semibold text-primary dark:text-accent">
                                    {law.amount}{" "}
                                    {law.amount === 1 ? "bot" : "bøter"}
                                </Text>
                            </View>
                            <ChevronRight size={16} color={mutedColor} />
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={
                    laws.isPending ? (
                        <View>
                            <LawCardSkeleton />
                            <LawCardSkeleton />
                            <LawCardSkeleton />
                        </View>
                    ) : laws.isError ? (
                        <View className="flex-1 items-center justify-center px-6 pt-16">
                            <Text className="text-base text-destructive">
                                {laws.error.message}
                            </Text>
                        </View>
                    ) : (
                        <View className="py-16 items-center">
                            <View className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
                                <Scale
                                    size={28}
                                    color={
                                        isDarkColorScheme ? "#8ba3d4" : "#2d5dab"
                                    }
                                />
                            </View>
                            <Text className="text-lg font-semibold text-foreground mb-1">
                                Ingen lover
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center px-8">
                                Det finnes ingen lover for denne gruppen ennå.
                            </Text>
                        </View>
                    )
                }
            />
        </PageWrapper>
    );
}
