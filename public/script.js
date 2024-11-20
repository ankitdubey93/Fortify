document.getElementById("loginForm").addEventListener("submit",async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch('/login',{
        body: JSON.stringify({email,password}),
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    })

    if (response.ok) {
        const user = await response.json();

        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword',password);
        

        window.location.href =  `/dashboard?user=${user.id}`;
    }


})






document.getElementById("showLogin").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
});

document.getElementById("showSignup").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("signupForm").style.display = "block";
    document.getElementById("loginForm").style.display = "none";
});

