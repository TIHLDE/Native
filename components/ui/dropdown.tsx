import * as SelectPrimitive from "@rn-primitives/select";
import * as React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ChevronDown } from "lucide-react-native";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export interface DropdownOption<T extends string> {
    value: T;
    label: string;
}

interface DropdownProps<T extends string> {
    options: DropdownOption<T>[];
    value: T;
    onChange: (value: T) => void;
    /** Teksten på knappen. Faller tilbake til det valgte alternativets navn. */
    label?: string;
    accessibilityLabel?: string;
    className?: string;
}

const MENU_GAP = 4;
const MENU_MIN_WIDTH = 200;
const SCREEN_MARGIN = 16;

/**
 * En nedtrekksmeny: en knapp som viser valget, og en liste som åpnes under den.
 *
 * Bygd på `@rn-primitives/select`, som tegner listen i rotens `PortalHost` og
 * plasserer den mot knappen selv — også nær skjermkanten og rundt
 * statuslinjen, der egen måling med `measureInWindow` lett bommer.
 */
function Dropdown<T extends string>({
    options,
    value,
    onChange,
    label,
    accessibilityLabel,
    className,
}: DropdownProps<T>) {
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);
    const { width: screenWidth } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const selected = options.find((option) => option.value === value);

    return (
        // Root er en View rundt knappen, så det er den som ligger i
        // forelderens layout — plasseringsklassene må derfor stå her.
        <SelectPrimitive.Root
            value={selected}
            onValueChange={(option) => {
                if (option) onChange(option.value as T);
            }}
            className={className}
        >
            <SelectPrimitive.Trigger
                accessibilityLabel={accessibilityLabel}
                className="flex-1 flex-row items-center justify-center px-3 py-2.5 rounded-2xl bg-gray-100 dark:bg-secondary/30 active:opacity-70"
            >
                <Text
                    className="flex-shrink text-sm font-semibold text-foreground"
                    numberOfLines={1}
                >
                    {label ?? selected?.label ?? ""}
                </Text>
                <ChevronDown
                    size={16}
                    color={colors.mutedForeground}
                    style={{ marginLeft: 4 }}
                />
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
                {/* Trykk utenfor lukker menyen. */}
                <SelectPrimitive.Overlay style={StyleSheet.absoluteFill}>
                    {/* Bare for inntoningen; trykk går gjennom til overlayet. */}
                    <Animated.View
                        entering={FadeIn.duration(150)}
                        exiting={FadeOut.duration(150)}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="box-none"
                    >
                        <SelectPrimitive.Content
                            side="bottom"
                            align="end"
                            sideOffset={MENU_GAP}
                            insets={{
                                top: insets.top,
                                bottom: insets.bottom,
                                left: SCREEN_MARGIN,
                                right: SCREEN_MARGIN,
                            }}
                            style={{
                                minWidth: MENU_MIN_WIDTH,
                                maxWidth: screenWidth - SCREEN_MARGIN * 2,
                            }}
                            className="rounded-2xl border border-border bg-background py-1 shadow-lg"
                        >
                            {options.map((option) => (
                                <SelectPrimitive.Item
                                    key={option.value}
                                    value={option.value}
                                    label={option.label}
                                    className="flex-row items-center px-4 py-3 active:opacity-70"
                                >
                                    <SelectPrimitive.ItemText
                                        className={cn(
                                            "flex-1 text-base text-foreground",
                                            option.value === value &&
                                                "font-semibold"
                                        )}
                                    />
                                    <SelectPrimitive.ItemIndicator>
                                        <Check size={18} color={colors.primary} />
                                    </SelectPrimitive.ItemIndicator>
                                </SelectPrimitive.Item>
                            ))}
                        </SelectPrimitive.Content>
                    </Animated.View>
                </SelectPrimitive.Overlay>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}

Dropdown.displayName = "Dropdown";

export { Dropdown };
