async function run() {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const body =
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="username"\r\n\r\n` +
        `testuser_${Date.now()}\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="email"\r\n\r\n` +
        `test_${Date.now()}@example.com\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="password"\r\n\r\n` +
        `Password123!\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="confirmPassword"\r\n\r\n` +
        `Password123!\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="profileImage"; filename="test.txt"\r\n` +
        `Content-Type: text/plain\r\n\r\n` +
        `dummy image content\r\n` +
        `--${boundary}--\r\n`;

    try {
        const res = await fetch('http://localhost:3000/api/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: body
        });

        // Attempt to parse JSON, fallback to text if fails
        const text = await res.text();
        console.log('Status:', res.status);
        try {
            const json = JSON.parse(text);
            console.log('Response:', JSON.stringify(json, null, 2));
        } catch {
            console.log('Response Text:', text);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}
run();
