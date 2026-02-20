// Quiz Generation Service
// Mock quiz generation (since we can't use actual API in vanilla JS demo)

export async function generateQuizQuestions(config) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock questions based on topic and difficulty
  const mockQuestions = [
    {
      question: `What is a key concept in ${config.topic}?`,
      options: [
        "Advanced implementation techniques",
        "Basic foundational principles",
        "Historical context and evolution",
        "Future trends and predictions"
      ],
      correctAnswer: "Basic foundational principles",
      explanation: "Understanding foundational principles is crucial for mastery."
    },
    {
      question: `How does ${config.topic} apply in real-world scenarios?`,
      options: [
        "Through practical applications",
        "Only in theoretical contexts",
        "Via experimental methods",
        "Exclusively in academic settings"
      ],
      correctAnswer: "Through practical applications",
      explanation: "Real-world application demonstrates practical value."
    },
    {
      question: `What challenge is commonly associated with ${config.topic}?`,
      options: [
        "Complexity and scalability",
        "Lack of research",
        "Too much simplicity",
        "Excessive documentation"
      ],
      correctAnswer: "Complexity and scalability",
      explanation: "Managing complexity is a common challenge in most technical fields."
    },
    {
      question: `Which approach is most effective for learning ${config.topic}?`,
      options: [
        "Hands-on practice",
        "Reading only",
        "Ignoring fundamentals",
        "Memorization without understanding"
      ],
      correctAnswer: "Hands-on practice",
      explanation: "Practical experience reinforces theoretical knowledge."
    },
    {
      question: `What distinguishes ${config.difficulty} level understanding of ${config.topic}?`,
      options: [
        "Deep theoretical knowledge",
        "Surface-level awareness",
        "Complete ignorance",
        "Only practical skills"
      ],
      correctAnswer: "Deep theoretical knowledge",
      explanation: `${config.difficulty} level requires comprehensive understanding.`
    }
  ];

  return mockQuestions.slice(0, config.questionCount);
}
