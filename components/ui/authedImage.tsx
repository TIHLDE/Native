import { useEffect, useState } from "react";
import { Image, type ImageProps, type ImageURISource } from "react-native";

import { BASE_URL } from "@/actions/constant";
import { getValidAccessToken } from "@/lib/auth/photon";

/**
 * Bilder Photon bare gir fra seg til en innlogget kaller.
 *
 * `GET /api/assets/:key` er åpen for arrangements- og nyhetsbilder,
 * gruppelogoer og Töddel, men svarer 404 på profilbilder og galleribilder uten
 * sesjon. Bøtebilder serveres ikke derfra i det hele tatt. `<Image>` sender
 * ingen headere av seg selv, så de private bildene ble stående tomme mens alt
 * det åpne virket.
 *
 * Tokenet hentes med `getValidAccessToken`, samme som `apiFetch`, så et utløpt
 * token fornyes før bildet lastes.
 */
function useAuthorizedSource(
    uri: string | null | undefined,
): ImageURISource | undefined {
    // Tokenet skal bare til Photon. Profilbildet kan være en Feide-URL eller en
    // rest fra Lepton-importen, og de ligger på andres verter.
    const needsToken = Boolean(uri?.startsWith(BASE_URL));
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (!needsToken) return;

        let active = true;
        getValidAccessToken().then((fresh) => {
            if (active) setToken(fresh);
        });
        return () => {
            active = false;
        };
    }, [needsToken, uri]);

    if (!uri) return undefined;
    if (!needsToken) return { uri };
    if (!token) return undefined;
    return { uri, headers: { Authorization: `Bearer ${token}` } };
}

export function AuthedImage({
    uri,
    ...props
}: { uri: string | null | undefined } & Omit<ImageProps, "source">) {
    const source = useAuthorizedSource(uri);

    return <Image source={source ?? {}} {...props} />;
}
