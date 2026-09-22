const API_URL = "http://localhost:5000/api/auth";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

const saveUser = (user) => {
    if (!user) return;

    localStorage.setItem(
        "bloggrUser",
        JSON.stringify({
            name: user.name || "User",
            email: user.email || ""
        })
    );
};

const redirectToHome = (user) => {
    saveUser(user);
    window.location.href = "home.html";
};


// -------------------------
// REGISTER
// -------------------------

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
        document.getElementById("registerName").value;

    const email =
        document.getElementById("registerEmail").value;

    const password =
        document.getElementById("registerPassword").value;


    try {

        const response = await fetch(
            `${API_URL}/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            registerForm.reset();
            redirectToHome(data.user);
        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Could not connect to server";

    }

});


// -------------------------
// LOGIN
// -------------------------

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("loginEmail").value;

    const password =
        document.getElementById("loginPassword").value;


    try {

        const response = await fetch(
            `${API_URL}/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            loginForm.reset();
            redirectToHome(data.user);
        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Could not connect to server";

    }

});