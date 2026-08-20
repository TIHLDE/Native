import type { Allergy, UserSettings } from "@/actions/types";
import {
    fetchAllergies,
    mySettings,
    settingsKeys,
    updateMySettings,
} from "@/actions/users/settings";
import PageWrapper, { TAB_SCREEN_EDGES, TAB_BAR_CLEARANCE } from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Plus, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    TextInput,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

/**
 * Katalogen er over hundre rader lang — Leptons fritekstsvar ble importert som
 * én rad hver — så lista vises ikke i sin helhet før noen har søkt.
 */
const MAX_SUGGESTIONS = 25;

export default function Allergier() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isDarkColorScheme } = useColorScheme();
    const [search, setSearch] = useState("");
    /** `null` fram til innstillingene er hentet, så valget kan starte på dem. */
    const [selected, setSelected] = useState<string[] | null>(null);

    const settings = useQuery({
        queryKey: settingsKeys.mine,
        queryFn: mySettings,
    });

    const allergies = useQuery({
        queryKey: settingsKeys.allergies,
        queryFn: fetchAllergies,
        // Katalogen er den samme for alle og endres nesten aldri.
        staleTime: 60 * 60 * 1000,
    });

    const save = useMutation({
        mutationFn: (slugs: string[]) => updateMySettings({ allergies: slugs }),
        onSuccess: (updated: UserSettings) => {
            queryClient.setQueryData(settingsKeys.mine, updated);
            Toast.show({ type: "success", text1: "Allergiene er lagret" });
            router.back();
        },
        onError: (error) => {
            Toast.show({
                type: "error",
                text1: "Allergiene ble ikke lagret",
                text2: error.message,
            });
        },
    });

    // Egen memo, ikke en løs `??`-kjede: uten den er lista et nytt objekt ved
    // hver render, og forslagene under regnes ut på nytt hver gang.
    const current = useMemo(
        () => selected ?? settings.data?.allergies ?? [],
        [selected, settings.data?.allergies],
    );

    const bySlug = useMemo(
        () => new Map((allergies.data ?? []).map((a) => [a.slug, a])),
        [allergies.data],
    );

    const suggestions = useMemo(() => {
        const needle = search.trim().toLowerCase();
        const chosen = new Set(current);

        return (allergies.data ?? [])
            .filter(
                (allergy) =>
                    !chosen.has(allergy.slug) &&
                    (needle === "" || allergy.label.toLowerCase().includes(needle)),
            )
            .slice(0, MAX_SUGGESTIONS);
    }, [allergies.data, current, search]);

    const mutedColor = themeColors(isDarkColorScheme).mutedForeground;

    if (settings.isPending || allergies.isPending) {
        return (
            <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" />
                </View>
            </PageWrapper>
        );
    }

    if (settings.isError || allergies.isError) {
        return (
            <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-base text-destructive text-center">
                        {(settings.error ?? allergies.error)?.message}
                    </Text>
                    <Pressable
                        onPress={() => {
                            settings.refetch();
                            allergies.refetch();
                        }}
                        className="mt-6 h-12 px-6 rounded-2xl items-center justify-center bg-primary active:opacity-80"
                    >
                        <Text className="text-white text-base font-semibold">
                            Prøv igjen
                        </Text>
                    </Pressable>
                </View>
            </PageWrapper>
        );
    }

    const toggle = (slug: string) => {
        setSelected(
            current.includes(slug)
                ? current.filter((s) => s !== slug)
                : [...current, slug],
        );
    };

    // Lagringen er ett kall som erstatter hele settet, så knappen står til
    // slutt framfor at hvert trykk sender en oppdatering.
    const isUnchanged =
        selected === null ||
        (selected.length === settings.data.allergies.length &&
            selected.every((slug) => settings.data.allergies.includes(slug)));

    return (
        <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
            <View className="flex-1">
                <FlatList
                    data={suggestions}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                    ListHeaderComponent={
                        <View className="pt-4">
                            <Text className="text-sm text-muted-foreground mb-4">
                                Allergiene dine deles med arrangørene av arrangementene du
                                melder deg på.
                            </Text>

                            {current.length > 0 ? (
                                <View className="flex-row flex-wrap gap-2 mb-4">
                                    {current.map((slug) => (
                                        <Pressable
                                            key={slug}
                                            onPress={() => toggle(slug)}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Fjern ${bySlug.get(slug)?.label ?? slug}`}
                                            className="flex-row items-center bg-primary/10 dark:bg-primary/20 rounded-full pl-3 pr-2 py-1.5 active:opacity-70"
                                        >
                                            <Text className="text-sm font-medium text-primary">
                                                {bySlug.get(slug)?.label ?? slug}
                                            </Text>
                                            <X
                                                size={14}
                                                color={themeColors(isDarkColorScheme).primary}
                                                style={{ marginLeft: 6 }}
                                            />
                                        </Pressable>
                                    ))}
                                </View>
                            ) : (
                                <Text className="text-muted-foreground mb-4">
                                    Ingen allergier registrert.
                                </Text>
                            )}

                            <View className="flex-row items-center bg-gray-100 dark:bg-secondary/30 rounded-2xl px-4 h-12 mb-2">
                                <Search size={18} color={mutedColor} />
                                <TextInput
                                    className="flex-1 ml-3 text-foreground"
                                    placeholder="Søk etter allergi..."
                                    placeholderTextColor={mutedColor}
                                    value={search}
                                    onChangeText={setSearch}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    inputMode="search"
                                    returnKeyType="search"
                                    style={{
                                        fontFamily: "Inter",
                                        fontSize: 16,
                                        lineHeight: 20,
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                    }}
                                />
                                {search.length > 0 ? (
                                    <Pressable onPress={() => setSearch("")} className="p-1">
                                        <X size={16} color={mutedColor} />
                                    </Pressable>
                                ) : null}
                            </View>
                        </View>
                    }
                    renderItem={({ item }: { item: Allergy }) => (
                        <Pressable
                            onPress={() => toggle(item.slug)}
                            accessibilityRole="button"
                            className="flex-row items-center py-3.5 active:opacity-70"
                        >
                            <Text className="flex-1 text-base text-foreground">
                                {item.label}
                            </Text>
                            <Plus size={18} color={mutedColor} />
                        </Pressable>
                    )}
                    keyExtractor={(item) => item.slug}
                    ItemSeparatorComponent={() => (
                        <View className="h-px bg-border dark:bg-muted" />
                    )}
                    ListEmptyComponent={
                        <View className="py-10 items-center">
                            <Text className="text-muted-foreground text-center">
                                {search
                                    ? "Ingen allergier matcher søket"
                                    : "Alle allergiene i katalogen er valgt"}
                            </Text>
                        </View>
                    }
                />

                {/* Faneraden flyter over innholdet, så knappen trenger luft
                    under seg for ikke å ligge klemt inntil den. */}
                <View
                    className="px-5 pt-2 border-t border-border dark:border-muted"
                    style={{ paddingBottom: TAB_BAR_CLEARANCE }}
                >
                    <Pressable
                        onPress={() => save.mutate(current)}
                        disabled={isUnchanged || save.isPending}
                        className={`h-14 rounded-2xl items-center justify-center ${
                            isUnchanged || save.isPending
                                ? "bg-gray-100 dark:bg-secondary/30"
                                : "bg-primary active:opacity-80"
                        }`}
                    >
                        {save.isPending ? (
                            <ActivityIndicator />
                        ) : (
                            <Text
                                className={`text-base font-semibold ${
                                    isUnchanged ? "text-muted-foreground" : "text-white"
                                }`}
                            >
                                Lagre
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </PageWrapper>
    );
}
