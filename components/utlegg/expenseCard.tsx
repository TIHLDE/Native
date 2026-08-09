import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import type { ApplicationStatus, ApplicationSummary } from "@/actions/types";

/**
 * Statusfargene. Photon sender med `statusLabel` ferdig oversatt, så teksten
 * hentes derfra og bare fargen bestemmes her.
 */
const STATUS_STYLES: Record<ApplicationStatus, string> = {
    new: "bg-gray-100 dark:bg-secondary/40",
    in_progress: "bg-amber-100 dark:bg-amber-500/20",
    approved: "bg-green-100 dark:bg-green-500/20",
    rejected: "bg-destructive/10 dark:bg-destructive/20",
};

const STATUS_TEXT: Record<ApplicationStatus, string> = {
    new: "text-muted-foreground",
    in_progress: "text-amber-700 dark:text-amber-300",
    approved: "text-green-700 dark:text-green-300",
    rejected: "text-destructive",
};

/** Beløpet lagres i hele kroner, så det formateres uten desimaler. */
const formatAmount = (amount: number) =>
    `${amount.toLocaleString("no-NO")} kr`;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("no-NO", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

interface ExpenseCardProps {
    expense: ApplicationSummary;
    onPress?: () => void;
}

const ExpenseCard = React.forwardRef<View, ExpenseCardProps>(
    ({ expense, onPress }, ref) => {
        return (
            <Pressable
                ref={ref}
                onPress={onPress}
                className="bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 mb-3 active:opacity-70"
            >
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="text-base font-semibold text-foreground">
                            {expense.groupName ?? expense.title}
                        </Text>
                        <Text className="text-sm text-muted-foreground mt-0.5">
                            Sendt {formatDate(expense.createdAt)}
                        </Text>
                    </View>

                    <View
                        className={`rounded-full px-2.5 py-1 ${STATUS_STYLES[expense.status]}`}
                    >
                        <Text
                            className={`text-xs font-semibold ${STATUS_TEXT[expense.status]}`}
                        >
                            {expense.statusLabel}
                        </Text>
                    </View>
                </View>

                {expense.amountNok !== null && (
                    <Text className="text-xl font-bold text-foreground mt-3">
                        {formatAmount(expense.amountNok)}
                    </Text>
                )}

                {expense.handledByName && (
                    <Text className="text-xs text-muted-foreground mt-2">
                        Behandlet av {expense.handledByName}
                    </Text>
                )}
            </Pressable>
        );
    },
);

ExpenseCard.displayName = "ExpenseCard";

export function ExpenseCardSkeleton() {
    return (
        <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 mb-3 animate-pulse">
            <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                    <View className="h-4 w-40 rounded bg-gray-300 dark:bg-muted" />
                    <View className="h-3 w-28 rounded bg-gray-300 dark:bg-muted mt-2" />
                </View>
                <View className="h-6 w-16 rounded-full bg-gray-300 dark:bg-muted" />
            </View>
            <View className="h-6 w-24 rounded bg-gray-300 dark:bg-muted mt-3" />
        </View>
    );
}

export default ExpenseCard;
