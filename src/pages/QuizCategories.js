import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { RobotOutlined } from "@ant-design/icons";
const levelCards = [
  {
    key: "grade3",
    title: "Grade 3 Science",
    emoji: "🔬",
    color: "linear-gradient(135deg,#56CC6A,#2FD3C5)",
    image: "🌱",
  },
  {
    key: "grade4",
    title: "Grade 4 Science",
    emoji: "🧪",
    color: "linear-gradient(135deg,#4FACFE,#00F2FE)",
    image: "🪐",
  },
  {
    key: "olympiad",
    title: "Olympiad Worksheets",
    emoji: "🏆",
    color: "linear-gradient(135deg,#FFB347,#FF6A88)",
    image: "📚",
  },
];

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
// const categories2 = [
//      { id: 14, name: "Flair AI Robot", path: "/quiz/robot" },
  
//   { id: 1, name: "Green Plants", path: "/quiz/greenplants" },
//   { id: 2, name: "Plant Adaptation", path: "/quiz/plantadaptations" },
//   { id: 3, name: "Animals and their Young ones", path: "/quiz/animalbaby" },
//   { id: 4, name: "Animal Adaptations", path: "/quiz/animaladaptations" },
//   { id: 5, name: "Circulatory & Excretory System", path: "/quiz/cesystem" },
//   { id: 6, name: "Food our basic need", path: "/quiz/food" },
//   { id: 7, name: "Digestion of Food", path: "/quiz/digestion" },
//   { id: 8, name: "Clothes", path: "/quiz/clothes" },
//   { id: 9, name: "Air Water Weather", path: "/quiz/airwaterweather" },
//   { id: 10, name: "The Solar System", path: "/quiz/solarsystem" },
//   { id: 11, name: "Keeping the Earth Clean", path: "/quiz/earthclean" },
//   { id: 12, name: "Soil", path: "/quiz/soil" },
//   { id: 13, name: "Solids Liquids & Gases", path: "/quiz/matter" },

// ];
// const categories2 = [
//   { id: 1, name: "Green Plants", icon: "🌱", color: "linear-gradient(135deg,#69c24a,#2bb6c9)", path: "/quiz/greenplants" },
//   { id: 2, name: "Plant Adaptation", icon: "🌵", color: "linear-gradient(135deg,#6cc04a,#42c5aa)", path: "/quiz/plantadaptations" },
//   { id: 3, name: "Animals and their Young ones", icon: "🐣", color: "linear-gradient(135deg,#ff8ba7,#c86dd7)", path: "/quiz/animalbaby" },
//   { id: 4, name: "Animal Adaptations", icon: "🦎", color: "linear-gradient(135deg,#4fc3f7,#3f87ff)", path: "/quiz/animaladaptations" },
//   { id: 5, name: "Circulatory & Excretory System", icon: "❤️", color: "linear-gradient(135deg,#ff6b6b,#ff9f43)", path: "/quiz/cesystem" },
//   { id: 6, name: "Food our basic need", icon: "🍎", color: "linear-gradient(135deg,#ff9966,#ff5e62)", path: "/quiz/food" },
//   { id: 7, name: "Digestion of Food", icon: "🥗", color: "linear-gradient(135deg,#43cea2,#185a9d)", path: "/quiz/digestion" },
//   { id: 8, name: "Clothes", icon: "👕", color: "linear-gradient(135deg,#f7971e,#ffd200)", path: "/quiz/clothes" },
//   { id: 9, name: "Air Water Weather", icon: "☁️", color: "linear-gradient(135deg,#56ccf2,#2f80ed)", path: "/quiz/airwaterweather" },
//   { id: 10, name: "The Solar System", icon: "🪐", color: "linear-gradient(135deg,#667eea,#764ba2)", path: "/quiz/solarsystem" },
//   { id: 11, name: "Keeping the Earth Clean", icon: "🌍", color: "linear-gradient(135deg,#38ef7d,#11998e)", path: "/quiz/earthclean" },
//   { id: 12, name: "Soil", icon: "🪴", color: "linear-gradient(135deg,#c79081,#dfa579)", path: "/quiz/soil" },
//   { id: 13, name: "Solids Liquids & Gases", icon: "💧", color: "linear-gradient(135deg,#4facfe,#00f2fe)", path: "/quiz/matter" },
// ];
const categories2 = [
{
  id: 14,
  name: "Flair AI Robot",
  path: "/quiz/robot",
  icon: "✨",
  color: "#6C63FF",
},
  {
    id: 1,
    name: "Green Plants",
    icon: "🌱",
    color: "linear-gradient(135deg,#22C55E,#16A34A)",
    path: "/quiz/greenplants",
  },
  {
    id: 2,
    name: "Plant Adaptation",
    icon: "🌵",
    color: "linear-gradient(135deg,#4CAF50,#2E7D32)",
    path: "/quiz/plantadaptations",
  },
  {
    id: 3,
    name: "Animals and their Young ones",
    icon: "🐣",
    color: "linear-gradient(135deg,#FF4D8D,#D81B60)",
    path: "/quiz/animalbaby",
  },
  {
    id: 4,
    name: "Animal Adaptations",
    icon: "🦎",
    color: "linear-gradient(135deg,#2196F3,#1565C0)",
    path: "/quiz/animaladaptations",
  },
  {
    id: 5,
    name: "Circulatory & Excretory System",
    icon: "❤️",
     color: "linear-gradient(135deg,#FFCA28,#FFA000)",
  
    path: "/quiz/cesystem",
  },
  {
    id: 6,
    name: "Food our basic need",
    icon: "🍎",
    color: "linear-gradient(135deg,#26A69A,#00897B)",
   
    path: "/quiz/food",
  },
  {
    id: 7,
    name: "Digestion of Food",
    icon: "🥗",
    color: "linear-gradient(135deg,#FF8A00,#FF6F00)", 
    path: "/quiz/digestion",
  },
  {
    id: 8,
    name: "Clothes",
    icon: "👕",
     color: "linear-gradient(135deg,#FF5252,#E53935)",
    path: "/quiz/clothes",
  },
  {
    id: 9,
    name: "Air Water Weather",
    icon: "☁️",
    color: "linear-gradient(135deg,#29B6F6,#0288D1)",
    path: "/quiz/airwaterweather",
  },
  {
    id: 10,
    name: "The Solar System",
    icon: "🪐",
    color: "linear-gradient(135deg,#7C4DFF,#5E35B1)",
    path: "/quiz/solarsystem",
  },
  {
    id: 11,
    name: "Keeping the Earth Clean",
    icon: "🌍",
    color: "linear-gradient(135deg,#00E676,#00C853)",
    path: "/quiz/earthclean",
  },
  {
    id: 12,
    name: "Soil",
    icon: "🪴",
    color: "linear-gradient(135deg,#A1887F,#795548)",
    path: "/quiz/soil",
  },
  {
    id: 13,
    name: "Solids Liquids & Gases",
    icon: "💧",
    color: "linear-gradient(135deg,#26C6DA,#00ACC1)",
    path: "/quiz/matter",
  },
];
// const categories3 = [
  
//     // { id: 3, name: "Grade 3", path: "/quiz/grade3" },
//     { id: 4, name: "Grade 4", path: "/quiz/grade4" }
  
// ]
const categories3 = [
  {
    id: 4,
    name: "Grade 4 Olympiad Worksheets",
    icon: "📚",
    color: "linear-gradient(135deg,#ff9966,#ff5e62)",
    path: "/quiz/grade4",
  },
];
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
  padding: 15,
  background:
    "linear-gradient(135deg, #f6f9fc 0%, #e9f5ff 50%, #fff7e6 100%)",
}}
    >
      <Card
        title={
          <div
            style={{
              fontSize: windowWidth<420?"1.2rem":"2rem",
              fontWeight: "bold",
              color: "#ff6b00",
              textAlign: "center",
              padding: 10,
            }}
          >
            🧠 {level ? "Select Quiz Category" : "Choose Level"}
          </div>
        }
//         title={
//   <div
//     style={{
//     background: "linear-gradient(135deg,#4FACFE,#00F2FE)",
//      //   background: "linear-gradient(135deg, #ff7b00, #ffb347)",
//       borderRadius: 20,
//       padding: "8px 55px",
//       display:"inline-block",
//       position: "relative",
//       overflow: "hidden",
//       boxShadow: "0 8px 20px rgba(255,123,0,0.25)",
//     }}
//   >
//     {/* Decorative circles */}
//     <div
//       style={{
//         position: "absolute",
//         width: 120,
//         height: 120,
//         borderRadius: "50%",
//         background: "rgba(255,255,255,0.12)",
//         top: -40,
//         right: -30,
//       }}
//     />

//     <div
//       style={{
//         position: "absolute",
//         width: 80,
//         height: 80,
//         borderRadius: "50%",
//         background: "rgba(255,255,255,0.08)",
//         bottom: -25,
//         left: -15,
//       }}
//     />

//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: 12,
//         position: "relative",
//         zIndex: 2,
//       }}
//     >
//       <span style={{ fontSize: windowWidth < 420 ? "1.6rem" : "2.5rem" }}>
//          🎯
//       </span>

//       <div
//         style={{
//           fontSize: windowWidth < 420 ? "1.1rem" : "2.1rem",
//           fontWeight: 800,
//           color: "#5a0e99",
//           letterSpacing: "0.5px",
//         }}
//       >
//         {level ? "Select Quiz Category" : "Choose Level"}
//       </div>

//       {/* <span style={{ fontSize: windowWidth < 420 ? "1.8rem" : "2.5rem" }}>
//         🎯
//       </span> */}
//     </div>
//   </div>
// }
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
            {[ "primary","olympiad"].map((lvl) => (
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
  ? "Grade4"
  : "Olympiad Worksheets"}
                </Button>
              </Col>
            ))}
          </Row>
        )} 
   
        {/* STEP 2 — Show Quiz Options */}
        {level && (
          <>
            {/* <Button
              onClick={() => setLevel(null)}
              style={{
                marginBottom: 20,
                fontSize: 16,
                borderRadius: 10,
              }}
            >
              ⬅ Back
            </Button> */}

<Button
  onClick={() => setLevel(null)}
  style={{
    marginBottom: 25,
    height: 50,
    padding: "0 28px",
    borderRadius: 30,
    border: "none",
    background: "linear-gradient(135deg, #ff9a44, #ff6a88)",
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    boxShadow: "0 8px 20px rgba(255,106,136,0.3)",
  }}
>
  🌟 ⬅ Back
</Button>


{level==="primary"  && (
     <Row gutter={[16, 16]} justify="center">
              {categories2.map((cat) => (
            //     <Col key={cat.id} xs={24} sm={12} md={8}>
            //       {cat.name!=="Flair AI Robot" &&
            //       <Button
            //         type="primary"
            //         block
            //         size="large"
            //         style={{
            //           fontSize: "1rem",
            //           height: 100,
            //           borderRadius: 15,
            //           background: "#ffbf00",
            //           color: "#4d3300",
            //           fontWeight: "bold",
            //         }}
            //         onClick={() =>
            //           navigate(`${cat.path}?level=${level}`)
            //         }
            //       >
            //         {cat.name}
            //       </Button>}
            //       {cat.name==="Flair AI Robot" && <>
            //       <Button
            //         type="primary"
            //         block
            //         size="large"
            //         style={{
            //           fontSize: "1.5rem",
            //           height: 100,
            //           borderRadius: 15,
            //            background: "linear-gradient(135deg, #f16795, #f0087c)",
            //           color: "#27f5ea",
            //           fontWeight: "bold",
            //         }}
            //         onClick={() =>
            //           navigate(`${cat.path}?level=${level}`)
            //         }
            //       >
            // {cat.name}
            //       </Button>
            //        <br></br>
            //       </> }
            //     </Col>

            <Col key={cat.id} xs={24} sm={12} md={8}>
  <div
    onClick={() => navigate(`${cat.path}?level=${level}`)}
    style={{
      height: 110,
      borderRadius: 24,
      background: cat.color,
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    }}
  >
    {/* Decorative circles */}
    <div
      style={{
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        top: -40,
        right: -30,
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        top: -40,
        right: 30,
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        top: 0,
        left: 0,
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        top: 60,
        left: 40,
      }}
    />

    <div
      style={{
        color: "#fff",
        fontWeight: "bold",
        fontSize: "1.2rem",
        textAlign: "left",
        width: "70%",
        zIndex: 2,
      }}
    >
      {cat.name}
    </div>

    <div
      style={{
        fontSize: "5.5rem",
        zIndex: 2,
      }}
    >
      {cat.icon}
    </div>
  </div>
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
{/* { level==="olympiad" && (
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
            </Row>)} */}

{level === "olympiad" && (
  <Row gutter={[16, 16]} justify="center">
    {categories3.map((cat) => (
      <Col key={cat.id} xs={24} sm={12} md={8}>
        <div
          onClick={() => navigate(`${cat.path}?level=${level}`)}
          style={{
            height: 110,
            borderRadius: 24,
            background: cat.color,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              top: -40,
              right: -30,
            }}
          />

          <div
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1.2rem",
              textAlign: "left",
              width: "70%",
              zIndex: 2,
            }}
          >
            {cat.name}
          </div>

          <div
            style={{
              fontSize: "5.5rem",
              zIndex: 2,
            }}
          >
            {cat.icon}
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

