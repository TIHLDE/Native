import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlatList, LayoutAnimation, Pressable, View } from "react-native";
import { ChevronDown, ChevronUp, Scale } from "lucide-react-native";
import { fetchLaws } from "@/actions/fines/laws";
import { Law } from "@/actions/types";
import { Text } from "@/components/ui/text";
import { themeColors } from "@/lib/theme/colors";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { GroupEmptyState } from "./GroupEmptyState";

function LawCardSkeleton() {
    return (
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center">
            <View className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="flex-1 ml-3">
                <View className="w-32 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mb-2" />
                <View className="w-40 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            </View>
        </View>
    );
}

/**
 * Én paragraf som en nedtrekksrad: lukket viser den bare § og tittel, åpnet
 * viser den hele beskrivelsen og hvor mange bøter paragrafen gir.
 *
 * Før sto hele beskrivelsen utbrettet på hver rad, og en gruppe med mange
 * paragrafer ble en lang vegg med tekst. Lukket kan man skumme titlene og åpne
 * den man lurer på.
 *
 * Åpne og lukke følger samme mønster som bøteradene i `GroupFinesList`:
 * `LayoutAnimation` framfor Reanimated, og samme pil, så de to fanene oppfører
 * seg likt. Hver rad holder sin egen tilstand, så flere kan stå åpne samtidig.
 */
function LawRow({ law }: { law: Law }) {
    const [isOpen, setIsOpen] = useState(false);
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen((open) => !open);
    };

    const Chevron = isOpen ? ChevronUp : ChevronDown;

    return (
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4">
            <Pressable
                onPress={toggle}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                accessibilityLabel={`Paragraf ${law.paragraph}, ${law.title}`}
                className="flex-row items-center active:opacity-70"
            >
                <View className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 items-center justify-center">
                    <Text className="text-sm font-bold text-primary">
                        §{law.paragraph}
                    </Text>
                </View>
                <Text
                    className="flex-1 ml-3 text-base font-semibold text-foreground"
                    numberOfLines={isOpen ? undefined : 2}
                >
                    {law.title}
                </Text>
                <Chevron
                    size={18}
                    color={colors.mutedForeground}
                    style={{ marginLeft: 8 }}
                />
            </Pressable>

            {isOpen ? (
                <View className="mt-3 pt-3 border-t border-border">
                    {law.description ? (
                        <Text className="text-sm text-muted-foreground">
                            {law.description}
                        </Text>
                    ) : (
                        <Text className="text-sm text-muted-foreground italic">
                            Ingen beskrivelse
                        </Text>
                    )}
                    <View className="self-start mt-3 bg-primary/10 dark:bg-primary/20 rounded-full px-2.5 py-1">
                        <Text className="text-xs font-semibold text-primary">
                            {law.amount} {law.amount === 1 ? "bot" : "bøter"}
                        </Text>
                    </View>
                </View>
            ) : null}
        </View>
    );
}

/**
 * Lovverket til gruppa, til lesing.
 *
 * Botflyten har sin egen lovliste som er trykkbar og starter utdelingen. Denne
 * er bevisst en egen komponent framfor en delt: de to har ulik oppgave, og
 * botflyten skal ikke endres. De deler `["laws", groupSlug]`-cachen, så det
 * koster ingen ekstra kall.
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

    return (
        <FlatList
            data={laws.data ?? []}
            className="flex-1"
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            refreshControl={refreshControl}
            renderItem={({ item: law }) => <LawRow law={law} />}
            ListEmptyComponent={
                laws.isPending ? (
                    <View>
                        <LawCardSkeleton />
                        <LawCardSkeleton />
                        <LawCardSkeleton />
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
