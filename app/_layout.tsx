import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function Layout() {
  // Suppress harmless network errors in console
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Suppress console.error messages
      const originalError = console.error;
      console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (
          message.includes('404') ||
          message.includes('400') && message.includes('TYPE=terminate') ||
          message.includes('firebasestorage.googleapis.com')
        ) {
          return;
        }
        originalError.apply(console, args);
      };

      // Suppress console.warn for pointerEvents deprecation
      const originalWarn = console.warn;
      console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (message.includes('pointerEvents is deprecated')) {
          return;
        }
        originalWarn.apply(console, args);
      };
    }
  }, []);

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
