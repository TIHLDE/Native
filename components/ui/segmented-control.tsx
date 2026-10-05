import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { segmentWidth } from "@/lib/segmentedControl";
import { cn } from "@/lib/utils";
import { Text } from "./text";

interface SegmentedControlProps {
    options: string[];
    /** Indeksen i `options` som er valgt. */
    value: number;
    onChange: (index: number) => void;
    /**
     * Lar valgene rulle sidelengs når de ikke får plass.
     *
     * For mange eller lange valg til å få plass på smale skjermer — fire faner
     * med «Medlemmer» klippet teksten på en iPhone SE. Knappene er like brede
     * som før: de deler bredden likt når de får plass, og ellers får alle
     * bredden den lengste teksten trenger, og raden ruller.
     */
    scrollable?: boolean;
    className?: string;
}

const itemClassName = "py-2.5 rounded-xl items-center justify-center";
const labelClassName = "text-base font-semibold";

/**
 * Valgbryteren appen bruker over lister og faner.
 *
 * Lå tidligere bare inne i `AnimatedPagerView`. Den er trukket ut hit fordi et
 * valg ikke alltid hører til en pager — profilen bytter mellom to lister uten
 * å swipe — og de to skal se like ut.
 */
const SegmentedControl = React.forwardRef<View, SegmentedControlProps>(
    ({ options, value, onChange, scrollable = false, className }, ref) => {
        const [containerWidth, setContainerWidth] = React.useState(0);
        const [labelWidths, setLabelWidths] = React.useState<number[]>([]);

        // Målerraden har denne som nøkkel, så nye valg måles på nytt og
        // overskriver de gamle målene plass for plass. Mål utover dagens antall
        // valg — fra fire faner til to — tas ikke med.
        const optionsKey = options.join("\u0000");

        const itemWidth = segmentWidth({
            scrollable,
            containerWidth,
            labelWidths,
            optionCount: options.length,
        });

        const control = (
            <View
                ref={ref}
                className={cn(
                    "flex-row bg-gray-100 dark:bg-secondary/30 rounded-2xl p-1",
                    // I en vannrett ScrollView er det ingen bredde å fylle, så
                    // klassene fra kalleren hører hjemme på rammen rundt.
                    !scrollable && className,
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
                            // `flex-1` deler en kjent bredde. Inne i en
                            // vannrett ScrollView finnes ingen, så der settes
                            // bredden eksplisitt.
                            style={itemWidth ? { width: itemWidth } : undefined}
                            className={cn(
                                !scrollable && "flex-1",
                                // Første bilde, før bredden er målt.
                                scrollable && !itemWidth && "px-4",
                                itemClassName,
                                isActive && "bg-primary",
                            )}
                        >
                            <Text
                                numberOfLines={1}
                                className={cn(
                                    labelClassName,
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

        if (!scrollable) return control;

        return (
            <View
                className={className}
                onLayout={(event) =>
                    setContainerWidth(event.nativeEvent.layout.width)
                }
            >
                {/* Usynlig målerad: hver tekst med knappens luft rundt, uten
                    breddebegrensning, så vi vet hva den lengste trenger. */}
                <View
                    key={optionsKey}
                    pointerEvents="none"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    className="absolute flex-row opacity-0"
                >
                    {options.map((option, index) => (
                        <View
                            key={option}
                            className={cn("shrink-0 px-4", itemClassName)}
                            onLayout={(event) => {
                                const width = event.nativeEvent.layout.width;
                                setLabelWidths((widths) => {
                                    if (widths[index] === width) return widths;
                                    const next = [...widths];
                                    next[index] = width;
                                    return next;
                                });
                            }}
                        >
                            <Text className={labelClassName}>{option}</Text>
                        </View>
                    ))}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-grow-0"
                >
                    {control}
                </ScrollView>
            </View>
        );
    },
);

SegmentedControl.displayName = "SegmentedControl";

export { SegmentedControl };
