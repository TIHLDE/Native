import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl } from "react-native-gesture-handler";

/**
 * `string[]` er én nøkkel. `string[][]` er flere nøkler som skal invalideres
 * samtidig — en skjerm som viser to lister må kunne oppdatere begge.
 */
type RefreshQueryKey = string | string[] | string[][];

export default function useRefresh(refreshQueryKey: RefreshQueryKey) {
    const queryClient = useQueryClient();
    let [isRefreshing, setIsRefreshing] = useState(false);

    const queryKey: (string | string[])[] = Array.isArray(refreshQueryKey)
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
                (queryKey as string[][]).map((key) =>
                    queryClient.invalidateQueries({ queryKey: key })
                )
            ).then(handleFinish);
            return;
        }

        queryClient
            .invalidateQueries({ queryKey: queryKey as string[] })
            .then(handleFinish);
    };

    return (
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
    )
}