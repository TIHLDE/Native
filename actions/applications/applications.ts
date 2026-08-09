import { apiJson } from "@/lib/api/client";
import type {
    ApplicationDetail,
    ApplicationOptions,
    ApplicationSummary,
    CreateApplicationResponse,
    CreateExpensePayload,
} from "@/actions/types";

/** Gruppene, budsjettypene og kopimottakerne skjemaet kan velge mellom. */
export async function applicationOptions(): Promise<ApplicationOptions> {
    return apiJson<ApplicationOptions>("/applications/options");
}

const PAGE_SIZE = 25;

/**
 * Mine utlegg, nyeste først.
 *
 * Photon svarer med en naken array uten totalantall, så neste side utledes av
 * at siden kom full: en kortere side er den siste. `/mine` dekker alle
 * søknadstyper, og `type=expense` holder listen til det fanen handler om.
 */
export async function myExpenses(
    offset: number,
): Promise<{ results: ApplicationSummary[]; next: number | null }> {
    const results = await apiJson<ApplicationSummary[]>(
        `/applications/mine?type=expense&limit=${PAGE_SIZE}&offset=${offset}`,
    );

    return {
        results,
        next: results.length === PAGE_SIZE ? offset + PAGE_SIZE : null,
    };
}

export async function application(id: string): Promise<ApplicationDetail> {
    return apiJson<ApplicationDetail>(`/applications/${encodeURIComponent(id)}`);
}

/**
 * Sender inn et utlegg. Kvitteringene må være lastet opp på forhånd, og
 * `attachmentKeys` inneholder nøklene `uploadReceipt` ga tilbake.
 *
 * Photon ruller hele søknaden tilbake om én nøkkel ikke går gjennom, så et
 * avslag her betyr at ingenting ble lagret.
 */
export async function createExpense(
    payload: CreateExpensePayload,
): Promise<CreateApplicationResponse> {
    return apiJson<CreateApplicationResponse>("/applications/expense", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export { PAGE_SIZE };
