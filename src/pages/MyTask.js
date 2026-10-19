
import { useEffect, useState } from "react";
import {
  Card,
  Spin,
  Row,
  Col,
  Empty,
  Button,
  message,
  Typography,
  Tag,
} from "antd";
import {
  Link,
} from "react-router-dom";
import {
  BookOutlined,
  RocketOutlined,
  StarFilled,
  TrophyOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import api from "../api/axiosClient";
import { categoryRouteMap } from "../utils/categoryRouteMap";
import CompletedTask from "./CompletedTask";
import CompletedVocabulary from "./ReadingComprehension/CompletedVocabulary";
import "./MyTasks.css";

const { Title, Text, Paragraph } = Typography;

const taskColors = [
  { background: "#FFF0B3", accent: "#F59E0B", emoji: "🚀" },
  { background: "#DDF7E8", accent: "#16A34A", emoji: "🧩" },
  { background: "#E8E4FF", accent: "#7C3AED", emoji: "🎨" },
  { background: "#FFE1EC", accent: "#E84393", emoji: "📚" },
  { background: "#DDF4FF", accent: "#0284C7", emoji: "🔬" },
  { background: "#FFE9D5", accent: "#EA580C", emoji: "🌟" },
];

const MyTask = ({
  user,
  todayTaskCount,
  setTodayTaskCount,
}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchTasks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const endpoint =
          user.role === "Student"
            ? "/users/todaytaskstudent"
            : "/users/todaytask";

        const res = await api.get(endpoint);

        if (cancelled) return;

        const taskList = Array.isArray(res.data)
          ? res.data
          : [];

        setTasks(taskList);
        setTodayTaskCount?.(taskList.length);
      } catch (error) {
        if (!cancelled) {
          message.error("Oops! We couldn't load your tasks. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      cancelled = true;
    };
  }, [user, retryKey, setTodayTaskCount]);

  const retryFetch = () => {
    setRetryKey((previous) => previous + 1);
  };

  if (loading) {
    return (
      <div className="mytask-loading">
        <div className="mytask-loading-emoji">🪄</div>
        <Spin size="large" />
        <Title level={4}>Getting your fun activities ready...</Title>
        <Text type="secondary">
          Your next adventure is coming!
        </Text>
      </div>
    );
  }

  return (
    <div className="mytask-page">
      {/* Vocabulary section */}
      <div className="mytask-section">
        <CompletedVocabulary user={user} />
      </div>

      {/* Hero section */}
      {/* <div className="mytask-hero">
        <div className="mytask-hero-content">
          <div className="mytask-hero-label">
            <StarFilled /> YOUR LEARNING ADVENTURE
          </div>

          <Title className="mytask-hero-title">
            My Fun Tasks <span>🌈</span>
          </Title>

          <Paragraph className="mytask-hero-description">
            Learn something new, complete your activities,
            and become a superstar!
          </Paragraph>

          <div className="mytask-stats">
            <div className="mytask-stat">
              <span className="mytask-stat-icon">🎯</span>
              <div>
                <strong>{tasks.length}</strong>
                <span>Tasks today</span>
              </div>
            </div>

            <div className="mytask-stat">
              <span className="mytask-stat-icon">⭐</span>
              <div>
                <strong>
                  {typeof todayTaskCount === "number"
                    ? todayTaskCount
                    : tasks.length}
                </strong>
                <span>On your list</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mytask-hero-art" aria-hidden="true">
          <div className="mytask-orbit">✨</div>
          <div className="mytask-rocket">🚀</div>
          <div className="mytask-planet">🪐</div>
          <div className="mytask-cloud">☁️</div>
        </div>
      </div> */}

      {/* Task list heading */}
      <div className="mytask-heading">
        <div>
          <Title level={2}>
            <RocketOutlined /> Today's Adventures
          </Title>
          <Text type="secondary">
            Pick an activity and let's get started!
          </Text>
        </div>

        <Tag color="purple" className="mytask-count-tag">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </Tag>
      </div>

      {/* Empty state */}
      {tasks.length === 0 ? (
        <Card className="mytask-empty-card">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="mytask-empty-content">
                <Title level={4}>No tasks for now! 🌻</Title>
                <Text type="secondary">
                  Take a little break. Your next learning
                  adventure may be coming soon.
                </Text>
              </div>
            }
          />

          <div className="mytask-retry">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={retryFetch}
              className="mytask-retry-button"
            >
              Check Again
            </Button>
          </div>
        </Card>
      ) : (
        <Row gutter={[20, 20]} className="mytask-grid">
          {tasks.map((task, taskIndex) => {
            const theme = taskColors[taskIndex % taskColors.length];

            const categories = Array.isArray(task.categories)
              ? task.categories
              : [];

            const activityCount = categories.reduce(
              (total, category) =>
                total +
                (Array.isArray(category.levels)
                  ? category.levels.length
                  : 0),
              0
            );

            return (
              <Col
                xs={24}
                sm={12}
                lg={8}
                xl={8}
                key={task.userTaskId || task._id || taskIndex}
                className="mytask-column"
              >
                <Card
                  className="mytask-card"
                  bordered={false}
                  style={{
                    "--task-accent": theme.accent,
                    "--task-tint": theme.background,
                  }}
                >
                  {/* Card header */}
                  <div className="mytask-card-top">
                    <div className="mytask-card-icon">
                      {theme.emoji}
                    </div>

                    <Tag color="success" className="mytask-active-tag">
                      <span className="mytask-status-dot" />
                      Active
                    </Tag>
                  </div>

                  <Title level={3} className="mytask-card-title">
                    {task.title || "My Learning Task"}
                  </Title>

                  {task.description && (
                    <Paragraph className="mytask-card-description">
                      {task.description}
                    </Paragraph>
                  )}

                  <div className="mytask-activity-heading">
                    <BookOutlined />
                    <span>Choose your activity</span>
                  </div>

                  {/* Category and level links */}
                  <div className="mytask-activities">
                    {categories.length === 0 ? (
                      <Text type="secondary">
                        No activities have been added yet.
                      </Text>
                    ) : (
                      categories.map((cat, categoryIndex) => {
                        const levels = Array.isArray(cat.levels)
                          ? cat.levels
                          : [];

                        return levels.map((lvl, levelIndex) => {
                          const route = categoryRouteMap[cat.name];

                          const selectedLevel = lvl.selectedLevel;
                          const taskId = task.userTaskId;

                          const activityUrl = route
                            ? `${route}?selectedLevel=${encodeURIComponent(
                                selectedLevel ?? ""
                              )}&userTaskId=${encodeURIComponent(
                                taskId ?? ""
                              )}&category=${encodeURIComponent(cat.name)}`
                            : null;

                          return (
                            <div
                              className="mytask-activity-item"
                              key={`${cat.name}-${selectedLevel}-${categoryIndex}-${levelIndex}`}
                            >
                              {activityUrl ? (
                                <Link
                                  to={activityUrl}
                                  className="mytask-activity-link"
                                >
                                  <Button
                                    block
                                    className="mytask-activity-button"
                                    style={{
                                      "--activity-accent": theme.accent,
                                    }}
                                  >
                                    <span className="mytask-activity-emoji">
                                      {theme.emoji}
                                    </span>

                                    <span className="mytask-activity-text">
                                      <strong>{cat.name}</strong>
                                      <span>
                                        Level: {selectedLevel}
                                      </span>
                                    </span>

                                    <span className="mytask-activity-arrow">
                                      →
                                    </span>
                                  </Button>
                                </Link>
                              ) : (
                                <div className="mytask-route-error">
                                  ⚠️ Activity route not found for{" "}
                                  {cat.name}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="mytask-card-footer">
                    <span>
                      <TrophyOutlined /> Let's do our best!
                    </span>
                    <span>
                      {activityCount}{" "}
                      {activityCount === 1 ? "activity" : "activities"}
                    </span>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Completed tasks */}
      <div className="mytask-completed-section">
        <div className="mytask-completed-heading">
          <span className="mytask-completed-emoji">🏆</span>
          <div>
            <Title level={2}>My Achievements</Title>
            <Text type="secondary">
              Look at all the amazing things you've completed!
            </Text>
          </div>
        </div>

        <CompletedTask user={user} />
      </div>
    </div>
  );
};

export default MyTask;
