import { themeColors } from "@/lib/theme/colors";
import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { fetchLaws } from "@/actions/fines/laws";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, View } from "react-native";
import { Scale } from "lucide-react-native";
import { Law } from "@/actions/types";
import {
    LawRow,
    LawRowSkeleton,
    useOpenLaws,
} from "@/components/grupper/LawRow";
import { useCallback } from "react";
import {
    forwardImageParams,
    ImageParams,
} from "@/components/boter/useFineImage";

export default function LawSelection() {
    const router = useRouter();
    const { groupSlug, imageId } = useLocalSearchParams<
        { groupSlug: string } & ImageParams
    >();
    const { isDarkColorScheme } = useColorScheme();

    const laws = useQuery({
        queryKey: ["laws", groupSlug],
        queryFn: () => fetchLaws(groupSlug),
    });

    const refreshControl = useRefresh(["laws", groupSlug]);

    const { openIds, toggle } = useOpenLaws();

    // Å gi en bot skal være ett trykk: raden velger paragrafen med én gang, og
    // bare pila åpner beskrivelsen. Stabil, så de memoiserte radene står i ro.
    const selectLaw = useCallback(
        (law: Law) =>
            router.push({
                pathname: "/(app)/(modals)/boter/[groupSlug]/brukere",
                params: {
                    groupSlug,
                    lawId: law.id,
                    lawTitle: law.title,
                    lawParagraph: law.paragraph,
                    lawAmount: law.amount.toString(),
                    lawDescription: law.description,
                    ...forwardImageParams({ imageId }),
                },
            }),
        [router, groupSlug, imageId],
    );

    return (
        <PageWrapper className="flex-1 bg-background">
            <FlatList
                data={laws.data ?? []}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
                refreshControl={refreshControl}
                keyExtractor={(item) => item.id}
                extraData={openIds}
                renderItem={({ item: law }) => (
                    <LawRow
                        law={law}
                        isOpen={openIds.has(law.id)}
                        onToggle={toggle}
                        onSelect={selectLaw}
                    />
                )}
                ListEmptyComponent={
                    laws.isPending ? (
                        <View>
                            <LawRowSkeleton />
                            <LawRowSkeleton />
                            <LawRowSkeleton />
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
                                        themeColors(isDarkColorScheme).primary
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
