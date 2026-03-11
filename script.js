// ================= HOSTEL DATA =================
const hostels = [
  {
    name: "Green Stay Hostel",
    city: "Hyderabad",
    price: 5500,
    type: "Girls",
    facilities: ["WiFi", "Food", "Laundry"],
    image: "images/hostel1.jpg"
  },
  {
    name: "Urban Nest",
    city: "Bengaluru",
    price: 6500,
    type: "Boys",
    facilities: ["WiFi", "Food"],
    image: "images/hostel2.jpg"
  },
  {
    name: "Student Haven",
    city: "Chennai",
    price: 4800,
    type: "Co-ed",
    facilities: ["Food", "Laundry"],
    image: "images/hostel3.jpg"
  }
];

// ================= LISTINGS PAGE =================
const hostelList = document.getElementById("hostelList");

function displayHostels(data) {
  if (!hostelList) return;

  hostelList.innerHTML = "";

  data.forEach(hostel => {
    hostelList.innerHTML += `
      <div class="hostel-card">
        <img src="${hostel.image}">
        <h4>${hostel.name}</h4>
        <p>📍 ${hostel.city}</p>
        <p>💰 ₹${hostel.price} / month</p>
        <p>✨ ${hostel.facilities.join(" • ")}</p>
        ${
          localStorage.getItem("loggedIn") === "true"
            ? `<button onclick="saveHostel('${hostel.name}')">❤️ Save</button>`
            : `<p style="color:red;">Login to save hostels</p>`
        }
      </div>
    `;
  });
}

if (hostelList) displayHostels(hostels);

// ================= FILTERS =================
const budgetFilter = document.getElementById("budgetFilter");
const typeFilter = document.getElementById("typeFilter");
const sortPrice = document.getElementById("sortPrice");

function filterHostels() {
  const budget = budgetFilter?.value;
  const type = typeFilter?.value;
  const facilities = [...document.querySelectorAll(".facility:checked")].map(cb => cb.value);

  const filtered = hostels.filter(h => {
    let budgetMatch = true;
    let typeMatch = true;
    let facilityMatch = facilities.every(f => h.facilities.includes(f));

    if (budget === "5000") budgetMatch = h.price < 5000;
    if (budget === "7000") budgetMatch = h.price >= 5000 && h.price <= 7000;
    if (budget === "above") budgetMatch = h.price > 7000;
    if (type && type !== "all") typeMatch = h.type === type;

    return budgetMatch && typeMatch && facilityMatch;
  });

  displayHostels(filtered);
}

budgetFilter?.addEventListener("change", filterHostels);
typeFilter?.addEventListener("change", filterHostels);
document.querySelectorAll(".facility").forEach(cb =>
  cb.addEventListener("change", filterHostels)
);

sortPrice?.addEventListener("change", () => {
  let sorted = [...hostels];
  if (sortPrice.value === "low") sorted.sort((a, b) => a.price - b.price);
  if (sortPrice.value === "high") sorted.sort((a, b) => b.price - a.price);
  displayHostels(sorted);
});

// ================= CONTACT PAGE =================
const contactForm = document.getElementById("contactForm");
const successMsg = document.getElementById("successMsg");

if (contactForm) {
  contactForm.addEventListener("submit", e => {
    e.preventDefault();
    successMsg.textContent = "Message sent successfully!";
    contactForm.reset();
  });
}

// ================= SAVE HOSTEL =================
function saveHostel(name) {
  let saved = JSON.parse(localStorage.getItem("savedHostels")) || [];
  if (!saved.includes(name)) {
    saved.push(name);
    localStorage.setItem("savedHostels", JSON.stringify(saved));
    alert("Hostel saved!");
  }
}

// ================= SIGNUP =================
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", e => {
    e.preventDefault();

    const user = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      mobile: document.getElementById("mobile").value,
      location: document.getElementById("location").value,
      password: document.getElementById("password").value
    };

    localStorage.setItem("user", JSON.stringify(user));
    alert("Signup successful! Please login.");
    window.location.href = "login.html";
  });
}

// ================= LOGIN =================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const email = loginForm.querySelector("input[type='email']").value.trim();
    const password = loginForm.querySelector("input[type='password']").value.trim();

    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (savedUser && savedUser.email === email && savedUser.password === password) {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "index.html";
    } else {
      alert("Invalid credentials");
    }
  });
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
}


// ================= NAVBAR AUTH CONTROL =================
// ================= NAVBAR AUTH CONTROL =================
document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  const loginBtn = document.querySelector(".login");
  const signupBtn = document.querySelector(".signup");
  const profileBtn = document.querySelector(".profile");
  const logoutBtn = document.querySelector(".logout");

  if (isLoggedIn) {
    // Show ONLY profile & logout
    if (loginBtn) loginBtn.style.display = "none";
    if (signupBtn) signupBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    // Show ONLY login & signup
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (signupBtn) signupBtn.style.display = "inline-block";
    if (profileBtn) profileBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});


// ================= PROFILE PAGE =================
if (window.location.pathname.includes("profile.html")) {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  }

  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileMobile").textContent = user.mobile;
    document.getElementById("profileLocation").textContent = user.location;
  }

  const saved = JSON.parse(localStorage.getItem("savedHostels")) || [];
  document.getElementById("savedCount").textContent = saved.length;
}

document.addEventListener("DOMContentLoaded", function () {

const facilityCheckboxes = document.querySelectorAll(".facility");
const hostels = document.querySelectorAll(".hostel-card");

facilityCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", filterHostels);
});

function filterHostels() {

    const selectedFacilities = [];

    facilityCheckboxes.forEach(cb => {
        if (cb.checked) {
            selectedFacilities.push(cb.value);
        }
    });

    hostels.forEach(hostel => {

        const hostelFacilities = hostel.dataset.facilities.split(",");

        const match = selectedFacilities.every(facility =>
            hostelFacilities.includes(facility)
        );

        if (selectedFacilities.length === 0 || match) {
            hostel.style.display = "block";
        } else {
            hostel.style.display = "none";
        }

    });

}

});

// ================= OPEN DETAILS PAGE =================

function openDetails(button){

const card = button.closest(".hostel-card");

const hostel = {
name: card.querySelector("h4").innerText,
city: card.dataset.city,
price: card.dataset.price,
facilities: card.dataset.facilities.split(","),
image: card.querySelector("img").src,
locationText: card.querySelector("p").innerText
};

localStorage.setItem("selectedHostel", JSON.stringify(hostel));

window.location.href = "details.html";

}

// ================= LOAD DETAILS PAGE =================

if(window.location.pathname.includes("details.html")){

const hostel = JSON.parse(localStorage.getItem("selectedHostel"));

if(hostel){

document.getElementById("hostelName").textContent = hostel.name;

document.getElementById("hostelCity").textContent = "📍 " + hostel.city;

document.getElementById("hostelPrice").textContent =
"💰 ₹" + hostel.price + " / month";

document.getElementById("hostelImage").src = hostel.image;

document.getElementById("hostelDesc").textContent =
hostel.name + " provides safe and affordable accommodation for students.";

const facilityList = document.getElementById("facilityList");

facilityList.innerHTML = "";

hostel.facilities.forEach(facility=>{
const li = document.createElement("li");
li.textContent = "✔ " + facility;
facilityList.appendChild(li);
});

document.getElementById("hostelMap").src =
"https://www.google.com/maps?q="+hostel.city+"&output=embed";

}

}

