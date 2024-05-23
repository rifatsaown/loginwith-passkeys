// Get the Register Passkey Button
const registerPasskeyBtn = document.getElementById('register-passkey-btn');

// Register Passkey Button Click Event
registerPasskeyBtn.addEventListener('click', async (e) => {
    const url = new URL(window.location);
    const userId = url.searchParams.get('userId');

    const response = await fetch('/register-challenge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });
    // Get the challenge result
    const challengeResult = await response.json();
    const { options } = challengeResult;

    const authenticationResult = await SimpleWebAuthnBrowser.startRegistration(options);

    const registerResponse = await fetch('/register-verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, credential: authenticationResult }),
    });
    const registerResult = await registerResponse.json();
    console.log(registerResult);

    if (registerResult.verified) {
        alert('Passkey registered successfully!');
        window.location.href = `/login.html`;
    } else {
        alert('Passkey registration failed!');
    }
});