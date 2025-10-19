export function getLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    console.log(`getLocalStorage(${key}):`, data);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`getLocalStorage(${key}) failed:`, error);
    return null;
  }
}

export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`setLocalStorage(${key}):`, value);
  } catch (error) {
    console.error(`setLocalStorage(${key}) failed:`, error);
    throw error;
  }
}