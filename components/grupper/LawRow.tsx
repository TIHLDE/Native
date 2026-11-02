import { forwardRef, memo, useCallback, useState } from "react";
import { LayoutAnimation, Pressable, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Law } from "@/actions/types";
import { Text } from "@/components/ui/text";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/utils";
import type { ViewRef } from "@rn-primitives/types";

/**
 * Hvilke paragrafer som står åpne i en liste.
 *
 * Tilstanden ligger i lista og ikke i hver rad, fordi `FlatList` avmonterer
 * rader som rulles langt ut av syne — med lokal tilstand ville en åpen rad
 * være lukket igjen når man ruller tilbake. Husk å gi `openIds` som
 * `extraData` til lista, ellers tegnes ikke radene på nytt når de åpnes.
 */
export function useOpenLaws() {
    const [openIds, setOpenIds] = useState<ReadonlySet<string>>(
        () => new Set(),
    );

    const toggle = useCallback((law: Law) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(law.id)) next.delete(law.id);
            else next.add(law.id);
            return next;
        });
    }, []);

    return { openIds, toggle };
}

type LawRowProps = {
    law: Law;
    isOpen: boolean;
    onToggle: (law: Law) => void;
    onSelect?: (law: Law) => void;
    className?: string;
};

/**
 * Én paragraf som en nedtrekksrad: lukket viser den §, tittel og hvor mange
 * bøter paragrafen gir; åpnet viser den også hele beskrivelsen.
 *
 * Brukes både i Lovverk-fanen på gruppesiden og i botflyten, så paragrafene ser
 * like ut begge steder. Gis `onSelect`, velger et trykk på raden paragrafen med
 * én gang — å gi en bot skal være ett trykk — og bare pila åpner og lukker.
 * Uten `onSelect` er raden bare til lesing, og hele raden åpner og lukker.
 *
 * Raden er memoisert, så send stabile `onToggle`/`onSelect` (se `useOpenLaws`).
 */
const LawRowInner = forwardRef<ViewRef, LawRowProps>(
    ({ law, isOpen, onToggle, onSelect, className }, ref) => {
        const { isDarkColorScheme } = useColorScheme();
        const colors = themeColors(isDarkColorScheme);

        const Chevron = isOpen ? ChevronUp : ChevronDown;
        const fines = `${law.amount} ${law.amount === 1 ? "bot" : "bøter"}`;

        return (
            <View
                ref={ref}
                className={cn(
                    "mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl",
                    className,
                )}
            >
                <Pressable
                    onPress={() => (onSelect ? onSelect(law) : onToggle(law))}
                    accessibilityRole="button"
                    accessibilityState={
                        onSelect ? undefined : { expanded: isOpen }
                    }
                    accessibilityLabel={
                        onSelect
                            ? `Gi bot etter paragraf ${law.paragraph}, ${law.title}, ${fines}`
                            : `Paragraf ${law.paragraph}, ${law.title}, ${fines}`
                    }
                    className="p-4 active:opacity-70"
                >
                    <View className="flex-row items-center">
                        <View className="min-w-12 h-12 px-2 rounded-xl bg-primary/10 dark:bg-primary/20 items-center justify-center">
                            <Text
                                className="text-sm font-bold text-primary"
                                numberOfLines={1}
                            >
                                §{law.paragraph}
                            </Text>
                        </View>
                        <Text
                            className="flex-1 ml-3 text-base font-semibold text-foreground"
                            numberOfLines={isOpen ? undefined : 2}
                        >
                            {law.title}
                        </Text>
                        <View className="ml-2 bg-primary/10 dark:bg-primary/20 rounded-full px-2.5 py-1">
                            <Text className="text-xs font-semibold text-primary">
                                {fines}
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => onToggle(law)}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityState={{ expanded: isOpen }}
                            accessibilityLabel={
                                isOpen ? "Skjul beskrivelse" : "Vis beskrivelse"
                            }
                            className="ml-2 p-1 active:opacity-50"
                        >
                            <Chevron size={18} color={colors.mutedForeground} />
                        </Pressable>
                    </View>

                    {isOpen ? (
                        <View className="mt-3 pt-3 border-t border-border">
                            {law.description ? (
                                <Text className="text-sm text-muted-foreground">
                                    {law.description}
                                </Text>
                            ) : (
                                <Text className="text-sm text-muted-foreground italic">
                                    Ingen beskrivelse
                                </Text>
                            )}
                        </View>
                    ) : null}
                </Pressable>
            </View>
        );
    },
);
LawRowInner.displayName = "LawRow";

export const LawRow = memo(LawRowInner);

/** Plassholder for en lukket `LawRow` mens lovverket lastes. */
export const LawRowSkeleton = forwardRef<ViewRef, { className?: string }>(
    ({ className }, ref) => (
        <View
            ref={ref}
            className={cn(
                "mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center",
                className,
            )}
        >
            <View className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="flex-1 ml-3 h-4 mr-8 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="w-14 h-6 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="w-5 h-5 ml-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
        </View>
    ),
);
LawRowSkeleton.displayName = "LawRowSkeleton";
