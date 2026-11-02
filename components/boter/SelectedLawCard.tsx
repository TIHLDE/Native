import { forwardRef } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { ViewRef } from "@rn-primitives/types";

/** Hvor stor del av skjermhøyden kortet høyst får ta. */
const MAX_SCREEN_SHARE = 0.3;

type SelectedLawCardProps = {
    paragraph: string;
    title: string;
    description?: string;
    /** Antall bøter paragrafen gir, som tekst slik den kommer fra ruteparametrene. */
    amount?: string;
    /** Gis denne, vises en «Endre»-knapp som tar brukeren tilbake til lovvalget. */
    onChange?: () => void;
    className?: string;
};

/**
 * Paragrafen som er valgt i botflyten, vist øverst mens man velger hvem som
 * skal få boten. Slik ser man hele tiden hva boten gis for, og oppdager fort
 * om man trykket på feil paragraf.
 *
 * Kortet tar høyst ca. 30 % av skjermen. En lang beskrivelse ruller inne i
 * kortet, så søkefeltet og medlemslista under alltid har resten av plassen.
 */
export const SelectedLawCard = forwardRef<ViewRef, SelectedLawCardProps>(
    ({ paragraph, title, description, amount, onChange, className }, ref) => {
        const { height } = useWindowDimensions();

        const count = parseInt(amount ?? "", 10);
        const fines = Number.isFinite(count)
            ? `${count} ${count === 1 ? "bot" : "bøter"}`
            : null;

        return (
            <View
                ref={ref}
                className={cn(
                    "mx-4 mt-3 mb-1 rounded-2xl p-4 bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40",
                    className,
                )}
                style={{ maxHeight: height * MAX_SCREEN_SHARE }}
                accessibilityLabel={`Gir bot for paragraf ${paragraph}, ${title}${fines ? `, ${fines}` : ""}`}
            >
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Gir bot for
                    </Text>
                    {onChange ? (
                        <Pressable
                            onPress={onChange}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Endre paragraf"
                            className="active:opacity-50"
                        >
                            <Text className="text-sm font-semibold text-primary">
                                Endre
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <View className="flex-row items-center">
                    <View className="min-w-12 h-12 px-2 rounded-xl bg-primary/15 dark:bg-primary/25 items-center justify-center">
                        <Text
                            className="text-sm font-bold text-primary"
                            numberOfLines={1}
                        >
                            §{paragraph}
                        </Text>
                    </View>
                    <Text
                        className="flex-1 ml-3 text-lg font-semibold text-foreground"
                        numberOfLines={2}
                    >
                        {title}
                    </Text>
                    {fines ? (
                        <View className="ml-2 bg-primary/15 dark:bg-primary/25 rounded-full px-2.5 py-1">
                            <Text className="text-xs font-semibold text-primary">
                                {fines}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* flexGrow 0 + flexShrink 1: beskrivelsen tar bare plassen den
                    trenger, og krymper til rullbar når kortet når makshøyden. */}
                <ScrollView
                    className="mt-3 pt-3 border-t border-primary/20 dark:border-primary/30"
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
            </View>
        );
    },
);
SelectedLawCard.displayName = "SelectedLawCard";
