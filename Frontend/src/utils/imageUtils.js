export const arrayBufferToBase64 = (buffer) => {
    if (!buffer) return "";
    // If it's already a string, assume it's base64
    if (typeof buffer === "string") return buffer;

    // If it's a buffer object from MongoDB/Mongoose (often has a 'data' array)
    if (buffer.type === "Buffer" && Array.isArray(buffer.data)) {
        buffer = buffer.data;
    }

    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};
