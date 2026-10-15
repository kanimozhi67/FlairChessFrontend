import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWindowSize } from "react-use";

import {
  Card,
  Button,
  Radio,
  Progress,
  Typography,
  Spin,
  Alert,
  Result,
  Tag,
  Divider,
  Space,
  message,
} from "antd";

import {
  BookOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
  ReloadOutlined,
  LeftOutlined,
  RocketOutlined,
} from "@ant-design/icons";

import api from "../../api/axiosClient";

import "./reading.css";
import CompletedVocabulary from "./CompletedVocabulary";
import StoryPdfViewer from "./StoryPdfViewer";

const {
  Title,
  Text,
  Paragraph,
} = Typography;

// ======================================================
// STORY THEMES
// ======================================================

const storyThemes = [
  {
    pageBackground:
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",

    passageBackground:
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",

    buttonBackground:
      "linear-gradient(135deg, #667eea, #764ba2)",

    accent: "#667eea",
    accentLight: "#eef2ff",

    shadow:
      "0 24px 60px rgba(102,126,234,0.28), 0 8px 24px rgba(118,75,162,0.20)",

    circle1:
      "rgba(255,255,255,0.16)",

    circle2:
      "rgba(255,220,100,0.18)",

    circle3:
      "rgba(120,220,255,0.18)",
  },

  {
    pageBackground:
      "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",

    passageBackground:
      "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",

    buttonBackground:
      "linear-gradient(135deg, #11998e, #38ef7d)",

    accent: "#11998e",
    accentLight: "#e8fff7",

    shadow:
      "0 24px 60px rgba(17,153,142,0.28), 0 8px 24px rgba(56,239,125,0.20)",

    circle1:
      "rgba(255,255,255,0.17)",

    circle2:
      "rgba(255,235,100,0.18)",

    circle3:
      "rgba(100,255,200,0.18)",
  },

  {
    pageBackground:
      "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",

    passageBackground:
      "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",

    buttonBackground:
      "linear-gradient(135deg, #ff9966, #ff5e62)",

    accent: "#ff5e62",
    accentLight: "#fff0ed",

    shadow:
      "0 24px 60px rgba(255,94,98,0.28), 0 8px 24px rgba(255,153,102,0.20)",

    circle1:
      "rgba(255,255,255,0.17)",

    circle2:
      "rgba(255,230,100,0.20)",

    circle3:
      "rgba(255,180,220,0.18)",
  },

  {
    pageBackground:
      "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",

    passageBackground:
      "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",

    buttonBackground:
      "linear-gradient(135deg, #2193b0, #6dd5ed)",

    accent: "#2193b0",
    accentLight: "#e9faff",

    shadow:
      "0 24px 60px rgba(33,147,176,0.28), 0 8px 24px rgba(109,213,237,0.20)",

    circle1:
      "rgba(255,255,255,0.18)",

    circle2:
      "rgba(180,240,255,0.18)",

    circle3:
      "rgba(255,240,150,0.18)",
  },

  {
    pageBackground:
      "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",

    passageBackground:
      "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",

    buttonBackground:
      "linear-gradient(135deg, #f953c6, #b91d73)",

    accent: "#b91d73",
    accentLight: "#fff0fa",

    shadow:
      "0 24px 60px rgba(185,29,115,0.28), 0 8px 24px rgba(249,83,198,0.20)",

    circle1:
      "rgba(255,255,255,0.17)",

    circle2:
      "rgba(255,230,120,0.18)",

    circle3:
      "rgba(180,220,255,0.18)",
  },

  {
    pageBackground:
      "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",

    passageBackground:
      "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",

    buttonBackground:
      "linear-gradient(135deg, #36d1dc, #5b86e5)",

    accent: "#5b86e5",
    accentLight: "#edf7ff",

    shadow:
      "0 24px 60px rgba(91,134,229,0.28), 0 8px 24px rgba(54,209,220,0.20)",

    circle1:
      "rgba(255,255,255,0.18)",

    circle2:
      "rgba(255,235,100,0.18)",

    circle3:
      "rgba(150,255,255,0.18)",
  },
];

// ======================================================
// SHUFFLE
// ======================================================

const shuffleArray = (array = []) => {
  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
};

// ======================================================
// COMPONENT
// ======================================================

const ReadingComprehensionkg = ({
  grade ,
  studentId,
  category,
  level,
  selectedLevel,
  user,
  addPointsToBackend,

}) => {
  // ======================================================
  // STATE
  // ======================================================

  const [readingData, setReadingData] =
    useState(null);
const [currentVocabulary, setCurrentVocabulary] = useState(0);
const [completedVocabulary,setCompletedVocabulary]=useState(false)
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState(0);

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState(null);

  const [answers, setAnswers] =
    useState({});

  const [showResult, setShowResult] =
    useState(false);

  const [finalScore, setFinalScore] =
    useState(0);

  const [pointsAdded, setPointsAdded] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [readings, setReadings] =
    useState([]);

  const [startQuiz, setStartQuiz] =
    useState(false);

  const [currentStory, setCurrentStory] =
    useState(0);

  const [
    allStoriesCompleted,
    setAllStoriesCompleted,
  ] = useState(false);

  // Passage pagination: show only 2 lines/sentences at a time
  const [passagePage, setPassagePage] = useState(0);
const passageCardRef = useRef(null);
  // ======================================================
  // CURRENT ACCOUNT ID
  // ======================================================
  const { width } = useWindowSize();
  const isMobile = width < 767;
const speakLine = (text) => {
  if (!text) return;

  // Remove emojis before speaking
  const cleanText = String(text)
    .replace(
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) return;

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(cleanText);

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
};
  const currentUserId =
    studentId ||
    user?._id ||
    user?.id ||
    null;

  const isStudent =
    Boolean(studentId);

  // ======================================================
  // CURRENT THEME
  // ======================================================

  const currentTheme =
    storyThemes[
      currentStory %
        storyThemes.length
    ];

  // ======================================================
  // CURRENT STORY ID
  // ======================================================


  const currentStoryId =
    readingData?._id ||
    readingData?.id ||
    null;

  // ======================================================
  // PASSAGE PAGINATION - 2 LINES AT A TIME
  // ======================================================

  const passageLines = useMemo(() => {
    if (!readingData?.passage) {
      return [];
    }

    const passage = String(readingData.passage).trim();

    // Prefer explicit line breaks when the story already contains them.
    let lines = passage
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    // If the passage is one paragraph, treat each sentence as a line.
    if (lines.length <= 1) {
      lines = passage
        .split(/(?<=[.!?])\s+/)
        .map((line) => line.trim())
        .filter(Boolean);
    }

    return lines;
  }, [readingData]);

  const passagePages = useMemo(() => {
    const pages = [];

    for (let i = 0; i < passageLines.length; i += 3) {
      pages.push(passageLines.slice(i, i + 3));
    }

    return pages;
  }, [passageLines]);

  const currentPassageLines =
    passagePages[passagePage] || [];

  const totalPassagePages = passagePages.length;

  const isFirstPassagePage = passagePage === 0;

  const isLastPassagePage =
    totalPassagePages > 0 &&
    passagePage >= totalPassagePages - 1;

  const handleNextPassage = () => {
  if (!isLastPassagePage) {
    setPassagePage((prev) => prev + 1);
  }
};

const handlePreviousPassage = () => {
  if (!isFirstPassagePage) {
    setPassagePage((prev) => prev - 1);
  }
};

  // ======================================================
  // FETCH WHEN USER / GRADE CHANGES
  // ======================================================

  useEffect(() => {
    if (!currentUserId) {
      console.log(
        "⏳ Waiting for user/student..."
      );

      setLoading(false);

      return;
    }

    fetchReadingQuestions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    grade,
    studentId,
    user?._id,
    user?.id,
  ]);

  // ======================================================
  // FETCH UNFINISHED STORIES
  // ======================================================

  const fetchReadingQuestions =
    async () => {
      try {
        setLoading(true);
        setError(null);
        setAllStoriesCompleted(false);

        if (!currentUserId) {
          throw new Error(
            "User or student information is not available."
          );
        }

        console.log(
          "📚 Fetching reading stories:",
          {
            grade,
            studentId,
            userId:
              user?._id ||
              user?.id,
          }
        );

        // -----------------------------------------------
        // PARAMETERS
        // -----------------------------------------------

        const params = isStudent
          ? {
              studentId:
                String(studentId),
            }
          : {
              userId: String(
                user?._id ||
                  user?.id
              ),
          };

        // -----------------------------------------------
        // API
        // -----------------------------------------------

        const response =
          await api.get(
            `/reading/grade/${grade}`,
            {
              params,
            }
          );

        console.log(
          "✅ Reading API response:",
          response.data
        );

        const backendReadings =
          response?.data?.data;

        if (
          !Array.isArray(
            backendReadings
          )
        ) {
          throw new Error(
            "Invalid reading data received from backend."
          );
        }

        // -----------------------------------------------
        // NO STORIES LEFT
        // -----------------------------------------------

        if (
          backendReadings.length ===
          0
        ) {
          console.log(
            "🎉 All stories completed."
          );

          setReadings([]);
          setReadingData(null);
          setAllStoriesCompleted(
            true
          );

          setCurrentStory(0);
          setCurrentQuestion(0);
          setSelectedAnswer(null);
          setAnswers({});
          setShowResult(false);
          setFinalScore(0);
          setPointsAdded(false);
          setStartQuiz(false);

          return;
        }

        // -----------------------------------------------
        // FILTER GRADE
        // -----------------------------------------------

        const gradeReadings =
          backendReadings.filter(
            (reading) =>
              String(
                reading.grade
              ) === String(grade)
          );

        if (
          gradeReadings.length ===
          0
        ) {
          setReadings([]);
          setReadingData(null);
          setAllStoriesCompleted(
            true
          );

          return;
        }

        console.log(
          `📚 ${gradeReadings.length} unfinished stories found.`
        );

        // -----------------------------------------------
        // STORE STORIES
        // -----------------------------------------------

        setReadings(
          gradeReadings
        );

        // -----------------------------------------------
        // START FIRST STORY
        // -----------------------------------------------

        setCurrentStory(0);

        setReadingData(
          gradeReadings[0]
        );

        // -----------------------------------------------
        // RESET QUIZ
        // -----------------------------------------------

        resetQuizState();

      } catch (err) {
        console.error(
          "❌ Reading fetch error:",
          err
        );

        console.error(
          "Backend response:",
          err?.response?.data
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Unable to load reading stories."
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // RESET QUIZ
  // ======================================================
const handleBackToVocabulary = () => {
  setCompletedVocabulary(false);
  setCurrentVocabulary(0);
  setPassagePage(0);
  setStartQuiz(false);
};
  const resetQuizState = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResult(false);
    setFinalScore(0);
    setPointsAdded(false);
    setSubmitting(false);
    setStartQuiz(false);
    setPassagePage(0);
      // Reset vocabulary
  setCurrentVocabulary(0);
    setCompletedVocabulary(false);
  };

  const vocabularyList = Array.isArray(
  readingData?.vocabulary
)
  ? readingData.vocabulary
  : [];

const currentVocabularyItem =
  vocabularyList[currentVocabulary];

const handleNextVocabulary = () => {
  if (currentVocabulary < vocabularyList.length - 1) {
    setCurrentVocabulary((prev) => prev + 1);
  } else {
    // Last vocabulary word → go to story passage
    setCompletedVocabulary(true);
    setCurrentVocabulary(0);
  }
};

const handlePreviousVocabulary = () => {
  if (currentVocabulary > 0) {
    setCurrentVocabulary(
      (prev) => prev - 1
    );
  }
};
  // ======================================================
  // CREATE QUESTIONS
  // 5 STORY + 3 VOCABULARY
  // ======================================================

  const questions = useMemo(() => {
    if (!readingData) {
      return [];
    }

    // ====================================================
    // STORY QUESTIONS
    // ====================================================

    const storyQuestions =
      Array.isArray(
        readingData.questions
      )
        ? readingData.questions
            .slice(0, 5)
            .map(
              (
                item,
                index
              ) => {
                const originalOptions =
                  Array.isArray(
                    item?.options
                  )
                    ? item.options
                    : [];

                const shuffledOptions =
                  shuffleArray(
                    originalOptions
                  );

                return {
                  id: `story-${currentStory}-${index}`,

                  type: "story",

                  question:
                    item?.question ||
                    item?.text ||
                    "",

                  answer:
                    item?.answer,

                  options:
                    shuffledOptions,
                };
              }
            )
        : [];

    // ====================================================
    // VOCABULARY QUESTIONS
    // ====================================================

 // ====================================================
// VOCABULARY QUESTIONS
// ====================================================

const vocabulary = Array.isArray(readingData.vocabulary)
  ? readingData.vocabulary
  : [];

const vocabularyQuestions = vocabulary
  .slice(0, 3)
  .map((item, index) => {

    // -----------------------------------------------
    // GET WORD + MEANING
    // -----------------------------------------------

    const word =
      typeof item === "string"
        ? item
        : item?.word;

    const correctAnswer =
      typeof item === "string"
        ? item
        : item?.meaning;

    if (!word || !correctAnswer) {
      return null;
    }

    // -----------------------------------------------
    // GET WRONG ANSWERS
    // -----------------------------------------------

    const wrongAnswers = vocabulary
      .filter((v) => {

        const vWord =
          typeof v === "string"
            ? v
            : v?.word;

        const vMeaning =
          typeof v === "string"
            ? v
            : v?.meaning;

        return (
          vWord &&
          vWord !== word &&
          vMeaning &&
          String(vMeaning).trim() !==
            String(correctAnswer).trim()
        );
      })
      .map((v) =>
        typeof v === "string"
          ? v
          : v?.meaning
      )
      .filter(Boolean);

    // -----------------------------------------------
    // MAKE SURE CORRECT ANSWER IS ALWAYS INCLUDED
    // -----------------------------------------------

    const uniqueWrongAnswers = [
      ...new Set(
        wrongAnswers.map((answer) =>
          String(answer).trim()
        )
      ),
    ].filter(
      (answer) =>
        answer !==
        String(correctAnswer).trim()
    );

    // Take maximum 3 wrong answers
    const selectedWrongAnswers =
      shuffleArray(uniqueWrongAnswers).slice(0, 3);

    // -----------------------------------------------
    // IMPORTANT:
    // ADD CORRECT ANSWER AFTER SELECTING WRONG ONES
    // -----------------------------------------------

    const options = shuffleArray([
      String(correctAnswer).trim(),
      ...selectedWrongAnswers,
    ]);

    // -----------------------------------------------
    // SAFETY CHECK
    // -----------------------------------------------

    if (
      !options.some(
        (option) =>
          String(option).trim() ===
          String(correctAnswer).trim()
      )
    ) {
      console.error(
        "❌ Correct vocabulary answer missing:",
        {
          word,
          correctAnswer,
          options,
        }
      );

      // Force correct answer into options
      options[0] = String(correctAnswer).trim();
    }

    return {
      id: `vocabulary-${currentStory}-${index}`,

      type: "vocabulary",

      word,

      question:
        `🧠 What does the word "${word}" mean?`,

      answer:
        String(correctAnswer).trim(),

      options,
    };
  })
  .filter(Boolean);
    return [
      ...storyQuestions,
      ...vocabularyQuestions,
    ].slice(0, 8);
  }, [
    readingData,
    currentStory,
  ]);

  // ======================================================
  // TOTAL QUESTIONS
  // ======================================================

  const totalQuestions =
    questions.length;

  // ======================================================
  // CURRENT QUESTION
  // ======================================================

  const question =
    questions[currentQuestion];

  // ======================================================
  // HANDLE ANSWER
  // ======================================================

  const handleAnswer = (
    value
  ) => {
    setSelectedAnswer(value);
  };

  // ======================================================
  // CALCULATE SCORE
  // ======================================================

  const calculateScore = (
    allAnswers
  ) => {
    let score = 0;

    questions.forEach(
      (
        quizQuestion,
        index
      ) => {
        const studentAnswer =
          allAnswers[index];

        const correctAnswer =
          quizQuestion.answer;

        if (
          String(
            studentAnswer
          ).trim() ===
          String(
            correctAnswer
          ).trim()
        ) {
          score++;
        }
      }
    );

    return score;
  };

  // ======================================================
  // SAVE STORY COMPLETION
  // ======================================================

  const saveStoryCompletion =
    async (score) => {
      if (!currentStoryId) {
        throw new Error(
          "Story ID is missing."
        );
      }

      if (!currentUserId) {
        throw new Error(
          "User or student ID is missing."
        );
      }

      const payload = {
        storyId: String(
          currentStoryId
        ),

        score: Number(score) || 0,
      };

      // -----------------------------------------------
      // STUDENT
      // -----------------------------------------------

      if (isStudent) {
        payload.studentId =
          String(studentId);
      }

      // -----------------------------------------------
      // NORMAL USER
      // -----------------------------------------------

      else {
        payload.userId = String(
          user?._id ||
            user?.id
        );
      }

      console.log(
        "📖 Saving completed story:",
        payload
      );

      const response =
        await api.post(
          "/reading/complete",
          payload
        );

      console.log(
        "✅ Story completion response:",
        response.data
      );

      return response.data;
    };

  // ======================================================
  // FINISH QUIZ
  // ======================================================

  const finishQuiz = async (
    finalAnswers
  ) => {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);

      const score =
        calculateScore(
          finalAnswers
        );

      console.log(
        "🏆 Final score:",
        score
      );

      // -----------------------------------------------
      // SAVE COMPLETED STORY FIRST
      // -----------------------------------------------

      await saveStoryCompletion(
        score
      );

      // -----------------------------------------------
      // ADD POINTS
      // -----------------------------------------------

      if (
        typeof addPointsToBackend ===
        "function"
      ) {
        try {
          await addPointsToBackend(
            score,
            String(
              currentStoryId
            )
          );

          setPointsAdded(true);
        } catch (pointsError) {
          console.error(
            "⚠️ Points error:",
            pointsError
          );

          message.warning(
            "Story completed, but points could not be saved."
          );
        }
      }

      // -----------------------------------------------
      // SHOW RESULT
      // -----------------------------------------------

      setFinalScore(score);

      setShowResult(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {
      console.error(
        "❌ Error completing story:",
        err
      );

      console.error(
        "Backend error:",
        err?.response?.data
      );

      message.error(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Unable to save completed story."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // NEXT QUESTION
  // ======================================================

  const handleNext = () => {
    if (
      selectedAnswer ===
      null ||
      selectedAnswer ===
      undefined
    ) {
      message.warning(
        "Please select an answer first 😊"
      );

      return;
    }

    const updatedAnswers = {
      ...answers,

      [currentQuestion]:
        selectedAnswer,
    };

    setAnswers(
      updatedAnswers
    );

    // -----------------------------------------------
    // NEXT QUESTION
    // -----------------------------------------------

    if (
      currentQuestion <
      totalQuestions - 1
    ) {
      const nextQuestion =
        currentQuestion + 1;

      setCurrentQuestion(
        nextQuestion
      );

      setSelectedAnswer(
        updatedAnswers[
          nextQuestion
        ] ?? null
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    // -----------------------------------------------
    // FINISH
    // -----------------------------------------------

    finishQuiz(
      updatedAnswers
    );
  };

  // ======================================================
  // PREVIOUS QUESTION
  // ======================================================

  const handlePrevious = () => {
    if (
      currentQuestion === 0
    ) {
      return;
    }

    const previousQuestion =
      currentQuestion - 1;

    setCurrentQuestion(
      previousQuestion
    );

    setSelectedAnswer(
      answers[
        previousQuestion
      ] ?? null
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================================
  // NEXT STORY
  // ======================================================

  const handleNextStory =
    async () => {
      if (submitting) {
        return;
      }

      const nextStoryIndex =
        currentStory + 1;

      // -----------------------------------------------
      // MORE STORIES ALREADY LOADED
      // -----------------------------------------------

      if (
        nextStoryIndex <
        readings.length
      ) {
        const nextStory =
          readings[
            nextStoryIndex
          ];

        console.log(
          "📖 Loading next story:",
          nextStory
        );

        setCurrentStory(
          nextStoryIndex
        );

        setReadingData(
          nextStory
        );

        resetQuizState();

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      // -----------------------------------------------
      // NO MORE STORIES IN CURRENT ARRAY
      // -----------------------------------------------

      console.log(
        "🔄 No more loaded stories. Fetching unfinished stories..."
      );

      await fetchReadingQuestions();
    };

  // ======================================================
  // PAGE BACKGROUND
  // ======================================================

  const pageBackground = {
    position: "relative",
    width: "100%",
    minHeight: "100%",
    padding: "20px",
    boxSizing: "border-box",
    overflow: "hidden",
    borderRadius: "32px",

    background:
      currentTheme.pageBackground,

    boxShadow:
      currentTheme.shadow,

    transition:
      "background 0.8s ease, box-shadow 0.8s ease",
  };

  // ======================================================
  // DECORATIVE BACKGROUND
  // ======================================================

  const DecorativeBackground =
    () => {
      return (
        <>
          <div
            style={{
              position:
                "absolute",
              width: "280px",
              height: "280px",
              borderRadius:
                "50%",
              background:
                currentTheme.circle1,
              top: "-130px",
              right: "-100px",
            }}
          />

          <div
            style={{
              position:
                "absolute",
              width: "150px",
              height: "150px",
              borderRadius:
                "50%",
              background:
                currentTheme.circle2,
              top: "80px",
              right: "60px",
            }}
          />

          <div
            style={{
              position:
                "absolute",
              width: "65px",
              height: "65px",
              borderRadius:
                "50%",
              background:
                currentTheme.circle3,
              top: "200px",
              right: "30px",
            }}
          />

          <div
            style={{
              position:
                "absolute",
              width: "240px",
              height: "240px",
              borderRadius:
                "50%",
              background:
                currentTheme.circle1,
              bottom: "-120px",
              left: "-90px",
            }}
          />

          <div
            style={{
              position:
                "absolute",
              width: "90px",
              height: "90px",
              borderRadius:
                "50%",
              background:
                currentTheme.circle2,
              bottom: "50px",
              left: "90px",
            }}
          />

          <div
            style={{
              position:
                "absolute",
              width: "18px",
              height: "18px",
              borderRadius:
                "50%",
              background:
                currentTheme.circle3,
              top: "300px",
              left: "40px",
            }}
          />

          <div
            style={{
              position:
                "absolute",
              width: "12px",
              height: "12px",
              borderRadius:
                "50%",
              background:
                currentTheme.circle2,
              bottom: "180px",
              right: "70px",
            }}
          />
        </>
      );
    };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div
        style={
          pageBackground
        }
      >
        <DecorativeBackground />

        <div
          style={{
            position:
              "relative",
            zIndex: 5,
            minHeight:
              "500px",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth:
                "700px",
              textAlign:
                "center",
              borderRadius:
                "30px",
              border: "none",
              boxShadow:
                "0 18px 45px rgba(0,0,0,0.18)",
            }}
          >
            <Spin
              size="large"
            />

            <Title
              level={3}
              style={{
                marginTop:
                  "20px",
              }}
            >
              📚 Loading Reading
              Questions...
            </Title>

            <Text type="secondary">
              Get ready for your
              reading adventure! 🚀
            </Text>
          </Card>
        </div>
      </div>
    );
  }

  // ======================================================
  // ALL STORIES COMPLETED
  // ======================================================

  if (
    allStoriesCompleted
  ) {
    return (
      <div
        style={
          pageBackground
        }
      >
        <DecorativeBackground />

        <div
          style={{
            position:
              "relative",
            zIndex: 5,
            minHeight:
              "500px",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            padding: "30px",
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth:
                "750px",
              textAlign:
                "center",
              borderRadius:
                "32px",
              border: "none",
              background:
                "rgba(255,255,255,0.97)",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                fontSize:
                  "80px",
                marginBottom:
                  "15px",
              }}
            >
              🏆🎉📚
            </div>

            <Title
              level={1}
              style={{
                color:
                  currentTheme.accent,
                fontWeight: 800,
              }}
            >
              Amazing! You Finished
              Everything! 🌟
            </Title>

            <Paragraph
              style={{
                fontSize:
                  "20px",
                lineHeight: 1.7,
                color: "#555",
              }}
            >
              You have completed
              all the Grade{" "}
              {grade} reading
              stories. 📖✨
              <br />
              Keep reading, keep
              learning, and keep
              shining! 🚀
            </Paragraph>

            <Tag
              style={{
                fontSize:
                  "18px",
                padding:
                  "10px 20px",
                borderRadius:
                  "20px",
                color:
                  currentTheme.accent,
                background:
                  currentTheme.accentLight,
                border:
                  `1px solid ${currentTheme.accent}`,
              }}
            >
              🌟 All Stories
              Completed
            </Tag>

            <div
              style={{
                marginTop:
                  "30px",
              }}
            >
              <Button
                type="primary"
                size="large"
                icon={
                  <RocketOutlined />
                }
                onClick={
                  fetchReadingQuestions
                }
                style={{
                  height:
                    "55px",
                  borderRadius:
                    "18px",
                  padding:
                    "0 30px",
                  fontSize:
                    "17px",
                  fontWeight: 700,
                  background:
                    currentTheme.buttonBackground,
                  border: "none",
                  boxShadow:
                    currentTheme.shadow,
                }}
              >
                Check for New
                Stories 🚀
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div
        style={
          pageBackground
        }
      >
        <DecorativeBackground />

        <div
          style={{
            position:
              "relative",
            zIndex: 5,
            padding: "30px",
            maxWidth:
              "900px",
            margin: "0 auto",
          }}
        >
          <Card
            style={{
              borderRadius:
                "30px",
              textAlign:
                "center",
              border: "none",
              boxShadow:
                "0 18px 45px rgba(0,0,0,0.18)",
            }}
          >
            <Alert
              type="error"
              showIcon
              message="Unable to Load Questions"
              description={
                error
              }
            />

            <Button
              type="primary"
              icon={
                <ReloadOutlined />
              }
              onClick={
                fetchReadingQuestions
              }
              style={{
                marginTop:
                  "20px",
                borderRadius:
                  "15px",
                height: "48px",
                padding:
                  "0 30px",
              }}
            >
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // ======================================================
  // NO QUESTIONS
  // ======================================================

  if (
    !readingData ||
    totalQuestions === 0
  ) {
    return (
      <div
        style={
          pageBackground
        }
      >
        <DecorativeBackground />

        <div
          style={{
            position:
              "relative",
            zIndex: 5,
            padding: "30px",
            textAlign:
              "center",
          }}
        >
          <Card
            style={{
              borderRadius:
                "30px",
              border: "none",
              boxShadow:
                "0 18px 45px rgba(0,0,0,0.18)",
            }}
          >
            <Title level={3}>
              📚 No Reading
              Questions Found
            </Title>

            <Text>
              Please try again
              later.
            </Text>

            <br />

            <Button
              type="primary"
              onClick={
                fetchReadingQuestions
              }
              style={{
                marginTop:
                  "20px",
                borderRadius:
                  "15px",
              }}
            >
              Reload Questions
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // ======================================================
  // RESULT SCREEN
  // ======================================================

  if (showResult) {
    const percentage =
      totalQuestions > 0
        ? Math.round(
            (finalScore /
              totalQuestions) *
              100
          )
        : 0;

    const isLastStory =
      currentStory >=
      readings.length - 1;

    return (
      <div
        style={
          pageBackground
        }
      >
        <DecorativeBackground />

        <div
          style={{
            position:
              "relative",
            zIndex: 5,
            width: "100%",
            maxWidth:
              "1100px",
            padding:
              "20px 10px 50px",
            margin: "0 auto",
            boxSizing:
              "border-box",
          }}
        >
          <Card
            style={{
              borderRadius:
                "32px",
              textAlign:
                "center",
              border: "none",
              background:
                "rgba(255,255,255,0.97)",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.20)",
            }}
          >
            <Result
              icon={
                <TrophyOutlined
                  style={{
                    fontSize:
                      "75px",
                    color:
                      currentTheme.accent,
                  }}
                />
              }
              title={
                <span
                  style={{
                    fontWeight: 800,
                  }}
                >
                  Great Job! 🎉
                </span>
              }
              subTitle={
                <>
                  You scored{" "}
                  <strong>
                    {finalScore}
                  </strong>{" "}
                  out of{" "}
                  <strong>
                    {totalQuestions}
                  </strong>
                </>
              }
            />

            <Progress
              percent={
                percentage
              }
              status="active"
              strokeWidth={15}
              strokeColor={
                currentTheme.accent
              }
            />

            <div
              style={{
                marginTop:
                  "25px",
              }}
            >
              <Title level={3}>
                ⭐ {finalScore} Points
                Earned!
              </Title>

              <Tag
                style={{
                  fontSize:
                    "16px",
                  padding:
                    "8px 15px",
                  borderRadius:
                    "15px",
                  color:
                    currentTheme.accent,
                  background:
                    currentTheme.accentLight,
                  border:
                    `1px solid ${currentTheme.accent}`,
                }}
              >
                {percentage}%
                Score
              </Tag>
            </div>

            {pointsAdded && (
              <div
                style={{
                  marginTop:
                    "20px",
                }}
              >
                <Text type="success">
                  ✅ Your points
                  have been
                  saved!
                </Text>
              </div>
            )}

            <div
              style={{
                marginTop:
                  "30px",
                display: "flex",
                justifyContent:
                  "center",
                gap: "15px",
                flexWrap:
                  "wrap",
              }}
            >
              <Button
                type="primary"
                size="large"
                icon={
                  <ArrowRightOutlined />
                }
                onClick={
                  handleNextStory
                }
                loading={
                  submitting
                }
                style={{
                  borderRadius:
                    "18px",
                  height:
                    "55px",
                  padding:
                    "0 35px",
                  fontSize:
                    "18px",
                  fontWeight: 700,
                  background:
                    currentTheme.buttonBackground,
                  border: "none",
                  boxShadow:
                    currentTheme.shadow,
                }}
              >
                {isLastStory
                  ? "Check Next Story ➡️"
                  : "Next Story ➡️"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ======================================================
  // PROGRESS
  // ======================================================

  const progress =
    totalQuestions > 0
      ? ((currentQuestion + 1) /
          totalQuestions) *
        100
      : 0;

  // ======================================================
  // MAIN PAGE
  // ======================================================

  return (
    <div
      style={
        pageBackground
      }
    >
      <DecorativeBackground />
      

      <div
        style={{
          position:
            "relative",
          zIndex: 5,
          width: "100%",
          maxWidth:
            "1250px",
          margin: "0 auto",
          boxSizing:
            "border-box",
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}
{!startQuiz  && !completedVocabulary &&
        <div
          style={{
            textAlign:
              "center",
            marginBottom:
              "20px",
          }}
        >
          <div
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: "10px",
              padding:
                "10px 20px",
              borderRadius:
                "30px",
              background:
                "rgba(255,255,255,0.20)",
              color: "#fff",
              fontWeight: 700,
              boxShadow:
                "0 8px 20px rgba(0,0,0,0.10)",
              backdropFilter:
                "blur(8px)",
            }}
          >
          
                  {/* <CompletedVocabulary
  grade={category}
  studentId={user._id}
  user={user}
/> */}

   (
<CompletedVocabulary
  grade={grade}
  studentId={studentId}
  user={user}
/>)
          </div>
        </div>}

        {/* ==================================================
            PASSAGE
        ================================================== */}

        {!startQuiz  && completedVocabulary  &&
          readingData.passage && (<>
           
              {/* <div
                    style={{
                      minHeight:
                        window.innerWidth < 600
                          ? "180px"
                          : "210px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  > */}
                    {/* PAGE INDICATOR */}
                    {/* <div
                      style={{
                        textAlign: "center",
                       
                        color: "rgba(255,255,255,0.95)",
                        fontSize:
                          window.innerWidth < 600
                            ? "14px"
                            : "16px",
                        fontWeight: 800,
                      }}
                    >
                   
                    </div> */}
                      {  !readingData.storyimage  &&  <>
                     <Title
                  level={1}
                  style={{
                    fontSize:
                      window.innerWidth <
                      600
                        ? "25px"
                        : "34px",
                    textAlign:
                      "center",
                    color:
                      "#f1e3f1",
                    fontWeight: 800,
                    textShadow:
                      "0 3px 10px rgba(0,0,0,0.20)",
                    marginBottom:
                      "15px",
                  }}
                >
             
                  <BookOutlined /> 🌈{" "}
                  {readingData.title ||
                    "Reading Comprehension"}{" "}
                  📚
                </Title>
                </>}
                     { readingData.storyimage &&  <>
                       <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        // marginTop: "20px",
                      }}
                    >
                    

<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    width: "100%",
    flexWrap: "wrap",
    // padding: "10px 12px",
    boxSizing: "border-box",
  }}
>
  {/* Back to Vocabulary */}
  <Button
    onClick={handleBackToVocabulary}
    style={{
      width: "100%",
      maxWidth: "220px",
      minWidth: "140px",
      height: "50px",
      borderRadius: "25px",
      fontSize: "clamp(13px, 2vw, 16px)",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
      border: "none",
      color: "#6a1b4d",
      boxShadow: "0 6px 15px rgba(255, 154, 158, 0.35)",
      whiteSpace: "nowrap",
      padding: "0 20px",
    }}
  >
    📚 Back to Vocabulary
  </Button>
{ !readingData.storyimage && <>
   <Button
    onClick={() => setStartQuiz(true)}
    style={{
      width: "100%",
      maxWidth: "220px",
      minWidth: "140px",
      height: "50px",
      borderRadius: "25px",
      fontSize: "clamp(13px, 2vw, 16px)",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
      border: "none",
      color: "#6a1b4d",
      boxShadow: "0 6px 15px rgba(255, 154, 158, 0.35)",
      whiteSpace: "nowrap",
      padding: "0 20px",
    }}
  >
                          🚀 Start Quiz
                        </Button> </>}
</div>
                      
                      <br></br>
                    </div>
  {readingData.storyimage? 

//                     <img
//   src={`${process.env.REACT_APP_API_URL}${readingData.storyimage}`}
//   alt={readingData.title}
// />
 <StoryPdfViewer
    pdfUrl={`${process.env.REACT_APP_API_URL}${readingData.storyimage}`}
    title={readingData.title}
     setStartQuiz={setStartQuiz}
  />

:<div
  style={{
    fontSize: "clamp(60px, 15vw, 120px)",
    lineHeight: 1,
    textAlign: "center",
    width: "100%",
    margin: "10px auto",
  }}
>
  {readingData?.emoji}
</div> }
</> }
            {!readingData.storyimage &&      <> 
                     <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      
                      }}
                    > 
                          <Button
                 type="primary"
                        size="large"
  onClick={handleBackToVocabulary}
      style={{
                          borderRadius: "15px",
                        
                          fontSize: "16px",
                          fontWeight: 700,
                         background: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
    border: "none",
    color: "#6a1b4d",
    boxShadow: "0 6px 15px rgba(255, 154, 158, 0.35)",
                        }}

>
  📚 Back to Vocabulary
</Button></div>


              {/* DECORATION */}

              <div
                style={{
                  position:
                    "absolute",
                  width:
                    "280px",
                  height:
                    "280px",
                  borderRadius:
                    "50%",
                  background:
                    currentTheme.circle1,
                  top:
                    "-140px",
                  right:
                    "-90px",
                }}
              />

              <div
                style={{
                  position:
                    "absolute",
                  width:
                    "140px",
                  height:
                    "140px",
                  borderRadius:
                    "50%",
                  background:
                    currentTheme.circle2,
                  top: "60px",
                  right: "80px",
                }}
              />

              <div
                style={{
                  position:
                    "absolute",
                  width: "60px",
                  height: "60px",
                  borderRadius:
                    "50%",
                  background:
                    currentTheme.circle3,
                  top: "35px",
                  right: "35px",
                }}
              />

              <div
                style={{
                  position:
                    "absolute",
                  width:
                    "230px",
                  height:
                    "230px",
                  borderRadius:
                    "50%",
                  background:
                    currentTheme.circle1,
                  bottom:
                    "-120px",
                  left:
                    "-90px",
                }}
              />

              <div
                style={{
                  position:
                    "absolute",
                  width: "85px",
                  height: "85px",
                  borderRadius:
                    "50%",
                  background:
                    currentTheme.circle2,
                  bottom: "40px",
                  left: "100px",
                }}
              />

              {/* CONTENT */}

              <div
                style={{
                  position:
                    "relative",
                  zIndex: 5,
                }}
              >
               

            

                <div
                  style={{
                    // background:
                    //   "rgba(255,255,255,0.14)",
                     background:"white",
                  //  currentTheme.passageBackground,
                    border:
                      "1px solid rgba(255,255,255,0.25)",
                    borderRadius:
                      "24px",
                    padding:
                      window.innerWidth <
                      600
                        ? "20px"
                        : "30px",
                    backdropFilter:
                      "blur(10px)",
                    WebkitBackdropFilter:
                      "blur(10px)",
                    boxShadow:
                      "0 12px 35px rgba(0,0,0,0.10)",
                  }}
                >
                  {/* ================================================
                      CURRENT PASSAGE - ONLY 2 LINES AT A TIME
                  ================================================= */}
  {/* 📖 Part {passagePage + 1} of {totalPassagePages} */}
  <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    textAlign: "center",
    fontSize: "clamp(60px, 12vw, 120px)",
    lineHeight: 1.3,
    padding: "15px 0",
  }}
>
  {readingData?.emoji}
</div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: "14px",
                        minHeight:
                          window.innerWidth < 600
                            ? "110px"
                            : "130px",
                      }}
                    >
                      {currentPassageLines.map((line, index) => (
                        <div
                          key={`${passagePage}-${index}`}
                          style={{
                            fontSize:
                              window.innerWidth < 600
                                ? "18px"
                                : "21px",
                            lineHeight: 1.6,
                            letterSpacing: "0.2px",
                            color:  currentTheme.passageBackground,
                            fontWeight: 500,
                            textShadow:
                              "0 2px 5px rgba(0,0,0,0.15)",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {line}
                        </div>
                      ))}
                    </div>

                    {/* LISTEN */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20px",
                      }}
                    > 
         
                      <Button
                        type="primary"
                        size="large"
                        onClick={() =>
                          speakLine(currentPassageLines.join(" "))
                        }
                        style={{
                          borderRadius: "15px",
                          minWidth:
                            window.innerWidth < 600
                              ? "140px"
                              : "170px",
                          height: "48px",
                          fontSize: "16px",
                          fontWeight: 700,
                          background:
                            currentTheme.buttonBackground,
                          border: "none",
                          boxShadow: currentTheme.shadow,
                        }}
                      >
                        🔊 Listen
                      </Button>
                    </div>

                    {/* BACK / NEXT */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "12px",
                        marginTop: "25px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        size="large"
                        disabled={isFirstPassagePage}
                        onClick={handlePreviousPassage}
                        style={{
                          minWidth:
                            window.innerWidth < 600
                              ? "120px"
                              : "140px",
                          height: "48px",
                          borderRadius: "15px",
                          fontWeight: 700,
                        }}
                      >
                        ⬅️ Back
                      </Button>

                      {!isLastPassagePage ? (
                        <Button
                          type="primary"
                          size="large"
                          onClick={handleNextPassage}
                          style={{
                            minWidth:
                              window.innerWidth < 600
                                ? "120px"
                                : "140px",
                            height: "48px",
                            borderRadius: "15px",
                            fontWeight: 700,
                            background:
                              currentTheme.buttonBackground,
                            border: "none",
                            boxShadow: currentTheme.shadow,
                          }}
                        >
                          Next ➡️
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => setStartQuiz(true)}
                          style={{
                            minWidth:
                              window.innerWidth < 600
                                ? "160px"
                                : "190px",
                            height: "48px",
                            borderRadius: "15px",
                            fontWeight: 700,
                            background:
                              currentTheme.buttonBackground,
                            border: "none",
                            boxShadow: currentTheme.shadow,
                          }}
                        >
                          🚀 Start Quiz
                        </Button>
                      )}
                    </div>
                
                </div>
              </div>
       

             
                    
                    
                     </> }

                  {/* </div> */}
            </>
          )}

        {/* ==================================================
            VOCABULARY
        ================================================== */}

{/* ==================================================
    CURRENT STORY VOCABULARY
================================================== */}

{!startQuiz  && !completedVocabulary  &&
  vocabularyList.length > 0 &&
  currentVocabularyItem && (
    <Card
      style={{
        width: "100%",
        borderRadius: "30px",
        marginTop: "25px",
        marginBottom: "25px",
        border: "none",
        background: "rgba(255,255,255,0.98)",
        boxShadow:
          "0 15px 40px rgba(0,0,0,0.15)",
        overflow: "hidden",
      }}
      styles={{
        body: {
          padding:
            window.innerWidth < 600
              ? "25px 18px"
              : "40px 50px",
        },
      }}
    >
      {/* HEADER */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            fontSize:
              window.innerWidth < 600
                ? "28px"
                : "34px",
            fontWeight: 800,
            color: currentTheme.accent,
          }}
        >
          🧠 New Word
        </div>

        <div
          style={{
            marginTop: "8px",
            fontSize:
              window.innerWidth < 600
                ? "14px"
                : "16px",
            color: "#888",
            fontWeight: 600,
          }}
        >
          Word {currentVocabulary + 1} of{" "}
          {vocabularyList.length}
        </div>
      </div>

      {/* WORD CARD */}

      <div
        style={{
          width: "100%",
          minHeight:
            window.innerWidth < 600
              ? "260px"
              : "300px",
          borderRadius: "28px",
          background:
            currentTheme.passageBackground,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding:
            window.innerWidth < 600
              ? "30px 20px"
              : "45px",
          boxSizing: "border-box",
          boxShadow:
            currentTheme.shadow,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}

        <div
          style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background:
              "rgba(255,255,255,0.15)",
            top: "-60px",
            right: "-50px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background:
              "rgba(255,255,255,0.12)",
            bottom: "-40px",
            left: "-30px",
          }}
        />

        {/* WORD */}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            fontSize:
              window.innerWidth < 600
                ? "42px"
                : "58px",
            fontWeight: 900,
            color: "#ffffff",
            textShadow:
              "0 4px 12px rgba(0,0,0,0.25)",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            lineHeight: 1.15,
          }}
        >
          <Button
                        type="primary"
                        size="large"
                     
                   onClick={() =>
    speakLine(
      typeof currentVocabularyItem === "string"
        ? currentVocabularyItem
        : `${currentVocabularyItem?.word}. Meaning: ${currentVocabularyItem?.meaning}. Example: ${currentVocabularyItem?.example}`
    )
  }
                      style={{
   
    fontSize: window.innerWidth < 600 ? "14px" : "16px",
    fontWeight: "bold",
  
    background: "transparent",
    border: "none",
    color: "#6a1b4d",
    // boxShadow: "0 6px 15px rgba(255, 154, 158, 0.35)",
  }}
                      >
                        🔊 
                      </Button>
          {typeof currentVocabularyItem ===
          "string"
            ? currentVocabularyItem
            : currentVocabularyItem?.word}

          
        </div>

        {/* MEANING */}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            marginTop: "20px",
            fontSize:
              window.innerWidth < 600
                ? "17px"
                : "21px",
            fontWeight: 500,
            color: "#ffffff",
            lineHeight: 1.6,
            maxWidth: "800px",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          {typeof currentVocabularyItem ===
          "string"
            ? ""
            : currentVocabularyItem?.meaning}
        </div>

        {/* EXAMPLE */}

        {typeof currentVocabularyItem !==
          "string" &&
          currentVocabularyItem?.example && (
            <div
              style={{
                position: "relative",
                zIndex: 2,
                marginTop: "15px",
                fontSize:
                  window.innerWidth < 600
                    ? "14px"
                    : "16px",
                color:
                  "rgba(255,255,255,0.9)",
                fontStyle: "italic",
                maxWidth: "700px",
                lineHeight: 1.5,
              }}
            >
              💡 Example:{" "}
              {currentVocabularyItem.example}
            </div>
          )}
      </div>

      {/* NAVIGATION */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "15px",
          marginTop: "25px",
          flexWrap: "wrap",
        }}
      >
        {/* PREVIOUS */}

        <Button
          size="large"
          disabled={currentVocabulary === 0}
          onClick={handlePreviousVocabulary}
          style={{
            minWidth:
              window.innerWidth < 600
                ? "120px"
                : "140px",
            height: "50px",
            borderRadius: "16px",
            fontWeight: 700,
          }}
        >
          ⬅️ Back
        </Button>

        {/* NEXT */}

        <Button
  type="primary"
  onClick={handleNextVocabulary}
  style={{
    minWidth: window.innerWidth < 600 ? "130px" : "160px",
    height: window.innerWidth < 600 ? "45px" : "50px",
    borderRadius: "25px",
    fontSize: window.innerWidth < 600 ? "15px" : "17px",
    fontWeight: "bold",
    background: currentVocabulary === vocabularyList.length - 1
      ? "linear-gradient(135deg, #00c853, #64dd17)"
      : "linear-gradient(135deg, #667eea, #764ba2)",
    border: "none",
  }}
>
  {currentVocabulary === vocabularyList.length - 1
    ? "Finished 🎉"
    : "Next ➡️"}
</Button>
      </div>
    </Card>
  )}
       

        {/* ==================================================
            QUESTION CARD
        ================================================== */}

        {startQuiz && (
          <Card
            style={{
              width: "100%",
              borderRadius:
                "32px",
              border: "none",
              background:
                "rgba(255,255,255,0.98)",
              boxShadow:
                "0 18px 40px rgba(0,0,0,0.14)",
         
              // marginBottom:
              //   "30px",
            }}
            styles={{
              body: {
                padding:
                  window.innerWidth <
                  600
                    ? "25px 20px"
                    : "35px 45px",
              },
            }}
          >
            {/* BACK */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-start",
                alignItems:
                  "center",
                width: "100%",
                marginBottom:
                  "25px",
              }}
            >
              <Button
                size="large"
                onClick={() =>
                  setStartQuiz(false)
                }
                style={{
                  color:"orange",
                  borderRadius:
                    "18px",
                  height:
                    "50px",
                  padding:
                    "0 20px",
                  fontWeight:
                    600,
                }}
              >
                ⬅️ Back to Story
              </Button>
            </div>

            {/* QUESTION HEADER */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap: "10px",
                flexWrap:
                  "wrap",
              }}
            >
              <Text
                type="secondary"
                style={{
                  fontSize:
                    "16px",
                  fontWeight:
                    600,
                }}
              >
                📖 Question{" "}
                {currentQuestion +
                  1}{" "}
                of{" "}
                {totalQuestions}
              </Text>

              <Tag
                style={{
                  borderRadius:
                    "20px",
                  padding:
                    "6px 13px",
                  fontWeight:
                    600,
                  color:
                    currentTheme.accent,
                  background:
                    currentTheme.accentLight,
                  border:
                    `1px solid ${currentTheme.accent}`,
                }}
              >
                {question?.type ===
                "vocabulary"
                  ? "🧠 Vocabulary"
                  : "📖 Story"}{" "}
                • Story{" "}
                {currentStory +
                  1}
              </Tag>
            </div>

            {/* PROGRESS */}

            <Progress
              percent={Math.round(
                progress
              )}
              showInfo={false}
              strokeWidth={12}
              strokeColor={
                currentTheme.accent
              }
              style={{
                marginTop:
                  "15px",
              }}
            />


            {/* QUESTION */}

            <Title
              level={3}
              style={{
                marginTop:
                  "20px",
                lineHeight:
                  "1.6",
                fontSize:
                  window.innerWidth <
                  600
                    ? "21px"
                    : "24px",
                fontWeight:
                  700,
              }}
            >
              {question?.question ||
                question?.text ||
                "Question not available"}
            </Title>

            {/* OPTIONS */}

            <Radio.Group
              value={
                selectedAnswer
              }
              onChange={(e) =>
                handleAnswer(
                  e.target.value
                )
              }
              style={{
                width:
                  "100%",
                marginTop:
                  "20px",
              }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{
                  width:
                    "100%",
                }}
              >
                {(
                  question?.options ||
                  []
                ).map(
                  (
                    option,
                    index
                  ) => {
                    const isSelected =
                      selectedAnswer ===
                      option;

                    return (
                      <Card
                        key={`${question.id}-option-${index}-${option}`}
                        hoverable
                        onClick={() =>
                          handleAnswer(
                            option
                          )
                        }
                        style={{
                          width:
                            "100%",
                          borderRadius:
                            "20px",
                          cursor:
                            "pointer",
                          border:
                            isSelected
                              ? `3px solid ${currentTheme.accent}`
                              : "2px solid #edf0f7",
                          background:
                            isSelected
                              ? currentTheme.accentLight
                              : "#ffffff",
                          transition:
                            "all 0.25s ease",
                          boxShadow:
                            isSelected
                              ? `0 8px 22px ${currentTheme.accent}35`
                              : "0 3px 12px rgba(0,0,0,0.05)",
                          transform:
                            isSelected
                              ? "translateY(-2px)"
                              : "translateY(0)",
                        }}
                        styles={{
                          body: {
                            padding:
                              "18px 22px",
                          },
                        }}
                      >
                        <Radio
                          value={
                            option
                          }
                          style={{
                            width:
                              "100%",
                            fontSize:
                              "18px",
                            fontWeight:
                              isSelected
                                ? 700
                                : 500,
                          }}
                        >
                          <span
                            style={{
                              marginLeft:
                                "8px",
                            }}
                          >
                            {String.fromCharCode(
                              65 +
                                index
                            )}
                            .{" "}
                            {option}
                          </span>
                        </Radio>
                      </Card>
                    );
                  }
                )}
              </Space>
            </Radio.Group>

            {/* NAVIGATION */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                gap: "15px",
                marginTop:
                  "35px",
                flexWrap:
                  "wrap",
              }}
            >
              {/* PREVIOUS */}

              <Button
                size="large"
                icon={
                  <LeftOutlined />
                }
                disabled={
                  currentQuestion ===
                  0
                }
                onClick={
                  handlePrevious
                }
                style={{
                  borderRadius:
                    "15px",
                  minWidth:
                    "140px",
                  height:
                    "50px",
                  fontWeight:
                    600,
                }}
              >
                Previous
              </Button>

              {/* NEXT / FINISH */}

              <Button
                type="primary"
                size="large"
                icon={
                  currentQuestion ===
                  totalQuestions - 1 ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ArrowRightOutlined />
                  )
                }
                loading={
                  submitting
                }
                onClick={
                  handleNext
                }
                style={{
                  borderRadius:
                    "15px",
                  minWidth:
                    "170px",
                  height:
                    "50px",
                  fontSize:
                    "17px",
                  fontWeight:
                    700,
                  background:
                    currentTheme.buttonBackground,
                  border: "none",
                  boxShadow:
                    currentTheme.shadow,
                }}
              >
                {currentQuestion ===
                totalQuestions - 1
                  ? "Finish 🎉"
                  : "Next ➡️"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReadingComprehensionkg;