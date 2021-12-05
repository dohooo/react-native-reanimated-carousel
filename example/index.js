import { registerRootComponent } from 'expo';

import App from './src/App';
// import App2 from './src/App2';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
// registerRootComponent(App2);
