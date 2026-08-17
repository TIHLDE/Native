import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

interface SegmentedControlProps {
    options: string[];
    /** Indeksen i `options` som er valgt. */
    value: number;
    onChange: (index: number) => void;
    className?: string;
}

/**
 * Valgbryteren appen bruker over lister og faner.
 *
 * Lå tidligere bare inne i `AnimatedPagerView`. Den er trukket ut hit fordi et
 * valg ikke alltid hører til en pager — profilen bytter mellom to lister uten
 * å swipe — og de to skal se like ut.
 */
const SegmentedControl = React.forwardRef<View, SegmentedControlProps>(
    ({ options, value, onChange, className }, ref) => {
        return (
            <View
                ref={ref}
                className={cn(
                    "flex-row bg-gray-100 dark:bg-secondary/30 rounded-2xl p-1",
                    className,
                )}
            >
                {options.map((option, index) => {
                    const isActive = value === index;

                    return (
                        <Pressable
                            key={option}
                            onPress={() => onChange(index)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isActive }}
                            className={cn(
                                "flex-1 py-2.5 rounded-xl items-center justify-center",
                                isActive && "bg-primary",
                            )}
                        >
                            <Text
                                numberOfLines={1}
                                className={cn(
                                    "text-base font-semibold",
                                    isActive ? "text-white" : "text-muted-foreground",
                                )}
                            >
                                {option}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        );
    },
);

SegmentedControl.displayName = "SegmentedControl";

export { SegmentedControl };
