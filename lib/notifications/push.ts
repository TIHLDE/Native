import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
    registerPushDevice,
    unregisterPushDevice,
    type DevicePlatform,
} from "@/actions/notifications/devices";

const STORED_TOKEN = "tihlde_push_token";
const PUSH_PREFERENCE = "tihlde_push_enabled";

/**
 * Om brukeren vil ha push på denne telefonen.
 *
 * Photon har ingen innstilling for det — der finnes bare listen over påmeldte
 * enheter — så valget hører hjemme på telefonen som er meldt på. Ingen lagret
 * verdi betyr «ikke svart», og da spør appen om tillatelse som før.
 */
export async function isPushEnabled(): Promise<boolean> {
    return (await AsyncStorage.getItem(PUSH_PREFERENCE)) !== "false";
}

export type PushEnableResult =
    /** Telefonen er meldt på. */
    | "ok"
    /** Brukeren har sagt nei til varsler i systemdialogen. */
    | "denied"
    /** Ingen ekte enhet, eller manglende EAS-prosjekt — ikke noe brukeren gjorde. */
    | "unavailable";

/**
 * Skrur push av eller på for telefonen.
 *
 * Valget lagres først, slik at `registerForPushNotifications` — som også kjører
 * ved oppstart — ser det med en gang.
 */
export async function setPushEnabled(
    enabled: boolean,
): Promise<PushEnableResult> {
    await AsyncStorage.setItem(PUSH_PREFERENCE, String(enabled));

    if (!enabled) {
        await unregisterForPushNotifications();
        return "ok";
    }

    if (Device.isDevice && (await registerForPushNotifications())) return "ok";

    // Påmeldingen gikk ikke. Valget settes tilbake, ellers ville innstillingen
    // stått som «på» mens telefonen ikke får noe — og appen ville prøvd på
    // nytt ved hver oppstart uten å komme lenger.
    await AsyncStorage.setItem(PUSH_PREFERENCE, "false");

    if (!Device.isDevice) return "unavailable";

    // Systemdialogen kan bare vises én gang. Er svaret nei, må brukeren inn i
    // telefoninnstillingene — og det må skjermen kunne si fra om.
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted" ? "unavailable" : "denied";
}

/**
 * Varsler som kommer mens appen er åpen vises ikke av seg selv — uten en
 * handler forkaster systemet dem, og brukeren ser ingenting før de bytter
 * skjerm. Settes på modulnivå slik at den er på plass før noe varsel rekker å
 * komme inn.
 */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Android viser hverken lyd eller banner uten en kanal, og kanalen må finnes
 * før det første varselet kommer. iOS har ingen kanaler og hopper over dette.
 */
export async function ensureAndroidChannel(): Promise<void> {
    if (Platform.OS !== "android") return;

    await Notifications.setNotificationChannelAsync("default", {
        name: "Varsler",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "default",
    });
}

/**
 * Ber om tillatelse, henter Expo-tokenet og registrerer det i Photon.
 *
 * Gir `null` når det ikke går: i simulator, eller når brukeren sier nei. Det
 * er ikke en feil appen skal si fra om — varsler er frivillige, og resten av
 * appen fungerer uten.
 */
export async function registerForPushNotifications(): Promise<string | null> {
    // Push krever ekte maskinvare. Simulatoren har ingen enhet å levere til,
    // og getExpoPushTokenAsync kaster der.
    if (!Device.isDevice) return null;

    // Sperren ligger her, ikke bare hos den som kaller: påmeldingen gjentas
    // ved hver oppstart, og den skal ikke overkjøre et nei fra innstillingene.
    if (!(await isPushEnabled())) return null;

    await ensureAndroidChannel();

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;

    if (status !== "granted") {
        // Systemdialogen kan bare vises én gang. Er den allerede avslått,
        // returnerer forespørselen med en gang uten å spørre på nytt.
        const requested = await Notifications.requestPermissionsAsync();
        status = requested.status;
    }

    if (status !== "granted") return null;

    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

    if (!projectId) {
        console.warn("Mangler EAS-prosjekt-ID, kan ikke hente push-token");
        return null;
    }

    try {
        const { data: token } = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        await registerPushDevice(token, Platform.OS as DevicePlatform);
        // Tokenet lagres fordi avmeldingen ved utlogging trenger det, og da er
        // det for sent å be Expo om det på nytt uten nett.
        await AsyncStorage.setItem(STORED_TOKEN, token);

        return token;
    } catch (error) {
        console.error("Klarte ikke å registrere push-varsler", error);
        return null;
    }
}

/**
 * Melder telefonen av push.
 *
 * Kalles ved utlogging, før tokenet slettes — kallet trenger en gyldig sesjon.
 * Feiler det, slettes det lagrede tokenet likevel: alternativet er en
 * utlogging som stopper opp fordi nettet er borte.
 */
export async function unregisterForPushNotifications(): Promise<void> {
    const token = await AsyncStorage.getItem(STORED_TOKEN);
    if (!token) return;

    try {
        await unregisterPushDevice(token);
    } catch (error) {
        console.error("Klarte ikke å melde av push-varsler", error);
    } finally {
        await AsyncStorage.removeItem(STORED_TOKEN);
    }
}
