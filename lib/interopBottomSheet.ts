import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";

export const InteropBottomSheetModal = cssInterop(BottomSheetModal, {
  backgroundStyleClassName: "backgroundStyle",
});