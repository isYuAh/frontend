export function getStorageItem(key: string) {
    return localStorage.getItem(key);
}

export function setStorageItem(key: string, value: string) {
    return localStorage.setItem(key, value);
}