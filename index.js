/**
 * @format
 */

import { AppRegistry } from 'react-native';
import Pushwoosh from 'pushwoosh-react-native-plugin';
import App from './App';
import { name as appName } from './app.json';

// Initialize Pushwoosh once on app startup (helps avoid double init in Fast Refresh/dev reloads)
if (!global.__PUSHWOOSH_INITIALIZED__) {
    global.__PUSHWOOSH_INITIALIZED__ = true;

    Pushwoosh.init({
        pw_appid: 'F4C86-5E9C9',
        project_number: '778143795656',
    });

    Pushwoosh.register(
        (token) => {
            console.log('[Pushwoosh] Push token:', token);
        },
        (error) => {
            console.warn('[Pushwoosh] Register failed:', error);
        }
    );
}

AppRegistry.registerComponent(appName, () => App);
