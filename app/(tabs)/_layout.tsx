import IonIcons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveBackgroundColor: "#0f5a0fa4",
        tabBarActiveTintColor: "#b4522bff",
        headerStyle: { backgroundColor: "#86a0beff" },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: "#134913a4" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Vault",
          tabBarIcon: ({ color, focused }) => (
            <IonIcons
              name={focused ? "lock-closed-sharp" : "lock-closed-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color, focused }) => (
            <IonIcons
              name={
                focused
                  ? "information-circle-sharp"
                  : "information-circle-outline"
              }
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
