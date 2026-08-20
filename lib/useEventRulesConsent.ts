import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { mySettings, settingsKeys, updateMySettings } from "@/actions/users/settings";
import { usePermissions } from "@/actions/users/me";

export const EVENT_RULES_URL = "https://wiki.tihlde.org/arrangementer";

/**
 * Om medlemmet mangler godkjenning av arrangementsreglene, og handlingen som
 * fikser det.
 *
 * Photon avviser påmelding uten godkjenning. Fram til nå lå bryteren bare i
 * profilinnstillingene, så den som ikke hadde huket av ble avvist på
 * arrangementssiden uten å få vite hvorfor. Nettsiden viser samtykket der
 * påmeldingen skjer — og før påmeldingen åpner, som er hele poenget: de skal
 * oppdage det i god tid, ikke i sekundet plassene slippes.
 */
export function useEventRulesConsent() {
    const queryClient = useQueryClient();

    const settings = useQuery({
        queryKey: settingsKeys.mine,
        queryFn: mySettings,
    });

    // Den som ikke kan melde seg på har ingen nytte av varselet — de stoppes
    // uansett et annet sted. Alumni er tilfellet dette gjelder.
    const permissions = usePermissions();
    const canRegister = permissions.data?.event?.register ?? true;

    const accept = useMutation({
        mutationFn: () => updateMySettings({ acceptsEventRules: true }),
        onSuccess: (updated) => {
            // Godkjenningen ligger i innstillingene, så de må oppdateres for at
            // påmeldingsknappen skal dukke opp uten at skjermen lastes på nytt.
            queryClient.setQueryData(settingsKeys.mine, updated);
        },
    });

    return {
        mustAccept:
            settings.isSuccess &&
            canRegister &&
            settings.data.acceptsEventRules !== true,
        isSubmitting: accept.isPending,
        error: accept.error ? "Kunne ikke lagre godkjenningen. Prøv igjen." : null,
        acceptEventRules: () => accept.mutate(),
    };
}
