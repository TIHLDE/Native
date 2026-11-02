import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

export type PickedImage = {
    uri: string;
    width: number;
    height: number;
};

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
 * bildet de satte (eller `null` ved avbrudd), så den som kaller kan gå videre
 * med det med én gang.
 */
export function useFineImage(initial: PickedImage | null = null) {
    const [image, setImage] = useState<PickedImage | null>(initial);

    // Ingen `allowsEditing`: den tvang bildet gjennom systemets beskjæring
    // (kvadratisk på iOS), og et beskåret bevis er ikke et bevis. Photon og
    // nettsida tar bilder i alle sideforhold.
    const pickImage = useCallback(async () => {
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

        const picked = toPickedImage(result);
        if (picked) setImage(picked);
        return picked;
    }, []);

    const takePhoto = useCallback(async () => {
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

        const picked = toPickedImage(result);
        if (picked) setImage(picked);
        return picked;
    }, []);

    return { image, setImage, pickImage, takePhoto };
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
