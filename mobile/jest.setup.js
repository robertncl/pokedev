jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});

// expo-asset 58.0.16+ reads `AssetRegistry` from 'react-native', which jest-expo
// 58.0.13 doesn't mock, so loading @expo/vector-icons fonts throws 'Module "1"
// is missing from the asset registry'. Point it at jest-expo's registry mock.
// Remove once a jest-expo release includes https://github.com/expo/expo/pull/52048.
jest.doMock(
  require.resolve('react-native/src/private/assets/AssetRegistry', {
    paths: [require('path').dirname(require.resolve('react-native/package.json'))],
  }),
  () => ({ AssetRegistry: jest.requireMock('react-native/asset-registry') })
);
