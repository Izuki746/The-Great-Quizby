export function HomeView() {

  async function loadQuizzes() {
    try {
      const res = await fetch("/quizzes");
      const quizzes = await res.json();

      const list = document.getElementById("quiz-list");
      if (!list) return;

      list.innerHTML = "";

      quizzes.forEach(q => {
        const card = document.createElement("div");
        card.className = "quiz-card";

        card.innerHTML = `
          <h3>${q.title}</h3>
          <p>${q.description}</p>
          <button class="start-btn">Start Quiz</button>
        `;

        const btn = card.querySelector(".start-btn");
        btn.addEventListener("click", () => startQuiz(q.id));

        list.appendChild(card);
      });

    } catch (err) {
      console.error(err);
    }
  }


  async function startQuiz(id) {
    try {
      const res = await fetch(`/quiz/${id}`);
      const questions = await res.json();

      const container = document.getElementById("quiz-container");
      if (!container) return;

      container.innerHTML = "";

      questions.forEach(q => {

        const div = document.createElement("div");

        div.innerHTML = `
          <h4>${q.text}</h4>

          <label><input type="radio" name="q${q.id}" value="a"> ${q.options.a}</label><br>
          <label><input type="radio" name="q${q.id}" value="b"> ${q.options.b}</label><br>
          <label><input type="radio" name="q${q.id}" value="c"> ${q.options.c}</label><br>
          <label><input type="radio" name="q${q.id}" value="d"> ${q.options.d}</label><br>

          <hr>
        `;

        container.appendChild(div);
      });

    } catch (err) {
      console.error(err);
    }
  }


  // Load quizzes AFTER HTML renders
  setTimeout(() => {
    loadQuizzes();
  }, 0);


  return `
    <div class="p-6">

      <h1>Available Quizzes</h1>

      <div id="quiz-list"></div>

      <hr style="margin:30px 0">

      <div id="quiz-container"></div>

    </div>
  `;
}