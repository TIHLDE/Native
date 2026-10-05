import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/lib/storage/tokenStore", () => ({
    getSession: jest.fn(),
    setSession: jest.fn(),
    deleteToken: jest.fn(),
}));
jest.mock("@/lib/auth/session-events", () => ({
    emitSessionLost: jest.fn(),
}));
jest.mock("@/lib/api/network", () => ({
    request: jest.fn(),
}));

import { request } from "@/lib/api/network";
import { emitSessionLost } from "@/lib/auth/session-events";
import { deleteToken, getSession, setSession } from "@/lib/storage/tokenStore";
import { refreshSession } from "./photon";

const mockRequest = jest.mocked(request);
const mockGetSession = jest.mocked(getSession);

beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({
        accessToken: "gammelt",
        refreshToken: "fornyelse",
        expiresAt: 0,
    });
});

describe("refreshSession", () => {
    it("lagrer det nye tokenet", async () => {
        mockRequest.mockResolvedValue(
            new Response(JSON.stringify({ access_token: "nytt", expires_in: 3600 })),
        );

        await expect(refreshSession()).resolves.toBe("nytt");
        expect(setSession).toHaveBeenCalled();
    });

    it.each([400, 401])("sletter sesjonen når Photon avviser med %i", async (status) => {
        mockRequest.mockResolvedValue(new Response(null, { status }));

        await expect(refreshSession()).resolves.toBeNull();
        expect(deleteToken).toHaveBeenCalled();
        expect(emitSessionLost).toHaveBeenCalled();
    });

    it.each([429, 500, 502, 503])("beholder sesjonen ved %i", async (status) => {
        mockRequest.mockResolvedValue(new Response(null, { status }));

        await expect(refreshSession()).rejects.toThrow(String(status));
        expect(deleteToken).not.toHaveBeenCalled();
        expect(emitSessionLost).not.toHaveBeenCalled();
    });

    it("beholder sesjonen når serveren ikke kan nås", async () => {
        mockRequest.mockRejectedValue(new Error("nettfeil"));

        await expect(refreshSession()).rejects.toThrow();
        expect(deleteToken).not.toHaveBeenCalled();
    });
});
