/**
 * Søknader i Photon. Appen bruker bare utleggstypen, men status- og
 * typefeltene er delt av alle søknadene og beholder derfor hele verdisettet.
 */

export type ApplicationType =
    | "expense"
    | "support"
    | "sports_support"
    | "hs_case"
    | "company_contact";

export type ApplicationStatus = "new" | "in_progress" | "approved" | "rejected";

export type BudgetType =
    | "social_budget"
    | "group_budget"
    | "approved_hs_application"
    | "approved_idkom_application";

/** Valglistene skjemaet fylles fra. Labels kommer ferdig oversatt fra Photon. */
export type ApplicationOptions = {
    groups: { slug: string; name: string }[];
    ccOptions: { slug: string; name: string; email: string }[];
    budgetTypes: { value: BudgetType; label: string }[];
    caseTypes: { value: string; label: string }[];
};

/** Raden i listevisningen. Selve utleggsdetaljene ligger bare på detaljruta. */
export type ApplicationSummary = {
    id: string;
    type: ApplicationType;
    typeLabel: string;
    status: ApplicationStatus;
    statusLabel: string;
    title: string;
    contactName: string;
    contactEmail: string;
    submittedById: string | null;
    submittedByName: string | null;
    amountNok: number | null;
    groupName: string | null;
    hasPdf: boolean;
    handledByName: string | null;
    handledAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type ApplicationAttachment = {
    id: string;
    assetKey: string;
    kind: "receipt" | "budget" | "attachment";
    sortOrder: number;
};

export type ExpenseDetail = {
    ccEmail: string | null;
    amountNok: number;
    expenseDate: string;
    budgetType: BudgetType;
    budgetTypeLabel: string;
    description: string;
    accountNumber: string;
    group: { slug: string; name: string };
};

export type ApplicationDetail = ApplicationSummary & {
    signature: string;
    attachments: ApplicationAttachment[];
    expense: ExpenseDetail | null;
};

/** Kroppen `POST /applications/expense` tar imot. */
export type CreateExpensePayload = {
    contactName: string;
    contactEmail: string;
    ccEmail?: string;
    amountNok: number;
    expenseDate: string;
    groupSlug: string;
    budgetType: BudgetType;
    description: string;
    accountNumber: string;
    attachmentKeys: string[];
};

/**
 * `pdfGenerated: false` betyr at utlegget er lagret, men at PDF-en ikke ble
 * laget — søknaden er altså sendt inn, og skal ikke framstå som mislykket.
 */
export type CreateApplicationResponse = {
    id: string;
    pdfGenerated: boolean;
};
