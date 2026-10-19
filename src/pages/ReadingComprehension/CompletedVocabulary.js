
import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Tag,
  Spin,
  Alert,
  Button,
} from "antd";
import {
  TrophyFilled,
  CheckCircleFilled,
  ReloadOutlined,
} from "@ant-design/icons";
import api from "../../api/axiosClient";

const { Title, Text, Paragraph } = Typography;

const DEFAULT_GRADES = ["kg1", "kg2", 1, 2, 3, 4, 5];

const CompletedVocabulary = ({
  grade = DEFAULT_GRADES,
  studentId,
  user,
}) => {
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = studentId || user?._id || user?.id;
  const isStudent = Boolean(studentId);
  const grades = Array.isArray(grade) ? grade : [grade];

  const gradeLabel =
    grades.length === 1
      ? String(grades[0]).toUpperCase()
      : "All Grades";

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

        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const filteredStories = data.filter((story) =>
          grades.some(
            (g) =>
              String(story.grade).toLowerCase() ===
              String(g).toLowerCase()
          )
        );

        if (!cancelled) {
          setCompletedStories(filteredStories);
        }
      } catch (err) {
        console.error("Error fetching completed stories:", err);

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "We couldn't load your completed stories. Please try again."
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
  }, [
    currentUserId,
    isStudent,
    studentId,
    user?._id,
    user?.id,
    grade,
  ]);

  const formatDate = (date) => {
    if (!date) return null;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return null;

    return parsedDate.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Use a real cover image when the API provides an image URL.
  // PDF story files are not used as <img> sources.
  const getCoverImage = (story) => {
    const candidates = [
      story.coverImage,
      story.image,
      story.storyimage,
    ];

    return (
      candidates.find(
        (src) =>
          typeof src === "string" &&
          /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(src)
      ) || null
    );
  };

  // Friendly illustrated-style fallback when a cover is unavailable.
  const getStoryArt = (title = "") => {
    const name = title.toLowerCase();

    if (name.includes("pup") || name.includes("puppy")) {
      return { emoji: "🐶", background: "cover-sky" };
    }

    if (name.includes("helper") || name.includes("kind")) {
      return { emoji: "🌱", background: "cover-garden" };
    }

    if (name.includes("pencil")) {
      return { emoji: "✏️", background: "cover-blue" };
    }

    if (name.includes("friend")) {
      return { emoji: "🐱", background: "cover-peach" };
    }

    if (name.includes("cloud")) {
      return { emoji: "☁️", background: "cover-cloud" };
    }

    if (
      name.includes("book") ||
      name.includes("library") ||
      name.includes("reading")
    ) {
      return { emoji: "📖", background: "cover-library" };
    }

    if (name.includes("seed") || name.includes("plant")) {
      return { emoji: "🌻", background: "cover-garden" };
    }

    if (name.includes("rabbit") || name.includes("bunny")) {
      return { emoji: "🐰", background: "cover-peach" };
    }

    if (name.includes("park") || name.includes("nature")) {
      return { emoji: "🌳", background: "cover-garden" };
    }

    if (name.includes("space") || name.includes("galaxy")) {
      return { emoji: "🚀", background: "cover-space" };
    }

    if (name.includes("rainbow")) {
      return { emoji: "🌈", background: "cover-cloud" };
    }

    return { emoji: "📚", background: "cover-blue" };
  };

  if (loading) {
    return (
      <div className="story-loading">
        <style>{styles}</style>
        <div className="loading-illustration">📚✨</div>
        <Spin size="large" />
        <Title level={4} className="loading-title">
          Finding your story trophies!
        </Title>
        <Text className="loading-description">
          Getting your reading adventures ready...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="story-error-wrapper">
        <style>{styles}</style>

        <div className="story-error-card">
          <div className="empty-illustration">😕</div>
          <Alert
            type="error"
            showIcon
            message="Oops! Something went wrong."
            description={error}
          />

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="story-library-wrapper">
      <style>{styles}</style>

      <section className="story-library">
        {/* Decorative background */}
        <span className="decoration decoration-star">⭐</span>
        <span className="decoration decoration-rainbow">🌈</span>
        <span className="decoration decoration-cloud">☁️</span>
        <span className="decoration decoration-sparkle">✨</span>

        {/* Trophy header */}
        <header className="story-header">
          <div className="trophy-icon">
            <TrophyFilled />
          </div>

          <Title level={1} className="story-header-title">
            My Story <span>Trophies!</span>
          </Title>

          <Paragraph className="story-header-description">
            Hooray, superstar! Every finished story is a new
            achievement. Keep shining!
          </Paragraph>

          <div className="story-total">
            <span className="total-book-icon">📚</span>
            <span>
              {completedStories.length}{" "}
              {completedStories.length === 1
                ? "Story Completed"
                : "Stories Completed"}
            </span>
          </div>

          {grades.length === 1 && (
            <Tag className="story-grade-filter">
              🎓 {gradeLabel}
            </Tag>
          )}
        </header>

        {/* Completed stories only */}
        {completedStories.length > 0 ? (
          <div className="story-grid">
            {completedStories.map((story, index) => {
              const date = formatDate(story.completedAt);
              const cover = getCoverImage(story);
              const art = getStoryArt(story.title);

              return (
                <Card
                  key={story._id || story.id || index}
                  bordered={false}
                  className="story-card"
                  cover={
                    <div
                      className={`story-art ${art.background}`}
                    >
                      {cover ? (
                        <img
                          src={cover}
                          alt={story.title || "Story illustration"}
                          className="story-art-image"
                          loading="lazy"
                        />
                      ) : (
                        <>
                          <div className="art-cloud art-cloud-one" />
                          <div className="art-cloud art-cloud-two" />
                          <div className="art-sun" />

                          <span className="story-art-emoji">
                            {art.emoji}
                          </span>

                          <span className="art-sparkle art-sparkle-one">
                            ✨
                          </span>
                          <span className="art-sparkle art-sparkle-two">
                            ⭐
                          </span>
                        </>
                      )}

                      {/* <div className="story-completed-badge">
                        <CheckCircleFilled />
                        <span>Completed</span>
                      </div> */}
                    </div>
                  }
                >
                  {/* Title appears only once */}
                  <Title level={4} className="story-card-title">
                    {story.title || "My Reading Story"}
                  </Title>

                  <div className="story-card-meta">
                    {story.grade != null && (
                      <Tag className="story-grade">
                        Grade {String(story.grade).toUpperCase()}
                      </Tag>
                    )}

                    {date && (
                      <Text className="story-date">
                        {date}
                      </Text>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="story-empty">
            <div className="empty-illustration">📖✨</div>

            <Title level={3} className="empty-title">
              Your adventure starts here!
            </Title>

            <Paragraph className="empty-description">
              Complete your first story and it will appear here.
              Your story trophies are waiting!
            </Paragraph>
          </div>
        )}

        {/* Footer inside the same gradient */}
        <footer className="story-footer">
          <div className="footer-decoration">
            <span>✨</span>
            <span>⭐</span>
          </div>

          <Title level={3} className="story-footer-title">
            You are a Reading Superstar!
          </Title>

          <Text className="story-footer-description">
            Every story makes your imagination grow. Keep reading!
          </Text>
        </footer>
      </section>
    </div>
  );
};

const styles = `
  .story-library-wrapper {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: 8px;
    box-sizing: border-box;
  }

  .story-library-wrapper *,
  .story-loading * {
    box-sizing: border-box;
  }

  /* Purple-pink background */
  .story-library {
    position: relative;
    isolation: isolate;
    width: 100%;
    min-height: 400px;
    padding: clamp(22px, 3vw, 38px);
    overflow: hidden;
    border-radius: 25px;
    background: linear-gradient(
      120deg,
      #7252f2 0%,
      #9250ed 43%,
      #c94fdc 72%,
      #ef72cb 100%
    );
    box-shadow: 0 12px 30px rgba(95, 60, 186, 0.17);
  }

  .story-header {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto 28px;
    text-align: center;
  }

  .trophy-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 66px;
    height: 58px;
    margin-bottom: 12px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.16);
    color: #ffdf65;
    font-size: 36px;
  }

  .story-header-title {
    margin: 0 !important;
    color: #fff !important;
    font-size: clamp(27px, 3.6vw, 43px) !important;
    font-weight: 900 !important;
    line-height: 1.2 !important;
  }

  .story-header-title span {
    color: #ffe16c;
  }

  .story-header-description {
    max-width: 650px;
    margin: 12px auto 18px !important;
    color: #fff !important;
    font-size: clamp(13px, 1.5vw, 16px);
    line-height: 1.7;
  }

  .story-total {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 44px;
    padding: 9px 20px;
    border: 2px solid rgba(255, 255, 255, 0.7);
    border-radius: 999px;
    background: #fff;
    color: #6945d0;
    font-size: 14px;
    font-weight: 900;
    box-shadow: 0 5px 15px rgba(55, 29, 115, 0.12);
  }

  .total-book-icon {
    font-size: 21px;
  }

  .story-grade-filter {
    margin: 12px 0 0;
    padding: 5px 13px;
    border: none;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-weight: 800;
  }

  /* Decorations */
  .decoration {
    position: absolute;
    z-index: -1;
    pointer-events: none;
    user-select: none;
    opacity: 0.58;
  }

  .decoration-star {
    top: 35px;
    left: 5%;
    font-size: clamp(32px, 4vw, 52px);
    transform: rotate(-15deg);
  }

  .decoration-rainbow {
    top: 30px;
    right: 5%;
    font-size: clamp(42px, 5vw, 65px);
    transform: rotate(10deg);
  }

  .decoration-cloud {
    right: 4%;
    bottom: 100px;
    font-size: 50px;
    opacity: 0.22;
  }

  .decoration-sparkle {
    left: 3%;
    bottom: 100px;
    font-size: 35px;
    opacity: 0.28;
  }

  /* Story grid */
  .story-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: stretch;
    gap: 20px;
    width: 100%;
  }

  /* White illustrated story cards */
  .story-card {
    min-width: 0;
    height: 100%;
    overflow: hidden;
    border: 3px solid rgba(255, 255, 255, 0.95);
    border-radius: 23px;
    background: #fff;
    box-shadow: 0 7px 17px rgba(57, 34, 120, 0.13);
    transition:
      transform 0.22s ease,
      box-shadow 0.22s ease;
  }

  .story-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 26px rgba(57, 34, 120, 0.2);
  }

  .story-card .ant-card-cover {
    margin: 0;
  }

  .story-card .ant-card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 98px;
    padding: 14px 15px 16px;
    background: linear-gradient(180deg, #fff 0%, #fbfaff 100%);
  }

  /* Soft illustrated covers instead of orange boxes */
  .story-art {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1.35 / 1;
    overflow: hidden;
    isolation: isolate;
  }

  .cover-sky {
    background: linear-gradient(180deg, #a6e5ff 0%, #dff7ff 100%);
  }

  .cover-garden {
    background: linear-gradient(180deg, #c2f1d4 0%, #edffdc 100%);
  }

  .cover-blue {
    background: linear-gradient(180deg, #b4e4ff 0%, #e3f4ff 100%);
  }

  .cover-peach {
    background: linear-gradient(180deg, #ffd5e3 0%, #fff0e7 100%);
  }

  .cover-cloud {
    background: linear-gradient(180deg, #b5dfff 0%, #edf6ff 100%);
  }

  .cover-library {
    background: linear-gradient(180deg, #ded1ff 0%, #f6edff 100%);
  }

  .cover-space {
    background: linear-gradient(180deg, #4b56a6 0%, #a48af5 100%);
  }

  .story-art-image {
    position: absolute;
    inset: 0;
    z-index: -1;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-art-emoji {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 30px 10px 8px;
    font-size: clamp(65px, 8vw, 105px);
    line-height: 1;
    filter: drop-shadow(0 6px 4px rgba(64, 65, 130, 0.1));
    animation: story-float 3.5s ease-in-out infinite;
  }

  .cover-space .story-art-emoji {
    filter: drop-shadow(0 6px 4px rgba(25, 22, 90, 0.25));
  }

  .art-cloud {
    position: absolute;
    z-index: -1;
    width: 90px;
    height: 28px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.6);
  }

  .art-cloud::before,
  .art-cloud::after {
    position: absolute;
    bottom: 7px;
    content: "";
    width: 37px;
    height: 37px;
    border-radius: 50%;
    background: inherit;
  }

  .art-cloud::before {
    left: 12px;
  }

  .art-cloud::after {
    right: 12px;
    width: 28px;
    height: 28px;
  }

  .art-cloud-one {
    top: 27%;
    left: -17px;
    transform: scale(0.8);
  }

  .art-cloud-two {
    right: -20px;
    bottom: 20%;
    transform: scale(0.7);
  }

  .art-sun {
    position: absolute;
    z-index: -1;
    top: 13%;
    right: 12%;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #ffe889;
    box-shadow: 0 0 0 9px rgba(255, 232, 137, 0.18);
  }

  .art-sparkle {
    position: absolute;
    z-index: 1;
    color: #fff;
    font-size: 20px;
  }

  .art-sparkle-one {
    top: 25%;
    left: 17%;
  }

  .art-sparkle-two {
    right: 18%;
    bottom: 20%;
    font-size: 15px;
  }

  /* Completed badge */
  .story-completed-badge {
    position: absolute;
    z-index: 2;
    top: 10px;
    right: 10px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 11px;
    border: 1px solid rgba(255, 255, 255, 0.95);
    border-radius: 999px;
    background: #e5ffed;
    color: #16874c;
    font-size: 11px;
    font-weight: 900;
    box-shadow: 0 3px 9px rgba(38, 104, 72, 0.12);
  }

  /* One title per card */
  .story-card-title {
    margin: 0 !important;
    color: #403184 !important;
    font-size: clamp(16px, 1.5vw, 21px) !important;
    font-weight: 900 !important;
    line-height: 1.4 !important;
    overflow-wrap: anywhere;
  }

  .story-card-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .story-grade {
    margin: 0;
    padding: 5px 11px;
    border: none;
    border-radius: 999px;
    background: #eee7ff;
    color: #6749ce;
    font-size: 11px;
    font-weight: 800;
  }

  .story-date {
    color: #81799a;
    font-size: 11px;
  }

  /* Empty state */
  .story-empty {
    position: relative;
    z-index: 1;
    max-width: 650px;
    margin: 0 auto;
    padding: 34px 20px;
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.96);
    text-align: center;
  }

  .empty-illustration {
    margin-bottom: 12px;
    font-size: 58px;
  }

  .empty-title {
    margin: 0 0 10px !important;
    color: #6045c4 !important;
    font-weight: 900 !important;
  }

  .empty-description {
    margin: 0 !important;
    color: #77718e;
    line-height: 1.7;
  }

  /* Footer */
  .story-footer {
    position: relative;
    z-index: 1;
    padding: 28px 10px 0;
    text-align: center;
  }

  .footer-decoration {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 24px;
  }

  .story-footer-title {
    margin: 10px 0 !important;
    color: #fff !important;
    font-size: clamp(20px, 2.3vw, 28px) !important;
    font-weight: 900 !important;
  }

  .story-footer-description {
    display: inline-block;
    max-width: 520px;
    color: rgba(255, 255, 255, 0.96);
    font-size: 13px;
    line-height: 1.7;
  }

  /* Loading */
  .story-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-height: 320px;
    padding: 30px 15px;
    text-align: center;
  }

  .loading-illustration {
    font-size: 54px;
  }

  .loading-title {
    margin: 0 !important;
    color: #6547cc !important;
  }

  .loading-description {
    color: #77718e;
  }

  /* Error */
  .story-error-wrapper {
    padding: 20px;
  }

  .story-error-card {
    max-width: 600px;
    margin: 0 auto;
    padding: 25px;
    border-radius: 22px;
    background: #fff;
    text-align: center;
  }

  .retry-button {
    height: 44px;
    margin-top: 18px;
    border-radius: 13px;
    font-weight: 800;
  }

  @keyframes story-float {
    0%, 100% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-5px);
    }
  }

  /* Desktop */
  @media (min-width: 1500px) {
    .story-grid {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  /* Tablet */
  @media (max-width: 1000px) {
    .story-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }

    .story-card .ant-card-body {
      padding: 12px;
    }

    .story-art {
      aspect-ratio: 1.15 / 1;
    }

    .story-completed-badge {
      top: 7px;
      right: 7px;
      padding: 6px 8px;
      font-size: 10px;
    }
  }

  /* Mobile */
  @media (max-width: 650px) {
    .story-library-wrapper {
      padding: 4px;
    }

    .story-library {
      padding: 22px 12px;
      border-radius: 20px;
    }

    .story-header {
      margin-bottom: 21px;
    }

    .trophy-icon {
      width: 50px;
      height: 47px;
      margin-bottom: 10px;
      border-radius: 16px;
      font-size: 29px;
    }

    .story-header-description {
      margin: 10px auto 15px !important;
      font-size: 12px;
    }

    .story-total {
      min-height: 40px;
      padding: 8px 13px;
      font-size: 12px;
    }

    .decoration-star {
      top: 10px;
      left: 3%;
      font-size: 29px;
    }

    .decoration-rainbow {
      top: 12px;
      right: 3%;
      font-size: 35px;
    }

    .story-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 11px;
    }

    .story-card {
      border-width: 2px;
      border-radius: 16px;
    }

    .story-card .ant-card-body {
      min-height: 88px;
      gap: 8px;
      padding: 10px;
    }

    .story-art {
      aspect-ratio: 1 / 0.95;
    }

    .story-art-emoji {
      padding-top: 24px;
      font-size: clamp(48px, 12vw, 75px);
    }

    .story-completed-badge {
      top: 5px;
      right: 5px;
      gap: 3px;
      padding: 4px 6px;
      font-size: 9px;
    }

    .story-card-title {
      font-size: 14px !important;
    }

    .story-grade {
      padding: 4px 8px;
      font-size: 9px;
    }

    .story-date {
      font-size: 10px;
    }

    .story-footer {
      padding-top: 22px;
    }

    .story-footer-title {
      font-size: 19px !important;
    }

    .story-footer-description {
      font-size: 12px;
    }
  }

  @media (max-width: 350px) {
    .story-grid {
      grid-template-columns: 1fr;
    }

    .story-art {
      aspect-ratio: 1.5 / 1;
    }

    .story-card .ant-card-body {
      padding: 13px;
    }

    .story-card-title {
      font-size: 16px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-card,
    .story-art-emoji,
    .story-art-image {
      animation: none;
      transition: none;
    }

    .story-card:hover {
      transform: none;
    }
  }
`;

export default CompletedVocabulary;
