import { API_URL } from "@/actions/constant";
import { getValidAccessToken } from "@/lib/auth/photon";
import { UnauthorizedError } from "@/lib/api/client";

type UploadedAsset = {
    key: string;
    originalFilename: string;
    contentType: string | null;
    size: number;
    status: "staged" | "ready";
};

/** Photon avviser alt annet, så filen stoppes her framfor å bli lastet opp forgjeves. */
const ALLOWED_EXTENSIONS: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Laster opp en kvittering og returnerer asset-nøkkelen.
 *
 * Til forskjell fra `uploadImage` i bøtene lastes denne opp som `private`:
 * `GET /assets/:key` er åpen for alle, og en kvittering med kontoutskrift eller
 * kjøpshistorikk skal ikke kunne hentes av hvem som helst med nøkkelen.
 *
 * Nøkkelen returneres rå, ikke som URL — `attachmentKeys` på utlegget vil ha
 * nettopp nøkkelen, og Photon avviser søknaden om den får noe annet.
 *
 * Går utenom apiFetch fordi den setter Content-Type til application/json; en
 * multipart-body må ha grensen sin satt av runtime.
 */
export async function uploadReceipt(uri: string): Promise<string> {
    const token = await getValidAccessToken();
    if (!token) throw new UnauthorizedError();

    const filename = uri.split("/").pop() ?? "kvittering.jpg";
    const extension = /\.(\w+)$/.exec(filename)?.[1]?.toLowerCase();
    const type = extension ? ALLOWED_EXTENSIONS[extension] : undefined;

    if (!type) {
        throw new Error(
            "Filtypen støttes ikke. Bruk bilde (JPG, PNG, GIF, WEBP) eller PDF.",
        );
    }

    const formData = new FormData();
    formData.append("file", { uri, name: filename, type } as any);
    // Uten dette blir kvitteringen offentlig — Photons standard er "public".
    formData.append("visibility", "private");

    const response = await fetch(`${API_URL}/assets`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
        throw new Error(
            body?.message ?? `Opplasting av kvittering feilet (${response.status})`,
        );
    }

    const asset = (await response.json()) as UploadedAsset;
    return asset.key;
}

export { MAX_FILE_SIZE };
