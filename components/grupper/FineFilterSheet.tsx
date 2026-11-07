import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { Pressable, View } from "react-native";
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Check, FilterX } from "lucide-react-native";
import { FineStatistics } from "@/actions/types";
import { Text } from "@/components/ui/text";
import {
    FineGrouping,
    FineStatusFilter,
    STATUS_OPTIONS,
    statusLabel,
} from "@/lib/groups/groupPage";
import { InteropBottomSheetModal } from "@/lib/interopBottomSheet";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/utils";

export type FineFilterSheetRef = {
    present: () => void;
};

/**
 * Antallet bak et valg, fra gruppas summer. «Alle bøter» får ikke noe tall:
 * statistikken holder avviste utenfor, så summen ville ikke stemt med lista.
 * Det ufiltrerte valget i «Per medlem» er «Aktive bøter», og der er summen
 * ikke godkjent + ubetalt — det samme Photon teller i medlemslista.
 */
function optionCount(
    value: FineStatusFilter,
    grouping: FineGrouping,
    statistics: FineStatistics | undefined
): number | undefined {
    if (!statistics) return undefined;
    switch (value) {
        case "pending":
            return statistics.notApproved;
        case "approved":
            return statistics.approvedNotPaid;
        case "paid":
            return statistics.paid;
        case "alle":
            return grouping === "per-medlem"
                ? statistics.notApproved + statistics.approvedNotPaid
                : undefined;
        default:
            return undefined;
    }
}

/**
 * Filteret i bøtefanen. Bare status — visningen velges i menyen over lista.
 *
 * Et valg gjelder med en gang, så lista bak arket oppdateres mens det står
 * oppe. «Ferdig» nederst bruker ingenting — den lukker bare arket.
 */
export const FineFilterSheet = forwardRef<
    FineFilterSheetRef,
    {
        status: FineStatusFilter;
        grouping: FineGrouping;
        statistics: FineStatistics | undefined;
        onChange: (status: FineStatusFilter) => void;
    }
>(({ status, grouping, statistics, onChange }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);
    const isActive = status !== "alle";

    useImperativeHandle(ref, () => ({
        present: () => sheetRef.current?.present(),
    }));

    // Stabil, så bakgrunnen ikke monteres på nytt hver gang arket rendres.
    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                opacity={0.5}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        ),
        []
    );

    return (
        <InteropBottomSheetModal
            ref={sheetRef}
            backgroundStyleClassName="bg-popover rounded-3xl"
            enableDynamicSizing
            backdropComponent={renderBackdrop}
        >
            {/* Samme oppsett som filteret i arrangementer, så de to arkene
                ser like ut. */}
            <BottomSheetView className="bg-popover px-6 pb-10 pt-4">
                <View className="flex-row items-center justify-between mb-5">
                    <View className="flex-row items-center">
                        <Text
                            className="text-xl font-bold text-foreground"
                            accessibilityRole="header"
                        >
                            Filter
                        </Text>
                        {isActive ? (
                            <View
                                className="ml-2.5 w-6 h-6 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center"
                                accessibilityElementsHidden
                                importantForAccessibility="no-hide-descendants"
                            >
                                <Text className="text-xs font-bold text-primary">
                                    1
                                </Text>
                            </View>
                        ) : null}
                    </View>
                    {isActive ? (
                        <Pressable
                            onPress={() => onChange("alle")}
                            accessibilityRole="button"
                            className="flex-row items-center active:opacity-70"
                        >
                            <FilterX size={16} color={colors.mutedForeground} />
                            <Text
                                className="text-sm text-muted-foreground ml-1.5"
                                style={{ fontFamily: "Inter" }}
                            >
                                Nullstill
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <View className="h-px bg-border dark:bg-muted mb-5" />

                <Text className="text-base font-semibold text-foreground mb-3">
                    Status
                </Text>
                <View
                    className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden mb-6"
                    accessibilityRole="radiogroup"
                >
                    {STATUS_OPTIONS.map((option, index) => {
                        const checked = option.value === status;
                        const count = optionCount(
                            option.value,
                            grouping,
                            statistics
                        );
                        return (
                            <View key={option.value}>
                                {index > 0 ? (
                                    <View className="h-px bg-border dark:bg-muted ml-4" />
                                ) : null}
                                <Pressable
                                    onPress={() => onChange(option.value)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked }}
                                    className="flex-row items-center px-4 py-3.5 active:opacity-70"
                                >
                                    <Text
                                        className={cn(
                                            "flex-1 text-base text-foreground",
                                            checked && "font-semibold"
                                        )}
                                    >
                                        {statusLabel(option, grouping)}
                                    </Text>
                                    {count !== undefined ? (
                                        <Text className="text-sm text-muted-foreground ml-3">
                                            {count}
                                        </Text>
                                    ) : null}
                                    <View className="w-6 items-end ml-3">
                                        {checked ? (
                                            <Check
                                                size={18}
                                                color={colors.primary}
                                            />
                                        ) : null}
                                    </View>
                                </Pressable>
                            </View>
                        );
                    })}
                </View>

                <Pressable
                    onPress={() => sheetRef.current?.dismiss()}
                    accessibilityRole="button"
                    className="h-14 rounded-2xl bg-primary flex-row items-center justify-center active:opacity-80"
                >
                    <Text
                        className="text-white text-base font-semibold"
                        style={{ fontFamily: "Inter" }}
                    >
                        Ferdig
                    </Text>
                </Pressable>
            </BottomSheetView>
        </InteropBottomSheetModal>
    );
});

FineFilterSheet.displayName = "FineFilterSheet";
