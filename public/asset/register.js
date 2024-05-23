const form = document.querySelector('form');
form.addEventListener('submit', async (event) => {
    // Prevent the form from submitting
    event.preventDefault();

    // Get the username and password from the form
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    // Send a POST request to the server with the username and password
    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const result = await response.json();

    const { id } = result;

    // Redirect to the login page
    window.location.href = `/profile.html?userId=${id}`;
});