
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');

    try {
        const email = localStorage.getItem("userEmail");
        const password = localStorage.getItem("userPassword");
    
        const verifyResponse = await fetch('/verify',{
                method: 'POST',
                body: JSON.stringify({email,password}),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (verifyResponse.status == 401) {
                throw new Error('Unauthorized');
            }
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
        if(error.message == 'Unauthorized') {
            window.location.href = '/';
        }
        console.error("Failed to fetch user details:", error);
        alert("An error occurred. Please try again.");
    }
});