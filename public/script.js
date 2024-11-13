document.getElementById("showLogin").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
});

document.getElementById("showSignup").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("signupForm").style.display = "block";
    document.getElementById("loginForm").style.display = "none";
});