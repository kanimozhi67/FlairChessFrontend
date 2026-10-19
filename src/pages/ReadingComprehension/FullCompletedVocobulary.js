
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Button,
  Typography,
  Tag,
  Empty,
  Spin,
  Alert,
  Input,
  Space,
  Divider,
} from "antd";

import {
  SearchOutlined,
  ReloadOutlined,
  SoundOutlined,
  BookFilled,
} from "@ant-design/icons";

import api from "../../api/axiosClient";

const { Title, Text, Paragraph } = Typography;

const WORD_THEMES = [
  {
    name: "purple",
    background: "linear-gradient(135deg, #8B5CF6, #C084FC)",
    light: "#F3E8FF",
    dark: "#6D28D9",
    emoji: "🦄",
  },
  {
    name: "blue",
    background: "linear-gradient(135deg, #38BDF8, #6366F1)",
    light: "#E0F2FE",
    dark: "#0369A1",
    emoji: "🚀",
  },
  {
    name: "pink",
    background: "linear-gradient(135deg, #FB7185, #F472B6)",
    light: "#FCE7F3",
    dark: "#BE185D",
    emoji: "🦋",
  },
  {
    name: "green",
    background: "linear-gradient(135deg, #34D399, #84CC16)",
    light: "#ECFCCB",
    dark: "#15803D",
    emoji: "🐸",
  },
  {
    name: "yellow",
    background: "linear-gradient(135deg, #FBBF24, #FB923C)",
    light: "#FEF3C7",
    dark: "#B45309",
    emoji: "🌟",
  },
];

const FullCompletedVocabulary = ({ studentId, user }) => {
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const currentUserId = studentId || user?._id || user?.id || null;
  const isStudent = Boolean(studentId);

  // Fetch vocabulary from completed stories only.
  const fetchCompletedVocabulary = async () => {
    if (!currentUserId) {
      setCompletedStories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = isStudent
        ? { studentId: String(studentId) }
        : { userId: String(user?._id || user?.id) };

      const response = await api.get("/reading/completed", { params });

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

      setCompletedStories(data);
    } catch (err) {
      console.error("Error fetching completed vocabulary:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "We couldn't load your word adventures. Please try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedVocabulary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, user?._id, user?.id]);

  // Build a unique word list.
  const vocabularyWords = useMemo(() => {
    const words = [];
    const seen = new Set();

    completedStories.forEach((story) => {
      if (!Array.isArray(story?.vocabulary)) return;

      story.vocabulary.forEach((item) => {
        const word =
          typeof item === "string" ? item : item?.word;

        const meaning =
          typeof item === "string" ? "" : item?.meaning || "";

        const example =
          typeof item === "string" ? "" : item?.example || "";

        if (!word || !String(word).trim()) return;

        const cleanWord = String(word).trim();
        const key = cleanWord.toLowerCase();

        if (seen.has(key)) return;
        seen.add(key);

        words.push({
          word: cleanWord,
          meaning: String(meaning).trim(),
          example: String(example).trim(),
          storyTitle: story?.title || "Reading Adventure",
          grade: story?.grade,
        });
      });
    });

    return words;
  }, [completedStories]);

  // Search words, meanings, examples and story titles.
  const filteredWords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return vocabularyWords;

    return vocabularyWords.filter((item) =>
      [
        item.word,
        item.meaning,
        item.example,
        item.storyTitle,
        item.grade,
      ].some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [vocabularyWords, search]);

  // Read a word, its meaning and its example aloud.
  const speakWord = (word, meaning, example = "") => {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const text = [
      word,
      meaning ? `It means ${meaning}` : "",
      example ? `Here is an example. ${example}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.82;
    speech.pitch = 1.1;

    window.speechSynthesis.speak(speech);
  };

  const getGradeLabel = (grade) => {
    if (grade === undefined || grade === null) return "";

    const value = String(grade).toLowerCase();

    if (value === "kg1") return "KG 1";
    if (value === "kg2") return "KG 2";
    if (value === "kindergarten") return "Kindergarten";

    return `Grade ${grade}`;
  };

  // Loading state.
  if (loading) {
    return (
      <div className="word-loading">
        <style>{styles}</style>
        <div className="word-loading-emoji">📚✨🔤</div>
        <Spin size="large" />
        <Title level={3}>Getting your word adventures ready!</Title>
        <Text type="secondary">Your new words are on their way!</Text>
      </div>
    );
  }

  // Error state.
  if (error) {
    return (
      <div className="word-page">
        <style>{styles}</style>
        <Card className="word-message-card">
          <div className="word-empty-emoji">😕</div>
          <Alert
            type="error"
            showIcon
            message="Oops! Something went wrong."
            description={error}
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchCompletedVocabulary}
            className="word-retry-button"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="word-page">
      <style>{styles}</style>

      {/* Colourful hero */}
      <header className="word-hero">
        <span className="word-decoration word-decoration-left">⭐</span>
        <span className="word-decoration word-decoration-right">🦋</span>

        <div className="word-hero-icons">📚 ✨ 🔤</div>

        <Title level={1} className="word-hero-title">
          My Word Adventure!
        </Title>

        <Paragraph className="word-hero-description">
          Discover amazing words, learn what they mean, and become a
          super word explorer! 🚀
        </Paragraph>

        <div className="word-hero-badges">
          <span>🌈 Learn</span>
          <span>🔊 Listen</span>
          <span>💡 Discover</span>
        </div>
      </header>
{/* 
     
      <section className="word-stats">
        <div className="word-stat-card stat-purple">
          <div className="word-stat-emoji">📖</div>
          <Text className="word-stat-label">Stories Finished</Text>
          <Title level={2}>{completedStories.length}</Title>
        </div>

        <div className="word-stat-card stat-blue">
          <div className="word-stat-emoji">🔤</div>
          <Text className="word-stat-label">Words Discovered</Text>
          <Title level={2}>{vocabularyWords.length}</Title>
        </div>

        <div className="word-stat-card stat-pink">
          <div className="word-stat-emoji">🌟</div>
          <Text className="word-stat-label">Words to Explore</Text>
          <Title level={2}>{filteredWords.length}</Title>
        </div>
      </section> */}

      {/* Search */}
      {vocabularyWords.length > 0 && (
        <section className="word-search-section">
          <div className="word-search-heading">
            <span>🔎</span>
            <div>
              <Title level={3}>Find a Word!</Title>
              <Text>Search for a word or discover its meaning.</Text>
            </div>
          </div>

          <Input
            size="large"
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Type a word, meaning or example..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="word-search-input"
          />

          {search && (
            <Text className="word-search-count">
              ✨ Found {filteredWords.length} word
              {filteredWords.length === 1 ? "" : "s"}
            </Text>
          )}
        </section>
      )}

      {/* No completed stories or words */}
      {completedStories.length === 0 && (
        <div className="word-empty-card">
          <div className="word-empty-emoji">📚🌱</div>
          <Title level={3}>Your adventure starts with a story!</Title>
          <Paragraph>
            Finish a reading story to unlock new words and begin your
            word adventure. Every story brings a new discovery! 🌟
          </Paragraph>
        </div>
      )}

      {completedStories.length > 0 && vocabularyWords.length === 0 && (
        <div className="word-empty-card">
          <div className="word-empty-emoji">🔍🦄</div>
          <Title level={3}>Your word treasure is waiting!</Title>
          <Paragraph>
            We couldn't find vocabulary words in your completed stories
            yet. Try again after vocabulary has been added to a story.
          </Paragraph>
        </div>
      )}

      {/* Word adventure cards */}
      {filteredWords.length > 0 && (
        <>
          <div className="word-grid-heading">
            <div className="word-grid-heading-emoji">🎁</div>
            <div>
              <Title level={2}>Your Word Treasure Box</Title>
              <Text>Tap the speaker to hear each word and its meaning!</Text>
            </div>
          </div>

          <div className="word-grid">
            {filteredWords.map((item, index) => {
              const theme = WORD_THEMES[index % WORD_THEMES.length];

              return (
                <Card
                  key={`${item.word}-${index}`}
                  className={`word-card word-card-${theme.name}`}
                  bordered={false}
                  styles={{ body: { padding: 0 } }}
                >
                  {/* Colourful word banner */}
                  <div
                    className="word-card-banner"
                    style={{ background: theme.background }}
                  >
                    <span className="word-card-number">
                      WORD {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="word-card-decoration">
                      {theme.emoji}
                    </span>

                    <div className="word-big-text">
                      {item.word}
                    </div>

                    <Button
                      className="word-sound-button"
                      shape="circle"
                      icon={<SoundOutlined />}
                      aria-label={`Listen to ${item.word}`}
                      onClick={() =>
                        speakWord(item.word, item.meaning, item.example)
                      }
                    />

                    <div className="word-card-listen-hint">
                      🔊 Tap to listen!
                    </div>
                  </div>

                  {/* Meaning and example */}
                  <div className="word-card-content">
                    <div className="word-section-label">
                      <span className="word-section-icon">💡</span>
                      <span>What does it mean?</span>
                    </div>

                    <div
                      className="word-meaning-box"
                      style={{
                        background: theme.light,
                        borderColor: `${theme.dark}25`,
                      }}
                    >
                      <Paragraph className="word-meaning-text">
                        {item.meaning ||
                          "Keep exploring this word with your teacher!"}
                      </Paragraph>
                    </div>

                    {item.example && (
                      <div className="word-example-box">
                        <div className="word-section-label example-label">
                          <span className="word-section-icon">✏️</span>
                          <span>See it in a sentence!</span>
                        </div>

                        <Paragraph className="word-example-text">
                          “{item.example}”
                        </Paragraph>
                      </div>
                    )}

                    <Divider className="word-card-divider" />

                    <div className="word-card-bottom">
                      <div className="word-source">
                        <BookFilled />
                        <span>{item.storyTitle}</span>
                      </div>

                      {item.grade !== undefined &&
                        item.grade !== null && (
                          <Tag className="word-grade-tag">
                            🎓 {getGradeLabel(item.grade)}
                          </Tag>
                        )}
                    </div>

                    <Button
                      block
                      className="word-practice-button"
                      onClick={() =>
                        speakWord(item.word, item.meaning, item.example)
                      }
                    >
                      <SoundOutlined /> Learn This Word!
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Search did not find anything */}
      {vocabularyWords.length > 0 && filteredWords.length === 0 && (
        <div className="word-empty-card">
          <div className="word-empty-emoji">🕵️‍♀️🔎</div>
          <Title level={3}>Word Detective, Keep Looking!</Title>
          <Paragraph>
            We couldn't find “{search}”. Try another word and continue
            your adventure!
          </Paragraph>
          <Button
            type="primary"
            onClick={() => setSearch("")}
            className="word-retry-button"
          >
            Show All Words
          </Button>
        </div>
      )}

      {/* Friendly footer */}
      {vocabularyWords.length > 0 && (
        <footer className="word-footer">
          <div className="word-footer-emoji">🦄 🌈 🚀</div>
          <Title level={3}>You Are a Word Superstar!</Title>
          <Paragraph>
            Every new word makes your brain stronger. Keep reading,
            listening and discovering! 💖
          </Paragraph>
        </footer>
      )}
    </div>
  );
};

const styles = `
  .word-page {
    width: 100%;
    max-width: 1500px;
    margin: 0 auto;
    padding: clamp(10px, 2.5vw, 26px);
    box-sizing: border-box;
    overflow: hidden;
    border-radius: 28px;
    background: linear-gradient(145deg, #F5F0FF, #FFF0F7 52%, #EAFBFF);
    font-family: inherit;
  }

  .word-page *,
  .word-loading * {
    box-sizing: border-box;
  }

  .word-hero {
    position: relative;
    overflow: hidden;
    padding: clamp(28px, 5vw, 54px) 18px;
    border-radius: 28px;
    text-align: center;
    color: white;
    background: linear-gradient(120deg, #6755E8, #A855F7 55%, #EC78C5);
    box-shadow: 0 12px 28px rgba(105, 70, 195, .2);
  }

  .word-hero-icons {
    position: relative;
    z-index: 1;
    margin-bottom: 12px;
    font-size: clamp(34px, 5vw, 55px);
    letter-spacing: 5px;
  }

  .word-hero-title {
    position: relative;
    z-index: 1;
    margin: 0 !important;
    color: white !important;
    font-size: clamp(27px, 4vw, 43px) !important;
    font-weight: 900 !important;
    line-height: 1.2 !important;
  }

  .word-hero-description {
    position: relative;
    z-index: 1;
    max-width: 600px;
    margin: 14px auto 20px !important;
    color: white !important;
    font-size: clamp(14px, 1.8vw, 17px);
    line-height: 1.7;
  }

  .word-hero-badges {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 9px;
  }

  .word-hero-badges span {
    padding: 8px 15px;
    border: 1px solid rgba(255,255,255,.5);
    border-radius: 30px;
    background: rgba(255,255,255,.2);
    color: white;
    font-size: 13px;
    font-weight: 800;
  }

  .word-decoration {
    position: absolute;
    opacity: .35;
    font-size: clamp(35px, 6vw, 65px);
    pointer-events: none;
  }

  .word-decoration-left {
    top: 12%;
    left: 6%;
    transform: rotate(-15deg);
  }

  .word-decoration-right {
    right: 6%;
    bottom: 10%;
    transform: rotate(15deg);
  }

  .word-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin: 22px 0;
  }

  .word-stat-card {
    min-width: 0;
    padding: 18px 10px;
    border: 2px solid white;
    border-radius: 22px;
    text-align: center;
    box-shadow: 0 6px 18px rgba(72, 52, 130, .07);
  }

  .stat-purple { background: #EEE7FF; }
  .stat-blue { background: #E0F4FF; }
  .stat-pink { background: #FFE4F1; }

  .word-stat-emoji {
    font-size: 32px;
  }

  .word-stat-label {
    display: block;
    margin-top: 5px;
    color: #51456F;
    font-size: 12px;
    font-weight: 800;
  }

  .word-stat-card .ant-typography {
    margin: 4px 0 0 !important;
    color: #5B4BDB;
    font-size: clamp(25px, 3vw, 34px);
    font-weight: 900;
  }

  .word-search-section {
    margin-bottom: 25px;
    padding: clamp(16px, 3vw, 24px);
    border: 2px solid white;
    border-radius: 24px;
    background: rgba(255,255,255,.85);
    box-shadow: 0 6px 20px rgba(72, 52, 130, .06);
  }

  .word-search-heading,
  .word-grid-heading {
    display: flex;
    align-items: center;
    gap: 13px;
    margin-bottom: 15px;
  }

  .word-search-heading > span,
  .word-grid-heading-emoji {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    border-radius: 17px;
    background: #EDE5FF;
    font-size: 27px;
  }

  .word-search-heading .ant-typography,
  .word-grid-heading .ant-typography {
    margin: 0 !important;
  }

  .word-search-heading h3 {
    color: #4C3D87 !important;
    font-weight: 850 !important;
    font-size: 21px !important;
  }

  .word-search-heading .ant-typography-secondary {
    display: block;
    margin-top: 5px;
    color: #77718C;
    font-size: 13px;
  }

  .word-search-input {
    height: 52px;
    border: 2px solid #E5D9FF !important;
    border-radius: 16px !important;
    background: white;
  }

  .word-search-input:focus,
  .word-search-input:hover {
    border-color: #9B78F5 !important;
  }

  .word-search-count {
    display: inline-block;
    margin-top: 12px;
    color: #6941C6;
    font-weight: 700;
  }

  .word-grid-heading {
    margin: 28px 0 18px;
  }

  .word-grid-heading-emoji {
    width: 56px;
    height: 56px;
    font-size: 30px;
    background: #FFE7A8;
  }

  .word-grid-heading h2 {
    color: #443474 !important;
    font-size: clamp(21px, 3vw, 28px) !important;
    font-weight: 900 !important;
  }

  .word-grid-heading .ant-typography-secondary {
    display: block;
    margin-top: 4px;
    color: #77718C;
    font-size: 13px;
  }

  .word-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 255px), 1fr));
    align-items: stretch;
    gap: clamp(14px, 2vw, 22px);
  }

  .word-card {
    min-width: 0;
    overflow: hidden;
    border: 3px solid white !important;
    border-radius: 25px !important;
    background: white !important;
    box-shadow: 0 8px 22px rgba(62, 46, 117, .09);
    transition: transform .22s ease, box-shadow .22s ease;
  }

  .word-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(62, 46, 117, .16);
  }

  .word-card-banner {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 185px;
    padding: 27px 18px 18px;
    overflow: hidden;
    text-align: center;
    color: white;
  }

  .word-card-number {
    position: absolute;
    top: 12px;
    left: 13px;
    padding: 5px 9px;
    border: 1px solid rgba(255,255,255,.45);
    border-radius: 20px;
    background: rgba(255,255,255,.2);
    color: white;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .7px;
  }

  .word-card-decoration {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 27px;
    opacity: .95;
  }

  .word-big-text {
    max-width: 100%;
    margin: 8px 0 12px;
    color: white;
    font-size: clamp(27px, 3vw, 37px);
    font-weight: 950;
    line-height: 1.2;
    overflow-wrap: anywhere;
    text-shadow: 0 3px 0 rgba(50, 30, 100, .13);
  }

  .word-sound-button {
    width: 48px !important;
    height: 48px !important;
    border: 3px solid rgba(255,255,255,.8) !important;
    background: white !important;
    color: #6941C6 !important;
    box-shadow: 0 4px 12px rgba(44, 24, 100, .17);
  }

  .word-sound-button .anticon {
    font-size: 22px;
  }

  .word-sound-button:hover {
    transform: scale(1.08);
    color: #A21CAF !important;
  }

  .word-card-listen-hint {
    margin-top: 8px;
    color: white;
    font-size: 12px;
    font-weight: 800;
  }

  .word-card-content {
    display: flex;
    flex-direction: column;
    height: calc(100% - 185px);
    padding: clamp(14px, 2vw, 20px);
  }

  .word-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    color: #47376F;
    font-size: 14px;
    font-weight: 900;
  }

  .word-section-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border-radius: 10px;
    background: white;
    font-size: 17px;
  }

  .word-meaning-box {
    padding: 14px;
    border: 1px solid;
    border-radius: 17px;
  }

  .word-meaning-text {
    margin: 0 !important;
    color: #403454;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.75;
    overflow-wrap: anywhere;
  }

  .word-example-box {
    margin-top: 14px;
    padding: 14px;
    border: 1px solid #BBF7D0;
    border-radius: 17px;
    background: #F0FDF4;
  }

  .example-label {
    color: #166534;
  }

  .word-example-text {
    margin: 0 !important;
    color: #22543D;
    font-size: 14px;
    font-style: italic;
    font-weight: 600;
    line-height: 1.75;
    overflow-wrap: anywhere;
  }

  .word-card-divider {
    margin: 16px 0 12px !important;
    border-color: #F0EAFB !important;
  }

  .word-card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: auto;
  }

  .word-source {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    color: #77718C;
    font-size: 11px;
    font-weight: 700;
  }

  .word-source .anticon {
    flex-shrink: 0;
    color: #8B5CF6;
  }

  .word-source span {
    overflow-wrap: anywhere;
  }

  .word-grade-tag {
    margin: 0 !important;
    padding: 4px 9px;
    border: none !important;
    border-radius: 20px;
    background: #F3E8FF;
    color: #6D28D9;
    font-size: 11px;
    font-weight: 800;
  }

  .word-practice-button {
    height: 43px;
    margin-top: 15px;
    border: none !important;
    border-radius: 14px !important;
    background: #F3E8FF !important;
    color: #6D28D9 !important;
    font-size: 13px;
    font-weight: 900;
  }

  .word-practice-button:hover {
    background: #E9D5FF !important;
    color: #581C87 !important;
  }

  .word-empty-card,
  .word-message-card {
    margin: 20px 0;
    padding: 25px 15px;
    border: 2px solid white !important;
    border-radius: 25px !important;
    background: rgba(255,255,255,.9);
    text-align: center;
    box-shadow: 0 8px 25px rgba(62, 46, 117, .07);
  }

  .word-empty-card .ant-typography {
    color: #4C3D87;
  }

  .word-empty-card p {
    max-width: 500px;
    margin: 8px auto 0;
    color: #77718C;
    line-height: 1.8;
  }

  .word-empty-emoji {
    margin-bottom: 12px;
    font-size: 65px;
  }

  .word-retry-button {
    height: 44px;
    margin-top: 18px;
    padding: 0 22px;
    border-radius: 14px;
    background: #7955E8;
    font-weight: 800;
  }

  .word-footer {
    margin-top: 32px;
    padding: 25px 15px;
    border: 2px dashed #D9C7FF;
    border-radius: 25px;
    background: rgba(255,255,255,.6);
    text-align: center;
  }

  .word-footer-emoji {
    font-size: 35px;
    letter-spacing: 5px;
  }

  .word-footer h3 {
    margin: 10px 0 !important;
    color: #6941C6 !important;
    font-weight: 900 !important;
  }

  .word-footer p {
    max-width: 520px;
    margin: 0 auto !important;
    color: #77718C;
    line-height: 1.8;
  }

  .word-loading {
    display: flex;
    min-height: 350px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 25px;
    text-align: center;
  }

  .word-loading-emoji {
    font-size: 52px;
  }

  .word-loading h3 {
    margin: 0 !important;
    color: #6941C6 !important;
  }

  @media (max-width: 767px) {
    .word-page {
      padding: 10px;
      border-radius: 19px;
    }

    .word-hero {
      padding: 32px 15px;
      border-radius: 22px;
    }

    .word-decoration-left {
      top: 4%;
      left: 3%;
    }

    .word-decoration-right {
      right: 3%;
      bottom: 4%;
    }

    .word-stats {
      gap: 8px;
      margin: 14px 0 20px;
    }

    .word-stat-card {
      padding: 13px 5px;
      border-radius: 16px;
    }

    .word-stat-emoji {
      font-size: 26px;
    }

    .word-stat-label {
      font-size: 10px;
      line-height: 1.5;
    }

    .word-search-section {
      padding: 15px;
      border-radius: 19px;
    }

    .word-search-heading > span,
    .word-grid-heading-emoji {
      width: 43px;
      height: 43px;
      border-radius: 14px;
      font-size: 23px;
    }

    .word-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 11px;
    }

    .word-card {
      border-width: 2px !important;
      border-radius: 19px !important;
    }

    .word-card-banner {
      min-height: 155px;
      padding: 29px 8px 12px;
    }

    .word-card-number {
      top: 8px;
      left: 8px;
      padding: 4px 6px;
      font-size: 8px;
    }

    .word-card-decoration {
      top: 8px;
      right: 7px;
      font-size: 20px;
    }

    .word-big-text {
      margin: 8px 0 10px;
      font-size: clamp(19px, 4.4vw, 27px);
    }

    .word-sound-button {
      width: 41px !important;
      height: 41px !important;
    }

    .word-card-listen-hint {
      font-size: 10px;
    }

    .word-card-content {
      height: calc(100% - 155px);
      padding: 11px;
    }

    .word-section-label {
      align-items: flex-start;
      gap: 6px;
      font-size: 12px;
      line-height: 1.5;
    }

    .word-section-icon {
      width: 25px;
      height: 25px;
      border-radius: 8px;
      font-size: 14px;
    }

    .word-meaning-box,
    .word-example-box {
      padding: 10px;
      border-radius: 13px;
    }

    .word-meaning-text {
      font-size: 13px;
      line-height: 1.65;
    }

    .word-example-text {
      font-size: 12px;
      line-height: 1.65;
    }

    .word-card-divider {
      margin: 12px 0 10px !important;
    }

    .word-card-bottom {
      align-items: flex-start;
      flex-direction: column;
      gap: 7px;
    }

    .word-source {
      font-size: 10px;
    }

    .word-practice-button {
      height: 39px;
      padding: 0 5px;
      font-size: 11px;
    }

    .word-footer {
      margin-top: 22px;
      padding: 22px 12px;
    }
  }

  @media (max-width: 370px) {
    .word-grid {
      grid-template-columns: 1fr;
    }

    .word-card-banner {
      min-height: 175px;
    }

    .word-big-text {
      font-size: 30px;
    }

    .word-card-content {
      height: auto;
      padding: 16px;
    }

    .word-card-bottom {
      align-items: center;
      flex-direction: row;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .word-card {
      transition: none;
    }

    .word-card:hover {
      transform: none;
    }
  }
`;

export default FullCompletedVocabulary;
