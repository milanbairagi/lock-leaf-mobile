import { getValueFor, save } from "@/hooks/useSecureStorage";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";


export default function Index() {
  const [key, setKey] = useState("abc");
  const [value, setValue] = useState("Apple Banana Cherry");

  return (
    <View>
      {/* <Text>Vault Screen</Text> */}
      <Text>Secure Storage Example</Text>
      <Text>Key:</Text>
      <TextInput value={key} onChangeText={e => setKey(e)} />
      <Text>Value:</Text>
      <TextInput value={value} onChangeText={e => setValue(e)} />

      <Button
        title="Save"
        onPress={() => {
          save(key, value);
        }}
      />

      <TextInput
        placeholder="Enter a key"
        onSubmitEditing={e => getValueFor(e.nativeEvent.text)}
      />
    </View>
  );
}