import { useEffect, useState, useRef } from "react";
import { Card, Input, Button, Typography, message } from "antd";
import api from "../api/axiosClient";

const { Title, Text } = Typography;

const Placevalue = ({ selectedLevel , addPointsToBackend }) => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
    const [aiExplanations, setAiExplanations] = useState({});
    const [loadingExplanation, setLoadingExplanation] = useState(false);

  const inputRef = useRef(null);

  /* ---------- Fetch Questions ---------- */
  const fetchQuestions = async () => {
    setSubmitted(false);
    setResult(null);
    setAnswers({});
    setSelected("");
    setCurrent(0);
// ["Indian Place Value", "Number Formation","Expanded Form", "Standard Form","Rounding Off", "International Place Value", "Roman Numerals"]
    const endpoint =
      selectedLevel === "Indian Place Value"
        ? "/quiz/placevalue"
        : selectedLevel === "Number Formation"
        ? "/quiz/placevalue2"
       
        : selectedLevel === "Expanded Form"
        ? "/quiz/placevalue3"
        : selectedLevel === "Standard Form"
        ? "/quiz/placevalue4"
         : selectedLevel === "Rounding Off"
        ? "/quiz/placevalue5"
        : selectedLevel === "International Place Value"
        ? "/quiz/placevalue6"
        : "/quiz/placevalue7";

    const res = await api.get(endpoint);
    setQuestions(res.data.questions);
console.log(res.data.questions);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (!questions.length) return <Card loading />;

  const currentQuestion = questions[current];

  /* ---------- Next Question ---------- */
  const nextQuestion = () => {
    if (!selected.trim()) {
      message.warning("Please enter an answer");
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selected.trim(),
    }));

    setSelected("");
    setCurrent((prev) => prev + 1);

    setTimeout(() => inputRef.current?.focus(), 150);
  };

  /* ---------- Submit Quiz ---------- */
  const submitQuiz = async () => {
    if (!selected.trim()) {
      message.warning("Please enter an answer");
      return;
    }

    const finalAnswers = {
      ...answers,
      [currentQuestion.id]: selected.trim(),
    };

    // ✅ FIX: save last answer into state
    setAnswers(finalAnswers);

    setLoading(true);

    try {
      const payload = {
        answers: Object.entries(finalAnswers).map(([id, answer]) => ({
          id,
          answer,
        })),
      };
      
// ["Indian Place Value", "Number Formation","Expanded Form", "Rounding Off", "International Place Value", "Roman Numerals"]
        const endpoint =
      selectedLevel === "Indian Place Value"
        ? "/quiz/checkplacevalue"
        : selectedLevel === "Number Formation"
        ? "/quiz/checkplacevalue2"
        : selectedLevel === "Expanded Form"
        ? "/quiz/checkplacevalue3"
        : selectedLevel === "Standard Form"
        ? "/quiz/checkplacevalue4"
         : selectedLevel === "Rounding Off"
        ? "/quiz/checkplacevalue5"
        : selectedLevel === "International Place Value"
        ? "/quiz/checkplacevalue6"
        : "/quiz/checkplacevalue7"

  

      const res = await api.post(endpoint, payload);

      setResult(res.data);
      setSubmitted(true);
      addPointsToBackend?.(res.data.score);

      message.success(`Score: ${res.data.score}`);
      const explanations = {};



for (const q of questions) {
  const userAnswer = finalAnswers[q.id];
  const correct = res.data.correctAnswers?.[q.id];

  if (

    normalize(userAnswer) !== normalize(correct)
  ) {
    const explainRes = await api.post("/quiz/explain2", {
      question: q.question,
      correctAnswer: correct,
      userAnswer,
    });

    explanations[q.id] = explainRes.data.explanation;
  }
}

setAiExplanations(explanations);

    } catch (err) {
      message.error("Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Helpers ---------- */
const normalizeRoman = (str) =>
  String(str || "")
    .toUpperCase()
    .replace(/[^IVXLCDM]/g, "")
    .trim();

const normalize = (value) => {
  if (!value) return "";

  // 🟣 Roman Numerals
  if (selectedLevel === "Roman Numerals") {
    return normalizeRoman(value);
  }

  // 🟡 Word-based (international)
  if (selectedLevel === "International Place Value") {
    return String(value)
      .toLowerCase()
      .replace(/-/g, " ")
      .replace(/\band\b/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // 🟢 Expanded Form (IMPORTANT FIX)
  if (selectedLevel === "Expanded Form") {
    return String(value)
      .replace(/\s+/g, "")   // remove spaces
      .replace(/\+/g, "+")   // keep structure clean
      .trim();
  }

  // 🔵 Numbers
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

// const normalize = (value) => {
//   // 🟣 Roman Numerals
//   if (selectedLevel === "Roman Numerals") {
//     return normalizeRoman(value);
//   }

//   // 🟡 Word-based (international)
//   if (selectedLevel === "International Place Value") {
//     if (!value) return "";

//     return String(value)
//       .toLowerCase()
//       .replace(/-/g, " ")
//       .replace(/\band\b/g, "")
//       .replace(/[^a-z0-9\s]/g, "")
//       .replace(/\s+/g, " ")
//       .trim();
//   }

//   // 🔵 Numbers
//   if (value === undefined || value === null || value === "") return null;

//   const num = Number(value);
//   return Number.isNaN(num) ? null : num;
// };
  /* ---------- UI ---------- */
  return (
    <div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
      <Card
        style={{
          width: "100%",
          maxWidth: 650,
          borderRadius: 20,
          background: "linear-gradient(135deg, #a9b1f3ff, #8a1043ff)",
          boxShadow: "0 8px 20px rgba(100, 7, 46, 0.25)",
          padding: 20,
        }}
      >
        <Title
          level={3}
          style={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}
        >
          💰 Place Value Quiz 
        </Title>

        <hr />

        {!submitted ? (
          <>
            <Text strong style={{ fontSize: "1.4rem", display: "block" }}>
              Q{current + 1}. 👉 {currentQuestion.question}
            </Text>

            <Input
              ref={inputRef}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              placeholder="Enter answer"
              style={{
                marginTop: 20,
                fontSize: "1.4rem",
                textAlign: "center",
              }}
            />

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#ec0a7bff",
                  maxWidth: 140,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
                onClick={
                  current < questions.length - 1
                    ? nextQuestion
                    : submitQuiz
                }
                loading={loading}
              >
                {current < questions.length - 1 ? "Next" : "Submit"}
              </Button>
            </div>
          </>
        ) : (
          <>
            {questions.map((q, i) => {
              const user = answers[q.id];
              const correct = result.correctAnswers[q.id];

      const userNorm = normalize(user);
const correctNorm = normalize(correct);

              const isCorrect =
              selectedLevel==="Expanded Form" ?
  normalize(user) === normalize(correct) :

 


  userNorm !== null &&
  correctNorm !== null &&
  userNorm === correctNorm;

              return (
                <Card
                  key={q.id}
                  style={{
                    marginBottom: 12,
                    border: isCorrect
                      ? "3px solid #22c55e"
                      : "3px solid #ef4444",
                    background: isCorrect ? "#dcfce7" : "#fee2e2",
                  }}
                >
                    <hr style={{ marginBottom: 12 }} />
{selectedLevel!==2 &&
aiExplanations[q.id] && (
  <div style={{ marginTop: 10 }}>
    <strong>🤖 Explanation</strong><br></br>
    <pre>{aiExplanations[q.id]}</pre>
  </div>
)}
                  <Text strong>
                    Q{i + 1}. {q.question}
                  </Text>
                  <Text >💬 Your Answer: ₹ {user}</Text>
                  <Text strong>
                    ✅ Correct Answer: ₹ {correct}
                  </Text>
                </Card>
              );
            })}

            <Title level={4} style={{ marginTop: 10 }}>
              🎯 Final Score: {result.score} / {questions.length}
            </Title>

            <Button
              block
              onClick={fetchQuestions}
              style={{
                backgroundColor: "lightgreen",
                fontWeight: "bold",
                fontSize: 18,
                marginTop: 10,
              }}
            >
              🔄 New Game
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Placevalue;
