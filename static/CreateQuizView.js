export function CreateQuizView(existingQuiz, onSaveQuiz, onBack) {
  setTimeout(() => {
    const addBtn = document.getElementById("add-question-btn");
    const saveBtn = document.getElementById("save-quiz-btn");
    const backBtn = document.getElementById("back-btn");

    if (backBtn) {
      backBtn.addEventListener("click", () => onBack());
    }

    // ⭐ 如果是编辑模式 → 自动填充题目
    if (existingQuiz) {
      document.getElementById("quiz-name-input").value = existingQuiz.name;

      const container = document.getElementById("question-container");

      existingQuiz.questions.forEach((q) => {
        const id = Date.now() + Math.random();

        const card = document.createElement("div");
        card.className = "glass-card p-4 rounded-xl text-white space-y-3 relative";
        card.setAttribute("data-id", id);

        card.innerHTML = `
          <button class="delete-question absolute top-3 right-3 text-red-400 hover:text-red-600">
            <span class="material-symbols-outlined">delete</span>
          </button>

          <h3 class="font-bold text-lg">Question</h3>

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                placeholder="Enter question text"
                id="q-${id}"
                value="${q.question}">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                placeholder="Option A"
                id="q-${id}-a"
                value="${q.options[0]}">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                placeholder="Option B"
                id="q-${id}-b"
                value="${q.options[1]}">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                placeholder="Option C"
                id="q-${id}-c"
                value="${q.options[2]}">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                placeholder="Option D"
                id="q-${id}-d"
                value="${q.options[3]}">

          <select id="q-${id}-correct"
                  class="w-full p-3 rounded bg-[#1a102b]/50">
            <option value="0" ${q.answer === 0 ? "selected" : ""}>Correct Answer: A</option>
            <option value="1" ${q.answer === 1 ? "selected" : ""}>Correct Answer: B</option>
            <option value="2" ${q.answer === 2 ? "selected" : ""}>Correct Answer: C</option>
            <option value="3" ${q.answer === 3 ? "selected" : ""}>Correct Answer: D</option>
          </select>
        `;

        container.appendChild(card);

        // 删除按钮
        card.querySelector(".delete-question").addEventListener("click", () => {
          card.remove();
        });
      });
    }

    // 添加题目
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const container = document.getElementById("question-container");

        const id = Date.now();

        const card = document.createElement("div");
        card.className = "glass-card p-4 rounded-xl text-white space-y-3 relative";
        card.setAttribute("data-id", id);

        card.innerHTML = `
          <button class="delete-question absolute top-3 right-3 text-red-400 hover:text-red-600">
            <span class="material-symbols-outlined">delete</span>
          </button>

          <h3 class="font-bold text-lg">Question</h3>

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                placeholder="Enter question text"
                id="q-${id}">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                placeholder="Option A"
                id="q-${id}-a">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                placeholder="Option B"
                id="q-${id}-b">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                placeholder="Option C"
                id="q-${id}-c">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                placeholder="Option D"
                id="q-${id}-d">

          <select id="q-${id}-correct"
                  class="w-full p-3 rounded bg-[#1a102b]/50">
            <option value="0">Correct Answer: A</option>
            <option value="1">Correct Answer: B</option>
            <option value="2">Correct Answer: C</option>
            <option value="3">Correct Answer: D</option>
          </select>
        `;

        container.appendChild(card);

        card.querySelector(".delete-question").addEventListener("click", () => {
          card.remove();
        });
      });
    }

    // 保存题目
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const quizName = document.getElementById("quiz-name-input").value.trim();
        const difficulty = document.getElementById("quiz-difficulty-input").value;
        const isPublic = document.getElementById("quiz-public-input").checked ? 1 : 0;
        if (!quizName) {
          alert("Please enter a quiz name.");
          return;
        }

        const container = document.getElementById("question-container");
        const cards = container.querySelectorAll("[data-id]");

        const finalQuestions = [];

        cards.forEach((card) => {
          const id = card.getAttribute("data-id");

          const qText = document.getElementById(`q-${id}`).value.trim();
          const optA = document.getElementById(`q-${id}-a`).value.trim();
          const optB = document.getElementById(`q-${id}-b`).value.trim();
          const optC = document.getElementById(`q-${id}-c`).value.trim();
          const optD = document.getElementById(`q-${id}-d`).value.trim();
          const correct = document.getElementById(`q-${id}-correct`).value;

          if (!qText || !optA || !optB || !optC || !optD) {
            alert("Please complete all fields before saving.");
            return;
          }

          finalQuestions.push({
            question: qText,
            options: [optA, optB, optC, optD],
            answer: Number(correct),
            
          });
        });
        onSaveQuiz({
          name: quizName,
          difficulty: difficulty,
          questions: finalQuestions,
          isPublic: isPublic
        });
      });
    }
  }, 0);

  return `
    <div class="flex-1 flex flex-col items-center p-6">

      <button id="back-btn"
        class="absolute top-6 left-6 px-4 py-2 rounded-lg bg-[#1a102b]/70 border border-primary/30 text-primary font-bold flex items-center gap-2 hover:bg-primary/20 transition-all">
        <span class="material-symbols-outlined">arrow_back</span>
        Back
      </button>

      <h1 class="text-4xl font-bold text-white mb-6">
        ${existingQuiz ? "Edit Quiz" : "Create Quiz (Manual)"}
      </h1>

      <input id="quiz-name-input"
        class="w-full max-w-3xl p-3 mb-4 rounded-xl bg-[#1a102b]/50 text-white"
        placeholder="Enter quiz name">
      <select id="quiz-difficulty-input" class="w-full max-w-3xl p-3 mb-4 rounded-xl bg-[#1a102b]/50 text-white">
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <div class="w-full max-w-3xl flex items-center gap-3 mb-4">
        <input type="checkbox" id="quiz-public-input" checked class="w-5 h-5">
        <label class="text-white font-bold">Make quiz public</label>
      </div>
      <div id="question-container" class="w-full max-w-3xl space-y-6"></div>

      <button id="add-question-btn"
        class="mt-6 w-full max-w-3xl bg-primary text-black p-3 rounded-xl font-bold">
        + Add New Question
      </button>

      <button id="save-quiz-btn"
        class="mt-4 w-full max-w-3xl bg-green-500 text-black p-3 rounded-xl font-bold">
        ${existingQuiz ? "Save Changes" : "Save Quiz"}
      </button>
    </div>
  `;
}
