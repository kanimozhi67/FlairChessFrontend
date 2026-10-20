import React, { useState, useEffect, useRef } from "react";
import { message } from "antd";
import { useWindowSize } from "react-use";
import {  useOutletContext ,useLocation,useNavigate,useParams} from "react-router-dom";
import { completeTask } from "../api/auth.js";
import api from "../api/axiosClient";
import LevelSelection from "./LevelSelection.js";
import MotivationScreen from "./MotivationScreen.js";
import ResultModal from "./ResultModal.js";
import StickerModal from "./StickerModal.js";
import FlyingSticker from "./FlyingSticker.js";
import GiftBox from "./GiftBox.js";
import NoGiftBox from "./NoGiftBox.js";

import { useSearchParams } from "react-router-dom";
import Robot from "./Robot.js";
import ReadingComprehension from "./ReadingComprehension/ReadingComprehension.js";
import CompletedVocabulary from "./ReadingComprehension/CompletedVocabulary.js";
import CompletedVocabularyWheel from "./ReadingComprehension/CompletedVocabularyWheel.js";
import ReadingComprehensionkg from "./ReadingComprehension/ReadingComprehensionkg.js";
import WheelDuplicate from "./ReadingComprehension/WheelDuplicate.js";
import FullStories from "./ReadingComprehension/FullStories.js";



const QuizPage = ({ user, setUser,setCompletedLevel,setCompletedCategory,setCompletedSelectedLevel,
  completedLevel,completedCategory,completedSelectedLevel,  setCompletedPoints }) => {
    const navigate = useNavigate();
   const { search } = useLocation();
  const [searchParams] = useSearchParams();
  var level = searchParams.get("level"); // kindergarten | primary
  const { category } = useParams();
  const { width } = useWindowSize();
  const firstInputRef = useRef(null);
 // const taskId = searchParams.get("taskId");
//console.log(`taskid:${taskId}`)
const urlSelectedLevel = Number(searchParams.get("selectedLevel"));
  // Attempt to read update function from Layout's Outlet context.
  const outletCtx = useOutletContext?.() || {};
  const updateTodayScore =
    outletCtx?.updateTodayScore || outletCtx?.fetchTodayScore || (() => {});


 const [selectedLevel, setSelectedLevel] = useState(
  urlSelectedLevel || null
);

  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [basket, setBasket] = useState([]);
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [flyData, setFlyData] = useState(null);
  const [showGift, setShowGift] = useState(false);
  const [showNoGift, setShowNoGift] = useState(false);
  const [puzzleId, setPuzzleId] = useState(null);

  // --- Default style objects (passed to children so they won't be undefined) ---
  const titleStyle = {
    fontSize: width < 480 ? 20 : width < 768 ? 24 : 28,
    marginBottom: 14,
    textAlign: "center",
    fontWeight: 700,
  };
  const numberStyle = {
    fontSize: width < 480 ? 18 : 24,
    margin: "0 8px",
    fontWeight: "700",
  };
  const buttonStyle = {
    marginTop: 18,
    padding: width < 480 ? "8px 16px" : "10px 20px",
    fontSize: width < 480 ? 16 : 18,
    borderRadius: 8,
    background: "#ff9d2f",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  };
  const playAgainButtonStyle = {
    marginTop: 12,
    padding: width < 480 ? "8px 12px" : "10px 14px",
    fontSize: width < 480 ? 16 : 18,
    borderRadius: 10,
    background: "linear-gradient(135deg,#ff9d2f,#ff6126)",
    color: "#fff",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  };
  //  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isMobile = width < 767;
  // --- speakLine helper (non-blocking) ---
//   if (isMobile) { const speakLine = (
//   text
//   ) => {
//     if (
//       typeof window === "undefined" ||
//       !window.speechSynthesis
//     ) {
//       return;
//     }

//     window.speechSynthesis.cancel();

//     // const text = meaning
//     //   ? `${word}. ${meaning}`
//     //   : word;

//     const speech =
//       new SpeechSynthesisUtterance(
//         text
//       );

//     speech.lang = "en-US";
//     speech.rate = 0.85;
//     speech.pitch = 1;

//     window.speechSynthesis.speak(
//       speech
//     );
//   }};
// if (!isMobile) { const speakLine = (text) => {
//     if (!window.speechSynthesis) return;
//     try {
//       const utter = new SpeechSynthesisUtterance(text);
//       // utter.pitch = 1.8;
//       // utter.rate = 1.05;
//       //  utter.lang = "en-US";
//        utter.lang = "en-US";
//       utter.rate =  1.05;
//       utter.pitch = 1.8;
//       utter.volume = 2;
//       const voices = window.speechSynthesis.getVoices();
//        utter.voice = voices.find((v) => /zira/i.test(v.name));
//       //  utter.voice = isMobile ? voices.find((v) => /child/i.test(v.name)) : voices.find((v) => /zira/i.test(v.name));
//       // utter.voice =
//       //   voices.find((v) => /zira/i.test(v.name)) ;
//       window.speechSynthesis.speak(utter);
//     } catch (e) {
//       // ignore speech errors
//     }
//   }};
const speakLine = (text) => {
  if (
    typeof window === "undefined" ||
    !window.speechSynthesis
  ) {
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);

    utter.lang = "en-US";
    utter.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    if (isMobile) {
      // Mobile voice
      utter.rate = 0.85;
      utter.pitch = 1;

      utter.voice =
        voices.find((v) => /female|samantha|susan/i.test(v.name)) ||
        voices.find((v) => /en-US/i.test(v.lang)) ||
        voices[0];
    } else {
      // Desktop voice
      utter.rate = 1.05;
      utter.pitch = 1.8;

      utter.voice =
        voices.find((v) => /zira/i.test(v.name)) ||
        voices.find((v) => /en-US/i.test(v.lang)) ||
        voices[0];
    }

    window.speechSynthesis.speak(utter);
  } catch (error) {
    console.error("Speech error:", error);
  }
};
// ======================================================
// MAIN QUIZ PAGE LAYOUT
// ======================================================

const containerStyle = {
  width: "100%",
  minHeight: "100vh",

  background:
    "linear-gradient(135deg, #ffe680 0%, #f8b36a 50%, #f08c8c 100%)",

  boxShadow:
    "0 12px 30px rgba(255, 160, 140, 0.45)",

  display: "flex",
  justifyContent: "center",

  overflowX: "hidden",

  boxSizing: "border-box",
};

// ======================================================
// FULL WIDTH INNER AREA
// ======================================================

const innerStyle = {
  display: "flex",

  flexDirection:
    width < 768
      ? "column"
      : "row",

  gap: 20,

  alignItems: "flex-start",

  justifyContent: "center",

  width: "100%",

  /*
   * IMPORTANT:
   * Do not keep maxWidth: 1200 here.
   * ReadingComprehension needs to use the
   * available width from QuizPage.
   */

  maxWidth: "none",

  margin: "0 auto",

  boxSizing: "border-box",

  padding:
    width < 768
      ? "0 10px"
      : "0 15px",
};

// ======================================================
// QUIZ CONTENT AREA
// ======================================================

const quizCardStyle = {
  width: "100%",

  /*
   * IMPORTANT:
   * Previously this was 580px.
   *
   * That was the reason your ReadingComprehension
   * component remained narrow.
   */

  flex: "1 1 auto",

  margin:
    width < 768
      ? "20px 0"
      : "0",

  boxSizing: "border-box",

  /*
   * Allows the child to shrink correctly
   * without creating horizontal overflow.
   */

  minWidth: 0,
};
  const allStickers = [
    "🍰",
    "🍫",
    "🦅",
    "🤖",
    "🦄",
    "🍬",
    "🎁",
    "🎈",
    "🐶",
    "🚀",
    "🎂",
    "⭐",
    "🤴",
    "👛",
    "🐯",
    "🦁",
    "🐣",
    "🐥",
    "🦜",
    "🦩",
    "🐇",
    "🚗",
    "🛩",
    "🪆",
    "🌈",
    "🐱",
    "🦊",
    "🧸",
    "🐼",
    "🐨",
    "🍩",
    "🍕",
    "🍓", 
    "🌟",
    "👸",
    "🍦",
    "🐰",
    "💕",
    "🐤",
    "🐧",
    "🍭"
  ];

  const guideList = [
    "you can do it! ✏️ Keep practicing a little every day. If you struggle, join 🏫 FLAIR OLYMPIAD class 🧑‍🎓.",
  ];
  const adviceList = [
    "Awesome! Try challenging yourself with harder problems next time.",
    "Nice work! Remember, accuracy is more important than speed.",
    "Fantastic! Math gets easier the more you play with it.",
    "You're doing great! Stay curious and keep learning.",
    "Super effort! Don’t forget to check your answers carefully.",
    "Well done! Practice makes progress, not perfection.",
    "Nice work! Take things one step at a ti  me. Progress is still progress.",
    "Super effort! Believe in yourself. You’re more capable than you realize.",
    "Nice work! Stay open-minded. Every experience teaches you something.",
    "Super effort! Don't be afraid to ask questions.curiosity is your superpower.",
    "Nice work! Keep showing up, even on the tough days.You’re growing.",
    "Super effort! Trust the process.Good things take time.",
    "Well done!Nice work! Celebrate your small wins.They lead to big success.",
    "Well done! Stay kind to yourself. Growth isn’t always linear.",
    "Well done! Keep exploring. Your passion will guide you forward.",
  ];

  const perfectScoreAdviceList = [
    "I know you can win! You are unstoppable!",
    "You are such a talented kid! Truly amazing!",
    "I have never seen such a knowledgeable person like you!",
    "Your brain shines like a superstar! 🌟",
    "Brilliant! You solved everything perfectly!",
    "You are a genius in the making!",
    "Wow! You didn’t miss a single one — outstanding!",
    "You are extraordinary! Keep shining bright! ✨",
    "you are outstanding. I think, you are a magician.",
    "you are doing Gorgeous.you might be an Angel.",
    "Your light makes the world better—keep glowing! ✨",
    "You’re doing amazing, even on the days you doubt it! 🌟",
    "Your energy is magnetic—never dim it! ✨",
    "You are capable, powerful, and unstoppable! 💫",
    "Keep rising—your brilliance inspires others! ✨",
    "You’re a spark of magic in this world! 🔥✨",
    "Believe in your shine—it's one of a kind! 🌟",
    "You’re making progress, even if you don’t see it yet! ✨",
    "Your heart, your mind, your presence—they matter. 💛✨",
    "Keep going—your story is unfolding beautifully! 🌙✨",
  ];

 
  const feedmsg = (score) => {
  // let len = questions.length; // default
  let len=8;
console.log(level)
  // Category-based length
  switch (level) {
    case "primary":
       len = 8;
         break;
    case "kindergarten":
        len=8;
       console.log(len)
         break;
    
    default:
      // len = questions.length;
      len=2;
      console.log(len)
  }

 


  const feedback =
    score === len
      ? perfectScoreAdviceList[Math.floor(Math.random() * perfectScoreAdviceList.length)]
      : score >= 2
      ? adviceList[Math.floor(Math.random() * adviceList.length)]
      : guideList;

  setFeedbackMessage(`🎉 You scored ${score} points! ${feedback}`);

  if (score === len) {
    setShowGift(true);
    setShowNoGift(false);
  } else {
    setShowGift(false);
    setShowNoGift(true);
  }
};


  // Fetch quiz questions
  const fetchQuiz = async () => {
    if (!selectedLevel) return;
    setLoading(true);
    setSubmitted(false);
    setResults({});
    setFeedbackMessage("");

    try {
      let res;
     
      //  setAnswers(Array((res.data.questions || []).length).fill(null));
    } catch (err) {
      console.error("fetchQuiz error:", err);
      setQuestions([]);
      setFeedbackMessage("❌ Failed to load quiz.");
    } finally {
      setLoading(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  };

  // Ensure user loaded
  useEffect(() => {
    const fetchUser = async () => {
    //     const token = localStorage.getItem("token");

    // if (!token) return; // ⛔ stop auto-login
      if (user) return;
      try {
        const res = await api.get("/auth/getMe");
        setUser(res.data.user ?? res.data);
      } catch (err) {
        console.error("User not logged in (from quizPage)", err);
        setUser(null);
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load stickers (guarded)
  useEffect(() => {
    if (!user || !user._id) return;
    const fetchStickers = async () => {
      try {
        const res = await api.get(`/users/${user._id}/stickers`);
        setBasket(res.data.stickers || []);
      } catch (err) {
        console.error("fetchStickers error:", err);
      }
    };
    fetchStickers();
  }, [user?._id]);

const userTaskId = searchParams.get("userTaskId");
const categoryName = searchParams.get("category");

  const handleComplete = async (score) => {
     if (!userTaskId || !categoryName || !selectedLevel) {
    console.warn("Task completion skipped – missing data");
    return;
  }
    try {
      console.log("user role in quizpage",user.role)
    if(user.role=== "Student"){
        await api.post("/users/completetaskstudent", {
        userTaskId,
        categoryName,
        selectedLevel,
        score,   // calculate real score here
        points: score,
      });
 message.success("🎉 Task level completed!");
    }else{
        await api.post("/users/completetask", {
        userTaskId,
        categoryName,
        selectedLevel,
        score,   // calculate real score here
        points: score,
      });
 message.success("🎉 Task level completed!");
    }
     
      //navigate("/my-tasks"); // go back to task list
    } catch (err) {
      message.error(
        err.response?.data?.message || "Failed to complete task"
      );
    }
  };

  // Helper: send points to backend and update UI
const addPointsToBackend = async (points = 0,lastStory) => {
 console.log(user.level);
 console.log(points);
 console.log(lastStory);

await api.post("/users/completed", {
  Id: user._id,
  level:!level  ? "Task" : level,
  category,
  selectedLevel,
  points,
  lastStory,
  role:user.role,
});


//     if(points!==0){
// handleComplete(points);}

    if (!user || !user._id) return;
    try {
   //   console.log(`user: ${JSON.stringify(user)} , user._id: ${user._id}`)
      // const res = await api.post("/quiz/progress/addpoints", { points });
       const res = await api.post(
      "/quiz/progress/addpoints",
      {
        studentId: user._id,   // 🔥 REQUIRED
        points: points,
        completedStory:lastStory,
      }
    );
      const total = res?.data?.points ?? res?.data?.total ?? null;

      // Prefer React callback first, but still dispatch as fallback
      try {
        await updateTodayScore();
      } catch (e) {
        // ignore
      }
      window.dispatchEvent(new Event("scoreUpdated"));
      feedmsg(points);
     // return total;



    } catch (err) {
      console.error("addPointsToBackend error:", err);
      message.error("Failed to save points. Try again.");
      return null;
    }
  };



  const giftmessage = (score) => {
    const feedback =
      score === questions.length
        ? perfectScoreAdviceList[
            Math.floor(Math.random() * perfectScoreAdviceList.length)
          ]
        : score >= 2
        ? adviceList[Math.floor(Math.random() * adviceList.length)]
        : guideList;

    setFeedbackMessage(`🎉  ${user?.username} You scored ${score} points! ${feedback}`);
    if (score === questions.length) setShowGift(true);
    else setShowNoGift(true);
  };
  const onStickerClicked = async (emoji, event) => {
    if (!user || !user._id) {
      message.error("Not logged in");
      return;
    }

    // Only check selectedStickers (stickers available to collect)
    if (!selectedStickers.includes(emoji)) {
      message.info("You've already collected this sticker!");
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const start = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const basketTarget = {
      x: window.innerWidth - 100,
      y: window.innerHeight - 100,
    };
    setFlyData({ emoji, start, target: basketTarget });

    try {
      await api.post(`/users/${user._id}/stickers`, { sticker: [emoji] });
      setUser((prev) => ({
        ...(prev || {}),
        sticker: [...((prev && prev.sticker) || []), emoji],
      }));
    } catch (err) {
      console.error("Failed to save sticker", err);
      message.error("Failed to save sticker.");
    }

    setTimeout(() => {
      setBasket((prev) => [...prev, emoji]);
      setSelectedStickers((prev) => prev.filter((s) => s !== emoji)); // remove from modal
      setFlyData(null);
      setShowStickerModal(false);
      setShowResultModal(true);
    }, 720);
  };




useEffect(() => {
  if (urlSelectedLevel) {
    setMotivationMessage("🔥.  Great choice! Let’s start your challenge!");
    level=user.level;
    console.log(level)
    setShowMotivation(true);
  }
}, [urlSelectedLevel]);
  // Render flows
  // if (!selectedLevel &&  category!=="robot") {
  //   return (
  //     <LevelSelection
  //     category={category}
  //     level={level}
  //       onSelectLevel={(lvl, msg) => {
  //         setSelectedLevel(lvl);
  //         setMotivationMessage(msg);
  //         setShowMotivation(true);
  //       }}
  //     />
  //   );
  // {}}

  if (showMotivation) {
    return (
      <MotivationScreen
        message={motivationMessage}
        onStart={() => {
          setShowMotivation(false);
          fetchQuiz();
        }}
        user={user}
      />
    );
  }

  return (
    <div
     style={{  
      //  background: "linear-gradient(135deg, #ffe680, #f08c8cff)",
 
        //boxShadow: "0 12px 30px rgba(255, 160, 140, 0.45)",
}}
>
{/* { category!=="robot" &&
           <button
  onClick={() => window.location.reload()}
  style={{
  
    height: "40px",
   // zIndex: 1000,
    backgroundColor:"#fff",
  
    fontSize:18,
    fontWeight:"bold",
    border:"0px ",
    color:"blue",
    cursor:"pointer"
  }}
>
   👉Change level from {selectedLevel}
</button>
} */}
    <div style={containerStyle}>
 
      <div style={innerStyle}>
      
        <div style={quizCardStyle}>
        
        <div style={{ display: "none" }}>
  {level ? level : user.level}
</div>
        {category==="robot" ?(
          <Robot 
          user={user}
          />)
          :  category==="wheel" ?(
          // <CompletedVocabularyWheel
          <WheelDuplicate
          user={user}
          addPointsToBackend={addPointsToBackend}
          />)
          :  category==="stories" ?(
          // <CompletedVocabularyWheel
          <FullStories
          user={user}
           studentId={user?._id}
          addPointsToBackend={addPointsToBackend}
          />)
       :  level==="kindergarten" ?
        <ReadingComprehensionkg
        grade={category}
        studentId={user?._id}
         category={category}
         level={level}
         selectedLevel={selectedLevel} 
         user={user} 
         addPointsToBackend={addPointsToBackend}
         speakLine={speakLine}
      />
       :  level==="primary" & category!=3 & category!=5 &   category!=4 ?
        <ReadingComprehensionkg
        grade={category}
        studentId={user?._id}
         category={category}
         level={level}
         selectedLevel={selectedLevel} 
         user={user} 
         addPointsToBackend={addPointsToBackend}
         speakLine={speakLine}
      />
:
 <ReadingComprehension
        grade={category}
        studentId={user?._id}
         category={category}
         level={level}
         selectedLevel={selectedLevel} 
         user={user} 
         addPointsToBackend={addPointsToBackend}
         
      />
        }

          
        </div>
      </div>
{console.log(category)}

      <GiftBox
        setSelectedStickers={setSelectedStickers}
        setShowStickerModal={setShowStickerModal}
        speakLine={speakLine}
        showGift={showGift}
        setShowGift={setShowGift}
        allStickers={allStickers}
      />

      <NoGiftBox
        speakLine={speakLine}
        showNoGift={showNoGift}
        setShowNoGift={setShowNoGift}
        setShowResultModal={setShowResultModal}
        user={user}
      />

      <StickerModal
        visible={showStickerModal}
        stickers={selectedStickers}
        onStickerClick={onStickerClicked}
        onCancel={() => setShowStickerModal(false)}
      />

      <ResultModal
        visible={showResultModal}
        score={finalScore}
        feedback={feedbackMessage}
        onClose={() => setShowResultModal(false)}
        onClose2={() => {
          setShowResultModal(false);
          fetchQuiz();
        }}
        speakLine={speakLine}
        user={user}
      />

      <FlyingSticker
        flyData={flyData}
        setShowResultModal={setShowResultModal}
      />

      {/* <Basket basket={basket} /> */}
    </div>
    </div>
  );
};

export default QuizPage;
