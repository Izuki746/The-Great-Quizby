function logout() {
    fetch("http://127.0.0.1:5000/logout", {
        method: "POST"
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        if (data.success){
            window.location.href = "/";
        }
    });
}