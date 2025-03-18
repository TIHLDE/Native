import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl } from "react-native-gesture-handler";

export default function useRefresh(refreshQueryKey: string | string[]) {
    const queryClient = useQueryClient();
    let [isRefreshing, setIsRefreshing] = useState(false);

    const queryKey = Array.isArray(refreshQueryKey)
        ? refreshQueryKey
        : [refreshQueryKey];
    const hasMultipleQueryKeys = Array.isArray(queryKey[0]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        const startTime = Date.now();

        const handleFinish = () => {
            if (Date.now() - startTime < 1000) {
                setTimeout(() => {
                    setIsRefreshing(false);
                }, 400 - (Date.now() - startTime));
                return;
            }
            setIsRefreshing(false);
        };

        if (hasMultipleQueryKeys) {
            Promise.all(
                queryKey.map((key) => queryClient.invalidateQueries({ queryKey: key }))
            ).then(handleFinish);
            return;
        }

        queryClient.invalidateQueries({ queryKey: queryKey }).then(handleFinish);
    };

    return (
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
    )
}