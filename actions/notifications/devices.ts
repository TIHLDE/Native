import { apiJson } from "@/lib/api/client";

export type DevicePlatform = "ios" | "android";

/**
 * Melder telefonen på push i Photon.
 *
 * Photon flytter tokenet til den innloggede brukeren om det allerede finnes,
 * så en telefon som byttes eier slutter å få forrige eiers varsler.
 */
export async function registerPushDevice(
    token: string,
    platform: DevicePlatform,
): Promise<void> {
    await apiJson("/notification/device", {
        method: "POST",
        body: JSON.stringify({ token, platform }),
    });
}

/** Melder telefonen av push. Kalles ved utlogging. */
export async function unregisterPushDevice(token: string): Promise<void> {
    await apiJson("/notification/device", {
        method: "DELETE",
        body: JSON.stringify({ token }),
    });
}
