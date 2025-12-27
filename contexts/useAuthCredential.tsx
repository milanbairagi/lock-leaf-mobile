import api from "@/hooks/useApi";
import { type AxiosResponse } from "axios";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getValueFor, remove, save } from "../hooks/useSecureStorage";

type NullableString = string | null;

const REFRESH_TOKEN_STORAGE_KEY = "leaflock.refreshToken";

const readStoredRefreshToken = async (): Promise<NullableString> => {
  try {
    const value = await getValueFor(REFRESH_TOKEN_STORAGE_KEY);
    return value ?? null;
  } catch {
    return null;
  }
};

const writeStoredRefreshToken = async (
  token: NullableString
): Promise<void> => {
  if (token) {
    await save(REFRESH_TOKEN_STORAGE_KEY, token);
  } else {
    await remove(REFRESH_TOKEN_STORAGE_KEY);
  }
  return;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

type AuthCredentialContextValue = {
  isHydrated: boolean;

  accessToken: NullableString;
  refreshToken: NullableString;

  setAuthTokens: (tokens: AuthTokens) => Promise<void>;
  clearAuthTokens: () => Promise<void>;

  vaultUnlockToken: NullableString;
  unlockVault: (token: string) => void;
  lockVault: () => void;
};

const AuthCredentialContext = createContext<AuthCredentialContextValue | null>(
  null
);

export const AuthCredentialProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [accessToken, setAccessToken] = useState<NullableString>(null);
  const [refreshToken, setRefreshToken] = useState<NullableString>(null);
  const [vaultUnlockToken, setVaultUnlockToken] = useState<NullableString>(null);

  const hasAttemptedBootstrapRefresh = useRef(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const storedRefresh = await readStoredRefreshToken();
      if (!isMounted) return;
      setRefreshToken(storedRefresh);
      setIsHydrated(true);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // If we have a refresh token but no access token,
  // silently bootstrap a fresh access token once.
  useEffect(() => {
    if (!isHydrated) return;
    if (!refreshToken) return;
    if (accessToken) return;
    if (hasAttemptedBootstrapRefresh.current) return;

    hasAttemptedBootstrapRefresh.current = true;
    const apiInstance = api();
    let isMounted = true;

    (async () => {
      try {
        const res: AxiosResponse<{ access: string }> = await apiInstance.post(
                                                        "accounts/token/refresh/",
                                                        { refresh: refreshToken }
                                                      );
        if (!isMounted) return;
        setAccessToken(res.data.access);
      } catch {
        if (!isMounted) return;
        // Refresh token invalid/expired; clear to force login.
        setAccessToken(null);
        setRefreshToken(null);
        await writeStoredRefreshToken(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isHydrated, refreshToken, accessToken]);

  const setAuthTokens = useCallback(async (tokens: AuthTokens) => {
    setAccessToken(tokens.accessToken);
    if (typeof tokens.refreshToken === "string") {
      setRefreshToken(tokens.refreshToken);
      await writeStoredRefreshToken(tokens.refreshToken);
    }
  }, []);

  const clearAuthTokens = useCallback(async () => {
    setAccessToken(null);
    setRefreshToken(null);
    await writeStoredRefreshToken(null);
  }, []);

  const unlockVault = useCallback((token: string) => {
    setVaultUnlockToken(token);
  }, []);

  const lockVault = useCallback(() => {
    setVaultUnlockToken(null);
  }, []);

  const value = useMemo<AuthCredentialContextValue>(
    () => ({
      isHydrated,
      accessToken,
      refreshToken,
      setAuthTokens,
      clearAuthTokens,
      vaultUnlockToken,
      unlockVault,
      lockVault,
    }),
    [
      isHydrated,
      accessToken,
      refreshToken,
      setAuthTokens,
      clearAuthTokens,
      vaultUnlockToken,
      unlockVault,
      lockVault,
    ]
  );
  return (
    <AuthCredentialContext.Provider value={value}>
      {children}
    </AuthCredentialContext.Provider>
  );
};

export const useAuthCredential = (): AuthCredentialContextValue => {
  const context = useContext(AuthCredentialContext);
  if (!context) {
    throw new Error(
      "useAuthCredential must be used within an AuthCredentialProvider"
    );
  }
  return context;
};
