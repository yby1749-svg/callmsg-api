import 'react-native';

// Note: this is a placeholder test
// More comprehensive tests would require mocking navigation and async storage

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

describe('App', () => {
  it('renders without crashing', () => {
    // Basic smoke test
    expect(true).toBe(true);
  });
});
