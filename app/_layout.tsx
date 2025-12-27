import { AuthCredentialProvider } from "@/contexts/useAuthCredential";
import { UserCredentialProvider } from "@/contexts/useUser";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthCredentialProvider>
      <UserCredentialProvider>
        <Stack>
          {/* <Stack.Screen name="index" options={{title: "Home"}} />
        <Stack.Screen name="about" options={{title: "About"}} /> */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Login" }} />
          <Stack.Screen name="register" options={{ title: "Register" }} />
        </Stack>
      </UserCredentialProvider>
    </AuthCredentialProvider>
  );
}
