document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault;

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
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

