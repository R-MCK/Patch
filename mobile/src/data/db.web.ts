// Mock db for web to prevent crash and avoid wasm bundling issues, 
// as web needs SharedArrayBuffer headers for expo-sqlite

export const db = {
  execSync: () => {},
  runSync: () => {},
  getAllSync: () => [],
  getFirstSync: () => null
} as any

export function initDatabase() {}
