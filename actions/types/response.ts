

export type ActionResponse<T> = {
    data?: T;
    status: number;
    error?: string | null;
};