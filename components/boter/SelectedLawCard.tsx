import { forwardRef, useMemo } from "react";
import {
    LayoutChangeEvent,
    Pressable,
    ScrollView,
    useWindowDimensions,
    View,
} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { ViewRef } from "@rn-primitives/types";

/** Hvor stor del av skjermhøyden kortet høyst får ta. */
const MAX_SCREEN_SHARE = 0.22;

/**
 * Omtrent hvor mye av makshøyden som går til øverste rad, kortets marger og
 * skillelinja. Resten er plassen beskrivelsen kan bruke før den må rulles.
 */
const TOP_ROW_RESERVE = 84;

/**
 * Hvor mye lengre enn skjermen lista må være (utover selve beskrivelsen)
 * før kortet får klappe sammen. Uten denne kunne en kort liste, med plassen
 * beskrivelsen frigjør, plutselig få plass, hoppe til toppen og åpne kortet
 * igjen — og så videre.
 */
const MIN_EXTRA_SCROLL = 40;

/**
 * Hvor langt kortet er klappet sammen, delt mellom lista som blar og kortet
 * som krymper. Lages av `useCollapseOnScroll`.
 */
export type LawCardCollapse = {
    /** Hvor mange piksler av beskrivelsen som er klappet bort, 0 til `height`. */
    collapsed: SharedValue<number>;
    /** Beskrivelsens naturlige høyde, målt ved første tegning. 0 før målingen. */
    height: SharedValue<number>;
};

type SelectedLawCardProps = {
    paragraph: string;
    title: string;
    description?: string;
    /** Antall bøter paragrafen gir, som tekst slik den kommer fra ruteparametrene. */
    amount?: string;
    /** Gis denne, vises en «Endre»-knapp som tar brukeren tilbake til lovvalget. */
    onChange?: () => void;
    /**
     * Gis denne, krymper og tones beskrivelsen gradvis ut i takt med at man
     * blar nedover i lista, til bare raden med paragraf, navn, antall bøter og
     * «Endre» står igjen. Se `useCollapseOnScroll`.
     */
    collapse?: LawCardCollapse;
    className?: string;
};

/**
 * Paragrafen som er valgt i botflyten, vist øverst mens man velger hvem som
 * skal få boten. Slik ser man hele tiden hva boten gis for, og oppdager fort
 * om man trykket på feil paragraf.
 *
 * Kortet holdes kompakt og tar høyst ca. en femtedel av skjermen. En lang
 * beskrivelse ruller inne i kortet, så søkefeltet og medlemslista under
 * alltid har resten av plassen.
 */
export const SelectedLawCard = forwardRef<ViewRef, SelectedLawCardProps>(
    (
        { paragraph, title, description, amount, onChange, collapse, className },
        ref,
    ) => {
        const { height: windowHeight } = useWindowDimensions();
        const descriptionMaxHeight = Math.max(
            48,
            windowHeight * MAX_SCREEN_SHARE - TOP_ROW_RESERVE,
        );

        const count = parseInt(amount ?? "", 10);
        const fines = Number.isFinite(count)
            ? `${count} ${count === 1 ? "bot" : "bøter"}`
            : null;

        // Beskrivelsen krymper piksel for piksel med blaingen, og tones ut
        // litt raskere enn den krymper, så teksten er borte før den kuttes.
        const descriptionStyle = useAnimatedStyle(() => {
            if (!collapse || collapse.height.value === 0) return {};
            const full = collapse.height.value;
            const hidden = Math.min(collapse.collapsed.value, full);
            return {
                height: full - hidden,
                opacity: interpolate(
                    hidden,
                    [0, full * 0.7],
                    [1, 0],
                    Extrapolation.CLAMP,
                ),
            };
        });

        // Det indre innholdet har alltid sin naturlige høyde (overflow skjuler
        // resten), så målingen er riktig også mens kortet er klappet sammen.
        const measureDescription = (event: LayoutChangeEvent) => {
            if (collapse) collapse.height.value = event.nativeEvent.layout.height;
        };

        return (
            <View
                ref={ref}
                className={cn(
                    "mx-4 mt-2 rounded-2xl px-3 py-2.5 bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40",
                    className,
                )}
                accessibilityLabel={`Gir bot for paragraf ${paragraph}, ${title}${fines ? `, ${fines}` : ""}`}
            >
                <View className="flex-row items-center">
                    <View className="min-w-10 h-10 px-1.5 rounded-lg bg-primary/15 dark:bg-primary/25 items-center justify-center">
                        <Text
                            className="text-xs font-bold text-primary"
                            numberOfLines={1}
                        >
                            §{paragraph}
                        </Text>
                    </View>
                    <View className="flex-1 ml-2.5">
                        <Text
                            className="text-[11px] font-semibold uppercase tracking-wider text-primary"
                            numberOfLines={1}
                        >
                            Gir bot for{fines ? ` · ${fines}` : ""}
                        </Text>
                        <Text
                            className="text-base font-semibold text-foreground"
                            numberOfLines={2}
                        >
                            {title}
                        </Text>
                    </View>
                    {onChange ? (
                        <Pressable
                            onPress={onChange}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Endre paragraf"
                            className="ml-2 active:opacity-50"
                        >
                            <Text className="text-sm font-semibold text-primary">
                                Endre
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <Animated.View style={[{ overflow: "hidden" }, descriptionStyle]}>
                    <View
                        onLayout={measureDescription}
                        className="mt-2 pt-2 border-t border-primary/20 dark:border-primary/30"
                    >
                        <ScrollView
                            style={{ maxHeight: descriptionMaxHeight }}
                            showsVerticalScrollIndicator
                            nestedScrollEnabled
                        >
                            {description ? (
                                <Text className="text-sm text-foreground">
                                    {description}
                                </Text>
                            ) : (
                                <Text className="text-sm text-muted-foreground italic">
                                    Ingen beskrivelse
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                </Animated.View>
            </View>
        );
    },
);
SelectedLawCard.displayName = "SelectedLawCard";

/**
 * Knytter `SelectedLawCard` til lista under, så beskrivelsen gradvis krymper
 * og tones ut når man blar nedover, og kommer like gradvis tilbake når man
 * blar oppover — hvor som helst i lista, ikke bare på toppen.
 *
 * Hver piksel man blar ned klapper bort én piksel av beskrivelsen, hver piksel
 * opp henter én tilbake (begrenset til 0 og hele høyden). Alt kjører på
 * UI-tråden, så animasjonen følger fingeren uten hakk.
 *
 * Gi `onScroll` til en `Animated.FlatList` (fra Reanimated) og `collapse` til
 * kortet.
 */
export function useCollapseOnScroll() {
    const collapsed = useSharedValue(0);
    const height = useSharedValue(0);
    const lastY = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler((event) => {
        const y = event.contentOffset.y;
        const dy = y - lastY.value;
        lastY.value = y;

        // På toppen (eller i iOS-strikken over den) skal alt synes.
        if (y <= 0) {
            collapsed.value = 0;
            return;
        }

        // Nederst (og i strikken under) står kortet stille. Når kortet krymper,
        // blir lista høyere og bunnen flytter seg opp, så lista hopper litt
        // tilbake av seg selv — det skal ikke tolkes som at man blar opp.
        const maxY = event.contentSize.height - event.layoutMeasurement.height;
        if (y >= maxY - 1) return;

        // En kort liste kan ikke klappe sammen kortet (se MIN_EXTRA_SCROLL).
        // Lista er `collapsed` piksler høyere nå enn med kortet helt åpent.
        const rangeWhenOpen = maxY + collapsed.value;
        if (dy > 0 && rangeWhenOpen < height.value + MIN_EXTRA_SCROLL) return;

        collapsed.value = Math.min(
            Math.max(collapsed.value + dy, 0),
            height.value,
        );
    });

    const collapse = useMemo<LawCardCollapse>(
        () => ({ collapsed, height }),
        [collapsed, height],
    );
    return { collapse, onScroll };
}
