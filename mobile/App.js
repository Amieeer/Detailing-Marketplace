import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from './src/gluestack-ui.config';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { StripeContainer } from './src/components/StripeContainer';

import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GluestackUIProvider config={config}>
          <ErrorBoundary>
            <StripeContainer>
              <AuthProvider>
                <SocketProvider>
                  <AppNavigator />
                </SocketProvider>
              </AuthProvider>
            </StripeContainer>
          </ErrorBoundary>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
