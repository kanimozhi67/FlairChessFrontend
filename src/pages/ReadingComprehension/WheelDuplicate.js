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
  Row,
  Col,
  Progress,
} from "antd";

import {
  ReloadOutlined,
  SoundOutlined,
  TrophyOutlined,
  CheckCircleFilled,
  BookFilled,
  BulbFilled,
  StarFilled,
} from "@ant-design/icons";

import api from "../../api/axiosClient";

import "./CompletedVocabularyWheel.css";

const { Title, Text, Paragraph } = Typography;

const WHEEL_COLORS = [
  "#FF4D8D",
  "#FFB830",
  "#25C9A5",
  "#42A5F5",
  "#A879FF",
];

const WORD_EMOJIS = [
  "🦋",
  "🌈",
  "🚀",
  "🦄",
  "🌟",
  "🐝",
  "🌻",
  "🎈",
];

const WheelDuplicate = ({
  studentId,
  user,
  addPointsToBackend,
}) => {
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [disableWheel,setDisableWheel] = useState(false);
  const [wheelWords, setWheelWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  const currentUserId = studentId || user?._id || user?.id || null;
  const isStudent = Boolean(studentId);

  const getLevelLabel = (grade) => {
    if (!grade) return "Reading";

    const value = String(grade).toLowerCase();

    if (value === "kg1") return "KG 1";
    if (value === "kg2") return "KG 2";

    return `Grade ${grade}`;
  };

  // -----------------------------------------------
  // SPEAK A WORD
  // -----------------------------------------------

  const speakWord = (text) => {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.85;
    speech.pitch = 1.1;

    window.speechSynthesis.speak(speech);
  };

  // -----------------------------------------------
  // FETCH COMPLETED STORIES ONLY
  // -----------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchCompletedStories = async () => {
      if (!currentUserId) {
        setCompletedStories([]);
        setLoading(false);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params = isStudent
          ? { studentId: String(studentId) }
          : { userId: String(user?._id || user?.id) };

        const response = await api.get("/reading/completed", {
          params,
        });

        const payload = response?.data;

        const stories = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        if (!cancelled) {
          setCompletedStories(stories);
        }
      } catch (err) {
        console.error("Failed to load completed stories:", err);

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "We couldn't load your word adventures. Please try again!"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCompletedStories();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, isStudent, studentId, user?._id, user?.id]);

  // -----------------------------------------------
  // EXTRACT UNIQUE WORDS
  // -----------------------------------------------

  const allVocabulary = useMemo(() => {
    const uniqueWords = new Map();

    completedStories.forEach((story) => {
      if (!Array.isArray(story?.vocabulary)) return;

      story.vocabulary.forEach((item) => {
        const word =
          typeof item === "string" ? item : item?.word;

        const meaning =
          typeof item === "string" ? "" : item?.meaning;

        const example =
          typeof item === "string" ? "" : item?.example;

        if (!word || !meaning) return;

        const cleanWord = String(word).trim();
        const cleanMeaning = String(meaning).trim();

        if (!cleanWord || !cleanMeaning) return;

        const key = cleanWord.toLowerCase();

        if (!uniqueWords.has(key)) {
          uniqueWords.set(key, {
            word: cleanWord,
            meaning: cleanMeaning,
            example: String(example || "").trim(),
            storyTitle: story?.title || "My Reading Adventure",
            storyId: story?._id || story?.id,
            grade: story?.grade,
          });
        }
      });
    });

    return Array.from(uniqueWords.values());
  }, [completedStories]);

  // -----------------------------------------------
  // CREATE A FRESH SET OF FIVE WORDS
  // -----------------------------------------------

  const createWheelWords = () => {
    const shuffled = [...allVocabulary];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setWheelWords(shuffled.slice(0, 5));
    setSelectedWord(null);
    setOptions([]);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrect(false);
  };

  useEffect(() => {
    if (!loading && allVocabulary.length > 0) {
      createWheelWords();
    } else if (!loading) {
      setWheelWords([]);
    }

    // Initialize when the vocabulary changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, allVocabulary]);

  // -----------------------------------------------
  // CREATE ANSWER CHOICES
  // -----------------------------------------------

  const createAnswerOptions = (winner) => {
    const wrongAnswers = allVocabulary
      .filter(
        (item) =>
          item.word.toLowerCase() !== winner.word.toLowerCase() &&
          item.meaning.toLowerCase() !== winner.meaning.toLowerCase()
      )
      .map((item) => item.meaning);

    const shuffledWrong = [...new Set(wrongAnswers)]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const answerOptions = [
      winner.meaning,
      ...shuffledWrong,
    ].sort(() => Math.random() - 0.5);

    setOptions(answerOptions);
  };

  // -----------------------------------------------
  // SPIN THE WHEEL
  // -----------------------------------------------

  const spinWheel = () => {
    if (spinning || wheelWords.length === 0) return;

    setSpinning(true);
    setSelectedWord(null);
    setOptions([]);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrect(false);

    const winningIndex = Math.floor(
      Math.random() * wheelWords.length
    );

    const segmentAngle = 360 / wheelWords.length;
    const winningCenterAngle =
      winningIndex * segmentAngle + segmentAngle / 2;

    const desiredRotation =
      (360 - winningCenterAngle + 360) % 360;

    const currentAngle = ((rotation % 360) + 360) % 360;

    const adjustment =
      (desiredRotation - currentAngle + 360) % 360;

    const newRotation =
      rotation + 6 * 360 + adjustment;

    const winner = wheelWords[winningIndex];

    setRotation(newRotation);

    window.setTimeout(() => {
      setSelectedWord(winner);
      createAnswerOptions(winner);
      setSpinning(false);
      speakWord(winner.word);
    }, 4200);
    setDisableWheel(true);
  };

  // -----------------------------------------------
  // CHECK ANSWER
  // -----------------------------------------------

  const checkAnswer = () => {
    if (!selectedAnswer || !selectedWord || answered) return;

    const isCorrect = selectedAnswer === selectedWord.meaning;

    setCorrect(isCorrect);
    setAnswered(true);

    if (isCorrect) {
      speakWord(`Amazing! ${selectedWord.word}. ${selectedWord.meaning}`);

      if (typeof addPointsToBackend === "function") {
        addPointsToBackend(2);
      }
    } else {
      speakWord(
        `Try again! ${selectedWord.word} means ${selectedWord.meaning}`
      );
    }
  };

  // -----------------------------------------------
  // START ANOTHER ROUND
  // -----------------------------------------------

  const playAgain = () => {
    setDisableWheel(false);
    createWheelWords();
  };

  // -----------------------------------------------
  // LOADING SCREEN
  // -----------------------------------------------

  if (loading) {
    return (
      <div className="vocab-loading">
        <div className="vocab-loading-emoji">🦋📚✨</div>
        <Spin size="large" />
        <Title level={3}>Preparing your word adventure!</Title>
        <Text>Getting your magical words ready...</Text>
      </div>
    );
  }

  // -----------------------------------------------
  // ERROR SCREEN
  // -----------------------------------------------

  if (error) {
    return (
      <div className="vocab-app">
        <Card className="vocab-message-card">
          <div className="vocab-big-emoji">😕</div>
          <Alert
            type="error"
            showIcon
            message="Oops! We couldn't load your words."
            description={error}
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
            className="vocab-primary-button"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // -----------------------------------------------
  // EMPTY STATE
  // -----------------------------------------------

  if (allVocabulary.length === 0) {
    return (
      <div className="vocab-app">
        <div className="vocab-hero">
          <div className="vocab-hero-decor vocab-decor-one">⭐</div>
          <div className="vocab-hero-decor vocab-decor-two">🌈</div>

          <div className="vocab-hero-emoji">🔐📚</div>
          <Title className="vocab-hero-title">
            Word Explorer
          </Title>
          <Paragraph className="vocab-hero-subtitle">
            Every story unlocks exciting new words!
          </Paragraph>
        </div>

        <Card className="vocab-empty-card">
          <Empty
            image={<div className="vocab-empty-emoji">📖✨</div>}
            description={
              <div>
                <Title level={3}>Your word treasure is waiting!</Title>
                <Paragraph>
                  Finish a reading story with vocabulary words to
                  unlock your magical word game.
                </Paragraph>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  // -----------------------------------------------
  // MAIN UI
  // -----------------------------------------------

  return (
    <div className="vocab-app">
      {/* COLOURFUL HEADER */}

      <header className="vocab-hero">
        <div className="vocab-hero-decor vocab-decor-one">⭐</div>
        <div className="vocab-hero-decor vocab-decor-two">🌈</div>
        <div className="vocab-hero-decor vocab-decor-three">✨</div>

        <div className="vocab-hero-emoji">🎡</div>

        <Title className="vocab-hero-title">
          Word Explorer!
        </Title>

        <Paragraph className="vocab-hero-subtitle">
          Spin, discover, learn and become a word superstar!
        </Paragraph>

        {/* <div className="vocab-hero-tags">
          <Tag>🌟 {allVocabulary.length} words to discover</Tag>
          <Tag>🏆 +2 points for a correct answer</Tag>
        </div> */}

          {/* QUICK STATS */}

      <Row gutter={[12, 12]} className="vocab-stats-row">
        <Col xs={12} sm={8}>
          <div className="vocab-stat-card stat-pink">
            <span className="vocab-stat-emoji">📚</span>
            <span className="vocab-stat-number">
              {completedStories.length}
            </span>
            <span className="vocab-stat-label">Stories read</span>
          </div>
        </Col>

        <Col xs={12} sm={8}>
          <div className="vocab-stat-card stat-blue">
            <span className="vocab-stat-emoji">💎</span>
            <span className="vocab-stat-number">
              {allVocabulary.length}
            </span>
            <span className="vocab-stat-label">Words unlocked</span>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div className="vocab-stat-card stat-yellow">
            <span className="vocab-stat-emoji">🎯</span>
            <span className="vocab-stat-number">
              {wheelWords.length}
            </span>
            <span className="vocab-stat-label">Words this round</span>
          </div>
        </Col>
      </Row>
      </header>

    

      {/* WORD COLLECTION PREVIEW */}
{/* 
      <section className="vocab-section">
        <div className="vocab-section-heading">
          <div className="vocab-heading-emoji">🎒</div>
          <div>
            <Title level={3}>Your Word Treasure Bag</Title>
            <Text>Meet some of the words you can learn!</Text>
          </div>
        </div>

        <Row gutter={[12, 12]}>
          {wheelWords.map((item, index) => (
            <Col xs={12} sm={8} md={6} lg={4} key={item.word}>
              <button
                type="button"
                className={`vocab-word-tile vocab-tile-${index % 5}`}
                onClick={() => speakWord(item.word)}
                title={`Listen to ${item.word}`}
              >
                <span className="vocab-tile-emoji">
                  {WORD_EMOJIS[index % WORD_EMOJIS.length]}
                </span>
                <span className="vocab-tile-word">{item.word}</span>
                <span className="vocab-tile-listen">
                  <SoundOutlined /> Listen
                </span>
              </button>
            </Col>
          ))}
        </Row>
      </section> */}

      {/* SPINNING WHEEL */}

      <section className="vocab-wheel-section">
        <div className="vocab-wheel-heading">
          <span>🎪</span>
          <div>
            <Title level={3}>Spin the Magic Wheel!</Title>
            <Text>Which word will your wheel discover?</Text>
          </div>
        </div>

        <div className="vocab-wheel-layout">
          <div className="vocab-wheel-side vocab-side-left">
            <span>🦄</span>
            <strong>Spin it!</strong>
            <small>Find a new word</small>
          </div>

          <div className="vocab-wheel-container">
            <div className="vocab-wheel-pointer">▼</div>

            <div
              className="vocab-wheel"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning
                  ? "transform 4.2s cubic-bezier(0.12, 0.75, 0.12, 1)"
                  : "none",
                background: `conic-gradient(${wheelWords
                  .map((_, index) => {
                    const start = index * (100 / wheelWords.length);
                    const end = (index + 1) * (100 / wheelWords.length);
                    return `${WHEEL_COLORS[index % WHEEL_COLORS.length]} ${start}% ${end}%`;
                  })
                  .join(",")})`,
              }}
            >
              {wheelWords.map((item, index) => {
                const angle =
                  index * (360 / wheelWords.length) +
                  180 / wheelWords.length;

                return (
                  <div
                    key={item.word}
                    className="vocab-wheel-label"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-105px) rotate(${-angle}deg)`,
                    }}
                  >
                    <span>{item.word}</span>
                  </div>
                );
              })}

              <div className="vocab-wheel-center">🌟</div>
            </div>
          </div>

          <div className="vocab-wheel-side vocab-side-right">
            <span>🚀</span>
            <strong>Learn it!</strong>
            <small>Become a star</small>
          </div>
        </div>

        <div className="vocab-wheel-actions">
        {!disableWheel && <>  <Button
            type="primary"
            size="large"
            className="vocab-spin-button"
            loading={spinning}
            disabled={spinning || wheelWords.length === 0 || !!selectedWord}
            onClick={spinWheel}
          >
            {spinning ? "WHEEE! SPINNING...": "SPIN THE WHEEL! 🎡"}
          </Button>
            <Button
            icon={<ReloadOutlined />}
            className="vocab-new-words-button"
            disabled={spinning || !!selectedWord}
            onClick={createWheelWords}
          >
            New Words
          </Button> </>}
 {answered && <Button
                  type="primary"
                  size="large"
                  className="vocab-next-button"
                  icon={<ReloadOutlined />}
                  onClick={playAgain}
                >
                  DISCOVER ANOTHER WORD! 🎡
                </Button>}
        
        </div>
      </section>

      {/* SELECTED WORD AND QUIZ */}

      {selectedWord && (
        <section className="vocab-discovery">
          <div className="vocab-discovery-banner">
            <div className="vocab-discovery-confetti">
              ✨ 🎉 ⭐ 🎈 ✨
            </div>

            <Text className="vocab-discovery-kicker">
              YOUR MAGIC WORD IS...
            </Text>

            <div className="vocab-discovery-word-row">
              <span className="vocab-discovery-emoji">
                {WORD_EMOJIS[
                  allVocabulary.findIndex(
                    (item) => item.word === selectedWord.word
                  ) % WORD_EMOJIS.length
                ]}
              </span>

              <Title className="vocab-discovery-word">
                {selectedWord.word}
              </Title>

              <Button
                className="vocab-speak-button"
                shape="circle"
                icon={<SoundOutlined />}
                onClick={() => speakWord(selectedWord.word)}
                aria-label={`Listen to ${selectedWord.word}`}
              />
            </div>

            <Tag className="vocab-source-tag">
              📖 {selectedWord.storyTitle}
            </Tag>

            <Tag className="vocab-level-tag">
              🎓 {getLevelLabel(selectedWord.grade)}
            </Tag>
          </div>

          {/* MEANING CARD */}
{/* 
          <Card className="vocab-meaning-card">
            <div className="vocab-learning-heading">
              <div className="vocab-learning-icon">💡</div>
              <div>
                <Title level={3}>Let's discover its meaning!</Title>
                <Text>Every new word makes your brain stronger.</Text>
              </div>
            </div>

            <div className="vocab-meaning-box">
              <span className="vocab-meaning-emoji">🌈</span>
              <div>
                <Text className="vocab-mini-label">WORD MEANING</Text>
                <Paragraph className="vocab-meaning-text">
                  {selectedWord.meaning}
                </Paragraph>
              </div>
              <Button
                type="text"
                icon={<SoundOutlined />}
                className="vocab-meaning-sound"
                onClick={() => speakWord(selectedWord.meaning)}
                aria-label="Listen to the meaning"
              />
            </div> */}

            {/* {selectedWord.example && (
              <div className="vocab-example-box">
                <div className="vocab-example-heading">
                  <span>📝</span>
                  <strong>Word in action!</strong>
                </div>

                <Paragraph className="vocab-example-text">
                  “{selectedWord.example}”
                </Paragraph>

                <Button
                  type="link"
                  icon={<SoundOutlined />}
                  onClick={() => speakWord(selectedWord.example)}
                  className="vocab-example-listen"
                >
                  Listen to the sentence
                </Button>
              </div>
            )} */}
          {/* </Card> */}

          {/* MULTIPLE CHOICE QUIZ */}

          <Card className="vocab-quiz-card">
            <div className="vocab-quiz-heading">
              <div className="vocab-quiz-icon">🧠</div>
              <div>
                <Title level={3}>Can you be a word detective?</Title>
                <Text>Choose the correct meaning below!</Text>
              </div>
            </div>

            <div className="vocab-question">
              What does <strong>{selectedWord.word}</strong> mean?
              <Button
                type="text"
                icon={<SoundOutlined />}
                onClick={() => speakWord(selectedWord.word)}
                aria-label="Hear the question word"
              />
            </div>

            <Radio.Group
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={answered}
              className="vocab-options-group"
            >
              <Row gutter={[10, 10]}>
                {options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption =
                    answered && option === selectedWord.meaning;
                  const isWrongSelection =
                    answered && isSelected && !correct;

                  return (
                    <Col xs={24} sm={12} key={`${option}-${index}`}>
                      <div
                        className={[
                          "vocab-answer-option",
                          `vocab-answer-${index}`,
                          isSelected ? "vocab-answer-selected" : "",
                          isCorrectOption ? "vocab-answer-correct" : "",
                          isWrongSelection ? "vocab-answer-wrong" : "",
                        ].join(" ")}
                      >
                        <Radio value={option}>
                          <span className="vocab-answer-letter">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="vocab-answer-text">
                            {option}
                          </span>
                        </Radio>

                        {isCorrectOption && (
                          <CheckCircleFilled className="vocab-answer-status" />
                        )}
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Radio.Group>

            {!answered && (
              <Button
                type="primary"
                block
                size="large"
                className="vocab-check-button"
                disabled={!selectedAnswer}
                onClick={checkAnswer}
              >
                CHECK MY ANSWER! 🚀
              </Button>
            )}

            {answered && (
              <div
                className={`vocab-feedback ${
                  correct ? "vocab-feedback-correct" : "vocab-feedback-try"
                }`}
              >
                {correct ? (
                  <>
                    <div className="vocab-feedback-emoji">🏆🎉🥳</div>
                    <Title level={3}>You're a Word Superstar!</Title>
                    <Paragraph>
                      Amazing work! You earned 2 points. Keep learning!
                    </Paragraph>
                    <Progress
                      percent={100}
                      showInfo={false}
                      strokeColor="#23C98B"
                      trailColor="#D8F7E9"
                    />
                  </>
                ) : (
                  <>
                    <div className="vocab-feedback-emoji">🌻💪</div>
                    <Title level={3}>Good Try, Little Explorer!</Title>
                    <Paragraph>
                      The correct meaning is:
                    </Paragraph>
                    <div className="vocab-correct-meaning">
                      {selectedWord.meaning}
                    </div>
                    <Button
                      icon={<SoundOutlined />}
                      onClick={() => speakWord(selectedWord.meaning)}
                    >
                      Hear the meaning
                    </Button>
                  </>
                )}

               
              </div>
            )}
          </Card>
        </section>
      )}

      {/* FOOTER */}

      <footer className="vocab-footer">
        <div className="vocab-footer-emojis">🦋 ⭐ 🌈 🚀</div>
        <Title level={3}>You're growing your word power!</Title>
        <Paragraph>
          Read a story. Discover a word. Learn something amazing! 💖
        </Paragraph>
        <div className="vocab-footer-badge">
          <TrophyOutlined /> Every word is a little victory!
        </div>
      </footer>
    </div>
  );
};

export default WheelDuplicate;
