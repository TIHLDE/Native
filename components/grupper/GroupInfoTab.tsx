import { Linking, Pressable, ScrollView, View } from "react-native";
import { ChevronRight, Mail } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { Group } from "@/actions/types";
import MarkdownView from "@/components/ui/MarkdownView";
import { Text } from "@/components/ui/text";
import { groupTypeLabel } from "@/lib/groups/groupPage";
import { themeColors } from "@/lib/theme/colors";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";

function GroupInfoSkeleton() {
    return (
        <View className="mx-4">
            <View className="w-24 h-6 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse mb-4" />
            <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4">
                <View className="w-full h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mb-2" />
                <View className="w-full h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mb-2" />
                <View className="w-2/3 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            </View>
        </View>
    );
}

/**
 * Om gruppa: hva slags gruppe det er, beskrivelsen og hvem man kontakter.
 *
 * Beskrivelsen er Markdown i Photon og vises som det, slik nettsida gjør.
 */
export function GroupInfoTab({
    groupSlug,
    group,
    isPending,
}: {
    groupSlug: string;
    group: Group | undefined;
    isPending: boolean;
}) {
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);

    // Samme par som de andre fanene, så et nedtrekk her også oppdaterer
    // lederen i hodet og summene i bøtefanen.
    const refreshControl = useRefresh([
        ["group", groupSlug],
        ["fines", groupSlug],
    ]);

    const typeLabel = group ? groupTypeLabel(group.type) : "";

    return (
        <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
            refreshControl={refreshControl}
        >
            {!group && isPending ? (
                <GroupInfoSkeleton />
            ) : group ? (
                <View className="mx-4">
                    {typeLabel ? (
                        <View className="self-start px-3 py-1 rounded-full bg-primary/15 dark:bg-primary/25 mb-4">
                            <Text className="text-xs font-semibold text-foreground">
                                {typeLabel}
                            </Text>
                        </View>
                    ) : null}

                    <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Beskrivelse
                    </Text>
                    <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4">
                        {group.description ? (
                            <MarkdownView content={group.description} />
                        ) : (
                            <Text className="text-sm text-muted-foreground italic">
                                Gruppen har ingen beskrivelse.
                            </Text>
                        )}
                    </View>

                    {group.contactEmail ? (
                        <>
                            <Text className="text-xs font-semibold text-muted-foreground uppercase mt-6 mb-2">
                                Kontakt
                            </Text>
                            <Pressable
                                onPress={() =>
                                    Linking.openURL(
                                        `mailto:${group.contactEmail}`
                                    ).catch(() =>
                                        // Enheter uten e-postprogram avviser mailto:.
                                        Toast.show({
                                            type: "error",
                                            text1: "Kunne ikke åpne e-post",
                                            text2: `Send en e-post til ${group.contactEmail} fra e-postappen din.`,
                                        })
                                    )
                                }
                                accessibilityRole="link"
                                accessibilityLabel={`Send e-post til ${group.contactEmail}`}
                                className="flex-row items-center bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 active:opacity-70"
                            >
                                <Mail size={20} color={colors.primary} />
                                <Text
                                    className="flex-1 ml-3 text-base text-foreground"
                                    numberOfLines={1}
                                >
                                    {group.contactEmail}
                                </Text>
                                <ChevronRight
                                    size={18}
                                    color={colors.mutedForeground}
                                />
                            </Pressable>
                        </>
                    ) : null}
                </View>
            ) : null}
        </ScrollView>
    );
}
