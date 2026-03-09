export function QuizPreviewView(quiz, onBack, onStartQuiz) {
  setTimeout(() => {

    // Add toggle event for each question
    document.querySelectorAll(".toggle-question").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const content = document.getElementById(`content-${id}`);

        if (content.classList.contains("hidden")) {
          content.classList.remove("hidden");
          btn.innerHTML = `<span class="material-symbols-outlined">expand_less</span>`;
        } else {
          content.classList.add("hidden");
          btn.innerHTML = `<span class="material-symbols-outlined">expand_more</span>`;
        }
      });
    });

    // Back button
    const backBtn = document.getElementById("back-btn");
    if (backBtn) backBtn.addEventListener("click", () => onBack());

    // ⭐ Start Quiz button
    const startBtn = document.getElementById("start-quiz-btn");
    if (startBtn) startBtn.addEventListener("click", () => onStartQuiz());

  }, 0);

  return `
    <div class="flex-1 flex flex-col items-center p-6">

      <button id="back-btn"
        class="absolute top-6 left-6 px-4 py-2 rounded-lg bg-[#1a102b]/70 border border-primary/30 text-primary font-bold flex items-center gap-2 hover:bg-primary/20 transition-all">
        <span class="material-symbols-outlined">arrow_back</span>
        Back
      </button>

      <h1 class="text-4xl font-bold text-white mb-6">Quiz Preview</h1>
      <h2 class="text-2xl font-bold text-primary mb-4">${quiz.name}</h2>

      <!-- ⭐ Start Quiz Button -->
      <button id="start-quiz-btn"
        class="mb-8 px-6 py-3 rounded-lg bg-green-500 text-black font-bold hover:bg-green-400 transition-all">
        Start Quiz
      </button>

      <div class="w-full max-w-3xl space-y-6">
        ${quiz.questions
          .map(
            (q, i) => `
          <div class="glass-card p-5 rounded-xl text-white">

            <!-- Top: question + toggle button -->
            <div class="flex justify-between items-center mb-3">
              <p class="font-bold text-lg">Q${i + 1}: ${q.question}</p>

              <button class="toggle-question text-primary hover:text-white"
                      data-id="${i}">
                <span class="material-symbols-outlined">expand_more</span>
              </button>
            </div>

            <!-- Collapsible content (hidden by default) -->
            <div id="content-${i}" class="hidden space-y-2 mt-3">

              ${q.options
                .map(
                  (opt, idx) => `
                <div class="p-2 rounded ${
                  idx === q.answer
                    ? "bg-green-600/30 text-green-300"
                    : "bg-[#1a102b]/50"
                }">
                  ${String.fromCharCode(65 + idx)}. ${opt}
                </div>
              `
                )
                .join("")}

            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}
