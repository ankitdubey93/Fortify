

const saveNewPassword = () => {
    let account = document.getElementById('website').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    console.log(account,username,password);

}


document.addEventListener("DOMContentLoaded", async () => {
    // Extract user ID from query parameters
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user");

    if (!userId) {
        alert("User not found. Please log in.");
        window.location.href = "/";
        return;
    }

    // Fetch user details
    try {
        const response = await fetch(`/api/user/${userId}`);
        const user = await response.json();

        if (response.ok) {
            document.querySelector(".user-info-container").innerHTML = `
                <p>User: ${user.name}</p>
                <p>UserID: ${userId}</p>
            `;
        } else {
            throw new Error(user);
        }
    } catch (error) {
        console.error("Failed to fetch user details:", error);
        alert("An error occurred. Please try again.");
    }
});