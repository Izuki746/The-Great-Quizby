// Create Quiz View
import { Button } from './Button.js';
import { generateQuizQuestions } from './quizService.js';

export function CreateQuizView(onQuestionsGenerated, onBack) {
  let isLoading = false;
  let topic = '';
  let difficulty = 'Undergrad';

  setTimeout(() => {
    const topicInput = document.getElementById('quiz-topic');
    const generateBtn = document.getElementById('generate-btn');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const backBtn = document.getElementById('back-btn');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        onBack();
      });
    }

    if (topicInput) {
      topicInput.addEventListener('input', (e) => {
        topic = e.target.value;
        if (generateBtn) {
          generateBtn.disabled = !topic;
        }
      });
    }

difficultyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    difficulty = btn.dataset.level;

    // Reset all buttons
    difficultyBtns.forEach(b => {
      b.classList.remove(
        'border-primary',
        'bg-primary/20',
        'text-primary'
      );
      b.classList.add(
        'border-primary/20',
        'bg-[#1a102b]/50',
        'text-slate-500',
        'hover:text-slate-300',
        'hover:border-primary/40'
      );
    });

    // Activate selected button
    btn.classList.remove(
      'border-primary/20',
      'bg-[#1a102b]/50',
      'text-slate-500',
      'hover:text-slate-300',
      'hover:border-primary/40'
    );
    btn.classList.add(
      'border-primary',
      'bg-primary/20',
      'text-primary'
    );
  });
});


    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        if (!topic || isLoading) return;
        
        isLoading = true;
        generateBtn.disabled = true;
        generateBtn.innerHTML = `
          <span class="material-symbols-outlined animate-spin">progress_activity</span>
          GENERATING...
        `;

        try {
          const config = { topic, difficulty, questionCount: 5 };
          const questions = await generateQuizQuestions(config);
          onQuestionsGenerated(questions, config);
        } catch (e) {
          console.error(e);
          alert("Error generating quiz. Please try again.");
          isLoading = false;
          generateBtn.disabled = false;
          generateBtn.innerHTML = `
            <span class="material-symbols-outlined">rocket_launch</span>
            INITIALIZE NEURAL GENERATION
          `;
        }
      });
    }
  }, 0);

  return `
    <div class="flex-1 flex flex-col items-center justify-center p-4">

      <!-- Back Button -->
      <button 
        id="back-btn"
        class="absolute top-6 left-6 px-4 py-2 rounded-lg bg-[#1a102b]/70 border border-primary/30 text-primary font-bold flex items-center gap-2 hover:bg-primary/20 transition-all"
      >
        <span class="material-symbols-outlined">arrow_back</span>
        Back
      </button>

      <div class="w-full max-w-4xl flex flex-col gap-8 animate-fade-in">
         <!-- Header -->
         <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
            <div class="flex flex-col gap-2">
               <div class="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                  <span class="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#ee8c2b] animate-pulse"></span>
                  University of Manchester Module
               </div>
               <h1 class="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white font-display">
                  Create Your Quiz
               </h1>
               <p class="text-slate-400 text-base max-w-lg font-medium">
                  Establish the framework for your academic assessment. Define parameters and input protocols.
               </p>
            </div>
            <div class="flex gap-2">
               <span class="px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest">
                  Live Generator
               </span>
            </div>
         </div>

         <!-- Configuration Card -->
         <div class="glass-card rounded-xl p-6 md:p-8">
            <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
               <span class="material-symbols-outlined text-primary">settings_input_component</span>
               Quiz Configuration
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div class="md:col-span-2 space-y-2">
                  <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">Quiz Topic</span>
                  <input 
                    type="text" 
                    id="quiz-topic"
                    placeholder="e.g., Quantum Computing: Entanglement Principles"
                    class="w-full bg-[#1a102b]/50 border border-primary/20 text-white rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-600"
                  />
               </div>

               <div class="space-y-2">
                  <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">Difficulty Level</span>
                  <div class="flex gap-2 h-[54px]">
                     <button
                        data-level="Undergrad"
                        class="difficulty-btn flex-1 rounded-lg border border-primary bg-primary/20 text-primary font-bold text-xs uppercase tracking-tight transition-all"
                     >
                        Undergrad
                     </button>
                     <button
                        data-level="Postgrad"
                        class="difficulty-btn flex-1 rounded-lg border border-primary/20 bg-[#1a102b]/50 text-slate-500 hover:text-slate-300 hover:border-primary/40 font-bold text-xs uppercase tracking-tight transition-all"
                     >
                        Postgrad
                     </button>
                     <button
                        data-level="Research"
                        class="difficulty-btn flex-1 rounded-lg border border-primary/20 bg-[#1a102b]/50 text-slate-500 hover:text-slate-300 hover:border-primary/40 font-bold text-xs uppercase tracking-tight transition-all"
                     >
                        Research
                     </button>
                  </div>
               </div>

               <div class="space-y-2">
                  <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">Model</span>
                  <div class="flex items-center h-[54px] bg-[#1a102b]/50 border border-primary/20 rounded-lg px-4 text-slate-400 text-sm">
                     <span class="material-symbols-outlined mr-2 text-primary">smart_toy</span>
                     Gemini 3 Flash Preview
                  </div>
               </div>
            </div>
         </div>

         <!-- Action Bar -->
         <div class="flex justify-end pt-4">
             <button 
               id="generate-btn"
               disabled
               class="relative inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 bg-primary text-uom-purple shadow-[0_0_15px_rgba(238,140,43,0.4)] hover:shadow-[0_0_25px_rgba(238,140,43,0.6)] hover:bg-[#ff9e3d]"
             >
                <span class="material-symbols-outlined">rocket_launch</span>
                INITIALIZE NEURAL GENERATION
             </button>
         </div>
      </div>
    </div>
  `;
}
