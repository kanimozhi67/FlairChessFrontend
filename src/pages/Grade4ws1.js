import { useEffect, useState } from "react";
import { Card, Button, Radio, Typography, Spin, message, Progress } from "antd";
import { Row, Col } from "antd";
import { SmileOutlined, RocketOutlined } from "@ant-design/icons";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import api from "../api/axiosClient";
import jsPDF from "jspdf";


const { Title, Text } = Typography;

const Grade4ws1 = ({ userId,level,selectedLevel, addPointsToBackend }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
         const [aiExplanations, setAiExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(false);
   const [userAnswers, setUserAnswers] = useState([]);

  const { width, height } = useWindowSize();

  const fetchQuiz = async () => {
    try {
      setLoading(true);
//        ["Large Numbers","Addition","Subtraction","Multiplication","Division","Factors",
//     "Geometry","Measurement","Time","Money","Symmetry and Patterns", "Data Handling"
//    ]
      const endpoint =
      selectedLevel === "Large Numbers"
        ? "/quiz/grade4ws1"
        : selectedLevel === "Addition"
        ? "/quiz/grade4ws2"
        : selectedLevel === "Subtraction"
        ? "/quiz/grade4ws3"
        : selectedLevel === "Multiplication"
        ? "/quiz/grade4ws4"
        : selectedLevel === "Division"
        ? "/quiz/grade4ws5"
        // : selectedLevel === "Factors"
        // ? "/quiz/grade4ws6"
        : selectedLevel === "Geometry"
        ? "/quiz/grade4ws7"
        : selectedLevel === "Measurement"
        ? "/quiz/grade4ws8"
        : selectedLevel === "Time"
        ? "/quiz/grade4ws9"
        : selectedLevel === "Money"
        ? "/quiz/grade4ws10"
        : selectedLevel === "Symmetry and Patterns"
        ? "/quiz/grade4ws11"
        : "/quiz/grade4ws1";
      const res = await api.get(endpoint);
      setQuestions(res.data.questions);
      setAnswers({});
      setResult(null);
    } catch (err) {
      message.error("Oops! Couldn't load quiz 😅");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleSelect = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };


const downloadPDF = () => {
  const doc = new jsPDF();

  let y = 10;

  doc.setFontSize(14);
  doc.text(`${selectedLevel} Quiz`, 10, y);
  y += 10;

  questions.forEach((q, index) => {
    if (y > 270) {
      doc.addPage();
      y = 10;
    }

    doc.setFontSize(12);
    doc.text(`Q${index + 1}. ${q.question}`, 10, y);
    y += 6;

    q.options.forEach((opt, i) => {
      doc.text(`   ${String.fromCharCode(65 + i)}. ${opt}`, 12, y);
      y += 5;
    });

    y += 5;
  });

  doc.save(`${selectedLevel}_quiz.pdf`);
};

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      return message.warning("Answer all questions first! 🧠");
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
      selectedLevel === "Large Numbers"
        ? "/quiz/checkgrade4ws1"
        : selectedLevel === "Addition"
        ? "/quiz/checkgrade4ws2"
        : selectedLevel === "Subtraction"
        ? "/quiz/checkgrade4ws3"
        : selectedLevel === "Multiplication"
        ? "/quiz/checkgrade4ws4"
        : selectedLevel === "Division"
        ? "/quiz/checkgrade4ws5"
        // : selectedLevel === "Factors"
        // ? "/quiz/checkgrade4ws6"
        : selectedLevel === "Geometry"
        ? "/quiz/checkgrade4ws7"
        : selectedLevel === "Measurement"
        ? "/quiz/checkgrade4ws8"
        : selectedLevel === "Time"
        ? "/quiz/checkgrade4ws9"
        : selectedLevel === "Money"
        ? "/quiz/checkgrade4ws10"
        : selectedLevel === "Symmetry and Patterns"
        ? "/quiz/checkgrade4ws11"
        : "/quiz/checkgrade4ws1";
      const res = await api.post(endpoint, payload);
      setResult(res.data);
      message.success("Great job! 🎉");
    //    setResults(res.data.results);

    message.success(` 🎉Score: ${res.data.score}/${res.data.total}`);
    addPointsToBackend(res.data.score);

    const explanations = {};

    for (const item of userAnswers) {
      const correct = res.data.correctAnswers?.[item.id];

      if (String(item.answer) !== String(correct)) {
        const questionText =
          questions.find(q => q.id === item.id)?.question || "";

        const explainRes = await api.post("/quiz/explain2", {
          question: questionText,
          correctAnswer: correct,
          userAnswer: item.answer,
        });

        explanations[item.id] = explainRes.data.explanation;
      }
    }

    setAiExplanations(explanations);

    } catch (err) {
      message.error("Submission failed 😢");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
        <p style={{ marginTop: 10 }}>Loading fun questions... 🚀</p>
      </div>
    );
  }

//   return (
//     <div style={{ maxWidth: 950, margin: "auto", padding: 20 ,  borderRadius: 20,
//         background: "linear-gradient(135deg,#a9b1f3,#8a1043)",
//         boxShadow: "0 8px 20px rgba(100,7,46,0.25)",}}>
//       {result && <Confetti width={width} height={height} />}

//       <Title style={{ textAlign: "center", color: "#4e0436" }}>
//         🎯 {selectedLevel} Quiz
//       </Title>
// <Button
//   type="default"
//   block
//   size="large"
//   onClick={downloadPDF}
//   style={{
//     marginBottom: 15,
//     height: 45,
//     borderRadius: 10
//   }}
// >
//   Download Questions as PDF 📄
// </Button>
//       <Progress
//         percent={(Object.keys(answers).length / questions.length) * 100}
//         showInfo={false}
//         strokeWidth={10}
//         style={{ marginBottom: 20 }}
//       />

//       {questions.map((q, index) => {
//         const userAnswer = answers[q.id];
//         const correctAnswer = result?.correctAnswers?.[q.id];

//         return (
//           <Card
//             key={q.id}
//             style={{
//               marginBottom: 20,
//               borderRadius: 16,
//               boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//               background: "#fdfcff"
//             }}
//           >
//             <Text strong style={{ fontSize: 16 }}>
//               Q{index + 1}. {q.question}
//             </Text>

//             <Radio.Group
//               onChange={(e) => handleSelect(q.id, e.target.value)}
//               value={userAnswer}
//               style={{ display: "block", marginTop: 15 }}
//             >
//               {q.options.map((opt, i) => {
//                 let bg = "#fff";

//                   <hr style={{ marginBottom: 12 }} />
// {result && aiExplanations[q.id] && (
//   <div style={{ marginTop: 12, background: "#eef6ff", padding: 10, borderRadius: 8 }}>
//     <strong>🤖 Explanation:</strong>
//     <div>{aiExplanations[q.id]}</div>
//   </div>
// )}
//                 if (result) {
//                   if (String(opt) === String(correctAnswer)) bg = "#d4edda";
//                   else if (String(opt) === String(userAnswer)) bg = "#f8d7da";
//                 }

//                 return (
//                   <Radio
//                     key={i}
//                     value={opt}
//                     style={{
//                       display: "block",
//                       padding: "10px 15px",
//                       margin: "8px 0",
//                       borderRadius: 10,
//                       background: bg,
//                       border: "1px solid #eee"
//                     }}
//                   >
//                     {opt}
//                   </Radio>
//                 );
//               })}
//             </Radio.Group>
//           </Card>
//         );
//       })}

//       {!result && (
//         <Button
//           type="primary"
//           icon={<RocketOutlined />}
//           block
//           size="large"
//           loading={submitting}
//           onClick={handleSubmit}
//           style={{
//             height: 50,
//             fontSize: 18,
//             borderRadius: 12
//           }}
//         >
//           Submit Answers 🚀
//         </Button>
//       )}

//       {result && (
//         <Card
//           style={{
//             marginTop: 20,
//             textAlign: "center",
//             borderRadius: 16,
//             background: "#fffbe6"
//           }}
//         >
//           <Title level={2}>
//             <SmileOutlined /> Score: {result.score} / {result.total} 🌟
//           </Title>

//           <Button
//             type="primary"
//             size="large"
//             onClick={fetchQuiz}
//             style={{ borderRadius: 10 }}
//           >
//             Try Again 🔄
//           </Button>
//         </Card>
//       )}
//     </div>
//   );


return (
  <div
    style={{
      width: "100%",
      maxWidth: 1000,
      margin: "auto",
      padding: "10px 15px",
      borderRadius: 20,
      background: "linear-gradient(135deg,#a9b1f3,#8a1043)",
      boxShadow: "0 8px 20px rgba(100,7,46,0.25)",
    }}
  >
    {result && <Confetti width={width} height={height} />}

    <Title
      level={window.innerWidth < 600 ? 4 : 2}
      style={{ textAlign: "center", color: "#4e0436" }}
    >
      🎯 {selectedLevel} Quiz
    </Title>

    <Button
      type="default"
      block
      size="large"
      onClick={downloadPDF}
      style={{ marginBottom: 15, height: 45, borderRadius: 10 }}
    >
      Download Questions as PDF 📄
    </Button>

    <Progress
      percent={(Object.keys(answers).length / questions.length) * 100}
      showInfo={false}
      strokeWidth={8}
      style={{ marginBottom: 20 }}
    />

    {questions.map((q, index) => {
      const userAnswer = answers[q.id];
      const correctAnswer = result?.correctAnswers?.[q.id];

      return (
        <Card
          key={q.id}
          style={{
            marginBottom: 15,
            borderRadius: 14,
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
            background: "#fdfcff",
          }}
          bodyStyle={{ padding: window.innerWidth < 600 ? 12 : 20 }}
        >
          <Text
            strong
            style={{
              fontSize: window.innerWidth < 600 ? 14 : 16,
            }}
          >
            Q{index + 1}. {q.question}
          </Text>
   {/* 👇 ADD THIS BLOCK */}
    {q.type === "measurement_line" && (
      <div
        style={{
          width: `${q.meta.length * 10}px`,
          height: "4px",
          background: "black",
          margin: "20px 0"
        }}
      />
    )}
          <Radio.Group
            onChange={(e) => handleSelect(q.id, e.target.value)}
            value={userAnswer}
            style={{ display: "block", marginTop: 12 }}
          >
            <Row gutter={[8, 8]}>
              {q.options.map((opt, i) => {
                let bg = "#fff";

                if (result) {
                  if (String(opt) === String(correctAnswer))
                    bg = "#d4edda";
                  else if (String(opt) === String(userAnswer))
                    bg = "#f8d7da";
                }

                return (
                  <Col xs={24} sm={24} md={12} key={i}>
                    <Radio
                      value={opt}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 10,
                        background: bg,
                        border: "1px solid #eee",
                        fontSize: window.innerWidth < 600 ? 13 : 15,
                      }}
                    >
                      {opt}
                    </Radio>
                  </Col>
                );
              })}
            </Row>
          </Radio.Group>

          {/* Explanation (FIXED POSITION) */}
          {result && aiExplanations[q.id] && (
            <div
              style={{
                marginTop: 12,
                background: "#eef6ff",
                padding: 10,
                borderRadius: 8,
                fontSize: window.innerWidth < 600 ? 13 : 14,
              }}
            >
              <strong>🤖 Explanation:</strong>
              <div>{aiExplanations[q.id]}</div>
            </div>
          )}
        </Card>
      );
    })}

    {!result && (
      <Button
        type="primary"
        icon={<RocketOutlined />}
        block
        size="large"
        loading={submitting}
        onClick={handleSubmit}
        style={{
          height: window.innerWidth < 600 ? 45 : 50,
          fontSize: window.innerWidth < 600 ? 14 : 18,
          borderRadius: 12,
        }}
      >
        Submit Answers 🚀
      </Button>
    )}

    {result && (
      <Card
        style={{
          marginTop: 20,
          textAlign: "center",
          borderRadius: 16,
          background: "#fffbe6",
        }}
      >
        <Title level={window.innerWidth < 600 ? 3 : 2}>
          <SmileOutlined /> Score: {result.score} / {result.total} 🌟
        </Title>

        <Button
          type="primary"
          size="large"
          onClick={fetchQuiz}
          style={{ borderRadius: 10 }}
        >
          Try Again 🔄
        </Button>
      </Card>
    )}
  </div>
);

};

export default Grade4ws1;