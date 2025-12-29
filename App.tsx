/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useMemo, useState } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import {
  DeviceEventEmitter,
  PermissionsAndroid,
  Pressable,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import Pushwoosh from 'pushwoosh-react-native-plugin';

enableScreens();

type UserProfile = {
  user_id: string;
  user_name: string;
  user_surname: string;
  user_country: string;
  user_city: string;
  user_card: string;
  user_product_card_name: string;
};

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function randomFrom<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function generateRandomUser(): UserProfile {
  const names = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Sofía'] as const;
  const surnames = ['Gómez', 'Pérez', 'Rodríguez', 'Martínez', 'López'] as const;
  const countries = ['Costa Rica', 'Panamá', 'Guatemala', 'Honduras'] as const;
  const cities = ['San José', 'Ciudad de Panamá', 'Guatemala', 'Tegucigalpa'] as const;
  const cards = ['VISA', 'MASTERCARD', 'AMEX'] as const;
  const products = ['Clásica', 'Oro', 'Platinum', 'Black'] as const;

  const user_id = String(100000 + Math.floor(Math.random() * 900000));

  return {
    user_id,
    user_name: randomFrom(names),
    user_surname: randomFrom(surnames),
    user_country: randomFrom(countries),
    user_city: randomFrom(cities),
    user_card: randomFrom(cards),
    user_product_card_name: randomFrom(products),
  };
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useState<UserProfile | null>(null);

  const initialRouteName: keyof RootStackParamList = useMemo(
    () => (user ? 'Home' : 'Login'),
    [user]
  );

  useEffect(() => {
    const requestAndroidNotificationPermission = async () => {
      if (Platform.OS !== 'android') return;
      if (Platform.Version < 33) return;

      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      } catch (e) {
        console.warn('[Notifications] Permission request failed:', e);
      }
    };

    requestAndroidNotificationPermission();

    Pushwoosh.getHwid(hwid => {
      console.log('Mi Pushwoosh HWID es:', hwid);
    });

    const receivedSub = DeviceEventEmitter.addListener('pushReceived', e => {
      console.warn('Push received: ' + JSON.stringify(e));
    });

    const openedSub = DeviceEventEmitter.addListener('pushOpened', e => {
      console.warn('Push accepted: ' + JSON.stringify(e));
    });

    return () => {
      receivedSub.remove();
      openedSub.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRouteName}>
          <Stack.Screen name="Login" options={{ title: 'Login' }}>
            {({ navigation }) => (
              <LoginScreen
                onSimulateLogin={() => {
                  const randomUser = generateRandomUser();

                  Pushwoosh.setUserId(
                    randomUser.user_id,
                    () => {
                      console.log('[Pushwoosh] setUserId success');
                    },
                    error => {
                      console.warn('[Pushwoosh] setUserId failed:', error);
                    }
                  );

                  Pushwoosh.setTags(
                    {
                      user_id: randomUser.user_id,
                      user_name: randomUser.user_name,
                      user_surname: randomUser.user_surname,
                      user_country: randomUser.user_country,
                      user_city: randomUser.user_city,
                      user_card: randomUser.user_card,
                      user_product_card_name: randomUser.user_product_card_name,
                    },
                    () => {
                      console.log('[Pushwoosh] setTags success');
                    },
                    error => {
                      console.warn('[Pushwoosh] setTags failed:', error);
                    }
                  );

                  setUser(randomUser);
                  navigation.replace('Home');
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Home" options={{ title: 'Home' }}>
            {() => <HomeScreen user={user} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function LoginScreen(props: { onSimulateLogin: () => void }) {
  return (
    <View style={styles.loginContainer}>
      <Text style={styles.loginTitle}>Club Promérica</Text>
      <Pressable style={styles.loginButton} onPress={props.onSimulateLogin}>
        <Text style={styles.loginButtonText}>Simular login</Text>
      </Pressable>
      <Text style={styles.loginHint}>
        Esto genera datos aleatorios y los registra en Pushwoosh.
      </Text>
    </View>
  );
}

function HomeScreen(props: { user: UserProfile | null }) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {props.user ? (
        <View style={styles.userBanner}>
          <Text style={styles.userBannerText}>
            user_id: {props.user.user_id}
          </Text>
        </View>
      ) : null}

      <NewAppScreen templateFileName="App.tsx" safeAreaInsets={safeAreaInsets} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginHint: {
    marginTop: 12,
    textAlign: 'center',
  },
  userBanner: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userBannerText: {
    fontSize: 12,
  },
});

export default App;
