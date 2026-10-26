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

/** Samme grenser som Photon håndhever, så feilen kommer før lagring. */
const MAX_CUSTOM = 15;
const MAX_CUSTOM_LENGTH = 64;

/** Katalogen er den samme for alle og endres nesten aldri. */
const CATALOGUE_STALE_TIME = 60 * 60 * 1000;

type Selection = Pick<UserSettings, "allergies" | "customAllergies">;

/**
 * En rad i forslagslista. `create` er «Legg til …» — aldri en verdi, bare et
 * forslag som blir en egen allergi i det man trykker på det.
 */
type Suggestion =
    | { kind: "curated"; allergy: Allergy }
    | { kind: "create"; label: string };

/**
 * Kuttes før duplikatsjekken, ellers kunne to tekster som er like etter
 * Photons kutt begge slippe gjennom her.
 */
function normalize(value: string) {
    return value.trim().replace(/\s+/g, " ").slice(0, MAX_CUSTOM_LENGTH).trim();
}

function sameEntries(a: string[], b: string[], key = (value: string) => value) {
    if (a.length !== b.length) return false;
    const keys = new Set(a.map(key));
    return b.every((value) => keys.has(key(value)));
}

const lowerCase = (value: string) => value.toLowerCase();

export default function Allergier() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isDarkColorScheme } = useColorScheme();
    const [search, setSearch] = useState("");
    /** `null` fram til innstillingene er hentet, så valget kan starte på dem. */
    const [selected, setSelected] = useState<Selection | null>(null);

    const settings = useQuery({
        queryKey: settingsKeys.mine,
        queryFn: mySettings,
    });

    // Den samme lista nettsiden viser. Hele katalogen er full av Leptons
    // fritekstsvar, importert som én rad hver.
    const curated = useQuery({
        queryKey: settingsKeys.allergies(true),
        queryFn: () => fetchAllergies({ curated: true }),
        staleTime: CATALOGUE_STALE_TIME,
    });

    const save = useMutation({
        mutationFn: (selection: Selection) => updateMySettings(selection),
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

    // Egen memo, ikke en løs `??`-kjede: uten den er utvalget et nytt objekt
    // ved hver render, og forslagene under regnes ut på nytt hver gang.
    const current = useMemo<Selection>(
        () =>
            selected ?? {
                allergies: settings.data?.allergies ?? [],
                customAllergies: settings.data?.customAllergies ?? [],
            },
        [selected, settings.data?.allergies, settings.data?.customAllergies],
    );

    const curatedBySlug = useMemo(
        () => new Map((curated.data ?? []).map((a) => [a.slug, a])),
        [curated.data],
    );

    // Sluger fra Lepton-tiden står ikke i den kuraterte lista. Hele katalogen
    // hentes bare for å gi dem et navn, og bare når noen faktisk har en.
    const hasLegacySlug =
        curated.isSuccess &&
        current.allergies.some((slug) => !curatedBySlug.has(slug));

    const catalogue = useQuery({
        queryKey: settingsKeys.allergies(false),
        queryFn: () => fetchAllergies({ curated: false }),
        staleTime: CATALOGUE_STALE_TIME,
        enabled: hasLegacySlug,
    });

    const catalogueBySlug = useMemo(
        () => new Map((catalogue.data ?? []).map((a) => [a.slug, a])),
        [catalogue.data],
    );

    // Feiler katalogen, vises slugen som den er — ikke en feilskjerm for noe
    // som bare er et navn.
    const labelFor = (slug: string) =>
        curatedBySlug.get(slug)?.label ?? catalogueBySlug.get(slug)?.label ?? slug;

    const trimmed = normalize(search);
    const needle = trimmed.toLowerCase();

    const exactMatch = (curated.data ?? []).find(
        (allergy) => allergy.label.toLowerCase() === needle,
    );

    /**
     * Fritekst tilbys bare når teksten ikke allerede finnes som et kuratert
     * valg — ellers ville man endt opp med «Melk» to ganger, én av dem
     * usynlig for opptellingen arrangøren får.
     */
    const canCreate =
        trimmed !== "" &&
        exactMatch === undefined &&
        current.customAllergies.length < MAX_CUSTOM &&
        !current.customAllergies.some((entry) => entry.toLowerCase() === needle);

    const suggestions = useMemo<Suggestion[]>(() => {
        const chosen = new Set(current.allergies);

        const matches = (curated.data ?? [])
            .filter(
                (allergy) =>
                    !chosen.has(allergy.slug) &&
                    (needle === "" ||
                        allergy.label.toLowerCase().includes(needle) ||
                        // Søk i eksemplene også: skriver du «laktose», er det
                        // Melk du er ute etter.
                        (allergy.description ?? "").toLowerCase().includes(needle)),
            )
            .map((allergy) => ({ kind: "curated" as const, allergy }));

        return canCreate
            ? [...matches, { kind: "create" as const, label: trimmed }]
            : matches;
    }, [curated.data, current.allergies, needle, canCreate, trimmed]);

    const mutedColor = themeColors(isDarkColorScheme).mutedForeground;

    if (settings.isPending || curated.isPending) {
        return (
            <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" />
                </View>
            </PageWrapper>
        );
    }

    if (settings.isError || curated.isError) {
        return (
            <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-base text-destructive text-center">
                        {(settings.error ?? curated.error)?.message}
                    </Text>
                    <Pressable
                        onPress={() => {
                            settings.refetch();
                            curated.refetch();
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

    const addCurated = (slug: string) => {
        if (current.allergies.includes(slug)) return;
        setSelected({ ...current, allergies: [...current.allergies, slug] });
    };

    const removeCurated = (slug: string) => {
        setSelected({
            ...current,
            allergies: current.allergies.filter((s) => s !== slug),
        });
    };

    const addCustom = (entry: string) => {
        setSelected({
            ...current,
            customAllergies: [...current.customAllergies, entry],
        });
    };

    const removeCustom = (entry: string) => {
        setSelected({
            ...current,
            customAllergies: current.customAllergies.filter((e) => e !== entry),
        });
    };

    const pick = (suggestion: Suggestion) => {
        if (suggestion.kind === "curated") addCurated(suggestion.allergy.slug);
        else addCustom(suggestion.label);
        // Tøm søket, ellers står teksten igjen og skjuler resten av lista.
        setSearch("");
    };

    // Retur på «melk» skal velge Melk, ikke bli liggende uten å gjøre noe.
    const submit = () => {
        if (exactMatch) addCurated(exactMatch.slug);
        else if (canCreate) addCustom(trimmed);
        setSearch("");
    };

    const chips = [
        ...current.allergies.map((slug) => ({
            key: `curated:${slug}`,
            label: labelFor(slug),
            remove: () => removeCurated(slug),
        })),
        ...current.customAllergies.map((entry) => ({
            key: `custom:${entry}`,
            label: entry,
            remove: () => removeCustom(entry),
        })),
    ];

    // Lagringen er ett kall som erstatter hele settet, så knappen står til
    // slutt framfor at hvert trykk sender en oppdatering. Photon fjerner
    // duplikater uten hensyn til store og små bokstaver, så det gjør vi også.
    const isUnchanged =
        selected === null ||
        (sameEntries(selected.allergies, settings.data.allergies) &&
            sameEntries(
                selected.customAllergies,
                settings.data.customAllergies,
                lowerCase,
            ));

    const reachedCustomLimit =
        trimmed !== "" &&
        exactMatch === undefined &&
        current.customAllergies.length >= MAX_CUSTOM;

    return (
        <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
            <View className="flex-1">
                {/* Feltet står fast over lista: med mange valgte allergier og
                    tastaturet oppe ville det ellers rulle ut av syne. */}
                <View className="px-5 pt-4 pb-2">
                    <View className="flex-row items-center bg-gray-100 dark:bg-secondary/30 rounded-2xl px-4 h-12">
                        <Search size={18} color={mutedColor} />
                        <TextInput
                            className="flex-1 ml-3 text-foreground"
                            placeholder="Søk eller skriv inn allergi..."
                            placeholderTextColor={mutedColor}
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={submit}
                            // Tastaturet blir stående, så man kan legge til
                            // flere på rad.
                            submitBehavior="submit"
                            autoCorrect={false}
                            returnKeyType="done"
                            maxLength={MAX_CUSTOM_LENGTH}
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

                <FlatList
                    data={suggestions}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                    ListHeaderComponent={
                        <View className="pt-2">
                            {chips.length > 0 ? (
                                <View className="flex-row flex-wrap gap-2 mb-4">
                                    {chips.map((chip) => (
                                        <Pressable
                                            key={chip.key}
                                            onPress={chip.remove}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Fjern ${chip.label}`}
                                            className="flex-row items-center bg-primary/10 dark:bg-primary/20 rounded-full pl-3 pr-2 py-1.5 active:opacity-70"
                                        >
                                            <Text className="text-sm font-medium text-primary">
                                                {chip.label}
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

                            <Text className="text-sm text-muted-foreground mb-2">
                                Allergiene dine deles med arrangørene av arrangementene du
                                melder deg på. Finner du ikke din, kan du skrive den inn selv.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }: { item: Suggestion }) =>
                        item.kind === "curated" ? (
                            <Pressable
                                onPress={() => pick(item)}
                                accessibilityRole="button"
                                className="flex-row items-center py-3.5 active:opacity-70"
                            >
                                <View className="flex-1 pr-3">
                                    <Text className="text-base text-foreground">
                                        {item.allergy.label}
                                    </Text>
                                    {/* Mattilsynets egne eksempler. De færreste
                                        vet at worcestersaus inneholder fisk. */}
                                    {item.allergy.description ? (
                                        <Text className="text-xs text-muted-foreground mt-0.5">
                                            {item.allergy.description}
                                        </Text>
                                    ) : null}
                                </View>
                                <Plus size={18} color={mutedColor} />
                            </Pressable>
                        ) : (
                            <Pressable
                                onPress={() => pick(item)}
                                accessibilityRole="button"
                                className="flex-row items-center py-3.5 active:opacity-70"
                            >
                                <Plus size={18} color={themeColors(isDarkColorScheme).primary} />
                                <Text className="flex-1 ml-3 text-base font-medium text-primary">
                                    Legg til «{item.label}»
                                </Text>
                            </Pressable>
                        )
                    }
                    keyExtractor={(item) =>
                        item.kind === "curated" ? `curated:${item.allergy.slug}` : "create"
                    }
                    ItemSeparatorComponent={() => (
                        <View className="h-px bg-border dark:bg-muted" />
                    )}
                    ListEmptyComponent={
                        reachedCustomLimit ? null : (
                            <View className="py-10 items-center">
                                <Text className="text-muted-foreground text-center">
                                    {search
                                        ? "Ingen treff"
                                        : "Alle allergiene i lista er valgt"}
                                </Text>
                            </View>
                        )
                    }
                    ListFooterComponent={
                        reachedCustomLimit ? (
                            <Text className="text-sm text-muted-foreground text-center py-6">
                                Du kan legge til opptil {MAX_CUSTOM} egne allergier.
                            </Text>
                        ) : null
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
