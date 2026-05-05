import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Typography,
  Spin,
  message,
  Progress,
  Radio,
  Input,
  Row,
  Col
} from "antd";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import api from "../api/axiosClient";

const { Title, Text } = Typography;

const Grade4ws3 = ({ userId, addPointsToBackend }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { width, height } = useWindowSize();

  /* ---------------- FETCH ---------------- */
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.get("/quiz/grade4ws12");
      setQuestions(res.data.questions);
      setAnswers({});
      setResult(null);
    } catch {
      message.error("Failed to load fractions quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  /* ---------------- HANDLE INPUT ---------------- */
  const handleSelect = (qid, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: value
    }));
  };

  /* ---------------- FORMAT ANSWER ---------------- */
  const formatAnswer = (ans) => {
    if (typeof ans === "object") {
      const { whole, num, den } = ans;

      if (whole && num && den) return `${whole} ${num}/${den}`;
      if (num && den) return `${num}/${den}`;
      if (whole) return `${whole}`;
      return "";
    }
    return ans;
  };

  /* ---------------- SUBMIT ---------------- */
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
          answer: formatAnswer(answers[q.id])
        }))
      };

      const res = await api.post("/quiz/checkgrade4ws12", payload);

      setResult(res.data);
      addPointsToBackend(res.data.score);

      message.success(`Score: ${res.data.score}/${res.data.total}`);
    } catch {
      message.error("Submission failed");
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

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "auto",
        padding: 20,
        background: "linear-gradient(135deg,#6dd5ed,#2193b0)",
        borderRadius: 10
      }}
    >
      {result && <Confetti width={width} height={height} />}

      <Title style={{ textAlign: "center", color: "#fff" }}>
        📘 Fractions Quiz
      </Title>

      <Progress
        percent={(Object.keys(answers).length / questions.length) * 100}
      />

      {questions.map((q, index) => {
        const userAnswer = answers[q.id];
        const correct = result?.correctAnswers?.[q.id];

        return (
          <Card key={q.id} style={{ marginTop: 20 }}>
            <Text strong>
              Q{index + 1}. {q.question}
            </Text>

            <div style={{ marginTop: 15 }}>
              {/* ✅ MCQ */}
              {q.options?.length > 0 && (
                <Radio.Group
                  onChange={(e) => handleSelect(q.id, e.target.value)}
                  value={userAnswer}
                >
                  {q.options.map((opt, i) => {
                    let bg = "#fff";

                    if (result) {
                      if (opt === correct) bg = "#d4edda";
                      else if (opt === userAnswer) bg = "#f8d7da";
                    }

                    return (
                      <Radio
                        key={i}
                        value={opt}
                        style={{
                          display: "block",
                          background: bg,
                          padding: 6,
                          margin: 5
                        }}
                      >
                        {opt}
                      </Radio>
                    );
                  })}
                </Radio.Group>
              )}

              {/* ✅ FRACTION INPUT */}
              {!q.options?.length && (
                <Row gutter={10}>
                  <Col span={8}>
                    <Input
                      placeholder="Whole"
                      onChange={(e) =>
                        handleSelect(q.id, {
                          ...(answers[q.id] || {}),
                          whole: e.target.value
                        })
                      }
                    />
                  </Col>

                  <Col span={8}>
                    <Input
                      placeholder="Numerator"
                      onChange={(e) =>
                        handleSelect(q.id, {
                          ...(answers[q.id] || {}),
                          num: e.target.value
                        })
                      }
                    />
                  </Col>

                  <Col span={8}>
                    <Input
                      placeholder="Denominator"
                      onChange={(e) =>
                        handleSelect(q.id, {
                          ...(answers[q.id] || {}),
                          den: e.target.value
                        })
                      }
                    />
                  </Col>
                </Row>
              )}
            </div>

            {/* ✅ CORRECT ANSWER */}
            {result && (
              <div style={{ marginTop: 10 }}>
                <Text type="secondary">
                  Correct: {correct}
                </Text>
              </div>
            )}
          </Card>
        );
      })}

      {!result && (
        <Button
          type="primary"
          block
          loading={submitting}
          onClick={handleSubmit}
          style={{ marginTop: 20 }}
        >
          Submit 🚀
        </Button>
      )}

      {result && (
        <Card style={{ marginTop: 20, textAlign: "center" }}>
          <Title>
            Score: {result.score}/{result.total}
          </Title>

          <Button onClick={fetchQuiz}>Try Again</Button>
        </Card>
      )}
    </div>
  );
};

export default Grade4ws3;