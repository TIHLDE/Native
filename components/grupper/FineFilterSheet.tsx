import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { Pressable, View } from "react-native";
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Check } from "lucide-react-native";
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
 * oppe. Derfor ingen bruk-knapp nederst; «Ferdig» lukker bare arket.
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
            <BottomSheetView className="bg-popover px-6 pb-10 pt-2">
                <View className="flex-row items-center mb-4">
                    <View className="flex-1 items-start">
                        <Pressable
                            onPress={() => onChange("alle")}
                            disabled={!isActive}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: !isActive }}
                            hitSlop={8}
                            className="active:opacity-70"
                        >
                            <Text
                                className={cn(
                                    "text-base",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground opacity-50"
                                )}
                            >
                                Nullstill
                            </Text>
                        </Pressable>
                    </View>
                    <Text
                        className="text-lg font-bold text-foreground"
                        accessibilityRole="header"
                    >
                        Filter
                    </Text>
                    <View className="flex-1 items-end">
                        <Pressable
                            onPress={() => sheetRef.current?.dismiss()}
                            accessibilityRole="button"
                            hitSlop={8}
                            className="active:opacity-70"
                        >
                            <Text className="text-base font-semibold text-primary">
                                Ferdig
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <Text className="text-sm font-semibold text-muted-foreground mb-2">
                    Status
                </Text>
                <View
                    className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden"
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
            </BottomSheetView>
        </InteropBottomSheetModal>
    );
});

FineFilterSheet.displayName = "FineFilterSheet";
