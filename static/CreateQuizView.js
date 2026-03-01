export function CreateQuizView(onSaveQuiz, onBack) {
  let questions = [];

  setTimeout(() => {
    const addBtn = document.getElementById("add-question-btn");
    const saveBtn = document.getElementById("save-quiz-btn");
    const backBtn = document.getElementById("back-btn");

    if (backBtn) {
      backBtn.addEventListener("click", () => onBack());
    }

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const container = document.getElementById("question-container");

        const index = questions.length;

        const card = document.createElement("div");
        card.className = "glass-card p-4 rounded-xl text-white space-y-3";
        card.innerHTML = `
          <h3 class="font-bold text-lg">Question ${index + 1}</h3>

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                 placeholder="Enter question text"
                 id="q-${index}">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                 placeholder="Option A"
                 id="q-${index}-a">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                 placeholder="Option B"
                 id="q-${index}-b">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                 placeholder="Option C"
                 id="q-${index}-c">

          <input class="w-full p-3 rounded bg-[#1a102b]/50"
                 placeholder="Option D"
                 id="q-${index}-d">

          <select id="q-${index}-correct"
                  class="w-full p-3 rounded bg-[#1a102b]/50">
            <option value="0">Correct Answer: A</option>
            <option value="1">Correct Answer: B</option>
            <option value="2">Correct Answer: C</option>
            <option value="3">Correct Answer: D</option>
          </select>
        `;

        container.appendChild(card);

        questions.push({}); // 占位，保存数量
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const finalQuestions = [];

        for (let i = 0; i < questions.length; i++) {
          const qText = document.getElementById(`q-${i}`).value.trim();
          const optA = document.getElementById(`q-${i}-a`).value.trim();
          const optB = document.getElementById(`q-${i}-b`).value.trim();
          const optC = document.getElementById(`q-${i}-c`).value.trim();
          const optD = document.getElementById(`q-${i}-d`).value.trim();
          const correct = document.getElementById(`q-${i}-correct`).value;

          if (!qText || !optA || !optB || !optC || !optD) {
            alert(`Question ${i + 1} is incomplete.`);
            return;
          }

          finalQuestions.push({
            question: qText,
            options: [optA, optB, optC, optD],
            answer: Number(correct)
          });
        }

        onSaveQuiz(finalQuestions);
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
