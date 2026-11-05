import { forwardRef, useCallback, useMemo, useState } from "react";
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

/** Så mange piksler fra toppen står beskrivelsen helt åpen, uansett. */
const TOP_LOCK = 4;

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
        // Mål bare mens kortet er helt åpent. Mens det er klappet delvis
        // sammen, er beskrivelsen presset mindre, og en ny måling da ville
        // gitt en for lav høyde — som klappet kortet enda mer sammen, som ga
        // en enda lavere måling, til kortet var lukket og ble værende lukket.
        const measureDescription = (event: LayoutChangeEvent) => {
            const measured = event.nativeEvent.layout.height;
            if (!collapse || measured <= 0) return;
            if (collapse.collapsed.value > 0) return;
            collapse.height.value = measured;
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
                    <View
                        onLayout={measureDescription}
                        className="pt-2"
                        style={{ flexShrink: 0 }}
                    >
                        <View className="pt-2 border-t border-primary/20 dark:border-primary/30">
                            {/* flexGrow 0 / flexShrink 0: rullefeltet skal ha
                                tekstens høyde (opp til maks), og ikke presses
                                sammen når beskrivelsen klappes bort — det er
                                rammen rundt som krymper og skjuler det. */}
                            <ScrollView
                                style={{
                                    flexGrow: 0,
                                    flexShrink: 0,
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
 * beskrivelsen, og når man blar nedover, krymper den piksel for piksel i
 * samme takt som fingeren, til den er helt borte. Blar man opp mot toppen
 * igjen, kommer den like gradvis tilbake.
 *
 * Kortet skal ligge oppå lista (absolutt plassert), med `spacerHeight` som
 * tom plass øverst i lista. Da endrer ikke kortet lista sin ramme når det
 * krymper, så radene følger fingeren 1:1, og en kort liste kan ikke hoppe.
 * Siden beskrivelsen krymper like fort som lista blar, ligger søkefeltet
 * tett inntil kortets nederkant helt til beskrivelsen er borte.
 *
 * Hvor mye som er skjult regnes rett fra hvor langt ned i lista man er, ikke
 * ved å summere bevegelser. Da kan kortet aldri bli stående skjult på toppen.
 * Alt kjører på UI-tråden, så animasjonen følger fingeren uten hakk.
 *
 * Gi `onScroll` til en `Animated.FlatList` (fra Reanimated), `collapse` til
 * kortet, `onCardLayout` til visningen som holder kortet, og `spacerHeight`
 * til en tom visning øverst i lista.
 */
export function useCollapseOnScroll() {
    const collapsed = useSharedValue(0);
    const height = useSharedValue(0);
    const [spacerHeight, setSpacerHeight] = useState(0);

    const onScroll = useAnimatedScrollHandler((event) => {
        const full = height.value;
        if (full <= 0) return;

        // Låst åpent på toppen (og i iOS-strikken over den), deretter 1:1
        // med blaingen.
        const y = event.contentOffset.y - TOP_LOCK;
        collapsed.value = Math.min(Math.max(y, 0), full);
    });

    // Mål kortet bare mens det er helt åpent, ellers ville plassholderen fått
    // høyden til et delvis sammenklappet kort.
    const onCardLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const measured = event.nativeEvent.layout.height;
            if (measured <= 0 || collapsed.value > 0) return;
            setSpacerHeight(measured);
        },
        [collapsed],
    );

    const collapse = useMemo<LawCardCollapse>(
        () => ({ collapsed, height }),
        [collapsed, height],
    );
    return { collapse, onScroll, onCardLayout, spacerHeight };
}
