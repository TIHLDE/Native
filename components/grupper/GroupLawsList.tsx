import { useQuery } from "@tanstack/react-query";
import { FlatList, View } from "react-native";
import { Scale } from "lucide-react-native";
import { fetchLaws } from "@/actions/fines/laws";
import { Text } from "@/components/ui/text";
import useRefresh from "@/lib/useRefresh";
import { GroupEmptyState } from "./GroupEmptyState";
import { LawRow, LawRowSkeleton, useOpenLaws } from "./LawRow";

/**
 * Lovverket til gruppa, til lesing.
 *
 * Botflyten har sin egen liste, men bruker samme `LawRow`, så paragrafene ser
 * like ut begge steder; der velger et trykk på raden paragrafen.
 * De deler `["laws", groupSlug]`-cachen, så det koster ingen ekstra kall.
 *
 * Lovverk-endepunktet er ikke stengt bak `finesActivated` i Photon — en gruppe
 * kan skrive paragrafene sine før bøtesystemet skrus på. Derfor tar denne lista
 * ingen `finesActivated`-parameter og virker for alle grupper.
 */
export function GroupLawsList({ groupSlug }: { groupSlug: string }) {
    const laws = useQuery({
        queryKey: ["laws", groupSlug],
        queryFn: () => fetchLaws(groupSlug),
    });

    const refreshControl = useRefresh(["laws", groupSlug]);
    const { openIds, toggle } = useOpenLaws();

    return (
        <FlatList
            data={laws.data ?? []}
            className="flex-1"
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            refreshControl={refreshControl}
            extraData={openIds}
            renderItem={({ item: law }) => (
                <LawRow
                    law={law}
                    isOpen={openIds.has(law.id)}
                    onToggle={toggle}
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
                    <View className="items-center px-6 pt-16">
                        <Text className="text-base text-destructive text-center">
                            {laws.error.message}
                        </Text>
                    </View>
                ) : (
                    <GroupEmptyState
                        icon={Scale}
                        title="Ingen lover"
                        description="Denne gruppen har ikke lagt inn noe lovverk ennå."
                    />
                )
            }
        />
    );
}
