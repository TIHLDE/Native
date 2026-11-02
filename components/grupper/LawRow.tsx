import { useState } from "react";
import { LayoutAnimation, Pressable, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Law } from "@/actions/types";
import { Text } from "@/components/ui/text";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";

/**
 * Én paragraf som en nedtrekksrad: lukket viser den bare § og tittel, åpnet
 * viser den hele beskrivelsen og hvor mange bøter paragrafen gir.
 *
 * Brukes både i Lovverk-fanen på gruppesiden og i botflyten, så paragrafene ser
 * like ut begge steder. Gis `onSelect`, får den åpne raden en knapp som velger
 * paragrafen — det er slik botflyten går videre til å velge personer. Uten
 * `onSelect` er raden bare til lesing.
 *
 * Åpne og lukke følger samme mønster som bøteradene i `GroupFinesList`:
 * `LayoutAnimation` framfor Reanimated, og samme pil. Hver rad holder sin egen
 * tilstand, så flere kan stå åpne samtidig.
 */
export function LawRow({
    law,
    onSelect,
}: {
    law: Law;
    onSelect?: (law: Law) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen((open) => !open);
    };

    const Chevron = isOpen ? ChevronUp : ChevronDown;

    return (
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4">
            <Pressable
                onPress={toggle}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                accessibilityLabel={`Paragraf ${law.paragraph}, ${law.title}`}
                className="flex-row items-center active:opacity-70"
            >
                <View className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 items-center justify-center">
                    <Text className="text-sm font-bold text-primary">
                        §{law.paragraph}
                    </Text>
                </View>
                <Text
                    className="flex-1 ml-3 text-base font-semibold text-foreground"
                    numberOfLines={isOpen ? undefined : 2}
                >
                    {law.title}
                </Text>
                <Chevron
                    size={18}
                    color={colors.mutedForeground}
                    style={{ marginLeft: 8 }}
                />
            </Pressable>

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
                    <View className="self-start mt-3 bg-primary/10 dark:bg-primary/20 rounded-full px-2.5 py-1">
                        <Text className="text-xs font-semibold text-primary">
                            {law.amount} {law.amount === 1 ? "bot" : "bøter"}
                        </Text>
                    </View>
                    {onSelect ? (
                        <Pressable
                            onPress={() => onSelect(law)}
                            accessibilityRole="button"
                            accessibilityLabel={`Gi bot etter paragraf ${law.paragraph}`}
                            className="mt-4 h-12 rounded-xl bg-primary items-center justify-center active:opacity-80"
                        >
                            <Text className="text-white text-base font-semibold">
                                Velg paragraf
                            </Text>
                        </Pressable>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}
