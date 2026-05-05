import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

const categories = [
   { id: 10, name: "Flair AI Robot", path: "/quiz/robot" },
  { id: 1, name: "Addition & Subtraction", path: "/quiz/math" },
  { id: 2, name: "Sorting", path: "/quiz/sorting" },
  { id: 3, name: "Multiplication", path: "/quiz/multiplication" },
  { id: 4, name: "Logical Questions", path: "/quiz/logic" },
  { id: 5, name: "Sudoku", path: "/quiz/sudoku" },
  { id: 6, name: "Puzzles", path: "/quiz/puzzles" },
   { id: 7, name: "Shapes", path: "/quiz/shapes" },
  { id: 8, name: "Time", path: "/quiz/time" },
   { id: 9, name: "Fraction", path: "/quiz/fraction" },
  
];
const categories2 = [
     { id: 14, name: "Flair AI Robot", path: "/quiz/robot" },
  { id: 1, name: "Addition & Subtraction", path: "/quiz/math" },
  { id: 2, name: "Large Numbers", path: "/quiz/placevalue" },
  { id: 3, name: "Sorting", path: "/quiz/sorting" },
  { id: 4, name: "Multiplication", path: "/quiz/multiplication" },
  { id: 5, name: "Division", path: "/quiz/division" },
  { id: 6, name: "Logical Questions", path: "/quiz/logic" },
  { id: 7, name: "Sudoku", path: "/quiz/sudoku" },
  { id: 8, name: "Puzzles", path: "/quiz/puzzles" },
  { id: 9, name: "Money", path: "/quiz/money" },
  { id: 10, name: "Shapes", path: "/quiz/shapes" },
  { id: 11, name: "Measurement", path: "/quiz/measure" },
  { id: 12, name: "Time", path: "/quiz/time" },
  { id: 13, name: "Fraction", path: "/quiz/fraction" },

];
const categories3 = [
  
    { id: 4, name: "Grade 4", path: "/quiz/grade4" }
  
]

const QuizCategories = ({ setUser }) => {
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
 const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const fetchUser = async () => {
        const token = localStorage.getItem("token");

   // if (!token) return; // ⛔ stop auto-login
      try {
        const res = await api.get("/auth/getMe");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: 10,
      }}
    >
      <Card
        title={
          <div
            style={{
              fontSize: windowWidth<420?"1.5rem":"2rem",
              fontWeight: "bold",
              color: "#ff6b00",
              textAlign: "center",
              padding: 10,
            }}
          >
            🧠 {level ? "Select Quiz Category" : "Choose Level"}
          </div>
        }
        style={{
          width: "100%",
          maxWidth: 850, // responsive max width
          textAlign: "center",
          borderRadius: 20,
          padding: 0,
        }}
      >
        {/* STEP 1 — Choose Level */}
        {!level && (
          <Row gutter={[16, 16]} justify="center">
            {["kindergarten", "primary","olympiad"].map((lvl) => (
              <Col key={lvl} xs={24} sm={12}>
                <Button
                  type="primary"
                  size="large"
                  block
                  style={{
                    height: 100,
                    borderRadius: 15,
                    background: "#ffbf00",
                    color: "#4d3300",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                  }}
                  onClick={() => setLevel(lvl)}
                >
                 {lvl === "kindergarten"
  ? "Kindergarten"
  : lvl === "primary"
  ? "Primary Level"
  : "Olympiad Worksheets"}
                </Button>
              </Col>
            ))}
          </Row>
        )}

        {/* STEP 2 — Show Quiz Options */}
        {level && (
          <>
            <Button
              onClick={() => setLevel(null)}
              style={{
                marginBottom: 20,
                fontSize: 16,
                borderRadius: 10,
              }}
            >
              ⬅ Back
            </Button>
{level==="primary"  && (
     <Row gutter={[16, 16]} justify="center">
              {categories2.map((cat) => (
                <Col key={cat.id} xs={24} sm={12} md={8}>
                  {cat.name!=="Flair AI Robot" &&
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                      fontSize: "1rem",
                      height: 100,
                      borderRadius: 15,
                      background: "#ffbf00",
                      color: "#4d3300",
                      fontWeight: "bold",
                    }}
                    onClick={() =>
                      navigate(`${cat.path}?level=${level}`)
                    }
                  >
                    {cat.name}
                  </Button>}
                  {cat.name==="Flair AI Robot" && <>
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                      fontSize: "1.5rem",
                      height: 100,
                      borderRadius: 15,
                       background: "linear-gradient(135deg, #f16795, #f0087c)",
                      color: "#27f5ea",
                      fontWeight: "bold",
                    }}
                    onClick={() =>
                      navigate(`${cat.path}?level=${level}`)
                    }
                  >
            {cat.name}
                  </Button>
                   <br></br>
                  </> }
                </Col>
              ))}
            </Row>
)}
{ level==="kindergarten" && (
            <Row gutter={[16, 16]} justify="center">
              {categories.map((cat) => (
                <Col key={cat.id} xs={24} sm={12} md={8}>
                  {cat.name!=="Flair AI Robot" &&
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                      fontSize: "1rem",
                      height: 100,
                      borderRadius: 15,
                      background: "#ffbf00",
                      color: "#4d3300",
                      fontWeight: "bold",
                    }}
                    onClick={() =>
                      navigate(`${cat.path}?level=${level}`)
                    }
                  >
                    {cat.name}
                  </Button>}
                  {cat.name==="Flair AI Robot" && <>
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                      fontSize: "1.5rem",
                      height: 100,
                      borderRadius: 15,
                       background: "linear-gradient(135deg, #f16795, #f0087c",
                      color: "#27f5ea",
                      fontWeight: "bold",
                    }}
                    onClick={() =>
                      navigate(`${cat.path}?level=${level}`)
                    }
                  >
                {cat.name}
                  </Button> <br></br>
                  </> }
                </Col>
              ))}
            </Row>)}
{ level==="olympiad" && (
            <Row gutter={[16, 16]} justify="center">
              {categories3.map((cat) => (
                <Col key={cat.id} xs={24} sm={12} md={8}>
                  {cat.name!=="Flair AI Robot" &&
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                      fontSize: "1rem",
                      height: 100,
                      borderRadius: 15,
                      background: "#ffbf00",
                      color: "#4d3300",
                      fontWeight: "bold",
                    }}
                    onClick={() =>
                      navigate(`${cat.path}?level=${level}`)
                    }
                  >
                    {cat.name}
                  </Button>}
                  {cat.name==="Flair AI Robot" && <>
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                      fontSize: "1.5rem",
                      height: 100,
                      borderRadius: 15,
                       background: "linear-gradient(135deg, #f16795, #f0087c",
                      color: "#27f5ea",
                      fontWeight: "bold",
                    }}
                    onClick={() =>
                      navigate(`${cat.path}?level=${level}`)
                    }
                  >
                {cat.name}
                  </Button> <br></br>
                  </> }
                </Col>
              ))}
            </Row>)}
          </>
        )}
      </Card>
    </div>
  );
};

export default QuizCategories;

