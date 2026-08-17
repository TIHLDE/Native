import { BottomSheetModal, type BottomSheetModalProps } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import type { ComponentType, RefAttributes } from "react";

/**
 * `BottomSheetModal` med `backgroundStyleClassName` som Tailwind-klasse.
 *
 * Typen settes eksplisitt fordi `cssInterop` legger på en indekssignatur av
 * strenger for klassenavnene den tar. Den slår ut `children`, så hvert eneste
 * kallsted fikk «Element is not assignable to string» — en feil om props
 * ingen faktisk sender.
 */
export const InteropBottomSheetModal = cssInterop(BottomSheetModal, {
    backgroundStyleClassName: "backgroundStyle",
}) as ComponentType<
    BottomSheetModalProps &
        RefAttributes<BottomSheetModal> & { backgroundStyleClassName?: string }
>;
