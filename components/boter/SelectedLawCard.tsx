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
 * Ekstra slingringsmonn i kravet til hvor lang lista må være før kortet får
 * klappe sammen (se `useCollapseOnScroll`).
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
            // Før beskrivelsen er målt (eller uten blaing koblet til) vises
            // den alltid i full høyde.
            if (!collapse || collapse.height.value <= 0) return {};
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
            const measured = event.nativeEvent.layout.height;
            if (collapse && measured > 0) collapse.height.value = measured;
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
                    {/* Padding i stedet for margin her: onLayout tar med
                        padding, men ikke margin, og målingen må dekke alt
                        som skal klappes bort. */}
                    <View onLayout={measureDescription} className="pt-2">
                        <View className="pt-2 border-t border-primary/20 dark:border-primary/30">
                            {/* flexGrow 0: ellers kan rullefeltet få en annen
                                høyde enn teksten det inneholder. */}
                            <ScrollView
                                style={{
                                    flexGrow: 0,
                                    maxHeight: descriptionMaxHeight,
                                }}
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
                    </View>
                </Animated.View>
            </View>
        );
    },
);
SelectedLawCard.displayName = "SelectedLawCard";

/**
 * Knytter `SelectedLawCard` til lista under: på toppen av lista vises hele
 * beskrivelsen, og jo lenger ned man blar, jo mindre og svakere blir den,
 * til den er helt borte. Blar man opp mot toppen igjen, kommer den like
 * gradvis tilbake.
 *
 * Hvor mye som er skjult regnes rett fra hvor langt ned i lista man er, ikke
 * ved å summere bevegelser. Da kan kortet aldri bli stående skjult på toppen.
 * Alt kjører på UI-tråden, så animasjonen følger fingeren uten hakk.
 *
 * Gi `onScroll` til en `Animated.FlatList` (fra Reanimated) og `collapse` til
 * kortet.
 */
export function useCollapseOnScroll() {
    const collapsed = useSharedValue(0);
    const height = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler((event) => {
        const full = height.value;
        if (full <= 0) return;

        const y = event.contentOffset.y;

        // Lista er `collapsed` piksler høyere nå enn med kortet helt åpent, så
        // dette er hvor langt den kan blas når kortet er åpent. En kort liste
        // får ikke klappe sammen kortet: da kunne plassen beskrivelsen frigjør
        // gjøre at lista plutselig får plass, hopper til toppen og åpner kortet
        // igjen. Kravet om dobbel høyde sikrer at bunnen alltid kan nås med
        // kortet helt sammenklappet.
        const maxY = event.contentSize.height - event.layoutMeasurement.height;
        const rangeWhenOpen = maxY + collapsed.value;
        if (rangeWhenOpen < full * 2 + MIN_EXTRA_SCROLL) {
            collapsed.value = 0;
            return;
        }

        collapsed.value = Math.min(Math.max(y, 0), full);
    });

    const collapse = useMemo<LawCardCollapse>(
        () => ({ collapsed, height }),
        [collapsed, height],
    );
    return { collapse, onScroll };
}
