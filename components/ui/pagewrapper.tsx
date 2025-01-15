import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface PageWrapperProps {
    children: React.ReactNode;
    refreshQueryKey?: string | string[];
    className?: string;
}

export default function PageWrapper({ children, refreshQueryKey, className }: PageWrapperProps) {
    const queryClient = useQueryClient();
    let [isRefreshing, setIsRefreshing] = useState(false);

    if (!refreshQueryKey) {
        return (
            <SafeAreaWrapper>
                <ScrollView className={cn("min-h-full", className ?? "")}>
                    {children}
                </ScrollView>
            </SafeAreaWrapper>
        )
    }

    const queryKey = Array.isArray(refreshQueryKey) ? refreshQueryKey : [refreshQueryKey];

    const handleRefresh = () => {
        setIsRefreshing(true);
        const startTime = Date.now();
        queryClient.invalidateQueries({ queryKey: queryKey }).then(() => {
            if (Date.now() - startTime < 1000) {

                //TODO: we might not want to do this, but providing a minnumum time for the refresh
                // feels better ux wise
                setTimeout(() => {
                    setIsRefreshing(false);
                }, 400 - (Date.now() - startTime));
                return;
            }

            setIsRefreshing(false);
        });
    }

    return (
        <SafeAreaWrapper>
            <ScrollView refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
                className={cn("min-h-full", className ?? "")}
            >
                {children}
            </ScrollView>
        </SafeAreaWrapper>
    )
}

function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
    return (
        <SafeAreaProvider>
            <SafeAreaView>
                {children}
            </SafeAreaView>
        </SafeAreaProvider>
    )
}