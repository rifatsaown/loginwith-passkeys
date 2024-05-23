const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (event) => {
    // Prevent the form from submitting
    event.preventDefault();

    // Get the username from the form
    const username = document.querySelector('#username').value;

    // Send a POST request to the server with the username
    const response = await fetch('/login-challenge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    });
    // Get the challenge result
    const challengeResult = await response.json();
    console.log(challengeResult);
    if (challengeResult.error) {
        document.getElementById('login-info').innerText = 'Login failed - User not found!';
        return;
    }

    const { options } = challengeResult;

    const authenticationResult = await SimpleWebAuthnBrowser.startAuthentication(options);
    console.log(authenticationResult);

    const loginResponse = await fetch('/login-verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, credential: authenticationResult }),
    });
    const loginResult = await loginResponse.json();
    console.log(loginResult);

    if (loginResult.success) {
        document.getElementById('login-info').innerText = 'Login successful!';
        alert('Login successful!');
    } else {
        document.getElementById('login-info').innerText = 'Login failed!';
        alert('Login failed!');
    }
});