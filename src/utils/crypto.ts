// nanoid
// function to generate a random ID
export function nanoid(size: number = 12): string {
    const alphabet = '2346789abcdefghijkmnpqrtwxyzABCDEFGHJKLMNPQRTUVWXYZ';
    const alphabetLength = alphabet.length;
    let id = '';

    for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(Math.random() * alphabetLength);
        id += alphabet[randomIndex];
    }

    return id;
}

// hashPassword
// function to hash a password
const hashPasswordRaw = async (password: string): Promise<ArrayBuffer> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    return crypto.subtle.digest('SHA-256', data);
};

export async function hashPassword(password: string): Promise<string> {
    const hashBuffer = await hashPasswordRaw(password);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// encryptCredential
// function to hash a credential with a key using AES-GCM
export async function encryptCredential(credential: string, key: string): Promise<string> {
    const hashedKeyRaw = await hashPasswordRaw(key);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyBuffer = new Uint8Array(hashedKeyRaw);
    const credentialBuffer = new TextEncoder().encode(credential);

    const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, false, ['encrypt']);

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        cryptoKey,
        credentialBuffer
    );

    return JSON.stringify({
        iv: Array.from(iv),
        encrypted: Array.from(new Uint8Array(encrypted)),
    });
}

// decryptCredential
// function to decrypt a credential with a key using AES-GCM
export async function decryptCredential(encryptedCredential: string, key: string): Promise<string> {
    const hashedKeyRaw = await hashPasswordRaw(key);

    const { iv, encrypted } = JSON.parse(encryptedCredential);
    const keyBuffer = new Uint8Array(hashedKeyRaw);
    const ivBuffer = new Uint8Array(iv);
    const encryptedBuffer = new Uint8Array(encrypted);

    const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, false, ['decrypt']);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: ivBuffer,
        },
        cryptoKey,
        encryptedBuffer
    );

    return new TextDecoder().decode(decrypted);
}
