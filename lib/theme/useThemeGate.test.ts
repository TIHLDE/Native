import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";
import type { ThemePreference } from "@/lib/storage/themeStore";
import { THEME_GATE_TIMEOUT_MS, useThemeGate } from "./useThemeGate";

type Props = {
    pendingTheme: ThemePreference | null;
    colorScheme: "light" | "dark";
};

const renderGate = (initialProps: Props) =>
    renderHook(
        ({ pendingTheme, colorScheme }: Props) => useThemeGate(pendingTheme, colorScheme),
        { initialProps },
    );

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
});

describe("useThemeGate", () => {
    it("venter mens temaet ikke er lest inn", async () => {
        const { result } = await renderGate({ pendingTheme: null, colorScheme: "light" });

        expect(result.current).toBe(false);
    });

    it("slipper appen fram med en gang når temaet følger systemet", async () => {
        const { result } = await renderGate({ pendingTheme: "system", colorScheme: "light" });

        expect(result.current).toBe(true);
    });

    it("venter til NativeWind viser det lagrede temaet", async () => {
        const { result, rerender } = await renderGate({
            pendingTheme: "dark",
            colorScheme: "light",
        });
        expect(result.current).toBe(false);

        await rerender({ pendingTheme: "dark", colorScheme: "dark" });

        expect(result.current).toBe(true);
    });

    it("blir stående når temaet byttes etterpå", async () => {
        const { result, rerender } = await renderGate({
            pendingTheme: "dark",
            colorScheme: "dark",
        });
        expect(result.current).toBe(true);

        await rerender({ pendingTheme: "dark", colorScheme: "light" });

        expect(result.current).toBe(true);
    });

    it("slipper appen fram etter tidsfristen og sier fra om det", async () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
        const { result } = await renderGate({ pendingTheme: "dark", colorScheme: "light" });

        await act(() => jest.advanceTimersByTime(THEME_GATE_TIMEOUT_MS - 1));
        expect(result.current).toBe(false);
        expect(warn).not.toHaveBeenCalled();

        await act(() => jest.advanceTimersByTime(1));
        expect(result.current).toBe(true);
        expect(warn).toHaveBeenCalledTimes(1);
    });
});
