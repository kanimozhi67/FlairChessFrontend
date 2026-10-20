import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

// 🎈 Kindergarten Levels
const kindergartenLevels = [
  {
    id: 1,
    name: "KG 1",
    icon: "🌈",
    color: "linear-gradient(135deg, #FF9A9E, #FAD0C4)",
    path: "/quiz/kg1",
  },
  {
    id: 2,
    name: "KG 2",
    icon: "🦄",
    color: "linear-gradient(135deg, #A18CD1, #FBC2EB)",
    path: "/quiz/kg2",
  },
];

// 🎓 Primary Grades
const primaryGrades = [
  {
    id: 1,
    name: "Grade 1",
    icon: "🐤",
    color: "linear-gradient(135deg, #e489a0, #FFB6C1)",
    path: "/quiz/1",
  },
  {
    id: 2,
    name: "Grade 2",
    icon: "🦜",
    color: "linear-gradient(135deg, #43e980, #D9F99D)",
    path: "/quiz/2",
  },
  {
    id: 3,
    name: "Grade 3",
    icon: "🐧",
    color: "linear-gradient(135deg, #FED7AA, #d64e4e)",
    path: "/quiz/3",
  },
  {
    id: 4,
    name: "Grade 4",
    icon: "🦩",
    color: "linear-gradient(135deg, #BAE6FD, #70c4eb)",
    path: "/quiz/4",
  },
  {
    id: 5,
    name: "Grade 5",
    icon: "🦁",
    color: "linear-gradient(135deg, #FEF3A7, #FCD34D)",
    path: "/quiz/5",
  },
];
const QuizCategories = ({ setUser }) => {
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);

  // 👤 Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/getMe");
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [setUser]);

  // 🚀 Navigate to quiz
  const openQuiz = (path) => {
    navigate(`${path}?level=${level}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 15px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #FFF5F7, #EAF7FF, #FFFBEA)",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 850,
          borderRadius: 30,
          border: "none",
          boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
          textAlign: "center",
        }}
      >
        {/* 🌟 Title */}
        <h1
          style={{
            marginBottom: 30,
            fontSize: "clamp(1.5rem, 2vw, 2rem)",
            fontWeight: "bold",
            color: "#FF6B35",
         
          }}
        >
          🎮 Choose Your Learning Level
        </h1>

     
        {/* 👋 Main Level Selection */}
{!level && (
  <Row gutter={[20, 20]} justify="center">

    {/* 🤖 AI Robot */}
    <Col xs={24} sm={10} md={9}>
      <Button
        block
        size="large"
        onClick={() => navigate("/quiz/robot")}
        style={{
          height: 120,
          border: "none",
          borderRadius: 25,
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          color: "#fff",
          fontSize: "1.2rem",
          fontWeight: "bold",
          boxShadow: "0 8px 18px rgba(255,107,107,0.3)",
        }}
      >
        🤖
        <br />
        FLAIR AI Robot
      </Button>
    </Col>
    <Col xs={24} sm={10} md={9}>
      <Button
        block
        size="large"
        onClick={() => navigate("/quiz/wheel")}
        style={{
          height: 120,
          border: "none",
          borderRadius: 25,
    // 🌈 Purple & Blue
background: "linear-gradient(135deg, #667EEA, #764BA2)",
          color: "#fff",
          fontSize: "1.2rem",
          fontWeight: "bold",
          boxShadow: "0 8px 18px rgba(255,107,107,0.3)",
        }}
      >
     🎡
        <br />
    SPIN THE WHEEL
      </Button>
    </Col>
  

    {/* 🧸 Kindergarten */}
    <Col xs={24} sm={10} md={9}>
      <Button
        block
        size="large"
        onClick={() => setLevel("kindergarten")}
        style={{
          height: 120,
          border: "none",
          borderRadius: 25,
          background: "linear-gradient(135deg, #FFD93D, #FFB703)",
          color: "#5C4200",
          fontSize: "1.2rem",
          fontWeight: "bold",
          boxShadow: "0 8px 18px rgba(255,183,3,0.3)",
        }}
      >
        🧸
        <br />
        Kindergarten
      </Button>
    </Col>

    {/* 🎓 Primary */}
    <Col xs={24} sm={10} md={9}>
      <Button
        block
        size="large"
        onClick={() => setLevel("primary")}
        style={{
          height: 120,
          border: "none",
          borderRadius: 25,
          background: "linear-gradient(135deg, #4FACFE, #00C6FF)",
          color: "#fff",
          fontSize: "1.2rem",
          fontWeight: "bold",
          boxShadow: "0 8px 18px rgba(0,198,255,0.3)",
        }}
      >
        🎓
        <br />
        Primary Level
      </Button>
    </Col>
  <Col xs={24} sm={10} md={9}>
      <Button
        block
        size="large"
        onClick={() => navigate("/quiz/stories")}
        style={{
          height: 120,
          border: "none",
          borderRadius: 25,
    // 🌈 Purple & Blue

background: "linear-gradient(135deg, #d60edd, #d651b0)",
          color: "#fff",
          fontSize: "1.2rem",
          fontWeight: "bold",
          boxShadow: "0 8px 18px rgba(255,107,107,0.3)",
        }}
      >
     📚
        <br />
    Explore Stories
      </Button>
    </Col>
  </Row>
)}

        {/* 📚 Level Options */}
        {level && (
          <>
            {/* ⬅ Back */}
            <Button
              onClick={() => setLevel(null)}
              style={{
                marginBottom: 25,
                height: 48,
                padding: "0 25px",
                borderRadius: 25,
                border: "none",
                background: "linear-gradient(135deg, #FF9A44, #FF6A88)",
                color: "#fff",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              ⬅️ Back
            </Button>

            {/* 🧸 Kindergarten */}
            {level === "kindergarten" && (
              <Row gutter={[20, 20]} justify="center">
                {kindergartenLevels.map((item) => (
                  <Col key={item.id} xs={24} sm={12}>
                    <div
                      onClick={() => openQuiz(item.path)}
                      style={{
                        height: 140,
                        borderRadius: 28,
                        background: item.color,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <div style={{ fontSize: "4rem" }}>
                        {item.icon}
                      </div>

                      <div
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: "bold",
                        }}
                      >
                        {item.name}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}

            {/* 🎓 Primary Grades */}
            {level === "primary" && (
              <Row gutter={[20, 20]} justify="center">
                {primaryGrades.map((item) => (
                  <Col key={item.id} xs={24} sm={12} md={8}>
                    <div
                      onClick={() => openQuiz(item.path)}
                      style={{
                        height: 145,
                        borderRadius: 28,
                        background: item.color,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <div style={{ fontSize: "4.2rem" }}>
                        {item.icon}
                      </div>

                      <div
                        style={{
                          color: "#fff",
                          fontSize: "1.3rem",
                          fontWeight: "bold",
                        }}
                      >
                        {item.name}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default QuizCategories;
