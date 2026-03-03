// static/PlayQuizView.js
import { Button } from './Button.js';

// 将状态变量移出函数内部，防止每次重新渲染时产生多个相互冲突的定时器
let currentIndex = 0;
let selectedOption = null;
let userAnswers = [];
let timeLeft = 30;
let timerInterval = null;
let currentQuestionsRef = null; // 用于检测是否是全新的测验

export function PlayQuizView(questions, config, onComplete) {
  // 如果进入了新的一轮测验，重置所有的状态变量
  if (currentQuestionsRef !== questions) {
    currentQuestionsRef = questions;
    currentIndex = 0;
    userAnswers = [];
    if (timerInterval) clearInterval(timerInterval); 
  }

  const currentQuestion = questions[currentIndex];

  const startTimer = () => {
    // 每次启动定时器前，确保旧的定时器已被清理
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = 30;
    
    timerInterval = setInterval(() => {
      timeLeft--;
      
      const timerDisplay = document.getElementById('timer-display');
      const timerIcon = document.getElementById('timer-icon');
      
      if (timerDisplay) {
        timerDisplay.textContent = `00:${timeLeft.toString().padStart(2, '0')}`;
        if (timeLeft < 10) {
          timerDisplay.className = 'text-xl font-bold tabular-nums tracking-tight text-red-500';
          if (timerIcon) {
            timerIcon.className = 'material-symbols-outlined text-red-500 animate-pulse';
          }
        } else {
          timerDisplay.className = 'text-xl font-bold tabular-nums tracking-tight text-white';
          if (timerIcon) {
            timerIcon.className = 'material-symbols-outlined text-primary';
          }
        }
      }
      
      // 时间到了自动提交
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        submitAnswer(null);
      }
    }, 1000);
  };

  const submitAnswer = (answer) => {
    if (timerInterval) clearInterval(timerInterval);
    
    const isCorrect = answer === questions[currentIndex].correctAnswer;
    
    userAnswers.push({
      questionIndex: currentIndex,
      userAnswer: answer || "Time Out",
      isCorrect
    });

    if (currentIndex < questions.length - 1) {
      currentIndex++;
      selectedOption = null;
      window.quizbyApp.render(); // 渲染下一题
    } else {
      // 测验完成
      const score = userAnswers.filter(a => a.isCorrect).length * 100;
      const correctCount = userAnswers.filter(a => a.isCorrect).length;
      const streak = calculateStreak(userAnswers);
      
      // 清空引用，以便用户再次游玩时能触发重新初始化
      currentQuestionsRef = null; 
      
      onComplete({
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        streak,
        date: new Date().toISOString(),
        topic: config.topic,
        answers: userAnswers
      });
    }
  };

  const calculateStreak = (answers) => {
    let streak = 0;
    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i].isCorrect) streak++;
      else break;
    }
    return streak;
  };

  setTimeout(() => {
    startTimer();

    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        selectedOption = currentQuestion.options[idx];
        
        optionButtons.forEach(b => {
          b.className = b.className.replace(/bg-primary\/20 border-primary shadow-\[0_0_20px_rgba\(238,140,43,0\.3\)\]/, 'bg-surface border-white/10 hover:border-primary/50 hover:bg-white/5');
        });
        btn.className = btn.className.replace(/bg-surface border-white\/10 hover:border-primary\/50 hover:bg-white\/5/, 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(238,140,43,0.3)]');
        
        const confirmBtn = document.getElementById('confirm-btn');
        if (confirmBtn) {
          confirmBtn.disabled = false;
        }
      });
    });

    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (selectedOption) {
          submitAnswer(selectedOption);
        }
      });
    }
  }, 0);

  const progressWidth = ((currentIndex + 1) / questions.length) * 100;

  return `
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <div class="p-6 pb-2 border-b border-white/5 flex items-center justify-between bg-surface/50 backdrop-blur-sm relative z-20">
         <div class="flex flex-col gap-1">
            <span class="text-white/50 text-xs font-bold uppercase tracking-widest">Question ${currentIndex + 1} of ${questions.length}</span>
            <div class="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
               <div class="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style="width: ${progressWidth}%"></div>
            </div>
         </div>
         
         <div class="flex items-center gap-3 bg-uom-deep border border-white/10 px-4 py-2 rounded-full shadow-lg">
            <span id="timer-icon" class="material-symbols-outlined text-primary">timer</span>
            <div class="flex flex-col items-end leading-none">
               <span id="timer-display" class="text-xl font-bold tabular-nums tracking-tight text-white">
                  00:${timeLeft.toString().padStart(2, '0')}
               </span>
               <span class="text-[8px] text-white/50 font-bold uppercase">Seconds Left</span>
            </div>
         </div>
      </div>

      <div class="flex-1 relative flex flex-col justify-center max-w-5xl mx-auto w-full px-6 py-8">
         <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
            <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]"></div>
         </div>

         <div class="relative z-10 text-center space-y-8 mb-12">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
               <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
               Live Question
            </div>
            <h2 class="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-xl font-display">
               ${currentQuestion.question}
            </h2>
         </div>

         <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            ${currentQuestion.options.map((option, idx) => `
              <button
                class="option-btn group relative flex items-center p-6 rounded-2xl border transition-all duration-300 text-left bg-surface border-white/10 hover:border-primary/50 hover:bg-white/5"
              >
                 <div class="flex items-center justify-center w-10 h-10 rounded-lg border font-bold mr-5 transition-colors shrink-0 bg-white/5 border-white/10 text-white group-hover:border-primary group-hover:text-primary">
                    ${String.fromCharCode(65 + idx)}
                 </div>
                 <span class="text-lg font-medium text-white/90">${option}</span>
              </button>
            `).join('')}
         </div>

         <div class="relative z-10 flex justify-end mt-12">
            <button 
               id="confirm-btn"
               disabled
               class="relative inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 bg-primary text-uom-purple shadow-[0_0_15px_rgba(238,140,43,0.4)] hover:shadow-[0_0_25px_rgba(238,140,43,0.6)] hover:bg-[#ff9e3d]"
            >
               Confirm Selection
               <span class="material-symbols-outlined">arrow_forward</span>
            </button>
         </div>
      </div>
    </div>
  `;
}
