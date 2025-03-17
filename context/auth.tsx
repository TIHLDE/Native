import { getToken } from "@/lib/storage/tokenStore";
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useEffect, useState } from "react";


type AuthState = {
    token: string | null;
    auhtenticated: boolean;
    isLoading: boolean;
};

export interface AuthContextType {
    authState?: AuthState;
    setAuthState?: Dispatch<SetStateAction<AuthState>>;
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
            const accessToken = await getToken();

            if (!accessToken) {
                setAuthState({
                    token: null,
                    auhtenticated: false,
                    isLoading: false,
                });
            } else {
                setAuthState({
                    token: accessToken,
                    auhtenticated: true,
                    isLoading: false,
                });
            }
        };

        checkAuth();
    }, []);

    const value = {
        authState,
        setAuthState,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};