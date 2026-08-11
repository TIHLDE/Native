import * as AuthSession from "expo-auth-session";
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import {
    CLIENT_ID,
    discovery,
    exchangeCode,
    getValidAccessToken,
    makeRedirectUri,
    SCOPES,
} from "@/lib/auth/photon";
import { onSessionLost } from "@/lib/auth/session-events";
import { queryClient } from "@/lib/queryClient";
import { deleteToken } from "@/lib/storage/tokenStore";


type AuthState = {
    token: string | null;
    auhtenticated: boolean;
    isLoading: boolean;
};

export interface AuthContextType {
    authState?: AuthState;
    setAuthState?: Dispatch<SetStateAction<AuthState>>;
    /** Opens Photon in a browser and completes the PKCE exchange. */
    signIn?: () => Promise<void>;
    signOut?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    authState: {
        token: null,
        auhtenticated: false,
        isLoading: true,
    }
});

export const useAuth = () => {
    return useContext(AuthContext);
};


export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [authState, setAuthState] = useState<AuthState>({
        token: null,
        auhtenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const checkAuth = async () => {
            // Refreshes on the way out when the stored token has expired, so a
            // returning user lands logged in rather than bounced to /login.
            const accessToken = await getValidAccessToken();

            setAuthState({
                token: accessToken,
                auhtenticated: Boolean(accessToken),
                isLoading: false,
            });
        };

        checkAuth();
    }, []);

    /**
     * Sesjonen kan dø midt i bruk — et fornyelsestoken kan være trukket
     * tilbake eller utløpt. Da må appen si det på ett sted, i stedet for at
     * hver skjerm viser sin egen feil om noe brukeren ikke kan gjøre noe med.
     * Cachen tømmes samtidig, ellers møter de gamle feilmeldingene brukeren
     * igjen etter neste innlogging.
     */
    useEffect(
        () =>
            onSessionLost(() => {
                queryClient.clear();
                setAuthState({
                    token: null,
                    auhtenticated: false,
                    isLoading: false,
                });
            }),
        [],
    );

    const signIn = useCallback(async () => {
        const redirectUri = makeRedirectUri();

        const request = new AuthSession.AuthRequest({
            clientId: CLIENT_ID,
            redirectUri,
            scopes: SCOPES,
            // The app ships no client secret, so the code alone must not be
            // enough to mint a token. AuthRequest generates the verifier and
            // sends only its S256 hash to Photon.
            usePKCE: true,
        });

        const result = await request.promptAsync(discovery);

        if (result.type !== "success" || !result.params.code) {
            // Dismissing the browser is an ordinary outcome, not a failure —
            // leave the state untouched so the login screen simply stays put.
            if (result.type === "error") {
                throw new Error(
                    result.params.error_description ?? "Innlogging feilet",
                );
            }
            return;
        }

        await exchangeCode(
            result.params.code,
            request.codeVerifier as string,
            redirectUri,
        );

        const token = await getValidAccessToken();
        setAuthState({
            token,
            auhtenticated: Boolean(token),
            isLoading: false,
        });
    }, []);

    const signOut = useCallback(async () => {
        await deleteToken();
        setAuthState({ token: null, auhtenticated: false, isLoading: false });
    }, []);

    const value = {
        authState,
        setAuthState,
        signIn,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
