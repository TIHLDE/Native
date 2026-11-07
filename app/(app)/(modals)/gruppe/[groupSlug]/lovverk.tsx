import { useLocalSearchParams } from "expo-router";
import PageWrapper from "@/components/ui/pagewrapper";
import { GroupLawsList } from "@/components/grupper/GroupLawsList";

/**
 * Lovverket til én gruppe, åpnet fra «Lovverk ›» i Bøter-fanen.
 *
 * Lovvelgeren i botflyten (`boter/[groupSlug]/index.tsx`) bruker samme
 * `LawRow` og samme `["laws", groupSlug]`-cache. Hold de to listene like.
 */
export default function LovverkSide() {
    const { groupSlug } = useLocalSearchParams<{ groupSlug: string }>();

    return (
        <PageWrapper className="flex-1 bg-background">
            <GroupLawsList groupSlug={groupSlug} />
        </PageWrapper>
    );
}
