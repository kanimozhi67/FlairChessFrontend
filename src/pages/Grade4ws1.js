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

      const endpoint =
      selectedLevel === "Green Plants"
        ? "/quiz/grade4gpwsquiz"
        : selectedLevel === "Plant Adaptation"
        ? "/quiz/grade4gpwsquiz2"
        : selectedLevel === "Animals and their Young ones"
        ? "/quiz/grade4gpwsquiz3"
        : selectedLevel === "Animal Adaptations"
        ? "/quiz/grade4gpwsquiz4"
        : selectedLevel === "Circulatory & Excretory System"
        ? "/quiz/grade4gpwsquiz5"
        : selectedLevel === "Food our basic need"
        ? "/quiz/grade4gpwsquiz6"
        : selectedLevel === "Digestion of Food"
        ? "/quiz/grade4gpwsquiz7"
        : selectedLevel === "Clothes"
        ? "/quiz/grade4gpwsquiz8"
        : selectedLevel === "Air Water Weather"
        ? "/quiz/grade4gpwsquiz9"
        : selectedLevel === "The Solar System"
        ? "/quiz/grade4gpwsquiz10"
        : selectedLevel === "Keeping the Earth Clean"
        ? "/quiz/grade4gpwsquiz11"
        
        : selectedLevel === "Soil"
        ? "/quiz/grade4gpwsquiz11"
        : selectedLevel === "Solids Liquids & Gases"
        ? "/quiz/grade4gpwsquiz11"
        : "/quiz/grade4gpwsquiz1";
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
 

      const res = await api.post("/quiz/checkgrade4gpwsquiz", payload);
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
    {q.type === "fill" && (
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