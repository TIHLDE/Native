import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { Plus, ReceiptText } from "lucide-react-native";
import { myExpenses } from "@/actions/applications/applications";
import ExpenseCard, {
    ExpenseCardSkeleton,
} from "@/components/utlegg/expenseCard";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { themeColors } from "@/lib/theme/colors";

export default function Utlegg() {
    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = themeColors(isDarkColorScheme).mutedForeground;

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isPending,
        isError,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["applications", "mine", "expense"],
        queryFn: ({ pageParam }) => myExpenses(pageParam),
        initialPageParam: 0,
        // `next` er null på siste side; å telle opp selv ville gitt en tom
        // side til etter at lista var slutt.
        getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    });

    const refreshControl = useRefresh(["applications", "mine", "expense"]);

    const expenses = data?.pages.flatMap((page) => page.results) ?? [];

    return (
        <PageWrapper className="flex-1 bg-background">
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                refreshControl={refreshControl}
                ListHeaderComponent={
                    <Pressable
                        onPress={() => router.push("/utlegg/nytt")}
                        className="flex-row items-center justify-center h-14 rounded-2xl bg-primary my-4 active:opacity-80"
                    >
                        <Plus size={20} color="#ffffff" />
                        <Text
                            className="text-base font-semibold text-white ml-2"
                            style={{ fontFamily: "Inter" }}
                        >
                            Nytt utlegg
                        </Text>
                    </Pressable>
                }
                ListEmptyComponent={
                    isPending ? (
                        <View>
                            <ExpenseCardSkeleton />
                            <ExpenseCardSkeleton />
                            <ExpenseCardSkeleton />
                        </View>
                    ) : isError ? (
                        <View className="items-center py-12">
                            <Text className="text-destructive text-center">
                                {error.message}
                            </Text>
                        </View>
                    ) : (
                        <View className="items-center py-16">
                            <ReceiptText size={40} color={mutedColor} />
                            <Text className="text-base text-muted-foreground text-center mt-4">
                                Du har ikke sendt inn noen utlegg
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center mt-1">
                                Ta bilde av kvitteringen og send den inn med en gang.
                            </Text>
                        </View>
                    )
                }
                renderItem={({ item }) => <ExpenseCard expense={item} />}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <ActivityIndicator className="my-4" color={mutedColor} />
                    ) : null
                }
            />
        </PageWrapper>
    );
}
