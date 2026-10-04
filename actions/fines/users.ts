import { GroupUser } from "@/actions/types";
import { fetchGroupMembers } from "@/actions/groups/members";

/**
 * Medlemmene i en gruppe, til bruk når man skal gi bot.
 *
 * Lepton hadde et globalt /users/-søk filtrert på gruppe med paginering.
 * Photon har medlemslista på gruppa og returnerer den i sin helhet, så søket
 * og pagineringen gjøres her. Gruppene er små nok til at det er billigere enn
 * et kall per tastetrykk.
 */
export async function fetchGroupUsers(
    groupSlug: string,
    search: string = "",
    page: number = 1
): Promise<{ count: number; results: GroupUser[] }> {
    const members = await fetchGroupMembers(groupSlug);

    const users = members.map((member) => member.user);
    const needle = search.trim().toLowerCase();
    const matched = needle
        ? users.filter((user) =>
              `${user.firstName} ${user.lastName} ${user.userId}`
                  .toLowerCase()
                  .includes(needle)
          )
        : users;

    const PAGE_SIZE = 25;
    const start = Math.max(0, (page - 1) * PAGE_SIZE);
    return { count: matched.length, results: matched.slice(start, start + PAGE_SIZE) };
}
