import { forwardRef, useCallback, useRef, useState } from "react";
import {
    LayoutAnimation,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    useWindowDimensions,
    View,
} from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { ViewRef } from "@rn-primitives/types";

/** Hvor stor del av skjermhøyden kortet høyst får ta. */
const MAX_SCREEN_SHARE = 0.22;

type SelectedLawCardProps = {
    paragraph: string;
    title: string;
    description?: string;
    /** Antall bøter paragrafen gir, som tekst slik den kommer fra ruteparametrene. */
    amount?: string;
    /** Gis denne, vises en «Endre»-knapp som tar brukeren tilbake til lovvalget. */
    onChange?: () => void;
    /**
     * Sammenklappet skjules beskrivelsen, og bare raden med paragraf, navn,
     * antall bøter og «Endre» står igjen. Animer overgangen hos den som eier
     * tilstanden (se `useCollapseOnScroll`).
     */
    collapsed?: boolean;
    className?: string;
};

/**
 * Paragrafen som er valgt i botflyten, vist øverst mens man velger hvem som
 * skal få boten. Slik ser man hele tiden hva boten gis for, og oppdager fort
 * om man trykket på feil paragraf.
 *
 * Kortet holdes kompakt og tar høyst ca. en femtedel av skjermen. En lang
 * beskrivelse ruller inne i kortet, så søkefeltet og medlemslista under
 * alltid har resten av plassen. Når man blar nedover i lista, kan kortet
 * klappes sammen til bare øverste rad (`collapsed`).
 */
export const SelectedLawCard = forwardRef<ViewRef, SelectedLawCardProps>(
    (
        {
            paragraph,
            title,
            description,
            amount,
            onChange,
            collapsed = false,
            className,
        },
        ref,
    ) => {
        const { height } = useWindowDimensions();

        const count = parseInt(amount ?? "", 10);
        const fines = Number.isFinite(count)
            ? `${count} ${count === 1 ? "bot" : "bøter"}`
            : null;

        return (
            <View
                ref={ref}
                className={cn(
                    "mx-4 mt-2 rounded-2xl px-3 py-2.5 bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40",
                    className,
                )}
                style={{ maxHeight: height * MAX_SCREEN_SHARE }}
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

                {/* flexGrow 0 + flexShrink 1: beskrivelsen tar bare plassen den
                    trenger, og krymper til rullbar når kortet når makshøyden. */}
                {collapsed ? null : (
                    <ScrollView
                        className="mt-2 pt-2 border-t border-primary/20 dark:border-primary/30"
                        style={{ flexGrow: 0, flexShrink: 1 }}
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
                )}
            </View>
        );
    },
);
SelectedLawCard.displayName = "SelectedLawCard";

/** Hvor langt man må bla i én retning før kortet klapper sammen eller åpner seg. */
const SCROLL_THRESHOLD = 16;

/**
 * Hvor mye lengre lista må være enn plassen den har før kortet får klappe
 * sammen. Uten denne kunne lista, med plassen beskrivelsen frigjør, plutselig
 * få plass på skjermen, hoppe til toppen og åpne kortet igjen — og så videre.
 */
const MIN_SCROLL_RANGE = 160;

const collapseAnimation = LayoutAnimation.create(
    220,
    LayoutAnimation.Types.easeInEaseOut,
    LayoutAnimation.Properties.opacity,
);

/**
 * Klapper `SelectedLawCard` sammen når man blar nedover i lista under, og åpner
 * det igjen når man blar oppover eller er tilbake på toppen.
 *
 * Retningen måles fra et ankerpunkt med en terskel, så små skjelvinger i
 * fingeren ikke får kortet til å blafre fram og tilbake. Endringen animeres
 * med `LayoutAnimation`, så kortet og lista under glir på plass sammen.
 */
export function useCollapseOnScroll() {
    const [collapsed, setCollapsed] = useState(false);
    const collapsedRef = useRef(false);
    const anchorY = useRef(0);

    const update = useCallback((next: boolean) => {
        if (collapsedRef.current === next) return;
        collapsedRef.current = next;
        LayoutAnimation.configureNext(collapseAnimation);
        setCollapsed(next);
    }, []);

    const onScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { contentOffset, contentSize, layoutMeasurement } =
                event.nativeEvent;
            const y = contentOffset.y;
            const scrollRange = contentSize.height - layoutMeasurement.height;

            // På toppen (eller i iOS-strikken over den) skal alt synes.
            if (y <= 0) {
                anchorY.current = 0;
                update(false);
                return;
            }

            if (collapsedRef.current) {
                // Følg punktet lengst ned i lista; åpne når man har blått opp
                // et stykke derfra.
                if (y > anchorY.current) anchorY.current = y;
                else if (anchorY.current - y > SCROLL_THRESHOLD) {
                    anchorY.current = y;
                    update(false);
                }
            } else {
                if (y < anchorY.current) anchorY.current = y;
                else if (
                    y - anchorY.current > SCROLL_THRESHOLD &&
                    scrollRange > MIN_SCROLL_RANGE
                ) {
                    anchorY.current = y;
                    update(true);
                }
            }
        },
        [update],
    );

    return { collapsed, onScroll };
}
