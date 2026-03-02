export function QuizPreviewView(quiz, onBack) {
  setTimeout(() => {
    // 为每个折叠按钮添加事件
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

    // 返回按钮
    const backBtn = document.getElementById("back-btn");
    if (backBtn) backBtn.addEventListener("click", () => onBack());
  }, 0);

  return `
    <div class="flex-1 flex flex-col items-center p-6">

      <button id="back-btn"
        class="absolute top-6 left-6 px-4 py-2 rounded-lg bg-[#1a102b]/70 border border-primary/30 text-primary font-bold flex items-center gap-2 hover:bg-primary/20 transition-all">
        <span class="material-symbols-outlined">arrow_back</span>
        Back
      </button>

      <h1 class="text-4xl font-bold text-white mb-6">Quiz Preview</h1>
      <h2 class="text-2xl font-bold text-primary mb-8">${quiz.name}</h2>

      <div class="w-full max-w-3xl space-y-6">
        ${quiz.questions
          .map(
            (q, i) => `
          <div class="glass-card p-5 rounded-xl text-white">

            <!-- 顶部：题目 + 折叠按钮 -->
            <div class="flex justify-between items-center mb-3">
              <p class="font-bold text-lg">Q${i + 1}: ${q.question}</p>

              <button class="toggle-question text-primary hover:text-white"
                      data-id="${i}">
                <span class="material-symbols-outlined">expand_more</span>
              </button>
            </div>

            <!-- 折叠内容（默认隐藏） -->
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
