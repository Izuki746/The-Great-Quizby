export function CreateQuizView(onSaveQuiz, onBack) {
  setTimeout(() => {
    const addBtn = document.getElementById("add-question-btn");
    const saveBtn = document.getElementById("save-quiz-btn");
    const backBtn = document.getElementById("back-btn");

    if (backBtn) {
      backBtn.addEventListener("click", () => onBack());
    }

    // 添加题目
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const container = document.getElementById("question-container");

        const id = Date.now(); // 唯一 ID

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

        // 删除按钮
        card.querySelector(".delete-question").addEventListener("click", () => {
          card.remove();
        });
      });
    }

    // 保存题目
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const quizName = document.getElementById("quiz-name-input").value.trim();
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
            answer: Number(correct)
          });
        });

        onSaveQuiz({
          name: quizName,
          questions: finalQuestions
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

      <h1 class="text-4xl font-bold text-white mb-6">Create Quiz (Manual)</h1>

      <input id="quiz-name-input"
        class="w-full max-w-3xl p-3 mb-4 rounded-xl bg-[#1a102b]/50 text-white"
        placeholder="Enter quiz name">

      <div id="question-container" class="w-full max-w-3xl space-y-6"></div>

      <button id="add-question-btn"
        class="mt-6 w-full max-w-3xl bg-primary text-black p-3 rounded-xl font-bold">
        + Add New Question
      </button>

      <button id="save-quiz-btn"
        class="mt-4 w-full max-w-3xl bg-green-500 text-black p-3 rounded-xl font-bold">
        Save Quiz
      </button>
    </div>
  `;
}
