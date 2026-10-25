import { fetchMemberships } from "@/actions/fines/memberships";
import { ProfileGroup } from "@/actions/types";
import { getUserProfile } from "@/actions/users/user";
import { PersonAvatar } from "@/components/grupper/PersonAvatar";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { formatStudyLabel } from "@/lib/study";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import useRefresh from "@/lib/useRefresh";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Github,
    GraduationCap,
    Linkedin,
    LucideIcon,
    Mail,
} from "lucide-react-native";
import { Linking, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

/**
 * Bare nettadresser åpnes. Photon validerer lenkene med `z.url()`, som godtar
 * hvilket som helst skjema — og en lenke på noen andres profil skal ikke kunne
 * starte noe annet enn nettleseren.
 */
const isWebUrl = (url: string) => /^https?:\/\//i.test(url.trim());

function ProfileSkeleton() {
    return (
        <View className="px-5 pt-6">
            <View className="flex-row items-center">
                <View className="w-20 h-20 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse" />
                <View className="flex-1 ml-4">
                    <View className="w-40 h-5 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mb-3" />
                    <View className="w-52 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mb-2" />
                    <View className="w-32 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
                </View>
            </View>
            <View className="w-full h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mt-8 mb-2" />
            <View className="w-2/3 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
        </View>
    );
}

/**
 * Profilen til et annet medlem, slik nettsiden viser den: bilde, navn, studie,
 * lenker, «Om» og medlemskapene.
 *
 * E-posten står bare når Photon gir den — på egen profil og for en admin med
 * `users:view`. For alle andre er den null, og raden faller bort.
 */
export default function Brukerprofil() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);

    const profile = useQuery({
        queryKey: ["users", userId],
        queryFn: () => getUserProfile(userId),
    });

    // Samme nøkkel som gruppeskjermene, så den er som regel allerede i cachen.
    const memberships = useQuery({
        queryKey: ["memberships"],
        queryFn: fetchMemberships,
    });

    const refreshControl = useRefresh([["users", userId]]);

    if (profile.isPending) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <ProfileSkeleton />
            </PageWrapper>
        );
    }

    if (profile.isError) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <ScrollView
                    refreshControl={refreshControl}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View className="flex-1 items-center justify-center px-6">
                        <Text className="text-base text-destructive text-center">
                            {profile.error.message}
                        </Text>
                        <Pressable
                            onPress={() => profile.refetch()}
                            className="mt-6 h-12 px-6 rounded-2xl items-center justify-center bg-primary active:opacity-80"
                        >
                            <Text className="text-white text-base font-semibold">
                                Prøv igjen
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    const user = profile.data;
    const studyLabel = formatStudyLabel(user.studyProgram, user.classYear);
    const links = [
        { label: "GitHub", url: user.githubUrl, icon: Github },
        { label: "LinkedIn", url: user.linkedinUrl, icon: Linkedin },
    ].filter((link): link is { label: string; url: string; icon: LucideIcon } =>
        Boolean(link.url && isWebUrl(link.url))
    );

    // Kvarks `canOpenGroup` slipper også inn den med `groups:manage` på
    // gruppa. Rettighetene i appen har ikke scope, så den saken står igjen
    // som en vanlig merkelapp — gruppesida ville uansett svart 403 for de
    // fleste.
    const mySlugs = new Set(memberships.data?.map((item) => item.group.slug));
    const canOpenGroup = (group: ProfileGroup) =>
        group.type.toUpperCase() !== "PRIVATE" || mySlugs.has(group.slug);

    return (
        <PageWrapper className="flex-1 bg-background">
            <ScrollView
                refreshControl={refreshControl}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View className="flex-row items-center px-5 pt-6 pb-7">
                    <PersonAvatar name={user.name} image={user.image} size="lg" />

                    <View className="flex-1 ml-4">
                        <Text
                            className="text-xl font-bold text-foreground"
                            numberOfLines={2}
                        >
                            {user.name}
                        </Text>
                        {studyLabel ? (
                            <InfoRow icon={GraduationCap} color={colors.primary}>
                                {studyLabel}
                            </InfoRow>
                        ) : null}
                        {user.email ? (
                            <Pressable
                                onPress={() =>
                                    Linking.openURL(`mailto:${user.email}`).catch(() =>
                                        // Enheter uten e-postprogram avviser mailto:.
                                        Toast.show({
                                            type: "error",
                                            text1: "Kunne ikke åpne e-post",
                                            text2: `Send en e-post til ${user.email} fra e-postappen din.`,
                                        })
                                    )
                                }
                                accessibilityRole="link"
                                accessibilityLabel={`Send e-post til ${user.email}`}
                                className="active:opacity-70"
                            >
                                <InfoRow icon={Mail} color={colors.primary}>
                                    {user.email}
                                </InfoRow>
                            </Pressable>
                        ) : null}
                        {links.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2 mt-3">
                                {links.map((link) => (
                                    <LinkPill
                                        key={link.label}
                                        label={link.label}
                                        url={link.url}
                                        icon={link.icon}
                                        color={colors.foreground}
                                    />
                                ))}
                            </View>
                        ) : null}
                    </View>
                </View>

                <View className="px-5">
                    {user.bio?.trim() ? (
                        <View className="mb-7">
                            <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                Om
                            </Text>
                            <Text className="text-base text-foreground">
                                {user.bio.trim()}
                            </Text>
                        </View>
                    ) : null}

                    <Text className="text-lg font-semibold text-foreground mb-3">
                        Medlemskap
                    </Text>
                    {user.groups.length > 0 ? (
                        <View className="flex-row flex-wrap gap-2">
                            {user.groups.map((group) => (
                                <MembershipChip
                                    key={group.slug}
                                    name={group.name}
                                    onPress={
                                        canOpenGroup(group)
                                            ? () =>
                                                  router.push({
                                                      pathname: "/(app)/(modals)/gruppe/[groupSlug]",
                                                      params: { groupSlug: group.slug },
                                                  })
                                            : undefined
                                    }
                                />
                            ))}
                        </View>
                    ) : (
                        <Text className="text-sm text-muted-foreground">
                            Ikke medlem i noen grupper
                        </Text>
                    )}
                </View>
            </ScrollView>
        </PageWrapper>
    );
}

/** Én opplysning under navnet, med ikonet foran. */
function InfoRow({
    icon: Icon,
    color,
    children,
}: {
    icon: LucideIcon;
    color: string;
    children: string;
}) {
    return (
        <View className="flex-row items-center mt-1.5">
            <Icon size={15} color={color} />
            <Text className="text-sm text-primary ml-1.5 flex-1" numberOfLines={1}>
                {children}
            </Text>
        </View>
    );
}

function LinkPill({
    label,
    url,
    icon: Icon,
    color,
}: {
    label: string;
    url: string;
    icon: LucideIcon;
    color: string;
}) {
    return (
        <Pressable
            onPress={() =>
                Linking.openURL(url).catch(() =>
                    Toast.show({
                        type: "error",
                        text1: `Kunne ikke åpne ${label}`,
                    })
                )
            }
            accessibilityRole="link"
            accessibilityLabel={`Åpne ${label}`}
            className="flex-row items-center px-3 py-1 rounded-full border border-border active:opacity-70"
        >
            <Icon size={14} color={color} />
            <Text className="text-sm font-semibold text-foreground ml-1.5">{label}</Text>
        </Pressable>
    );
}

/**
 * En gruppe brukeren er med i. Uten `onPress` er den bare en merkelapp — en
 * privat gruppe man selv ikke er med i, ville svart 403.
 */
function MembershipChip({ name, onPress }: { name: string; onPress?: () => void }) {
    const chip = (
        <View className="px-3 py-1 rounded-full bg-primary/15 dark:bg-primary/25">
            <Text className="text-sm font-semibold text-foreground">{name}</Text>
        </View>
    );

    if (!onPress) return chip;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="link"
            accessibilityLabel={`Åpne ${name}`}
            className="active:opacity-70"
        >
            {chip}
        </Pressable>
    );
}
