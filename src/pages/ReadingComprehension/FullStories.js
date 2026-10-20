
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Alert,
  Spin,
  Empty,
  Typography,
  Tag,
  Select,
} from "antd";

import {
  BookFilled,
  CheckCircleFilled,
  TrophyOutlined,
  StarFilled,
  ReloadOutlined,
} from "@ant-design/icons";

import api from "../../api/axiosClient";
import "./FullStories.css";

const { Title, Text } = Typography;

const GRADES = [
  { label: "KG 1", value: "kg1" },
  { label: "KG 2", value: "kg2" },
  { label: "GRADE 1", value: "1" },
  { label: "GRADE 2", value: "2" },
  { label: "GRADE 3", value: "3" },
  { label: "GRADE 4", value: "4" },
  { label: "GRADE 5", value: "5" },
];

const normalizeGrade = (grade) => {
  const value = String(grade ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  if (
    ["kg1", "kindergarten1", "kindergarten"].includes(value)
  ) {
    return "kg1";
  }

  if (["kg2", "kindergarten2"].includes(value)) {
    return "kg2";
  }

  const match = value.match(/^(?:grade|gr)?(\d+)$/);

  return match ? match[1] : value;
};

const getStoryImage = (story) =>
  story?.coverImage ||
  story?.image ||
  story?.thumbnail ||
  story?.storyimage ||
  "";

const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return "";

  const cleanPath = path.trim();

  if (
    /^(https?:\/\/|data:image\/|blob:)/i.test(cleanPath)
  ) {
    return cleanPath;
  }

  const baseURL = (
    process.env.REACT_APP_API_URL ||
    ""
  ).replace(/\/+$/, "");

  return `${baseURL}/${cleanPath.replace(/^\/+/, "")}`;
};

const isPdf = (path) => /\.pdf(?:$|[?#])/i.test(path || "");

const getStoryId = (story) =>
  String(story?._id || story?.storyId || story?.id || "");

const getGradeLabel = (grade) =>
  GRADES.find(
    (item) => item.value === normalizeGrade(grade)
  )?.label || "STORY";

const FullStories = ({
  user,
  studentId,
  isStudent = false,
}) => {
  const [stories, setStories] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("kg1");
  const [visibleCount, setVisibleCount] = useState(12);
  const [sortBy, setSortBy] = useState("relevance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const userId = user?._id || user?.id;

  const currentStudentId =
    studentId || (isStudent ? userId : null);

  // Fetch stories whenever the selected grade changes.
  useEffect(() => {
    let cancelled = false;

    const fetchStories = async () => {
      try {
        setLoading(true);
        setError("");
        setStories([]);

        const params = {};

        if (isStudent && currentStudentId) {
          params.studentId = String(currentStudentId);
        } else if (userId) {
          params.userId = String(userId);
        }

        const response = await api.get(
          `/reading/grade/${selectedGrade}`,
          { params }
        );

        const payload = response?.data;

        const result = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.stories)
          ? payload.stories
          : [];

        if (!cancelled) {
          setStories(result);
        }
      } catch (err) {
        console.error("Failed to load stories:", err);

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "We couldn't load your stories. Please try again!"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStories();

    return () => {
      cancelled = true;
    };
  }, [
    selectedGrade,
    isStudent,
    currentStudentId,
    userId,
    reloadKey,
  ]);

  const selectedGradeLabel = getGradeLabel(selectedGrade);

  // Sort without mutating the original story list.
  const displayedStories = useMemo(() => {
    const result = [...stories];

    if (sortBy === "title") {
      result.sort((a, b) =>
        String(a.title || "").localeCompare(
          String(b.title || "")
        )
      );
    }

    if (sortBy === "score") {
      result.sort(
        (a, b) =>
          Number(b.score || 0) - Number(a.score || 0)
      );
    }

    return result;
  }, [stories, sortBy]);

  const visibleStories = displayedStories.slice(
    0,
    visibleCount
  );

  const handleGradeChange = (grade) => {
    setSelectedGrade(grade);
    setVisibleCount(12);
  };

  const handleReload = () => {
    setReloadKey((key) => key + 1);
  };

  return (
    <main className="my-stories-page">
      {/* Library header */}
      <header className="stories-header">
        <div className="stories-header-icon">
          <BookFilled />
        </div>

        <div className="stories-header-text">
          <Title level={2}>Story Library</Title>

          <Text>
            Discover amazing stories, explore new worlds,
            and keep learning!
          </Text>
        </div>
      </header>

      {/* Grade navigation and filters */}
      <nav
        className="stories-navigation"
        aria-label="Story library navigation"
      >
        <div className="stories-top-menu" role="tablist">
          {GRADES.map((grade) => (
            <button
              key={grade.value}
              type="button"
              role="tab"
              aria-selected={
                selectedGrade === grade.value
              }
              className={`stories-menu-item ${
                selectedGrade === grade.value
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                handleGradeChange(grade.value)
              }
            >
              {grade.label}
            </button>
          ))}
        </div>

        <div className="stories-filter-menu">
          <span className="story-filter-chip">
            📚 Reading Adventures
          </span>

          <span className="story-filter-chip">
            🌈 Fiction & Non-Fiction
          </span>

          <div className="stories-sort">
            <label
              className="stories-sort-label"
              htmlFor="story-sort"
            >
              Sort by
            </label>

            <Select
              id="story-sort"
              size="middle"
              value={sortBy}
              onChange={setSortBy}
              aria-label="Sort stories"
              options={[
                {
                  label: "Relevance",
                  value: "relevance",
                },
                {
                  label: "Title A–Z",
                  value: "title",
                },
                {
                  label: "Highest Score",
                  value: "score",
                },
              ]}
            />
          </div>
        </div>
      </nav>

      {/* Stories section */}
      <section className="stories-section">
        <div className="stories-section-heading">
          <div>
            <h3>
              <StarFilled className="heading-star" />{" "}
              {selectedGradeLabel} Stories
            </h3>

            <p>
              Pick a book, discover a new world, and have fun
              reading!
            </p>
          </div>

          {!loading && !error && (
            <Tag className="stories-count">
              {stories.length}{" "}
              {stories.length === 1 ? "BOOK" : "BOOKS"}
            </Tag>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="stories-loading">
            <Spin size="large" />

            <p>
              📖 Opening your story library...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert
            type="error"
            showIcon
            message="Unable to load stories"
            description={error}
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleReload}
              >
                Try Again
              </Button>
            }
          />
        )}

        {/* No stories */}
        {!loading && !error && stories.length === 0 && (
          <div className="stories-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <strong>
                    No stories found for {selectedGradeLabel}.
                  </strong>

                  <p>
                    Try another grade to discover more
                    adventures!
                  </p>
                </div>
              }
            />
          </div>
        )}

        {/* Story cards */}
        {!loading && !error && stories.length > 0 && (
          <>
            <div className="stories-grid">
              {visibleStories.map((story, index) => {
                const imagePath = getStoryImage(story);
                const imageUrl = getImageUrl(imagePath);
                const pdfCover = isPdf(imagePath);

                return (
                  <article
                    className="story-card"
                    key={
                      getStoryId(story) ||
                      `${story.title || "story"}-${index}`
                    }
                  >
                    {/* Exactly one cover container */}
                    <div className="story-cover">
                      {imageUrl && !pdfCover && (
                        <img
                          src={imageUrl}
                          alt={
                            story.title || "Story cover"
                          }
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";

                            const placeholder =
                              event.currentTarget.parentElement
                                ?.querySelector(
                                  ".story-placeholder"
                                );

                            placeholder?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      )}

                      <div
                        className={`story-placeholder ${
                          imageUrl && !pdfCover
                            ? "hidden"
                            : ""
                        }`}
                      >
                        {story.emoji || "📚"}
                      </div>

                      <span className="story-grade-badge">
                        {getGradeLabel(story.grade || selectedGrade)}
                      </span>

                      {story.completedAt && (
                        <span
                          className="story-completed-icon"
                          title="Completed"
                        >
                          <CheckCircleFilled />
                        </span>
                      )}
                    </div>

                    {/* Story information */}
                    <div className="story-card-content">
                      <h4 title={story.title}>
                        {story.title || "Untitled Story"}
                      </h4>

                      <p className="story-meta">
                        <BookFilled />
                        <span>
                          {story.category ||
                            "Reading Adventure"}
                        </span>
                      </p>

                      <div className="story-card-footer">
                        {story.completedAt ? (
                          <span className="completed-label">
                            <CheckCircleFilled />
                            Completed
                          </span>
                        ) : (
                          <span className="reading-label">
                            <StarFilled />
                            Ready to read
                          </span>
                        )}

                        {story.score != null && (
                          <span className="story-score">
                            <TrophyOutlined />
                            {story.score}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {visibleCount < displayedStories.length && (
              <div className="show-more-container">
                <Button
                  type="primary"
                  onClick={() =>
                    setVisibleCount((count) => count + 12)
                  }
                >
                  Show More Stories ✨
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default FullStories;
