import { SafeAreaProvider, SafeAreaView, type Edge } from "react-native-safe-area-context";

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
    /**
     * Hvilke kanter som skal få safe-area-padding. Skjermer som ligger under
     * tab-baren sender inn `TAB_SCREEN_EDGES`: der eier tab-baren bunnen, og
     * padding her ville lagt en stripe med bakgrunnsfarge over innholdet —
     * synlig så snart Liquid Glass-baren krymper inn til venstre.
     */
    edges?: readonly Edge[];
}

/** Alt unntatt bunnen — for skjermer som ligger under tab-baren. */
export const TAB_SCREEN_EDGES = ["top", "left", "right"] as const;

export default function PageWrapper({ children, className, edges }: PageWrapperProps) {

    return (
        <SafeAreaProvider>
            <SafeAreaView className={`flex-1 ${className ?? ""}`} edges={edges}>
                {children}
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

/**
 * Luft som må ligge under rullende innhold på skjermer med tab-bar. Baren
 * flyter over innholdet (og safe-area-paddingen er skrudd av, se
 * `TAB_SCREEN_EDGES`), så uten dette blir det nederste elementet liggende
 * permanent bak glasset — det kan ikke rulles fram.
 */
export const TAB_BAR_CLEARANCE = 100;
