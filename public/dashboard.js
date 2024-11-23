
const displayTable = (userData) => {
let tbody = document.getElementById('formDataTable').getElementsByTagName('tbody')[0];

tbody.innerHTML = '';
const data = userData.data;
console.log(data);
const finalDataArray = data.sort((a, b) => {
  if (a.account < b.account) { return -1; }
  else if (a.account > b.account) { return 1; }
  else return 0;
});
finalDataArray.forEach(function (data) {
  let row = tbody.insertRow();
  let c1 = row.insertCell(0);
  let c2 = row.insertCell(1);
  let c3 = row.insertCell(2);
  let c4 = row.insertCell(3);
  let c5 = row.insertCell(4);


  c1.textContent = data.website;
  c2.textContent = data.username;
  c3.textContent = data.password;
  c4.textContent = data.notes;


  let editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', function () {
      handleEditButton(data);
    });
    
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
      handleDeleteButton(data);

    });
    c4.appendChild(editButton);
    c5.appendChild(deleteButton);
});             

};


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
        console.log(user);

        if (response.ok) {
            document.querySelector(".user-info-container").innerHTML = `
                <p>User: ${user.name}</p>
                <p>UserID: ${userId}</p>
            `;
            displayTable(user);
           
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

        window.location.reload('/')
        
       
    } catch (error) {
        console.error("Failed to save entry:", error);
        alert("Failed to save entry. Please try again.");
    }
});

