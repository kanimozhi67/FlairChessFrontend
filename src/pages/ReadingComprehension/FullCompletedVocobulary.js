import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Typography,
  Tag,
  Empty,
  Spin,
  Alert,
  Button,
  Input,
  Space,
  Divider,
  Badge,
} from "antd";

import {
  SearchOutlined,
  ReloadOutlined,
  SoundOutlined,
} from "@ant-design/icons";

import api from "../../api/axiosClient";

const { Title, Text, Paragraph } = Typography;

const FullCompletedVocabulary = ({
  studentId,
  user,
}) => {
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enableSpinWheel,setEnablespinWheel]= useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // =========================================================
  // CURRENT USER / STUDENT
  // =========================================================

  const currentUserId =
    studentId ||
    user?._id ||
    user?.id ||
    null;

  const isStudent = Boolean(studentId);

  // =========================================================
  // LEVEL LABEL
  // =========================================================

  const getLevelLabel = (grade) => {
    if (grade === undefined || grade === null) {
      return "Reading";
    }

    const value = String(grade).trim().toLowerCase();

    if (value === "kg1") {
      return "KG 1";
    }

    if (value === "kg2") {
      return "KG 2";
    }

    if (value === "kindergarten") {
      return "Kindergarten";
    }

    if (value === "primary") {
      return "Primary";
    }

    return `Grade ${grade}`;
  };

  // =========================================================
  // FETCH ALL COMPLETED STORIES
  // =========================================================

  const fetchCompletedVocabulary = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
        {
          params,
        }
      );

      console.log(
        "✅ All completed reading stories:",
        response.data
      );

      const data =
        response?.data?.data || [];

      // =====================================================
      // IMPORTANT:
      // DO NOT FILTER BY GRADE
      //
      // We want vocabulary from ALL completed stories:
      // KG1 + KG2 + Grade 1 + Grade 2 + Grade 3...
      // =====================================================

      setCompletedStories(data);

    } catch (err) {
      console.error(
        "❌ Error fetching completed vocabulary:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load finished vocabulary."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH WHEN USER / STUDENT CHANGES
  // =========================================================

  useEffect(() => {
    fetchCompletedVocabulary();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    studentId,
    user?._id,
    user?.id,
  ]);

  // =========================================================
  // CREATE UNIQUE VOCABULARY LIST
  // =========================================================

  const vocabularyWords = useMemo(() => {
    const words = [];

    completedStories.forEach((story) => {
      if (
        !Array.isArray(
          story?.vocabulary
        )
      ) {
        return;
      }

      story.vocabulary.forEach(
        (item) => {
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

          if (!word) {
            return;
          }

          words.push({
            word: String(word).trim(),

            meaning: String(
              meaning || ""
            ).trim(),

            example: String(
              example || ""
            ).trim(),

            storyTitle:
              story?.title ||
              "Reading Story",

            storyId:
              story?._id ||
              story?.id,

            grade:
              story?.grade,
          });
        }
      );
    });

    // =====================================================
    // REMOVE DUPLICATE WORDS
    // =====================================================

    const uniqueWords = [];
    const seen = new Set();

    words.forEach((item) => {
      const key =
        item.word
          .trim()
          .toLowerCase();

      if (!key) {
        return;
      }

      if (!seen.has(key)) {
        seen.add(key);
        uniqueWords.push(item);
      }
    });

    return uniqueWords;
  }, [completedStories]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredWords = useMemo(() => {
    const searchText =
      search
        .trim()
        .toLowerCase();

    if (!searchText) {
      return vocabularyWords;
    }

    return vocabularyWords.filter(
      (item) => {
        const word =
          item.word
            ?.toLowerCase() || "";

        const meaning =
          item.meaning
            ?.toLowerCase() || "";

        const storyTitle =
          item.storyTitle
            ?.toLowerCase() || "";

        const grade =
          getLevelLabel(item.grade)
            .toLowerCase();

        return (
          word.includes(searchText) ||
          meaning.includes(searchText) ||
          storyTitle.includes(
            searchText
          ) ||
          grade.includes(searchText)
        );
      }
    );
  }, [
    vocabularyWords,
    search,
  ]);

  // =========================================================
  // TEXT TO SPEECH
  // =========================================================

  const speakWord = (
    word,
    meaning
  ) => {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const text = meaning
      ? `${word}. ${meaning}`
      : word;

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

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "350px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Space
          direction="vertical"
          align="center"
        >
          <Spin size="large" />

          <Text type="secondary">
            Loading your finished
            vocabulary... 📚
          </Text>
        </Space>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <Card
        style={{
          borderRadius: "25px",
          border: "none",
          boxShadow:
            "0 12px 35px rgba(0,0,0,0.10)",
        }}
      >
        <Alert
          type="error"
          showIcon
          message="Unable to Load Vocabulary"
          description={error}
        />

        <Button
          type="primary"
          icon={
            <ReloadOutlined />
          }
          onClick={
            fetchCompletedVocabulary
          }
          style={{
            marginTop: "20px",
            borderRadius: "14px",
          }}
        >
          Try Again
        </Button>
      </Card>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        borderRadius: "30px",
        background:
          "linear-gradient(135deg, #eef2ff 0%, #fdf2ff 50%, #ecfeff 100%)",
        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            fontSize: "55px",
            marginBottom: "5px",
          }}
        >
          📚✨🔤
        </div>

        <Title
          level={2}
          style={{
            margin: 0,
            fontWeight: 800,
            color: "#5b4bdb",
          }}
        >
          My Finished Vocabulary
        </Title>

        <Paragraph
          style={{
            fontSize: "16px",
            color: "#666",
            marginBottom: 0,
          }}
        >
          Words you have learned from
          all your completed reading
          stories! 🌟
        </Paragraph>
      </div>

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <Card
        style={{
          borderRadius: "22px",
          border: "none",
          marginBottom: "20px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-around",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {/* STORIES */}

          <div
            style={{
              textAlign: "center",
              minWidth: "120px",
            }}
          >
            <div
              style={{
                fontSize: "35px",
              }}
            >
              📖
            </div>

            <Text strong>
              Stories Finished
            </Text>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#5b4bdb",
              }}
            >
              {completedStories.length}
            </div>
          </div>

          <Divider
            type="vertical"
            style={{
              height: "70px",
            }}
          />

          {/* WORDS */}

          <div
            style={{
              textAlign: "center",
              minWidth: "120px",
            }}
          >
            <div
              style={{
                fontSize: "35px",
              }}
            >
              🔤
            </div>

            <Text strong>
              Words Learned
            </Text>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#11998e",
              }}
            >
              {vocabularyWords.length}
            </div>
          </div>

          <Divider
            type="vertical"
            style={{
              height: "70px",
            }}
          />

          {/* LEVELS */}

          <div
            style={{
              textAlign: "center",
              minWidth: "120px",
            }}
          >
            <div
              style={{
                fontSize: "35px",
              }}
            >
              🎓
            </div>

            <Text strong>
              Levels Read
            </Text>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#f59e0b",
              }}
            >
              {
                new Set(
                  completedStories.map(
                    (story) =>
                      String(
                        story?.grade
                      )
                  )
                ).size
              }
            </div>
          </div>
        </div>
      </Card>

      {/* =====================================================
          SEARCH
          ===================================================== */}

      {vocabularyWords.length >
        0 && (
        <Input
          size="large"
          allowClear
          prefix={
            <SearchOutlined />
          }
          placeholder="Search a word, meaning, story or grade..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            marginBottom: "25px",
            borderRadius: "16px",
            height: "52px",
          }}
        />
      )}

      {/* =====================================================
          NO COMPLETED STORIES
          ===================================================== */}

      {completedStories.length ===
        0 && (
        <Card
          style={{
            borderRadius: "25px",
            border: "none",
            textAlign: "center",
            padding: "30px",
          }}
        >
          <Empty
            image={
              <div
                style={{
                  fontSize: "70px",
                }}
              >
                📖🌱
              </div>
            }
            description={
              <div>
                <Title level={4}>
                  No Finished Vocabulary Yet
                </Title>

                <Text type="secondary">
                  Complete a reading story
                  to see its vocabulary
                  here! 🚀
                </Text>
              </div>
            }
          />
        </Card>
      )}

      {/* =====================================================
          VOCABULARY CARDS
          ===================================================== */}

      {filteredWords.length >
        0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredWords.map(
            (item, index) => (
              <Card
                key={`${item.word}-${index}`}
                hoverable
                style={{
                  borderRadius: "24px",
                  border: "none",
                  overflow: "hidden",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.10)",
                  background:
                    "rgba(255,255,255,0.96)",
                }}
              >
                {/* =================================================
                    TOP
                    ================================================= */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius:
                          "15px",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize: "25px",
                        background:
                          "linear-gradient(135deg, #667eea, #764ba2)",
                      }}
                    >
                      🔤
                    </div>

                    <div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize:
                            "12px",
                        }}
                      >
                        WORD
                      </Text>

                      <div
                        style={{
                          fontSize:
                            "21px",
                          fontWeight: 800,
                          color:
                            "#4338ca",
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {item.word}
                      </div>
                    </div>
                  </div>

                  {/* SPEAKER */}

                  <Button
                    type="text"
                    shape="circle"
                    icon={
                      <SoundOutlined
                        style={{
                          fontSize:
                            "20px",
                          color:
                            "#667eea",
                        }}
                      />
                    }
                    onClick={() =>
                      speakWord(
                        item.word,
                        item.meaning
                      )
                    }
                  />
                </div>

                <Divider
                  style={{
                    margin:
                      "15px 0",
                  }}
                />

                {/* =================================================
                    MEANING
                    ================================================= */}

                <div
                  style={{
                    padding: "15px",
                    borderRadius:
                      "16px",
                    background:
                      "#f5f3ff",
                    marginBottom:
                      "12px",
                  }}
                >
                  <Text
                    strong
                    style={{
                      color:
                        "#5b4bdb",
                    }}
                  >
                    💡 Meaning
                  </Text>

                  <Paragraph
                    style={{
                      margin:
                        "7px 0 0",
                      fontSize:
                        "16px",
                    }}
                  >
                    {item.meaning ||
                      "Meaning not available"}
                  </Paragraph>
                </div>

                {/* =================================================
                    EXAMPLE
                    ================================================= */}

                {item.example && (
                  <div
                    style={{
                      padding: "15px",
                      borderRadius:
                        "16px",
                      background:
                        "#ecfdf5",
                      marginBottom:
                        "12px",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color:
                          "#059669",
                      }}
                    >
                      ✏️ Example
                    </Text>

                    <Paragraph
                      style={{
                        margin:
                          "7px 0 0",
                        fontSize:
                          "15px",
                      }}
                    >
                      {item.example}
                    </Paragraph>
                  </div>
                )}

                {/* =================================================
                    STORY + LEVEL
                    ================================================= */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    gap: "10px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  {/* <Space
                    wrap
                    size={[6, 6]}
                  >
                    <Tag
                      color="purple"
                      style={{
                        borderRadius:
                          "12px",
                        padding:
                          "5px 10px",
                        margin: 0,
                      }}
                    >
                      📖{" "}
                      {
                        item.storyTitle
                      }
                    </Tag>

                    <Tag
                      color="blue"
                      style={{
                        borderRadius:
                          "12px",
                        padding:
                          "5px 10px",
                        margin: 0,
                      }}
                    >
                      🎓{" "}
                      {getLevelLabel(
                        item.grade
                      )}
                    </Tag>
                  </Space> */}

                  {/* <Badge
                    status="success"
                    text="Finished"
                  /> */}
                </div>
              </Card>
            )
          )}
        </div>
      )}

      {/* =====================================================
          SEARCH EMPTY
          ===================================================== */}

      {vocabularyWords.length >
        0 &&
        filteredWords.length ===
          0 && (
          <Card
            style={{
              borderRadius: "25px",
              border: "none",
              textAlign: "center",
            }}
          >
            <Empty
              description={
                <>
                  <div
                    style={{
                      fontSize:
                        "50px",
                    }}
                  >
                    🔍
                  </div>

                  <Text>
                    No vocabulary found
                    for "{search}"
                  </Text>
                </>
              }
            />
          </Card>
        )}
    </div>
  );
};

export default FullCompletedVocabulary;