import { useAuthCredential } from "@/contexts/useAuthCredential";
import { useUserCredential } from "@/contexts/useUser";
import api from "@/hooks/useApi";
import { AxiosResponse } from "axios";
import { useCallback, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

interface LoginResponseData {
  access: string;
  refresh: string;
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { user, isLoading } = useUserCredential() ?? {
    user: null,
    isLoading: false,
  };
  const { accessToken, refreshToken, setAuthTokens } = useAuthCredential();

  const handleLogin = useCallback(async () => {
    setErrorMessage("");
    const apiInstance = api(accessToken, refreshToken, null, setAuthTokens);
    let res: AxiosResponse<LoginResponseData>;

    try {
      res = await apiInstance.post("accounts/token/", {
        username,
        password,
      });
    } catch (error) {
      setErrorMessage("Login faile!.");
      console.error("Login request failed:", error);
      return;
    }

    const nextAccess = res.data?.access;
    const nextRefresh = res.data?.refresh;

    if (!nextAccess || !nextRefresh) {
      setErrorMessage("Login failed: server returned invalid tokens.");
      return;
    }

    try {
      await setAuthTokens({ accessToken: nextAccess, refreshToken: nextRefresh });
      setErrorMessage("");
    } catch (error) {
      console.error("Saving tokens failed:", error);
      setErrorMessage("Logged in, but failed to save session on device.");
    }
  }, [accessToken, refreshToken, setAuthTokens, username, password]);

  return (
    <View>
      <Text>Login Screen</Text>
      <Text>{isLoading ? "Loading..." : JSON.stringify(user)}</Text>

      {errorMessage ? <Text style={{ color: "red" }}>{errorMessage}</Text> : null}

      <Text>Username:</Text>
      <TextInput
        placeholder="Enter a username"
        onChangeText={(text) => {
          setUsername(text);
        }}
        value={username}
      />

      <Text>Password:</Text>
      <TextInput
        placeholder="Enter a password"
        onChangeText={(text) => {
          setPassword(text);
        }}
        value={password}
      />

      <Button
        title="Login"
        onPress={handleLogin}
      />
    </View>
  );
}
