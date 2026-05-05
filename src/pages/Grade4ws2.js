import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Radio,
  Typography,
  Spin,
  message,
  Progress,
  Checkbox,
  Row,Col,
  Input
} from "antd";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import api from "../api/axiosClient";
import jsPDF from "jspdf";

const { Title, Text } = Typography;

const Grade4ws2 = ({ userId, selectedLevel, addPointsToBackend }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiExplanations, setAiExplanations] = useState({});
  const [userAnswers, setUserAnswers] = useState([]);

  const { width, height } = useWindowSize();

  /* ---------------- FETCH QUIZ ---------------- */
  const fetchQuiz = async () => {
    try {
      setLoading(true);

      const endpoint =
        selectedLevel === "Factors"
          ? "/quiz/grade4ws6"
       : selectedLevel === "Measurement"
          ? "/quiz/grade4ws8"
          : "/quiz/grade4ws1";

      const res = await api.get(endpoint);

      setQuestions(res.data.questions);
      setAnswers({});
      setResult(null);
      setAiExplanations({});
    } catch {
      message.error("Couldn't load quiz 😅");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  /* ---------------- NORMALIZE ANSWERS ---------------- */
  const normalize = (val) => {
    if (val === "✅ Yes" || val === "True") return "true";
    if (val === "❌ No" || val === "False") return "false";
    return String(val);
  };

  /* ---------------- HANDLE ANSWER ---------------- */
  const handleSelect = (qid, value) => {
    setAnswers((prev) => {
      const updated = { ...prev, [qid]: value };

      setUserAnswers(
        Object.keys(updated).map((id) => ({
          id,
          answer: updated[id]
        }))
      );

      return updated;
    });
  };

  /* ---------------- PDF ---------------- */
  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.text(`${selectedLevel} Quiz`, 10, y);
    y += 10;

    questions.forEach((q, i) => {
      if (y > 270) {
        doc.addPage();
        y = 10;
      }

      doc.text(`Q${i + 1}. ${q.question}`, 10, y);
      y += 6;

      if (q.options) {
        q.options.forEach((opt, idx) => {
          const label =
            opt === "True"
              ? "✅ Yes"
              : opt === "False"
              ? "❌ No"
              : opt;

          doc.text(` ${String.fromCharCode(65 + idx)}. ${label}`, 12, y);
          y += 5;
        });
      }

      y += 4;
    });

    doc.save(`${selectedLevel}.pdf`);
  };

  /* ---------------- SUBMIT ---------------- */
//   const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const isEqual = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);
    return JSON.stringify(sortedA) === JSON.stringify(sortedB);
  }
  return JSON.stringify(a) === JSON.stringify(b);
};
const parseArrayInput = (value) => {
  return value
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((x) => !isNaN(x));
};

  const handleSubmit = async () => {
    if (questions.some((q) => answers[q.id] === undefined)) {
      return message.warning("Answer all questions!");
    }

    try {
      setSubmitting(true);

      const payload = {
        userId,
        answers: questions.map((q) => ({
          id: q.id,
          answer: answers[q.id]
        }))
      };
 const endpoint =
        selectedLevel === "Factors"
          ? "/quiz/checkgrade4ws6"
       : selectedLevel === "Measurement"
          ? "/quiz/checkgrade4ws8"
          : "/quiz/checkgrade4ws6";
      const res = await api.post(endpoint, payload);

      setResult(res.data);
      addPointsToBackend(res.data.score);

      /* ---------- EXPLANATIONS ---------- */
      const explanations = {};

      for (const item of userAnswers) {
        const correct = res.data.correctAnswers[item.id];

        if (!isEqual(item.answer, correct)) {
          const questionText =
            questions.find((q) => q.id === item.id)?.question || "";

          const explainRes = await api.post("/quiz/explain2", {
            question: questionText,
            correctAnswer: correct,
            userAnswer: item.answer
          });

          explanations[item.id] = explainRes.data.explanation;
        }
      }

      setAiExplanations(explanations);
      message.success(`Score: ${res.data.score}/${res.data.total}`);
    } catch {
      message.error("Submission failed 😢");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

//   return (
//     <div style={{ maxWidth: 900, margin: "auto", padding: 20 ,
//       background: "linear-gradient(135deg,#a9b1f3,#8a1043)",
//         boxShadow: "0 8px 20px rgba(100,7,46,0.25)",}}>
//       {result && <Confetti width={width} height={height} />}

//       <Title style={{ textAlign: "center" }}>
//         🎯 {selectedLevel} Quiz
//       </Title>

//       <Button onClick={downloadPDF} block style={{ marginBottom: 15 }}>
//         Download Questions as PDF 📄
//       </Button>

//       <Progress
//         percent={(Object.keys(answers).length / questions.length) * 100}
//       />

//       {questions.map((q, index) => {
//         const userAnswer = answers[q.id];
//         const correctAnswer = result?.correctAnswers?.[q.id];

//         return (
//           <Card key={q.id} style={{ marginTop: 20 }}>
//             <Text strong>
//               Q{index + 1}. {q.question}
//             </Text>

//             <div style={{ marginTop: 10 }}>
//               {/* ✅ OPTIONS (FOR ALL MCQ TYPES) */}
//               {q.options && (
//                 <Radio.Group
//                   onChange={(e) => handleSelect(q.id, e.target.value)}
//                   value={userAnswer}
//                 >
//                   {q.options.map((opt, i) => {
//                     const display =
//                       opt === "True"
//                         ? "✅ Yes"
//                         : opt === "False"
//                         ? "❌ No"
//                         : opt;

//                     let bg = "#fff";

//                     if (result) {
//                       if (normalize(opt) === normalize(correctAnswer))
//                         bg = "#d4edda";
//                       else if (normalize(opt) === normalize(userAnswer))
//                         bg = "#f8d7da";
//                     }

//                     return (
//                       <Radio
//                         key={i}
//                         value={opt}
//                         style={{
//                           display: "block",
//                           background: bg,
//                           margin: 5,
//                           padding: 6
//                         }}
//                       >
//                         {display}
//                       </Radio>
//                     );
//                   })}
//                 </Radio.Group>
//               )}

//               {/* MULTI */}
//               {q.type === "multi_select" && (
//                 <Checkbox.Group
//                   options={q.options}
//                   value={userAnswer || []}
//                   onChange={(val) =>
//                     handleSelect(q.id, [...val].sort((a, b) => a - b))
//                   }
//                 />
//               )}

//               {/* INPUT */}
//               {q.type === "input" && (
//                 <Input
//                   onChange={(e) =>
//                     handleSelect(q.id, e.target.value)
//                   }
//                 />
//               )}

//               {/* LIST */}
//               {q.type === "list" && (
//                 <Input
//                   placeholder="1,2,3"
//                   onChange={(e) =>
//                     handleSelect(
//                       q.id,
//                       e.target.value
//                         .split(",")
//                         .map((x) => Number(x.trim()))
//                     )
//                   }
//                 />
//               )}

//               {/* HCF LCM */}
//               {q.type === "hcf_lcm" && (
//                 <div style={{ display: "flex", gap: 10 }}>
//                   <Input
//                     placeholder="HCF"
//                     value={userAnswer?.hcf}
//                     onChange={(e) =>
//                       handleSelect(q.id, {
//                         ...(userAnswer || {}),
//                         hcf: Number(e.target.value)
//                       })
//                     }
//                   />
//                   <Input
//                     placeholder="LCM"
//                     value={userAnswer?.lcm}
//                     onChange={(e) =>
//                       handleSelect(q.id, {
//                         ...(userAnswer || {}),
//                         lcm: Number(e.target.value)
//                       })
//                     }
//                   />
//                 </div>
//               )}
//             </div>

//             {/* CORRECT ANSWER */}
//             {result && (
//               <div style={{ marginTop: 10 }}>
//                 <Text type="secondary">
//                   Correct: {JSON.stringify(correctAnswer)}
//                 </Text>
//               </div>
//             )}

//             {/* AI EXPLANATION */}
//             {result && aiExplanations[q.id] && (
//               <div
//                 style={{
//                   marginTop: 10,
//                   background: "#eef6ff",
//                   padding: 10
//                 }}
//               >
//                 🤖 {aiExplanations[q.id]}
//               </div>
//             )}
//           </Card>
//         );
//       })}

//       {!result && (
//         <Button
//           type="primary"
//           block
//           loading={submitting}
//           onClick={handleSubmit}
//           style={{ marginTop: 20 }}
//         >
//           Submit 🚀
//         </Button>
//       )}

//       {result && (
//         <Card style={{ marginTop: 20, textAlign: "center" }}>
//           <Title>
//             Score: {result.score}/{result.total}
//           </Title>

//           <Button onClick={fetchQuiz}>Try Again</Button>
//         </Card>
//       )}
//     </div>
//   );
return (
  <div
    style={{
      maxWidth: "1200px",
      margin: "auto",
      padding: "10px 16px",
      background: "linear-gradient(135deg,#a9b1f3,#8a1043)",
      boxShadow: "0 8px 20px rgba(100,7,46,0.25)",
      borderRadius: 10
    }}
  >
    {result && <Confetti width={width} height={height} />}

    <Title level={2} style={{ textAlign: "center", color: "#fff" }}>
      🎯 {selectedLevel} Quiz
    </Title>

    <Button onClick={downloadPDF} block style={{ marginBottom: 15 }}>
      Download Questions as PDF 📄
    </Button>

    <Progress
      percent={(Object.keys(answers).length / questions.length) * 100}
      style={{ marginBottom: 20 }}
    />

    {questions.map((q, index) => {
      const userAnswer = answers[q.id];
      const correctAnswer = result?.correctAnswers?.[q.id];

      return (
        <Card
          key={q.id}
          style={{
            marginBottom: 20,
            borderRadius: 12
          }}
        >
          <Text strong style={{ fontSize: 16 }}>
            Q{index + 1}. {q.question}
          </Text>

          <div style={{ marginTop: 12 }}>
            {/* MCQ */}
            {q.options && (
              <Radio.Group
                onChange={(e) => handleSelect(q.id, e.target.value)}
                value={userAnswer}
                style={{ width: "100%" }}
              >
                {q.options.map((opt, i) => {
                  const display =
                    opt === "True"
                      ? "✅ Yes"
                      : opt === "False"
                      ? "❌ No"
                      : opt;

                  let bg = "#fff";

                  if (result) {
                    if (normalize(opt) === normalize(correctAnswer))
                      bg = "#2bc950";
                    else if (normalize(opt) === normalize(userAnswer))
                      bg = "#da2b39";
                  }

                  return (
                    <Radio
                      key={i}
                      value={opt}
                      style={{
                        display: "block",
                        background: bg,
                        marginBottom: 8,
                        padding: 10,
                        borderRadius: 8,
                        width: "100%"
                      }}
                    >
                      {display}
                    </Radio>
                  );
                })}
              </Radio.Group>
            )}

            {/* MULTI SELECT */}
            {q.type === "multi_select" && (
              <Checkbox.Group
                options={q.options}
                value={userAnswer || []}
                style={{ width: "100%" }}
                onChange={(val) =>
                  handleSelect(q.id, [...val].sort((a, b) => a - b))
                }
              />
            )}

            {/* INPUT */}
            {q.type === "input" && (
              <Input
                size="large"
                style={{ width: "100%" }}
                onChange={(e) =>
                  handleSelect(q.id, e.target.value)
                }
              />
            )}

            {/* LIST */}
            {q.type === "list" && (
              <Input
                size="large"
                placeholder="1,2,3"
                style={{ width: "100%" }}
             onChange={(e) =>
  handleSelect(
    q.id,
    e.target.value
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => !isNaN(x)) // remove invalid values
  )
}
              />
            )}

            {/* HCF / LCM RESPONSIVE */}
            {q.type === "hcf_lcm" && (
              <Row gutter={[10, 10]} style={{ marginTop: 10 }}>
                <Col xs={24} sm={12}>
                  <Input
                    size="large"
                    placeholder="HCF"
                    value={userAnswer?.hcf}
                    onChange={(e) =>
                      handleSelect(q.id, {
                        ...(userAnswer || {}),
                        hcf: Number(e.target.value)
                      })
                    }
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    size="large"
                    placeholder="LCM"
                    value={userAnswer?.lcm}
                    onChange={(e) =>
                      handleSelect(q.id, {
                        ...(userAnswer || {}),
                        lcm: Number(e.target.value)
                      })
                    }
                  />
                </Col>
              </Row>
            )}
          </div>

          {/* CORRECT ANSWER */}
          {result && (
            <div style={{ marginTop: 10 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Correct: {JSON.stringify(correctAnswer)}
              </Text>
            </div>
          )}

          {/* AI EXPLANATION */}
          {result && aiExplanations[q.id] && (
            <div
              style={{
                marginTop: 10,
                background: "#eef6ff",
                padding: 12,
                borderRadius: 8,
                fontSize: 14
              }}
            >
              🤖 {aiExplanations[q.id]}
            </div>
          )}
        </Card>
      );
    })}

    {!result && (
      <Button
        type="primary"
        block
        size="large"
        loading={submitting}
        onClick={handleSubmit}
        style={{ marginTop: 20 }}
      >
        Submit 🚀
      </Button>
    )}

    {result && (
      <Card style={{ marginTop: 20, textAlign: "center" }}>
        <Title level={3}>
          Score: {result.score}/{result.total}
        </Title>

        <Button type="primary" onClick={fetchQuiz}>
          Try Again
        </Button>
      </Card>
    )}
  </div>
);

};

export default Grade4ws2;