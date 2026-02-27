
function login(){
    
    const username = document.getElementById('auth-form').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById("message");

    fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);

        if (data.success) {
            window.location.href = "/home";
        } else {
            message.style.color = "red";
            message.textContent = data.error || "Login failed";
        }
    });
}
var input=document.getElementById('username');
input.addEventListener('keypress', function(login){
    if (login.key==='Enter'){
        login.preventDefault();
        document.getElementById('login-button').click();
    }
});

function signup() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    message.textContent = "";

    fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            message.style.color = "green";
            message.textContent = "Signup successful!";
        } else {
            message.style.color = "red";
            message.textContent = data.error;
        }
    });
}




