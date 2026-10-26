import { API_URL } from "@/actions/constant";
import { request } from "@/lib/api/network";
import {
    PhotonAllergy,
    PhotonUserSettings,
    toAllergy,
    toUserSettings,
} from "@/actions/photon";
import type { Allergy, UserSettings } from "@/actions/types";
import { apiFetch, apiJson } from "@/lib/api/client";

/**
 * Innstillingene en bruker uten innstillingsrad har.
 *
 * Photon oppretter ikke raden ved registrering — den kommer først når noen
 * fullfører onboarding på nettsiden eller endrer én innstilling. Fram til da
 * svarer `/user/me/settings` 404, og det betyr «ingen har svart», ikke «feil».
 * Verdiene her er de samme Photon selv legger til grunn: bildesamtykke og
 * offentlig påmelding er på, arrangementsreglene er ikke godkjent.
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
    acceptsEventRules: false,
    allowsPhotosByDefault: true,
    publicEventRegistrations: true,
    receiveMailCommunication: true,
    allergies: [],
    customAllergies: [],
};

export const settingsKeys = {
    mine: ["users", "me", "settings"],
    allergies: (curated: boolean) => ["allergies", curated],
};

export async function mySettings(): Promise<UserSettings> {
    const response = await apiFetch("/user/me/settings");

    // 404 er ikke en feil her — se DEFAULT_USER_SETTINGS.
    if (response.status === 404) return DEFAULT_USER_SETTINGS;

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
        throw new Error(
            body?.message ?? `Kunne ikke hente innstillingene (${response.status})`,
        );
    }

    return toUserSettings((await response.json()) as PhotonUserSettings);
}

/**
 * Oppdaterer bare feltene som sendes med. Photon oppretter innstillingsraden
 * hvis den mangler, så en bruker som aldri har vært innom onboarding kan
 * fortsatt godta arrangementsreglene herfra.
 *
 * Svaret er hele innstillingssettet etter endringen, så skjermen slipper et
 * ekstra kall for å vise resultatet.
 */
export async function updateMySettings(
    updates: Partial<UserSettings>,
): Promise<UserSettings> {
    const updated = await apiJson<PhotonUserSettings>("/user/me/settings", {
        method: "PATCH",
        body: JSON.stringify(updates),
    });

    return toUserSettings(updated);
}

/**
 * Allergikatalogen. Åpne data, som arrangementslista, så den går uten token.
 *
 * Send `curated` for alt et medlem skal velge fra — det er den samme lista
 * nettsiden viser. Hele katalogen inneholder også fritekstsvarene
 * Lepton-importen gjorde om til egne rader, og trengs bare for å gi navn til
 * slike sluger noen allerede har lagret.
 */
export async function fetchAllergies({
    curated,
}: {
    curated: boolean;
}): Promise<Allergy[]> {
    const response = await request(
        `${API_URL}/user/allergy${curated ? "?curated=true" : ""}`,
    );

    if (!response.ok) {
        throw new Error(`Kunne ikke hente allergier (${response.status})`);
    }

    const allergies = (await response.json()) as PhotonAllergy[];
    return allergies.map(toAllergy);
}
