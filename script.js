/* =========================================================
   COLLEGE CT PAPERS
   Firebase + Firestore
   script.js
========================================================= */

import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   GLOBAL DATA
========================================================= */

let allPapers = [];


/* =========================================================
   MOBILE MENU
========================================================= */

function toggleMenu() {

    const menu = document.getElementById("mobileMenu");

    if (!menu) return;

    menu.classList.toggle("show");
}


/* =========================================================
   UPLOAD MODAL
========================================================= */

function openUpload() {

    const modal = document.getElementById("uploadModal");

    if (!modal) return;

    modal.classList.add("show");

    document.body.style.overflow = "hidden";
}


function closeUpload() {

    const modal = document.getElementById("uploadModal");

    if (!modal) return;

    modal.classList.remove("show");

    document.body.style.overflow = "";
}


/* Close modal when clicking outside */

document.addEventListener("click", function (event) {

    const modal = document.getElementById("uploadModal");

    if (!modal) return;

    if (event.target === modal) {

        closeUpload();

    }

});


/* Close modal using ESC */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeUpload();

    }

});


/* =========================================================
   UPLOAD PAPER
========================================================= */

async function submitPaper() {

    const branchElement = document.getElementById("branch");
    const semesterElement = document.getElementById("semester");
    const subjectElement = document.getElementById("subject");
    const ctNumberElement = document.getElementById("ctNumber");
    const yearElement = document.getElementById("year");
    const fileElement = document.getElementById("paperFile");


    if (
        !branchElement ||
        !semesterElement ||
        !subjectElement ||
        !ctNumberElement ||
        !yearElement ||
        !fileElement
    ) {

        alert("Upload form properly load nahi hua.");

        return;
    }


    const branch = branchElement.value.trim();
    const semester = semesterElement.value.trim();
    const subject = subjectElement.value.trim();
    const ctNumber = ctNumberElement.value.trim();
    const year = yearElement.value.trim();
    const file = fileElement.files[0];


    /* =====================================================
       VALIDATION
    ====================================================== */

    if (
        !branch ||
        !semester ||
        !subject ||
        !ctNumber ||
        !year ||
        !file
    ) {

        alert("Please fill all fields and select the PDF.");

        return;
    }


    /* Only PDF */

    const fileName = file.name.toLowerCase();

    if (
        file.type !== "application/pdf" &&
        !fileName.endsWith(".pdf")
    ) {

        alert("Sirf PDF file upload karein.");

        return;
    }


    /* File size check */

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {

        alert("PDF size 10 MB se kam honi chahiye.");

        return;
    }


    /* =====================================================
       BUTTON
    ====================================================== */

    const submitButton =
        document.querySelector(".modal-btn");

    const originalButtonHTML =
        submitButton ? submitButton.innerHTML : "";


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.innerHTML = `
            <span>Submitting...</span>
            <span>⏳</span>
        `;

    }


    /* =====================================================
       FIRESTORE
    ====================================================== */

    try {

        await addDoc(collection(db, "papers"), {

            branch: branch,

            semester: semester,

            subject: subject,

            ctNumber: ctNumber,

            year: Number(year),

            fileName: file.name,

            fileUrl: "",

            status: "pending",

            uploadedAt: serverTimestamp()

        });


        alert(
            "Paper submitted successfully!\n\n" +
            "Admin approval ke baad paper students ko visible hoga."
        );


        /* Reset form */

        const form =
            document.getElementById("uploadForm");

        if (form) {

            form.reset();

        }


        /* Close modal */

        closeUpload();


    } catch (error) {

        console.error(
            "Paper Upload Error:",
            error
        );

        alert(
            "Paper submit nahi hua.\n\n" +
            "Console me error check karein."
        );

    } finally {

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.innerHTML =
                originalButtonHTML;

        }

    }

}


/* =========================================================
   LOAD APPROVED PAPERS
========================================================= */

function loadApprovedPapers() {

    const papersGrid =
        document.getElementById("papersGrid");

    if (!papersGrid) return;


    /*
       Only approved papers will be loaded.
    */

    const papersQuery = query(

        collection(db, "papers"),

        where("status", "==", "approved"),

        orderBy("uploadedAt", "desc")

    );


    onSnapshot(

        papersQuery,

        function (snapshot) {

            allPapers = [];


            snapshot.forEach(function (doc) {

                allPapers.push({

                    id: doc.id,

                    ...doc.data()

                });

            });


            renderPapers(allPapers);

        },


        function (error) {

            console.error(
                "Firestore Papers Error:",
                error
            );


            /*
               If index/orderBy issue occurs,
               try without orderBy.
            */

            loadApprovedPapersWithoutOrder();

        }

    );

}


/* =========================================================
   FALLBACK QUERY
========================================================= */

function loadApprovedPapersWithoutOrder() {

    const papersGrid =
        document.getElementById("papersGrid");

    if (!papersGrid) return;


    const papersQuery = query(

        collection(db, "papers"),

        where("status", "==", "approved")

    );


    onSnapshot(

        papersQuery,

        function (snapshot) {

            allPapers = [];


            snapshot.forEach(function (doc) {

                allPapers.push({

                    id: doc.id,

                    ...doc.data()

                });

            });


            /*
               Newest first if uploadedAt exists
            */

            allPapers.sort(function (a, b) {

                const aTime =
                    a.uploadedAt?.seconds || 0;

                const bTime =
                    b.uploadedAt?.seconds || 0;

                return bTime - aTime;

            });


            renderPapers(allPapers);

        },


        function (error) {

            console.error(
                "Fallback Firestore Error:",
                error
            );

            showPaperError();

        }

    );

}


/* =========================================================
   RENDER PAPERS
========================================================= */

function renderPapers(papers) {

    const papersGrid =
        document.getElementById("papersGrid");

    const emptyPapers =
        document.getElementById("emptyPapers");

    const paperCount =
        document.getElementById("paperCount");


    if (!papersGrid) return;


    /*
       Clear existing demo cards.
    */

    papersGrid.innerHTML = "";


    /*
       Update counter.
    */

    if (paperCount) {

        paperCount.textContent =
            papers.length;

    }


    /*
       No papers
    */

    if (papers.length === 0) {

        if (emptyPapers) {

            emptyPapers.style.display =
                "block";

        }

        return;

    }


    if (emptyPapers) {

        emptyPapers.style.display =
            "none";

    }


    /*
       Create cards
    */

    papers.forEach(function (paper) {

        const card =
            createPaperCard(paper);

        papersGrid.appendChild(card);

    });

}


/* =========================================================
   CREATE PAPER CARD
========================================================= */

function createPaperCard(paper) {

    const card =
        document.createElement("div");

    card.className = "paper-card";


    card.setAttribute(
        "data-branch",
        paper.branch || ""
    );


    const branch =
        escapeHTML(paper.branch || "N/A");

    const semester =
        formatSemester(paper.semester);

    const subject =
        escapeHTML(paper.subject || "Unknown Subject");

    const ctNumber =
        escapeHTML(paper.ctNumber || "");

    const year =
        escapeHTML(String(paper.year || ""));


    card.innerHTML = `

        <div class="paper-header">

            <div class="file-icon">
                PDF
            </div>

            <span class="approved">
                ✓ APPROVED
            </span>

        </div>


        <div class="paper-branch">
            ${branch} • ${semester}
        </div>


        <h3>
            ${subject}
        </h3>


        <p>
            ${ctNumber} • ${year}
        </p>


        <div class="paper-footer">

            <span>
                Previous CT Paper
            </span>

            ${
                paper.fileUrl
                ?
                `
                <button
                    onclick="viewPDF('${escapeAttribute(paper.fileUrl)}')">
                    View →
                </button>
                `
                :
                `
                <button
                    onclick="paperUnavailable()">
                    View →
                </button>
                `
            }

        </div>

    `;


    return card;

}


/* =========================================================
   VIEW PDF
========================================================= */

function viewPDF(url) {

    if (!url) {

        alert(
            "Is paper ki PDF abhi available nahi hai."
        );

        return;

    }


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   PAPER UNAVAILABLE
========================================================= */

function paperUnavailable() {

    alert(
        "Paper approved hai, lekin PDF file abhi storage me available nahi hai."
    );

}


/* =========================================================
   SEARCH PAPERS
========================================================= */

function searchPapers() {

    const input =
        document.getElementById("searchInput");


    if (!input) return;


    const searchText =
        input.value
            .toLowerCase()
            .trim();


    if (!searchText) {

        renderPapers(allPapers);

        return;

    }


    const filtered =
        allPapers.filter(function (paper) {

            const searchableText = `

                ${paper.branch || ""}

                ${paper.semester || ""}

                ${paper.subject || ""}

                ${paper.ctNumber || ""}

                ${paper.year || ""}

                ${paper.fileName || ""}

            `.toLowerCase();


            return searchableText.includes(
                searchText
            );

        });


    renderPapers(filtered);

}


/* =========================================================
   BRANCH FILTER
========================================================= */

function filterPapers(branch, button) {

    /*
       Update active button
    */

    const filters =
        document.querySelectorAll(".filter");


    filters.forEach(function (item) {

        item.classList.remove("active");

    });


    if (button) {

        button.classList.add("active");

    }


    /*
       All
    */

    if (branch === "ALL") {

        renderPapers(allPapers);

        return;

    }


    /*
       Branch filter
    */

    const filtered =
        allPapers.filter(function (paper) {

            return paper.branch === branch;

        });


    renderPapers(filtered);

}


/* =========================================================
   BRANCH SHORTCUT
========================================================= */

function filterBranch(branch) {

    const papersSection =
        document.getElementById("papers");


    if (papersSection) {

        papersSection.scrollIntoView({
            behavior: "smooth"
        });

    }


    const filters =
        document.querySelectorAll(".filter");


    filters.forEach(function (button) {

        button.classList.remove("active");


        if (
            button.textContent
                .trim()
                .toUpperCase() === branch
        ) {

            button.classList.add("active");

        }

    });


    filterPapers(branch);

}


/* =========================================================
   FORMAT SEMESTER
========================================================= */

function formatSemester(value) {

    const semester =
        String(value || "");

    const map = {

        "1": "1st Semester",
        "2": "2nd Semester",
        "3": "3rd Semester",
        "4": "4th Semester",
        "5": "5th Semester",
        "6": "6th Semester",
        "7": "7th Semester",
        "8": "8th Semester"

    };


    return map[semester] || semester;

}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   ATTRIBUTE SECURITY
========================================================= */

function escapeAttribute(value) {

    return String(value)

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'")

        .replace(/"/g, "&quot;");

}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function showPaperError() {

    const papersGrid =
        document.getElementById("papersGrid");


    if (!papersGrid) return;


    papersGrid.innerHTML = `

        <div style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 50px 20px;
            background: white;
            border: 1px solid #e5eaf2;
            border-radius: 15px;
        ">

            <div style="
                font-size: 35px;
                margin-bottom: 10px;
            ">
                ⚠️
            </div>

            <h3>
                Papers could not be loaded
            </h3>

            <p style="
                color: #667085;
                font-size: 12px;
                margin-top: 5px;
            ">
                Please try again later.
            </p>

        </div>

    `;

}


/* =========================================================
   EXPOSE FUNCTIONS TO HTML
========================================================= */

window.toggleMenu =
    toggleMenu;

window.openUpload =
    openUpload;

window.closeUpload =
    closeUpload;

window.submitPaper =
    submitPaper;

window.searchPapers =
    searchPapers;

window.filterPapers =
    filterPapers;

window.filterBranch =
    filterBranch;

window.viewPDF =
    viewPDF;

window.paperUnavailable =
    paperUnavailable;


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           Load approved papers
        */

        loadApprovedPapers();

    }
);
