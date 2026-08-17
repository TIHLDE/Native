import { fetchFavoriteEvents } from "@/actions/events/events";
import { Event } from "@/actions/types";
import me, { myEvents } from "@/actions/users/me";
import EventCard, {
    EventCardSkeleton,
} from "@/components/arrangement/eventCard";
import PageWrapper from "@/components/ui/pagewrapper";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { avatarImageUrl } from "@/lib/images";
import { classYearLabel, parseStartYear } from "@/lib/study";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import useRefresh from "@/lib/useRefresh";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

/** Fanene under profilen. Rekkefølgen styrer `SegmentedControl`. */
const TABS = ["Påmeldte", "Favoritter"] as const;

export default function Profil() {
    const { signOut } = useAuth();
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();
    const [tab, setTab] = useState(0);

    const user = useQuery({
        queryKey: ["users", "me"],
        queryFn: me,
    });

    const registered = useQuery({
        queryKey: ["users", "me", "events"],
        queryFn: myEvents,
    });

    // Favorittlista koster ett kall per favoritt hos Photon, så den hentes
    // først når fanen faktisk åpnes.
    const favorites = useQuery({
        queryKey: ["events", "favorites", "upcoming"],
        queryFn: () => fetchFavoriteEvents({ expired: false }),
        enabled: tab === 1,
    });

    const refreshControl = useRefresh([
        ["users", "me"],
        ["events", "favorites"],
    ]);

    if (user.isPending) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <ScrollView
                    refreshControl={refreshControl}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-base text-muted-foreground">
                            Laster profil...
                        </Text>
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    if (user.isError) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <ScrollView
                    refreshControl={refreshControl}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    {/*
                      * «Logg ut» hører hjemme her også. Ligger den bare i
                      * innstillingene, er den utilgjengelig akkurat når den
                      * trengs mest — når profilen ikke lar seg hente.
                      */}
                    <View className="flex-1 items-center justify-center px-6">
                        <Text className="text-base text-destructive text-center">
                            {user.error.message}
                        </Text>
                        <Pressable
                            onPress={() => user.refetch()}
                            className="mt-6 h-12 px-6 rounded-2xl items-center justify-center bg-primary active:opacity-80"
                        >
                            <Text className="text-white text-base font-semibold">
                                Prøv igjen
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={async () => {
                                await signOut?.();
                                router.replace("/(auth)/login");
                            }}
                            hitSlop={8}
                            className="mt-4"
                        >
                            <Text className="text-base text-primary">Logg ut</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    const initials = `${user.data.first_name[0] ?? ""}${user.data.last_name[0] ?? ""}`;
    const studyProgram = user.data.study.group.name || null;
    const classLabel = classYearLabel(
        studyProgram ?? undefined,
        parseStartYear(user.data.studyyear.group.name),
    );

    const events = tab === 0 ? registered : favorites;

    return (
        <PageWrapper className="flex-1 bg-background">
            <ScrollView
                refreshControl={refreshControl}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Profilhode: bilde til venstre, opplysningene til høyre */}
                <View className="flex-row items-center px-5 pt-6 pb-7">
                    {user.data.image ? (
                        <Image
                            className="w-20 h-20 rounded-full"
                            source={{ uri: avatarImageUrl(user.data.image) }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-20 h-20 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                            <Text className="text-2xl font-bold text-primary">
                                {initials}
                            </Text>
                        </View>
                    )}

                    <View className="flex-1 ml-4">
                        <Text
                            className="text-xl font-bold text-foreground"
                            numberOfLines={2}
                        >
                            {user.data.first_name} {user.data.last_name}
                        </Text>
                        <MetaRow
                            left={`@${user.data.user_id}`}
                            right={user.data.email || null}
                        />
                        <MetaRow left={studyProgram} right={classLabel} />
                    </View>

                    {/*
                      * Innstillingene ligger her, ikke i headeren: der har
                      * bjella høyre side alene, og et tannhjul inntil den ble
                      * to knapper som klemte hverandre.
                      */}
                    <Pressable
                        onPress={() => router.push("/(app)/(tabs)/profil/innstillinger")}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Innstillinger"
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-secondary/30 items-center justify-center ml-3 active:opacity-70"
                    >
                        <Settings
                            size={19}
                            strokeWidth={2}
                            color={themeColors(isDarkColorScheme).foreground}
                        />
                    </Pressable>
                </View>

                {/* Arrangementer: påmeldte eller favoritter */}
                <View className="px-5">
                    <SegmentedControl
                        className="mb-5"
                        options={[...TABS]}
                        value={tab}
                        onChange={setTab}
                    />
                    <DisplayUserEvents
                        userEvents={events}
                        router={router}
                        emptyText={
                            tab === 0
                                ? "Du er ikke påmeldt noen arrangementer"
                                : "Du har ingen favorittmerkede arrangementer"
                        }
                    />
                </View>
            </ScrollView>
        </PageWrapper>
    );
}

/**
 * En linje med to opplysninger: den venstre står først, den høyre etter en
 * prikk. Mangler den ene, faller prikken bort sammen med den.
 *
 * Den høyre får resten av bredden og kuttes med «…» — e-postadresser er
 * lengre enn det er plass til ved siden av brukernavnet på de smaleste
 * telefonene.
 */
function MetaRow({ left, right }: { left: string | null; right: string | null }) {
    if (!left && !right) return null;

    return (
        <View className="flex-row items-center mt-1">
            {left ? (
                <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                    {left}
                </Text>
            ) : null}
            {left && right ? (
                <View className="w-1 h-1 rounded-full bg-muted-foreground/60 mx-2" />
            ) : null}
            {right ? (
                <Text
                    className="text-sm text-muted-foreground flex-1"
                    numberOfLines={1}
                >
                    {right}
                </Text>
            ) : null}
        </View>
    );
}

function DisplayUserEvents({
    userEvents,
    router,
    emptyText,
}: {
    userEvents: UseQueryResult<{ results: Event[] }, Error>;
    router: ReturnType<typeof useRouter>;
    emptyText: string;
}) {
    // `isPending` er sann også for en spørring som ikke har startet ennå
    // (favorittfanen før den åpnes), så skjelettene dekker begge tilfellene.
    if (userEvents.isPending) {
        return (
            <>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
            </>
        );
    }

    if (userEvents.isError) {
        return (
            <Text className="text-destructive text-center py-4">
                {userEvents.error.message}
            </Text>
        );
    }

    if (userEvents.data.results.length === 0) {
        return (
            <View className="py-8 items-center">
                <Text className="text-muted-foreground text-center">{emptyText}</Text>
            </View>
        );
    }

    return userEvents.data.results.map((event) => (
        <EventCard
            key={event.id}
            id={event.id.toString()}
            title={event.title}
            date={new Date(event.start_date)}
            image={event.image ?? null}
            location={event.location ?? null}
            organizer={event.organizer ?? { name: "Ukjent", slug: null }}
            onPress={() => {
                router.push({
                    pathname: "/(app)/(modals)/arrangement/[arrangementId]",
                    params: { arrangementId: event.id },
                });
            }}
        />
    ));
}
