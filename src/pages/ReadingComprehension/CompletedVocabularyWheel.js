import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Button,
  Typography,
  Tag,
  Alert,
  Spin,
  Empty,
  Radio,
  Result,
} from "antd";

import {
  ReloadOutlined,
  SoundOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import api from "../../api/axiosClient";

const { Title, Text, Paragraph } = Typography;

const WHEEL_COLORS = [
  "#FF0080",
  "#FFD000",
  "#00F5A0",
  "#00D9FF",
  "#A855F7",
];
const CompletedVocabularyWheel = ({ studentId, user,addPointsToBackend }) => {
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wheelWords, setWheelWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  const currentUserId =
    studentId ||
    user?._id ||
    user?.id ||
    null;

  const isStudent = Boolean(studentId);

  // --------------------------------------------------
  // LEVEL LABEL
  // --------------------------------------------------

  const getLevelLabel = (grade) => {
    if (!grade) return "Reading";

    const value = String(grade).toLowerCase();

    if (value === "kg1") return "KG 1";
    if (value === "kg2") return "KG 2";

    return `Grade ${grade}`;
  };

  // --------------------------------------------------
  // FETCH ONLY COMPLETED STORIES
  // --------------------------------------------------

  const fetchCompletedStories = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = isStudent
        ? {
            studentId: String(studentId),
          }
        : {
            userId: String(
              user?._id || user?.id
            ),
          };

      const response = await api.get(
        "/reading/completed",
        { params }
      );

      console.log(
        "🎯 Completed stories for vocabulary game:",
        response.data
      );

      const stories =
        response?.data?.data || [];

      setCompletedStories(stories);

      // Immediately create first wheel
      createWheelWords(stories);

    } catch (err) {
      console.error(
        "❌ Failed to load completed stories:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load your vocabulary."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedStories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    studentId,
    user?._id,
    user?.id,
  ]);

  // --------------------------------------------------
  // EXTRACT VOCABULARY FROM COMPLETED STORIES
  // --------------------------------------------------

  const allVocabulary = useMemo(() => {
    const words = [];

    completedStories.forEach((story) => {
      if (!Array.isArray(story?.vocabulary)) {
        return;
      }

      story.vocabulary.forEach((item) => {
        const word =
          typeof item === "string"
            ? item
            : item?.word;

        const meaning =
          typeof item === "string"
            ? ""
            : item?.meaning || "";

        const example =
          typeof item === "string"
            ? ""
            : item?.example || "";

        if (!word || !meaning) {
          return;
        }

        words.push({
          word: String(word).trim(),
          meaning: String(meaning).trim(),
          example: String(example || "").trim(),

          storyTitle:
            story?.title || "Reading Story",

          storyId:
            story?._id || story?.id,

          grade: story?.grade,
        });
      });
    });

    // Remove duplicate words
    const unique = [];
    const seen = new Set();

    words.forEach((item) => {
      const key = item.word
        .toLowerCase()
        .trim();

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    return unique;
  }, [completedStories]);

  // --------------------------------------------------
  // CREATE 5 WORD WHEEL
  // --------------------------------------------------

  const createWheelWords = (stories = completedStories) => {
    const words = [];

    stories.forEach((story) => {
      if (!Array.isArray(story?.vocabulary)) {
        return;
      }

      story.vocabulary.forEach((item) => {
        const word =
          typeof item === "string"
            ? item
            : item?.word;

        const meaning =
          typeof item === "string"
            ? ""
            : item?.meaning || "";

        if (!word || !meaning) {
          return;
        }

        words.push({
          word: String(word).trim(),
          meaning: String(meaning).trim(),
          storyTitle:
            story?.title || "Reading Story",
          grade: story?.grade,
        });
      });
    });

    // Remove duplicates
    const unique = [];
    const seen = new Set();

    words.forEach((item) => {
      const key = item.word.toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    // Shuffle
    const shuffled = [...unique].sort(
      () => Math.random() - 0.5
    );

    // Pick maximum 5
    setWheelWords(
      shuffled.slice(0, 5)
    );

    setSelectedWord(null);
    setOptions([]);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrect(false);
  };

  // --------------------------------------------------
  // SPIN WHEEL
  // --------------------------------------------------

  const spinWheel = () => {
    if (
      spinning ||
      wheelWords.length === 0
    ) {
      return;
    }

    setSpinning(true);
    setSelectedWord(null);
    setOptions([]);
    setSelectedAnswer(null);
    setAnswered(false);

    // Random winning index
    const winningIndex = Math.floor(
      Math.random() * wheelWords.length
    );

    const segmentAngle =
      360 / wheelWords.length;

    /*
      Add several complete rotations
      so the wheel looks like it is really spinning.
    */
    const extraRotations = 5 * 360;

    const targetAngle =
      extraRotations +
      (360 -
        winningIndex * segmentAngle -
        segmentAngle / 2);

    const newRotation =
      rotation + targetAngle;

    setRotation(newRotation);

    setTimeout(() => {
      const winner =
        wheelWords[winningIndex];

      setSelectedWord(winner);

      createAnswerOptions(
        winner,
        wheelWords
      );

      setSpinning(false);

      speakWord(winner.word);
    }, 4200);
  };

  // --------------------------------------------------
  // CREATE MEANING OPTIONS
  // --------------------------------------------------

  const createAnswerOptions = (
    correctWord,
    availableWords
  ) => {
    const wrongAnswers =
      availableWords
        .filter(
          (item) =>
            item.word !==
            correctWord.word
        )
        .map(
          (item) => item.meaning
        );

    const shuffledWrong =
      [...wrongAnswers]
        .sort(
          () => Math.random() - 0.5
        )
        .slice(0, 3);

    const answerOptions = [
      correctWord.meaning,
      ...shuffledWrong,
    ].sort(
      () => Math.random() - 0.5
    );

    setOptions(answerOptions);
  };

  // --------------------------------------------------
  // ANSWER
  // --------------------------------------------------

  const checkAnswer = () => {
    if (
      !selectedAnswer ||
      !selectedWord
    ) {
      return;
    }

    const isCorrect =
      selectedAnswer ===
      selectedWord.meaning;

    setCorrect(isCorrect);
    setAnswered(true);

    if (isCorrect) {
      speakWord(
        "Correct! " +
          selectedWord.word
      );
      addPointsToBackend(2);
    }
  };

  // --------------------------------------------------
  // SPEECH
  // --------------------------------------------------

  const speakWord = (text) => {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    speech.lang = "en-US";
    speech.rate = 0.85;
    speech.pitch = 1;

    window.speechSynthesis.speak(
      speech
    );
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div
        style={{
          minHeight: 400,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Unable to load vocabulary"
        description={error}
      />
    );
  }

  // --------------------------------------------------
  // NO VOCABULARY
  // --------------------------------------------------

  if (
    allVocabulary.length === 0
  ) {
    return (
      <Card
        style={{
          borderRadius: 25,
          textAlign: "center",
        }}
      >
        <Empty
          image={
            <div
              style={{
                fontSize: 70,
              }}
            >
              📚🎡
            </div>
          }
          description={
            <div>
              <Title level={3}>
                Read a story first!
              </Title>

              <Text type="secondary">
                Finish a reading story to
                unlock the vocabulary wheel.
              </Text>
            </div>
          }
        />
      </Card>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div
      style={{
        padding: 25,
        borderRadius: 30,
        background:
          "linear-gradient(135deg,#eef2ff,#fdf2ff,#ecfeff)",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          textAlign: "center",
          marginBottom: 25,
        }}
      >
        <div
          style={{
            fontSize: 60,
          }}
        >
          🎡📚✨
        </div>

        <Title
          level={2}
          style={{
            margin: 0,
            color: "#5b4bdb",
            fontWeight: 800,
          }}
        >
          Vocabulary Spin & Answer
        </Title>

        <Paragraph
          style={{
            fontSize: 16,
            color: "#666",
          }}
        >
          Spin the wheel and find the
          meaning of the word! 🚀
        </Paragraph>

        <Tag color="green">
          🔒 Only words from stories
          you have finished
        </Tag>
      </div>

      {/* WHEEL */}

      <Card
        style={{
          borderRadius: 30,
          border: "none",
          textAlign: "center",
          boxShadow:
            "0 15px 40px rgba(0,0,0,0.10)",
        }}
      >
        <Title level={4}>
          🎯 Your 5 Vocabulary Words
        </Title>

        <div
          style={{
            position: "relative",
            width: 330,
            height: 330,
            margin: "30px auto",
          }}
        >
          {/* POINTER */}

          <div
            style={{
              position: "absolute",
              top: -18,
              left: "50%",
              transform:
                "translateX(-50%)",
              zIndex: 10,
              fontSize: 40,
            }}
          >
            🔻
          </div>

          {/* WHEEL */}

          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              border:
                "10px solid white",
              boxShadow:
                "0 8px 30px rgba(0,0,0,0.20)",
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? "transform 4s cubic-bezier(0.15,0.8,0.25,1)"
                : "none",
              background: `conic-gradient(
                ${wheelWords
                  .map(
                    (_, index) =>
                      `${WHEEL_COLORS[index]} ${
                        index *
                        (100 /
                          wheelWords.length)
                      }% ${
                        (index + 1) *
                        (100 /
                          wheelWords.length)
                      }%`
                  )
                  .join(",")}
              )`,
              position: "relative",
            }}
          >
            {wheelWords.map(
              (item, index) => {
                const angle =
                  index *
                    (360 /
                      wheelWords.length) +
                  360 /
                    wheelWords.length /
                    2;

                return (
                  <div
                    key={item.word}
                    style={{
                      position:
                        "absolute",
                      left: "50%",
                      top: "50%",
                      transform: `
                        rotate(${angle}deg)
                        translateY(-115px)
                        rotate(-${angle}deg)
                      `,
                      transformOrigin:
                        "center",
                      width: 100,
                      marginLeft: -50,
                      textAlign: "center",
                      color: "white",
                      fontWeight: 800,
                      fontSize: 14,
                      textShadow:
                        "0 2px 3px rgba(0,0,0,.35)",
                    }}
                  >
                    {item.word}
                  </div>
                );
              }
            )}
          </div>

          {/* CENTER */}

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform:
                "translate(-50%,-50%)",
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 30,
              boxShadow:
                "0 5px 20px rgba(0,0,0,.2)",
              zIndex: 5,
            }}
          >
            🎡
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          danger
          loading={spinning}
          disabled={
            spinning || selectedWord||
            wheelWords.length < 2
          }
          onClick={spinWheel}
          style={{
            height: 60,
            padding: "0 45px",
            borderRadius: 20,
            fontSize: 20,
            fontWeight: 800,
          }}
        >
          {spinning
            ? "SPINNING... 🎡"
            : "SPIN THE WHEEL! 🎯"}
        </Button>

        <div
          style={{
            marginTop: 20,
          }}
        >
          <Button
            icon={<ReloadOutlined />}
            onClick={() =>
              createWheelWords()
            }
            disabled={spinning || selectedWord}
          >
            New 5 Words
          </Button>
        </div>
      </Card>

      {/* SELECTED WORD */}

      {selectedWord && (
        <Card
          style={{
            marginTop: 25,
            borderRadius: 30,
            border: "none",
            textAlign: "center",
            boxShadow:
              "0 12px 35px rgba(0,0,0,.10)",
          }}
        >
          <div
            style={{
              fontSize: 55,
            }}
          >
            🎉
          </div>

          <Text
            type="secondary"
            strong
          >
            THE WHEEL CHOSE
          </Text>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              margin: "10px 0 20px",
            }}
          >
            <Title
              level={1}
              style={{
                margin: 0,
                color: "#5b4bdb",
              }}
            >
              {selectedWord.word}
            </Title>

            <Button
              shape="circle"
              icon={
                <SoundOutlined />
              }
              onClick={() =>
                speakWord(
                  selectedWord.word
                )
              }
            />
          </div>

          <Tag color="blue">
            📖 {selectedWord.storyTitle}
          </Tag>

          <Tag color="purple">
            🎓{" "}
            {getLevelLabel(
              selectedWord.grade
            )}
          </Tag>

          <div
            style={{
              marginTop: 25,
              textAlign: "left",
            }}
          >
            <Title level={4}>
              🧠 What does{" "}
              <b>{selectedWord.word}</b>{" "}
              mean?
            </Title>

            <Radio.Group
              value={selectedAnswer}
              onChange={(e) =>
                setSelectedAnswer(
                  e.target.value
                )
              }
              disabled={answered}
              style={{
                width: "100%",
              }}
            >
              {options.map(
                (option, index) => (
                  <Card
                    key={option}
                    hoverable={!answered}
                    style={{
                      marginBottom: 12,
                      borderRadius: 16,

                      border:
                        selectedAnswer ===
                        option
                          ? "2px solid #667eea"
                          : "1px solid #eee",

                      background:
                        answered &&
                        option ===
                          selectedWord.meaning
                          ? "#ecfdf5"
                          : answered &&
                            selectedAnswer ===
                              option
                          ? "#fff1f2"
                          : "white",
                    }}
                  >
                    <Radio
                      value={option}
                    >
                      <b>
                        {String.fromCharCode(
                          65 + index
                        )}
                        .
                      </b>{" "}
                      {option}
                    </Radio>
                  </Card>
                )
              )}
            </Radio.Group>

            {!answered && (
              <Button
                type="primary"
                size="large"
                block
                disabled={!selectedAnswer}
                onClick={checkAnswer}
                style={{
                  height: 55,
                  borderRadius: 16,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                CHECK ANSWER ✅
              </Button>
            )}

            {answered && (
              <Result
                status={
                  correct
                    ? "success"
                    : "error"
                }
                title={
                  correct
                    ? "🎉 Excellent! Correct Answer!"
                    : "💪 Good Try!"
                }
                subTitle={
                  correct
                    ? `You found the meaning of "${selectedWord.word}"!`
                    : `The correct meaning is: ${selectedWord.meaning}`
                }
                extra={
                  <Button
                    type="primary"
                    icon={
                      <ReloadOutlined />
                    }
                    onClick={() => {
                      createWheelWords();
                    }}
                  >
                    SPIN AGAIN 🎡
                  </Button>
                }
              />
            )}
          </div>
        </Card>
      )}

      {/* SMALL INFO */}

      <Card
        style={{
          marginTop: 20,
          borderRadius: 20,
          border: "none",
          background:
            "rgba(255,255,255,.75)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 15,
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 30,
              }}
            >
              📚
            </div>
            <Text strong>
              {completedStories.length}
            </Text>
            <br />
            <Text type="secondary">
              Stories Finished
            </Text>
          </div>

          <div>
            <div
              style={{
                fontSize: 30,
              }}
            >
              🔤
            </div>
            <Text strong>
              {allVocabulary.length}
            </Text>
            <br />
            <Text type="secondary">
              Words Available
            </Text>
          </div>

          <div>
            <div
              style={{
                fontSize: 30,
              }}
            >
              🎡
            </div>
            <Text strong>
              {wheelWords.length}
            </Text>
            <br />
            <Text type="secondary">
              Words on Wheel
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompletedVocabularyWheel;