const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testRegister() {
    try {
        const form = new FormData();
        form.append('username', 'testuser_' + Date.now());
        form.append('email', `test_${Date.now()}@example.com`);
        form.append('password', 'Password123!');
        form.append('confirmPassword', 'Password123!');
        // We need a dummy image file. Let's create one or just use a dummy buffer if possible, 
        // but form-data needs a stream or buffer with filename options.
        // Let's try sending without image first since it seems optional in mongoose model? 
        // Wait, the backend says: `profileImage: req.file ? ... : undefined`. So it is optional.
        // But the frontend sends it. Let's send a dummy buffer.
        form.append('profileImage', Buffer.from('fake image data'), { filename: 'test.jpg', contentType: 'image/jpeg' });

        const response = await axios.post('http://localhost:3000/api/user/register', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Registration Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Registration Failed:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRegister();
