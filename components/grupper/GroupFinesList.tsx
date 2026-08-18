import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
    ActivityIndicator,
    FlatList,
    Image,
    LayoutAnimation,
    Pressable,
    View,
} from "react-native";
import { ChevronDown, ChevronUp, Gavel } from "lucide-react-native";
import { fetchFines } from "@/actions/fines/fines";
import { Fine, FineStatus } from "@/actions/types";
import { Text } from "@/components/ui/text";
import { coverImageUrl } from "@/lib/images";
import { themeColors } from "@/lib/theme/colors";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { GroupEmptyState } from "./GroupEmptyState";
import { PersonAvatar } from "./PersonAvatar";

const STATUS_LABELS: Record<FineStatus, string> = {
    pending: "Venter",
    approved: "Godkjent",
    paid: "Betalt",
    rejected: "Avvist",
};

/**
 * `bg-muted` er #f5f5f5 i lys modus og forsvant helt i kortet, som er #f3f4f6.
 * Ventende bøter bruker derfor samme nøytrale par som skjelettene lenger nede.
 */
const STATUS_CLASSES: Record<FineStatus, string> = {
    pending: "bg-gray-200 dark:bg-secondary/50",
    approved: "bg-primary/15 dark:bg-primary/25",
    paid: "bg-primary/30 dark:bg-primary/40",
    rejected: "bg-destructive/15",
};

function FineCardSkeleton() {
    return (
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4">
            <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse" />
                <View className="flex-1 ml-3">
                    <View className="w-28 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mb-2" />
                    <View className="w-20 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
                </View>
            </View>
            <View className="w-full h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mt-3" />
        </View>
    );
}

/**
 * Én bot, som en sammenslått rad.
 *
 * Begrunnelsene er fritekst og ofte flere linjer, så en liste der alt sto
 * utbrettet ble en vegg av tekst uten rader å skanne. Lukket viser raden det man
 * leter etter — hvem, hvilken paragraf og hvor mange bøter — og resten ligger
 * ett trykk unna.
 */
function FineCard({ fine }: { fine: Fine }) {
    const { isDarkColorScheme } = useColorScheme();
    const [isOpen, setIsOpen] = useState(false);
    // 16:9 til bildet har sagt fra om sitt eget forhold — da er plassholderen
    // like høy som et vanlig landskapsbilde og kortet hopper minst mulig.
    const [imageAspect, setImageAspect] = useState(16 / 9);

    const colors = themeColors(isDarkColorScheme);

    // Dato og klokkeslett. Bøter kommer ofte i klynger på samme kveld, så
    // tidspunktet er det som faktisk skiller dem.
    const givenAt = new Date(fine.createdAt).toLocaleString("no-NO", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    // Bøtene i Photon har fått paragraf, så denne linja er paragrafens plass og
    // ingenting annet. Den håndfullen som fortsatt mangler den, er migrerte
    // Lepton-bøter der koblingen aldri fantes; der sier raden det rett ut.
    //
    // Begrunnelsen sto her før, som reserve. Det ga to problemer: den lot som
    // om den var en paragraf, og siden den også står under «Begrunnelse» når
    // raden åpnes, ble den samme teksten stående dobbelt.
    const paragraph = fine.law
        ? `§${fine.law.paragraph} ${fine.law.title}`
        : null;

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
                accessibilityLabel={`${fine.user.name}, ${paragraph ?? "uten paragraf"}`}
                className="flex-row items-center active:opacity-70"
            >
                <PersonAvatar name={fine.user.name} image={fine.user.image} />
                <View className="flex-1 ml-3">
                    <Text
                        className="text-base font-semibold text-foreground"
                        numberOfLines={1}
                    >
                        {fine.user.name}
                    </Text>
                    <Text
                        className={
                            paragraph
                                ? "text-sm text-muted-foreground mt-0.5"
                                : "text-sm text-muted-foreground mt-0.5 italic"
                        }
                        numberOfLines={1}
                    >
                        {paragraph ?? "Uten paragraf"}
                    </Text>
                </View>
                <View className="items-end ml-2">
                    <Text className="text-base font-semibold text-foreground">
                        {/* `amount` teller bøter, ikke kroner — se `Fine`. */}
                        {`${fine.amount} ${fine.amount === 1 ? "bot" : "bøter"}`}
                    </Text>
                    <View
                        className={`mt-1 px-2 py-0.5 rounded-full ${STATUS_CLASSES[fine.status]}`}
                    >
                        <Text className="text-xs font-semibold text-foreground">
                            {STATUS_LABELS[fine.status]}
                        </Text>
                    </View>
                </View>
                <Chevron
                    size={18}
                    color={colors.mutedForeground}
                    style={{ marginLeft: 8 }}
                />
            </Pressable>

            {isOpen ? (
                <View className="mt-3 pt-3 border-t border-border">
                    {fine.image ? (
                        // Bevisbildene er telefonbilder og skjermbilder i alle
                        // mulige sideforhold, og et bevis som er beskåret er
                        // ikke et bevis. Sideforholdet leses derfor av bildet
                        // selv når det er lastet, sånn at hele flaten vises.
                        //
                        // Rammen sentrerer og setter taket. Uten den ble et
                        // stående skjermbilde liggende venstrestilt med
                        // dødplass ved siden av, fordi bildet beholdt full
                        // bredde mens innholdet krympet.
                        <View className="items-center mb-3">
                            <Image
                                source={{ uri: coverImageUrl(fine.image) }}
                                onLoad={(event) => {
                                    const { width, height } =
                                        event.nativeEvent.source;
                                    if (width > 0 && height > 0) {
                                        setImageAspect(width / height);
                                    }
                                }}
                                style={{
                                    // Høyden styrer, og bredden følger av
                                    // sideforholdet. Et stående skjermbilde blir
                                    // da smalt og helt, framfor å bli 650 punkter
                                    // høyt og skyve resten av kortet under
                                    // skjermkanten. `maxWidth` fanger det
                                    // motsatte: et bredt bilde ville ellers blitt
                                    // bredere enn kortet.
                                    height: 320,
                                    maxWidth: "100%",
                                    aspectRatio: imageAspect,
                                }}
                                className="rounded-xl"
                                resizeMode="contain"
                            />
                        </View>
                    ) : null}

                    <View className="flex-row items-center">
                        {fine.createdByUser ? (
                            <>
                                <PersonAvatar
                                    name={fine.createdByUser.name}
                                    image={fine.createdByUser.image}
                                    className="w-6 h-6"
                                />
                                <Text className="text-sm text-muted-foreground ml-2">
                                    {`Gitt av ${fine.createdByUser.name}`}
                                </Text>
                            </>
                        ) : (
                            <Text className="text-sm text-muted-foreground">
                                Ukjent giver
                            </Text>
                        )}
                    </View>
                    <Text className="text-sm text-muted-foreground mt-1">
                        {givenAt}
                    </Text>

                    {fine.reason ? (
                        <>
                            <Text className="text-xs font-semibold text-muted-foreground mt-3 uppercase">
                                Begrunnelse
                            </Text>
                            <Text className="text-sm text-foreground mt-1">
                                {fine.reason}
                            </Text>
                        </>
                    ) : null}

                    {fine.defense ? (
                        <>
                            <Text className="text-xs font-semibold text-muted-foreground mt-3 uppercase">
                                Forsvar
                            </Text>
                            <Text className="text-sm text-foreground mt-1">
                                {fine.defense}
                            </Text>
                        </>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}

export function GroupFinesList({
    groupSlug,
    finesActivated,
}: {
    groupSlug: string;
    finesActivated: boolean;
}) {
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
        queryKey: ["fines", groupSlug],
        queryFn: ({ pageParam }) => fetchFines(groupSlug, { page: pageParam }),
        initialPageParam: 0,
        // Sidene er 0-baserte og `next` er null på siste side.
        getNextPageParam: (lastPage) => lastPage.next ?? undefined,
        // Photon svarer 404 når gruppa ikke har bøter aktivert. Uten denne
        // porten ville hver slik gruppe gitt et garantert mislykket kall som
        // react-query så prøver på nytt.
        enabled: finesActivated,
    });

    const refreshControl = useRefresh(["fines", groupSlug]);
    const fines = data?.pages.flatMap((page) => page.results) ?? [];

    if (!finesActivated) {
        return (
            <GroupEmptyState
                icon={Gavel}
                title="Bøter er ikke aktivert"
                description="Denne gruppen bruker ikke bøtesystemet."
            />
        );
    }

    return (
        <FlatList
            data={fines}
            className="flex-1"
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            refreshControl={refreshControl}
            renderItem={({ item }) => <FineCard fine={item} />}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListFooterComponent={
                isFetchingNextPage ? (
                    <ActivityIndicator className="my-4" color={mutedColor} />
                ) : null
            }
            ListEmptyComponent={
                isPending ? (
                    <View>
                        <FineCardSkeleton />
                        <FineCardSkeleton />
                        <FineCardSkeleton />
                    </View>
                ) : isError ? (
                    <View className="items-center px-6 pt-16">
                        <Text className="text-base text-destructive text-center">
                            {error.message}
                        </Text>
                    </View>
                ) : (
                    <GroupEmptyState
                        icon={Gavel}
                        title="Ingen bøter"
                        description="Det er ikke gitt noen bøter i denne gruppen ennå."
                    />
                )
            }
        />
    );
}
