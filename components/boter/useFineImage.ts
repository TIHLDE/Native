import { useCallback, useRef, useState } from "react";
import { Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { isPickerCacheUri } from "@/lib/fines/pickerImage";

export type PickedImage = {
    uri: string;
    width: number;
    height: number;
};

/**
 * Bildet som route-params. BotBlitz tar bildet før gruppe, lov og brukere er
 * valgt, og det følger med gjennom flyten som disse til bekreft-skjermen. Den
 * vanlige flyten sender ingen bilde-params, men ruta kan også åpnes med en
 * dyplenke, og da kommer params rett fra lenka. `imageFromParams` godtar
 * derfor bare filer bildevelgeren selv har lagt i cachen.
 */
export type ImageParams = { imageUri?: string; w?: string; h?: string };

export function imageParams(image: PickedImage | null): ImageParams {
    return image
        ? {
              imageUri: image.uri,
              w: String(image.width),
              h: String(image.height),
          }
        : {};
}

/** Sender bildet videre til neste skjerm, om det er et. */
export function forwardImageParams(params: ImageParams): ImageParams {
    return params.imageUri
        ? { imageUri: params.imageUri, w: params.w, h: params.h }
        : {};
}

export function imageFromParams(params: ImageParams): PickedImage | null {
    // Mangler målene, blir de 0, og `previewSize` faller tilbake til fast høyde.
    return params.imageUri &&
        isPickerCacheUri(params.imageUri, Paths.cache.uri)
        ? {
              uri: params.imageUri,
              width: Number(params.w) || 0,
              height: Number(params.h) || 0,
          }
        : null;
}

/** Høyden forhåndsvisningen sikter mot. Brede bilder blir lavere enn dette. */
const PREVIEW_HEIGHT = 192;

function toPickedImage(
    result: ImagePicker.ImagePickerResult,
): PickedImage | null {
    const asset = result.canceled ? undefined : result.assets[0];
    return asset
        ? { uri: asset.uri, width: asset.width, height: asset.height }
        : null;
}

/**
 * Bildet til en bot, med valg fra biblioteket og kameraet. Begge returnerer
 * bildet de satte (eller `null` ved avbrudd, feil eller om en velger alt er
 * åpen), så den som kaller kan gå videre med det med én gang. Feil vises som
 * toast her og kastes aldri videre.
 */
export function useFineImage(initial: PickedImage | null = null) {
    const [image, setImage] = useState<PickedImage | null>(initial);

    // Én velger om gangen. Et dobbelttrykk kommer før `isPicking` har nådd
    // knappen, så sperren er en ref; staten er bare for å vise knappen som
    // deaktivert. Et nytt kall mens velgeren er åpen avvises av
    // expo-image-picker.
    const busy = useRef(false);
    const [isPicking, setIsPicking] = useState(false);

    const run = useCallback(
        async (
            launch: () => Promise<PickedImage | null>,
            failure: string,
        ): Promise<PickedImage | null> => {
            if (busy.current) return null;
            busy.current = true;
            setIsPicking(true);
            try {
                const picked = await launch();
                if (picked) setImage(picked);
                return picked;
            } catch {
                // F.eks. ingen kamera (simulator), eller at velgeren ikke
                // kunne åpnes. Uten denne ble det et ubehandlet løfte og
                // ingen beskjed.
                Toast.show({
                    type: "error",
                    text1: failure,
                    text2: "Prøv igjen.",
                });
                return null;
            } finally {
                busy.current = false;
                setIsPicking(false);
            }
        },
        [],
    );

    // Ingen `allowsEditing`: den tvang bildet gjennom systemets beskjæring
    // (kvadratisk på iOS), og et beskåret bevis er ikke et bevis. Photon og
    // nettsida tar bilder i alle sideforhold.
    const launchLibrary = useCallback(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
            // Uten `allowsEditing` bruker iOS PHPicker, som gir HEIC-bilder
            // videre som rå .heic. Photon avviser det, og nettlesere kan ikke
            // vise det, så be om et kompatibelt format (JPEG).
            preferredAssetRepresentationMode:
                ImagePicker.UIImagePickerPreferredAssetRepresentationMode
                    .Compatible,
        });

        return toPickedImage(result);
    }, []);

    const launchCamera = useCallback(async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Toast.show({
                type: "error",
                text1: "Tilgang nektet",
                text2: "Du må gi tilgang til kameraet for å ta bilder.",
            });
            return null;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });

        return toPickedImage(result);
    }, []);

    const pickImage = useCallback(
        () => run(launchLibrary, "Kunne ikke åpne bildebiblioteket"),
        [run, launchLibrary],
    );
    const takePhoto = useCallback(
        () => run(launchCamera, "Kunne ikke åpne kameraet"),
        [run, launchCamera],
    );

    return { image, setImage, pickImage, takePhoto, isPicking };
}

/**
 * Rammen for forhåndsvisningen, i bildets eget sideforhold, så det som vises
 * er det som lastes opp. Bredden regnes ut direkte framfor å la `aspectRatio`
 * og `maxWidth` møtes: da holder Yoga fast høyden, og et panorama ender i en
 * ramme som ikke passer bildet. Appen er låst til stående, så vindusbredden
 * minus marg er innholdsbredden.
 */
export function previewSize(image: PickedImage, maxWidth: number) {
    if (!(image.width > 0 && image.height > 0)) {
        return { width: maxWidth, height: PREVIEW_HEIGHT };
    }
    const aspect = image.width / image.height;
    const width = Math.min(maxWidth, PREVIEW_HEIGHT * aspect);
    return { width, height: width / aspect };
}
