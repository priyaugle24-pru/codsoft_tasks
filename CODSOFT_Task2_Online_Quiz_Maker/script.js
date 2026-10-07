let quizzes = JSON.parse(
    localStorage.getItem("quizora_quizzes") || "null"
) || [
    {
        id: 1,
        title: "General Knowledge",
        description: "Test your knowledge with a quick mixed quiz.",
        author: "Quizora",
        questions: [
            {
                q: "Which planet is known as the Red Planet?",
                options: ["Earth", "Mars", "Jupiter", "Venus"],
                answer: 1
            },
            {
                q: "How many days are there in a leap year?",
                options: ["365", "366", "364", "360"],
                answer: 1
            },
            {
                q: "Which language runs in a web browser?",
                options: ["Java", "C", "JavaScript", "Python"],
                answer: 2
            }
        ]
    },
    {
        id: 2,
        title: "Web Development Basics",
        description: "HTML, CSS and JavaScript fundamentals.",
        author: "Quizora",
        questions: [
            {
                q: "What does HTML stand for?",
                options: [
                    "Hyper Text Markup Language",
                    "High Text Machine Language",
                    "Hyperlink Text Management Language",
                    "Home Tool Markup Language"
                ],
                answer: 0
            },
            {
                q: "Which CSS property changes text color?",
                options: [
                    "font-style",
                    "color",
                    "text-style",
                    "background"
                ],
                answer: 1
            },
            {
                q: "Which symbol starts a JavaScript single-line comment?",
                options: ["<!--", "//", "##", "**"],
                answer: 1
            }
        ]
    }
];

let currentQuiz = null;
let currentIndex = 0;
let userAnswers = [];
let authMode = "login";

function save() {
    localStorage.setItem(
        "quizora_quizzes",
        JSON.stringify(quizzes)
    );
}

function showPage(id) {
    document
        .querySelectorAll(".page")
        .forEach(p => p.classList.remove("active"));

    document.getElementById(id).classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (id === "quizzes") {
        renderQuizList();
    }

    if (id === "create") {
        if (!localStorage.getItem("quizora_user")) {
            openAuth();
            return;
        }

        if (!document.querySelector(".question-builder")) {
            addQuestion();
        }
    }
}

function openAuth() {
    showPage("auth");
}

function toggleAuth() {
    authMode = authMode === "login" ? "register" : "login";

    document.getElementById("authTitle").textContent =
        authMode === "login" ? "Login" : "Create Account";

    document.getElementById("authText").textContent =
        authMode === "login"
            ? "Login to create and manage quizzes."
            : "Register for a personalized quiz experience.";

    document.getElementById("authSubmit").textContent =
        authMode === "login" ? "Login" : "Register";

    document.getElementById("authName").style.display =
        authMode === "login" ? "none" : "block";

    document.querySelector(".link-btn").textContent =
        authMode === "login"
            ? "Don't have an account? Register"
            : "Already have an account? Login";
}

document.getElementById("authForm").addEventListener("submit", e => {
    e.preventDefault();

    const email = authEmail.value.trim();
    const pass = authPassword.value;

    if (authMode === "register") {
        localStorage.setItem(
            "quizora_user",
            JSON.stringify({
                name: authName.value.trim() || "User",
                email,
                pass
            })
        );
    } else {
        const u = JSON.parse(
            localStorage.getItem("quizora_user") || "null"
        );

        if (
            !u ||
            u.email !== email ||
            u.pass !== pass
        ) {
            alert(
                "Invalid login details. Please register or check your credentials."
            );
            return;
        }
    }

    updateAuth();
    showPage("home");
});

function updateAuth() {
    const u = JSON.parse(
        localStorage.getItem("quizora_user") || "null"
    );

    authBtn.textContent = u ? "Logout" : "Login";
    authBtn.onclick = u ? logout : openAuth;
}

function logout() {
    localStorage.removeItem("quizora_user");
    updateAuth();
    showPage("home");
}

updateAuth();

let questionCount = 0;

function addQuestion(data = null) {
    questionCount++;

    const box = document.createElement("div");
    box.className = "question-builder";
    box.dataset.id = questionCount;

    const q = data?.q || "";
    const opts = data?.options || ["", "", "", ""];
    const ans = data?.answer ?? 0;

    box.innerHTML = `
        <div style="display:flex;justify-content:space-between">
            <b>Question ${questionCount}</b>
            <button type="button" class="link-btn"
                onclick="this.closest('.question-builder').remove()">
                Remove
            </button>
        </div>

        <input
            class="q-text"
            placeholder="Enter question"
            value="${escapeHtml(q)}"
            required
        >

        ${opts.map((o, i) => `
            <div class="option-row">
                <input
                    type="radio"
                    name="correct${questionCount}"
                    value="${i}"
                    ${ans === i ? "checked" : ""}
                    ${i === 0 ? "required" : ""}
                >

                <input
                    class="q-opt"
                    placeholder="Option ${i + 1}"
                    value="${escapeHtml(o)}"
                    required
                >
            </div>
        `).join("")}
    `;

    document
        .getElementById("questionList")
        .appendChild(box);
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

document.getElementById("quizForm").addEventListener("submit", e => {
    e.preventDefault();

    const boxes = [
        ...document.querySelectorAll(".question-builder")
    ];

    if (!boxes.length) {
        alert("Add at least one question.");
        return;
    }

    const questions = boxes.map(b => ({
        q: b.querySelector(".q-text").value.trim(),

        options: [
            ...b.querySelectorAll(".q-opt")
        ].map(x => x.value.trim()),

        answer: Number(
            b.querySelector(
                'input[type="radio"]:checked'
            ).value
        )
    }));

    quizzes.unshift({
        id: Date.now(),
        title: quizTitle.value.trim(),
        description:
            quizDescription.value.trim() ||
            "A new quiz created with Quizora.",

        author:
            (
                JSON.parse(
                    localStorage.getItem("quizora_user") || "{}"
                ).name || "User"
            ),

        questions
    });

    save();

    alert("Quiz published successfully!");

    e.target.reset();

    document.getElementById("questionList").innerHTML = "";

    questionCount = 0;

    showPage("quizzes");
});

function renderQuizList() {
    const term = (searchBox.value || "").toLowerCase();

    const list = quizzes.filter(x =>
        (x.title + " " + x.description)
            .toLowerCase()
            .includes(term)
    );

    quizGrid.innerHTML = list.length
        ? list.map(q => `
            <article class="quiz-card">
                <span class="badge">
                    ${q.questions.length} QUESTIONS
                </span>

                <h3>${escapeHtml(q.title)}</h3>

                <p>${escapeHtml(q.description)}</p>

                <small>
                    Created by ${escapeHtml(q.author)}
                </small>

                <button
                    class="primary"
                    onclick="startQuiz(${q.id})">
                    Take Quiz →
                </button>
            </article>
        `).join("")
        : `
            <div class="feature">
                <h3>No quizzes found</h3>
                <p>
                    Try another search or create your own quiz.
                </p>
            </div>
        `;
}

function startQuiz(id) {
    currentQuiz = quizzes.find(q => q.id === id);

    currentIndex = 0;

    userAnswers = Array(
        currentQuiz.questions.length
    ).fill(null);

    takeTitle.textContent = currentQuiz.title;
    takeDescription.textContent =
        currentQuiz.description;

    showPage("take");

    renderQuestion();
}

function renderQuestion() {
    const q = currentQuiz.questions[currentIndex];

    progressText.textContent =
        `Question ${currentIndex + 1} of ${currentQuiz.questions.length}`;

    progressBar.style.width =
        `${((currentIndex + 1) / currentQuiz.questions.length) * 100}%`;

    questionCard.innerHTML = `
        <h3>${escapeHtml(q.q)}</h3>

        ${q.options.map((o, i) => `
            <label class="option ${
                userAnswers[currentIndex] === i
                    ? "selected"
                    : ""
            }">

                <input
                    type="radio"
                    name="answer"
                    value="${i}"
                    ${
                        userAnswers[currentIndex] === i
                            ? "checked"
                            : ""
                    }
                >

                <span>${escapeHtml(o)}</span>
            </label>
        `).join("")}
    `;

    document
        .querySelectorAll(".option")
        .forEach(el =>
            el.addEventListener("click", () => {
                const input = el.querySelector("input");

                input.checked = true;

                userAnswers[currentIndex] =
                    Number(input.value);

                document
                    .querySelectorAll(".option")
                    .forEach(x =>
                        x.classList.remove("selected")
                    );

                el.classList.add("selected");
            })
        );

    prevBtn.disabled = currentIndex === 0;

    prevBtn.style.opacity =
        currentIndex === 0 ? 0.5 : 1;

    nextBtn.textContent =
        currentIndex === currentQuiz.questions.length - 1
            ? "Finish Quiz"
            : "Next";
}

function nextQuestion() {
    if (userAnswers[currentIndex] === null) {
        alert("Please select an answer.");
        return;
    }

    if (
        currentIndex <
        currentQuiz.questions.length - 1
    ) {
        currentIndex++;
        renderQuestion();
    } else {
        showResults();
    }
}

function previousQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

function showResults() {
    let score = 0;

    currentQuiz.questions.forEach((q, i) => {
        if (userAnswers[i] === q.answer) {
            score++;
        }
    });

    const pct = Math.round(
        score / currentQuiz.questions.length * 100
    );

    scoreValue.textContent = pct + "%";

    scoreFraction.textContent =
        `${score} / ${currentQuiz.questions.length} correct`;

    resultTitle.textContent =
        pct >= 80
            ? "Excellent Work!"
            : pct >= 50
                ? "Good Job!"
                : "Keep Practicing!";

    resultMessage.textContent =
        `You completed "${currentQuiz.title}". Here are your answers:`;

    answerReview.innerHTML =
        currentQuiz.questions.map((q, i) => `
            <div class="review">

                <b>
                    ${i + 1}. ${escapeHtml(q.q)}
                </b>

                <p class="${
                    userAnswers[i] === q.answer
                        ? "correct"
                        : "wrong"
                }">

                    ${
                        userAnswers[i] === q.answer
                            ? "✓ Correct"
                            : "✗ Incorrect"
                    }

                    — Your answer:
                    ${escapeHtml(
                        q.options[userAnswers[i]] ||
                        "Not answered"
                    )}
                </p>

                <p>
                    Correct answer:
                    <b>
                        ${escapeHtml(q.options[q.answer])}
                    </b>
                </p>

            </div>
        `).join("");

    showPage("results");
}

renderQuizList();
