import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";

export default function Grade4quiz({
  category,
  level,
  selectedLevel,
  user,
  addPointsToBackend
}) {
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const [aiExplanations, setAiExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // FETCH QUIZ
  const fetchFractionQuiz = async () => {
    try {
      setLoading(true);

      setResult(null);
      setAnswers([]);
      setSelected("");
      setStep(0);
      setAiExplanations({});

     
  const endpoint =
      category === "greenplants"
        ? "/quiz/grade4gpquiz"
        : category === "plantadaptations"
        ? "/quiz/grade4gpquiz2"
        : category === "animalbaby"
        ? "/quiz/grade4gpquiz3"
        : category === "animaladaptations"
        ? "/quiz/grade4gpquiz4"
        : category === "cesystem"
        ? "/quiz/grade4gpquiz5"
        : category === "food"
        ? "/quiz/grade4gpquiz6"
        : category === "digestion"
        ? "/quiz/grade4gpquiz7"
        : category === "clothes"
        ? "/quiz/grade4gpquiz8"
        : category === "airwaterweather"
        ? "/quiz/grade4gpquiz9"
        : category === "solarsystem"
        ? "/quiz/grade4gpquiz10"
        : category === "earthclean"
        ? "/quiz/grade4gpquiz11"
        
        : category === "soil"
        ? "/quiz/grade4gpquiz12"
        : category === "matter"
        ? "/quiz/grade4gpquiz13"
        : "/quiz/grade4gpquiz1";
      const res = await api.get(endpoint);

      setQuestions(res.data.questions || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load quiz 😢");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFractionQuiz();
  }, [selectedLevel]);

  // LOADING SCREEN
  if (loading) {
    return <p style={styles.loading}>Loading quiz... 🧠</p>;
  }

  if (!questions.length) {
    return <p style={styles.loading}>No questions found 😢</p>;
  }

  const current = questions[step];

  // NEXT QUESTION
  const handleNext = () => {
    if (!selected) {
      alert("Please select an answer 😊");
      return;
    }

    const updatedAnswers = [
      ...answers,
      {
        id: current.id,
        question: current.question,
        answer: selected
      }
    ];

    setAnswers(updatedAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
      setSelected("");
    } else {
      finishQuiz(updatedAnswers);
    }
  };

  // FINISH QUIZ
  const finishQuiz = async (finalAnswers) => {
    try {
    

   

      const response = await api.post("/quiz/checkgrade4gpquiz", {
        userId: user?._id || "demo-user",
        answers: finalAnswers
      });
      console.log("CHECK RESPONSE", response.data);
console.log("CORRECT ANSWERS", response.data.correctAnswers);

      setResult(response.data);

      if (addPointsToBackend) {
        addPointsToBackend(response.data.score);
      }
 
      // FETCH AI EXPLANATIONS
//       const explanationPromises = finalAnswers.map(async (item) => {
//         const correct = response.data.correctAnswers?.[item.id];

//         if (String(item.answer) !== String(correct)) {
//           const explainRes = await api.post("/quiz/explain2", {
//             question: item.question,
//             correctAnswer: correct,
//             userAnswer: item.answer
//           });
// console.log("item.id:", item.id);
// console.log(
//   "correct:",
//   response.data.correctAnswers?.[item.id]
// );
// console.log("user:", item.answer);
//           return {
//             id: item.id,
//             explanation: explainRes.data.explanation
//           };
//         }

//         return null;
//       });
const explanationPromises = finalAnswers.map(async (item) => {
  const correct =
    response.data.correctAnswers?.[item.id];

  if (String(item.answer) !== String(correct)) {
    const explainRes = await api.post("/quiz/explain2", {
      question: item.question,
      correctAnswer: correct,
      userAnswer: item.answer
    });
 setLoadingExplanation(true);
    return {
      id: item.id,
      explanation: explainRes.data.explanation
    };
  }

  return null;
});

      const explanationResults = await Promise.all(explanationPromises);

      const explanations = {};

      explanationResults.forEach((item) => {
        if (item) {
          explanations[item.id] = item.explanation;
        }
      });

      setAiExplanations(explanations);
    } catch (error) {
      console.error(error);
      alert("Something went wrong 😢");
    } finally {
      setLoadingExplanation(false);
    }
  };

  // RESULT SCREEN
  if (result) {
    return (
      <div style={styles.resultCard}>
        <h2 style={styles.title}>🎉 Great Job! 🎉</h2>

        <hr />

        <p style={styles.score}>
          You scored <strong>{result.score}</strong> out of{" "}
          {result.total} ⭐
        </p>

        {loadingExplanation && (
          <p style={styles.loadingExplain}>
            🤖 Generating AI explanations...
          </p>
        )}

        {answers.map((item, index) => {
          const correct = result.correctAnswers?.[item.id];

          const isCorrect =
            String(item.answer) === String(correct);

          return (
            <div
              key={item.id}
              style={{
                ...styles.reviewBox,
                borderColor: isCorrect
                  ? "#22c55e"
                  : "#ef4444"
              }}
            >
              <p style={styles.question}>
                {index + 1}. {item.question}
              </p>

              <p style={styles.answerText}>
                🧒 Your Answer:{" "}
                <span
                  style={{
                    color: isCorrect
                      ? "#16a34a"
                      : "#dc2626",
                    fontWeight: "bold"
                  }}
                >
                  {item.answer}
                </span>
              </p>

              {!isCorrect && (
                <p style={styles.answerText}>
                  ✅ Correct Answer:{" "}
                  <span
                    style={{
                      color: "#16a34a",
                      fontWeight: "bold"
                    }}
                  >
                    {correct}
                  </span>
                </p>
              )}

              <p
                style={
                  isCorrect
                    ? styles.correct
                    : styles.wrong
                }
              >
                {isCorrect
                  ? "🎈 Correct!"
                  : "💡 Try again next time!"}
              </p>

              {level === "primary" &&
                aiExplanations[item.id] && (
                  <div style={styles.explanationBox}>
                    <strong style={styles.explanationTitle}>
                      🤖 AI Explanation
                    </strong>

                    <pre style={styles.explanationText}>
                      {aiExplanations[item.id]}
                    </pre>
                  </div>
                )}
            </div>
          );
        })}

        <button
          style={styles.playAgainBtn}
          onClick={fetchFractionQuiz}
        >
          🎮 New Game
        </button>
      </div>
    );
  }

  // QUESTION SCREEN
  return (
    <div style={styles.card}>
      <h3 style={styles.step}> 
        🌈 Question {step + 1} / {questions.length}
      </h3>

      <hr />

      <br />

      <p style={styles.mainQuestion}>
        {current.question}
      </p>

      {current.options.map((opt) => (
        <label
          key={opt}
          style={{
            ...styles.option,
            border:
              selected === opt
                ? "3px solid #22c55e"
                : "2px solid #e5e7eb",
            background:
              selected === opt
                ? "#dcfce7"
                : "#ffffff"
          }}
        >
          <input
            type="radio"
            name="option"
            value={opt}
            checked={selected === opt}
            onChange={() => setSelected(opt)}
            style={styles.radio}
          />

          <span style={{ marginLeft: 12 }}>
            {opt}
          </span>
        </label>
      ))}

      <button style={styles.button} onClick={handleNext}>
        {step === questions.length - 1
          ? "🎯 Submit"
          : "➡ Next"}
      </button>
    </div>
  );
}

// STYLES
const styles = {
  loading: {
    textAlign: "center",
    fontSize: "clamp(18px, 3vw, 28px)",
    marginTop: 50,
    fontFamily:
      "'Comic Sans MS', 'Poppins', sans-serif"
  },

  card: {
    maxWidth: "1000px",

    margin: "20px auto",
    padding: "clamp(20px, 4vw, 40px)",
    borderRadius: 24,
    background: "#f0fdf4",
    boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
    fontFamily:
      "'Comic Sans MS', 'Poppins', sans-serif"
  },

  step: {
    fontSize: "clamp(10px, 3vw, 20px)",
    marginBottom: 15
  },

  mainQuestion: {
    fontSize: "clamp(20px, 4vw, 30px)",
    marginBottom: 24,
    fontWeight: "bold",
    color: "#111827"
  },

  option: {
    display: "flex",
    alignItems: "center",
    margin: "14px 0",
    fontSize: "clamp(18px, 4vw, 26px)",
    cursor: "pointer",
    padding: "16px",
    borderRadius: 16,
    transition: "0.3s"
  },

  radio: {
    width: 24,
    height: 24,
    cursor: "pointer"
  },

  button: {
    marginTop: 30,
    padding:
      "clamp(12px, 2vw, 18px) clamp(24px, 4vw, 40px)",
    borderRadius: 16,
    border: "none",
    background: "#f59e0b",
    color: "#fff",
    fontSize: "clamp(18px, 4vw, 28px)",
    cursor: "pointer",
    fontWeight: "bold"
  },

  resultCard: {
    maxWidth: "1100px",
    margin: "30px auto",
    padding: "clamp(25px, 5vw, 45px)",
    borderRadius: 28,
    background:
      "linear-gradient(90deg, #f01758ff, #f7656cff)",
    boxShadow:
      "0 0 25px rgba(228, 217, 71, 0.6)",
    fontFamily:
      "'Comic Sans MS', 'Poppins', sans-serif"
  },

  title: {
    fontSize: "clamp(28px, 5vw, 40px)",
    textAlign: "center",
    color: "#ffffff"
  },

  score: {
    fontSize: "clamp(22px, 4vw, 30px)",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 25
  },

  loadingExplain: {
    textAlign: "center",
    fontSize: 22,
    color: "#fff",
    marginBottom: 20
  },

  reviewBox: {
    background: "#ffffff",
    border: "4px solid",
    borderRadius: 22,
    padding: "clamp(18px, 4vw, 28px)",
    marginBottom: 24
  },

  question: {
    fontSize: "clamp(18px, 4vw, 28px)",
    fontWeight: "bold",
    marginBottom: 12
  },

  answerText: {
    fontSize: "clamp(16px, 3vw, 24px)",
    marginBottom: 8
  },

  correct: {
    color: "#16a34a",
    fontWeight: "bold",
    fontSize: "clamp(18px, 3vw, 24px)"
  },

  wrong: {
    color: "#ea580c",
    fontWeight: "bold",
    fontSize: "clamp(18px, 3vw, 24px)"
  },

  explanationBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    background: "#eff6ff",
    border: "2px solid #93c5fd"
  },

  explanationTitle: {
    fontSize: "clamp(18px, 3vw, 24px)"
  },

  explanationText: {
    whiteSpace: "pre-wrap",
    fontSize: "clamp(15px, 2.5vw, 20px)",
    marginTop: 10,
    fontFamily: "'Poppins', sans-serif"
  },

  playAgainBtn: {
    marginTop: 30,
    padding:
      "clamp(14px, 2vw, 20px) clamp(28px, 4vw, 46px)",
    borderRadius: 18,
    border: "none",
    background: "#22c55e",
    color: "#fff",
    fontSize: "clamp(20px, 4vw, 30px)",
    cursor: "pointer",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    fontWeight: "bold"
  }
};