import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#F7931A',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#000',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Coinshit',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="entry/[id]"
        options={{
          title: 'Entry Details',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
