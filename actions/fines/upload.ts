import { File } from "expo-file-system";
import { API_URL } from "@/actions/constant";
import { request } from "@/lib/api/network";
import { getValidAccessToken } from "@/lib/auth/photon";
import { UnauthorizedError } from "@/lib/api/client";

type UploadedAsset = { key: string };

/**
 * Laster opp et bilde og returnerer URL-en det kan vises fra.
 *
 * Filen legges i skjemaet som en `File` fra expo-file-system: `expo/fetch`,
 * som er den globale `fetch`, godtar ikke det gamle `{ uri, name, type }`-
 * objektet og kaster før noe blir sendt. MIME-typen leses av `File` selv.
 *
 * Går utenom apiFetch: den setter Content-Type til application/json, og en
 * multipart-body må ha grensen sin satt av runtime. Tokenet hentes likevel
 * samme vei, så en utløpt sesjon oppdages her også.
 */
export async function uploadImage(uri: string): Promise<string> {
    const token = await getValidAccessToken();
    if (!token) throw new UnauthorizedError();

    const filename = uri.split("/").pop() ?? "photo.jpg";
    const formData = new FormData();
    formData.append("file", new File(uri), filename);

    const response = await request(`${API_URL}/assets`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? `Opplasting feilet (${response.status})`);
    }

    const asset = (await response.json()) as UploadedAsset;
    return `${API_URL}/assets/${asset.key}`;
}
