import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl } from "react-native-gesture-handler";

/**
 * `KeyPart[]` er én nøkkel. `KeyPart[][]` er flere nøkler som skal invalideres
 * samtidig — en skjerm som viser to lister må kunne oppdatere begge.
 *
 * Delene må tåle mer enn `string`: arrangementslista har filterflagg i
 * nøkkelen sin (`["events", søk, expired, openForSignUp, userFavorite]`), og
 * med bare `string` her pekte invalideringen på en annen nøkkel enn den
 * `useInfiniteQuery` faktisk bruker.
 */
type KeyPart = string | number | boolean | null | undefined;
type RefreshQueryKey = KeyPart | KeyPart[] | KeyPart[][];

export default function useRefresh(refreshQueryKey: RefreshQueryKey) {
    const queryClient = useQueryClient();
    let [isRefreshing, setIsRefreshing] = useState(false);

    const queryKey: (KeyPart | KeyPart[])[] = Array.isArray(refreshQueryKey)
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
                (queryKey as KeyPart[][]).map((key) =>
                    queryClient.invalidateQueries({ queryKey: key })
                )
            ).then(handleFinish);
            return;
        }

        queryClient
            .invalidateQueries({ queryKey: queryKey as KeyPart[] })
            .then(handleFinish);
    };

    return (
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
    )
}