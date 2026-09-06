import { db } from "./firebase-config.js";
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



/* ================= MOBILE MENU ================= */

function toggleMenu() {

    const menu = document.getElementById("mobileMenu");

    menu.classList.toggle("show");

}


/* ================= UPLOAD MODAL ================= */

function openUpload() {

    document.getElementById("uploadModal").classList.add("show");

}


function closeUpload() {

    document.getElementById("uploadModal").classList.remove("show");

}


/* Close modal by clicking outside */

document.getElementById("uploadModal").addEventListener("click", function(e) {

    if (e.target === this) {
        closeUpload();
    }

});


/* ================= PAPER FILTER ================= */

function filterPapers(branch, button) {

    const cards = document.querySelectorAll(".paper-card");

    const filters = document.querySelectorAll(".filter");

    filters.forEach(function(item) {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }


    cards.forEach(function(card) {

        const cardBranch = card.getAttribute("data-branch");

        if (branch === "ALL" || cardBranch === branch) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}


/* ================= BRANCH FILTER ================= */

function filterBranch(branch) {

    const papersSection = document.getElementById("papers");

    papersSection.scrollIntoView({
        behavior: "smooth"
    });


    const filters = document.querySelectorAll(".filter");

    filters.forEach(function(button) {

        button.classList.remove("active");

        if (button.textContent.trim() === branch) {
            button.classList.add("active");
        }

    });


    filterPapers(branch);
}


/* ================= SEARCH ================= */

function searchPapers() {

    const input = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const cards = document.querySelectorAll(".paper-card");

    cards.forEach(function(card) {

        const text = card.textContent.toLowerCase();

        if (text.includes(input)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });


    if (input.length > 0) {

        document
            .getElementById("papers")
            .scrollIntoView({
                behavior: "smooth"
            });

    }

}


/* ================= VIEW PAPER ================= */

function viewPaper(subject) {

    alert(
        subject +
        " paper will open here after Firebase storage is connected."
    );

}


/* ================= PAPER COUNTER ================= */

document.addEventListener("DOMContentLoaded", function() {

    const cards = document.querySelectorAll(".paper-card");

    const counter = document.getElementById("paperCount");

    let current = 0;

    const target = cards.length;

    const interval = setInterval(function() {

        current++;

        counter.textContent = current;

        if (current >= target) {

            clearInterval(interval);

        }

    }, 150);

});
async function testFirebase() {
    try {
        const docRef = await addDoc(collection(db, "test"), {
            message: "Firebase connected successfully!",
            createdAt: serverTimestamp()
        });

        console.log("Firebase connected. Document ID:", docRef.id);
    } catch (error) {
        console.error("Firebase Error:", error);
    }
}

testFirebase();


/* ================= UPLOAD PAPER TO FIRESTORE ================= */

async function submitPaper() {

    const branch = document.getElementById("branch").value;
    const semester = document.getElementById("semester").value;
    const subject = document.getElementById("subject").value;
    const ctNumber = document.getElementById("ctNumber").value;
    const year = document.getElementById("year").value;

    if (!branch || !semester || !subject || !ctNumber || !year) {
        alert("Please fill all fields.");
        return;
    }

    try {

        await addDoc(collection(db, "papers"), {

            branch: branch,
            semester: semester,
            subject: subject,
            ctNumber: ctNumber,
            year: year,

            fileUrl: "",

            status: "pending",

            uploadedAt: serverTimestamp()

        });

        alert("Paper submitted successfully! Admin approval ke baad paper visible hoga.");

        closeUpload();

    } catch (error) {

        console.error("Upload Error:", error);

        alert("Paper submit nahi hua. Console check karo.");

    }

}
window.openUpload = openUpload;
window.closeUpload = closeUpload;
window.toggleMenu = toggleMenu;
window.filterPapers = filterPapers;
window.filterBranch = filterBranch;
window.searchPapers = searchPapers;
window.viewPaper = viewPaper;
window.submitPaper = submitPaper;
