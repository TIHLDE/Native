import { setToken } from "@/lib/storage";
import { BASE_URL } from "../constant";
import { LeptonError, LoginData } from "../types";


export type LoginInput = {
    email: string;
    password: string;
};

export default async function login({ email, password }: LoginInput): Promise<LoginData> {
    const url = `${BASE_URL}/auth/login/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: email,
            password,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }

    const data = await response.json() as LoginData;

    await setToken(data.token);

    return data;
};