
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');

    try {
        const email = localStorage.getItem("userEmail");
        const password = localStorage.getItem("userPassword");

        if (!email || !password) {
            // If no email or password, redirect to login page
            window.location.href = '/';
            return;
        }
    
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


document.getElementById('logout-btn').addEventListener("click",() => {

    localStorage.clear();
    window.location.href = '/';
})


window.addEventListener("popstate", () => {
    localStorage.getItem("userEmail");
    localStorage.getItem("userPassword");

    if(!email || !assword) {
        window.location.href = '/';
    }
});


window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});


document.getElementById("submitButton").addEventListener("click", async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');
    const formData = new FormData(document.getElementById("myForm"));
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("/api/entry", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, ...data }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        alert("Entry saved successfully!");
       
    } catch (error) {
        console.error("Failed to save entry:", error);
        alert("Failed to save entry. Please try again.");
    }
});