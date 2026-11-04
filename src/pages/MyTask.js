
import { useEffect, useState, useCallback } from "react";
import {
  Spin,
  Button,
  message,
  Typography,
  Tag,
  Modal,
  Card,
  Row,
  Col,
  Empty,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  ShareAltOutlined,
  ReloadOutlined,
  TrophyOutlined,
} from "@ant-design/icons";


import api from "../api/axiosClient";
import CompletedTask from "./CompletedTask";
import "./MyTasks.css";
import Signup from "./Signup";

const { Title, Text } = Typography;

const MyTask = ({
  user,
  setUser,
  todayTaskCount,
  setTodayTaskCount,
}) => {
  const navigate = useNavigate();

  // Task states
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  // Tournament states
  const [tournaments, setTournaments] = useState([]);
  const [tournamentLoading, setTournamentLoading] = useState(true);
  const [tournamentError, setTournamentError] = useState("");
  const [joiningId, setJoiningId] = useState(null);
  const [joinedTournamentIds, setJoinedTournamentIds] = useState([]);

  // Signup modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // --------------------------------
  // Load tournaments
  // --------------------------------

  const loadTournaments = useCallback(async () => {
    setTournamentLoading(true);
    setTournamentError("");

    try {
      const response = await api.get("/chess/tournaments");

      const data = response?.data;

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.tournaments)
        ? data.tournaments
        : Array.isArray(data?.items)
        ? data.items
        : [];

      setTournaments(items);
    } catch (error) {
      console.error("Could not load tournaments:", error);

      setTournamentError(
        error?.response?.data?.message ||
          "Could not load tournaments. Please try again."
      );
    } finally {
      setTournamentLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTournaments();

    const interval = setInterval(() => {
      loadTournaments();
    }, 300000);

    return () => clearInterval(interval);
  }, [loadTournaments]);

  // --------------------------------
  // Load today's tasks
  // --------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchTasks = async () => {
      if (!user) {
        setTasks([]);
        setTaskLoading(false);
        return;
      }

      setTaskLoading(true);

      try {
        const endpoint =
          user.role === "Student"
            ? "/users/todaytaskstudent"
            : "/users/todaytask";

        const response = await api.get(endpoint);

        if (cancelled) return;

        const taskList = Array.isArray(response.data)
          ? response.data
          : [];

        setTasks(taskList);
        setTodayTaskCount?.(taskList.length);
      } catch (error) {
        if (!cancelled) {
          console.error("Task loading error:", error);
          message.error(
            "Oops! We couldn't load your tasks. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setTaskLoading(false);
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

  // --------------------------------
  // Tournament helpers
  // --------------------------------

  const getTournamentId = (tournament) =>
    String(tournament?._id || tournament?.id || "");

  const getStatus = (tournament) =>
    String(tournament?.status || "open").toLowerCase();

  const getPlayers = (tournament) => {
    if (typeof tournament.playerCount === "number") {
      return tournament.playerCount;
    }

    if (typeof tournament.playersCount === "number") {
      return tournament.playersCount;
    }

    if (Array.isArray(tournament.players)) {
      return tournament.players.length;
    }

    if (Array.isArray(tournament.participants)) {
      return tournament.participants.length;
    }

    return 0;
  };

  const getMaxPlayers = (tournament) =>
    Number(tournament.maxPlayers || 16);

  const isJoined = (tournament) => {
    const tournamentId = getTournamentId(tournament);

    if (joinedTournamentIds.includes(tournamentId)) {
      return true;
    }

    if (
      tournament.joinedByMe === true ||
      tournament.isJoined === true
    ) {
      return true;
    }

    const currentUserId = String(
      user?._id || user?.id || user?.userId || ""
    );

    const players =
      tournament.players || tournament.participants || [];

    if (!currentUserId || !Array.isArray(players)) {
      return false;
    }

    return players.some((player) => {
      const registeredUserId =
        player?.userId?._id ||
        player?.userId?.id ||
        player?.userId ||
        player?.studentId?._id ||
        player?.studentId?.id ||
        player?.studentId;

      return String(registeredUserId || "") === currentUserId;
    });
  };

  const canJoin = (tournament) => {
    const status = getStatus(tournament);

    return (
      ["open", "upcoming", "registration"].includes(status) &&
      getPlayers(tournament) < getMaxPlayers(tournament) &&
      !isJoined(tournament)
    );
  };

  const getStatusColor = (statusValue) => {
    if (["open", "registration"].includes(statusValue)) {
      return "green";
    }

    if (statusValue === "upcoming") return "blue";
    if (statusValue === "ongoing" || statusValue === "in-progress") {
      return "orange";
    }

    if (statusValue === "completed") return "default";

    return "purple";
  };

  // --------------------------------
  // Join tournament
  // --------------------------------

  const joinTournament = async (tournament) => {
    const id = getTournamentId(tournament);

    if (!id) {
      message.error("Tournament ID is missing.");
      return;
    }

    if (joiningId) return;

    setJoiningId(id);

    try {
      const response = await api.post(
        `/chess/tournaments/${id}/join`
      );

      setJoinedTournamentIds((previous) =>
        previous.includes(id) ? previous : [...previous, id]
      );

      message.success(
        response?.data?.message ||
          `You joined ${tournament.name || "the tournament"}!`
      );

      await loadTournaments();
    } catch (error) {
      console.error("Tournament registration failed:", error);

      message.error(
        error?.response?.data?.message ||
          "Unable to register for this tournament."
      );
    } finally {
      setJoiningId(null);
    }
  };

  // --------------------------------
  // Share tournament
  // --------------------------------

  const shareTournament = async (tournament) => {
    const id = getTournamentId(tournament);

    if (!id) {
      message.error("Tournament ID is missing.");
      return;
    }

    const shareUrl =
      `${window.location.origin}/tournaments`;

    const shareData = {
      title: tournament.name || "Flair Chess Tournament",
      text: `♟️ Join me in ${
        tournament.name || "Flair Chess Tournament"
      }! Register now and let's play chess together!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        message.success(
          "Tournament link copied! Share it with your friends."
        );
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(shareUrl);
          message.success("Tournament link copied!");
        } catch {
          message.error("Unable to share tournament link.");
        }
      }
    }
  };

  // --------------------------------
  // Match navigation
  // --------------------------------

  const handlePlayMatch = (
    tournamentId,
    roundNumber,
    pairingId
  ) => {
    navigate(
      `/chess/tournaments/${tournamentId}/match?round=${roundNumber}&pairingId=${pairingId}`
    );
  };

  // --------------------------------
  // Loading
  // --------------------------------

  if (taskLoading) {
    return (
      <div className="mytask-loading">
        <div className="mytask-loading-emoji">🪄</div>
        <Spin size="large" />
        <Title level={4}>
          Getting your fun activities ready...
        </Title>
        <Text type="secondary">
          Your next adventure is coming!
        </Text>
      </div>
    );
  }

  // --------------------------------
  // Main UI
  // --------------------------------

  return (
    <div className="mytask-page">

      {/* Today's Tasks */}

    
      


      {/* Chess Tournaments */}

      <div className="mytask-tournament-section">
        <div style={{ marginBottom: 20 }}>
          <Title level={2}>
            ♟️ Flair Chess Tournaments
          </Title>

          <Text type="secondary">
            Join tournaments, challenge your friends and become a chess champion!
          </Text>
        </div>

        {tournamentLoading ? (
          <div style={{ textAlign: "center", padding: 30 }}>
            <Spin size="large" />
            <p>Loading chess tournaments...</p>
          </div>
        ) : tournamentError ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Text type="danger">{tournamentError}</Text>
            <br />
            <Button
              onClick={loadTournaments}
              style={{ marginTop: 12 }}
            >
              Try Again
            </Button>
          </div>
        ) : tournaments.length === 0 ? (
          <Empty description="No chess tournaments available yet." />
        ) : (
          <Row gutter={[16, 16]}>
            {tournaments.map((tournament) => {
              const id = getTournamentId(tournament);
              const status = getStatus(tournament);
              const joined = isJoined(tournament);
              const available = canJoin(tournament);

              const playerCount = getPlayers(tournament);
              const maxPlayers = getMaxPlayers(tournament);

              const isGuest =
                !user || user?.username === "Guest";

              return (
                <Col xs={24} sm={12} lg={8} key={id}>
                  <Card
                    hoverable
                    style={{
                      height: "100%",
                      borderRadius: 20,
                      border: "2px solid #E9D5FF",
                      boxShadow:
                        "0 5px 18px rgba(124,58,237,0.10)",
                    }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Title
                          level={4}
                          style={{ margin: 0 }}
                        >
                          ♟️ {tournament.name || "Chess Tournament"}
                        </Title>

                        <Tag color={getStatusColor(status)}>
                          {status.toUpperCase()}
                        </Tag>
                      </div>

                      <Text type="secondary">
                        {tournament.description ||
                          "Join the chess challenge and show your skills!"}
                      </Text>
                    </div>

                    <div
                      style={{
                        background: "#F5F0FF",
                        padding: 14,
                        borderRadius: 12,
                        marginBottom: 16,
                      }}
                    >
                      <Row justify="space-between">
                        <Col>
                          <Text type="secondary">Players</Text>
                          <Title level={4} style={{ margin: 0 }}>
                            👥 {playerCount}/{maxPlayers}
                          </Title>
                        </Col>

                        <Col>
                          <Text type="secondary">Format</Text>
                          <Title level={4} style={{ margin: 0 }}>
                            🏆 {tournament.format || "Swiss"}
                          </Title>
                        </Col>
                      </Row>
                    </div>

                    {/* Tournament footer */}

                    <div className="chess-tournament-footer">

                      {["ongoing", "in-progress"].includes(status) && (
                        <Button
                          block
                          size="large"
                          type="primary"
                          onClick={() =>
                            navigate(`/chess/tournaments/${id}`)
                          }
                          style={{ marginBottom: 10 }}
                        >
                          ♟️ View Tournament Matches
                        </Button>
                      )}

                      {isGuest ? (
                        <>
                          <p>To join this tournament, please sign up.</p>

                          <Button
                            type="primary"
                            block
                            onClick={() => {
                              setIsLogin(true);
                              setModalOpen(true);
                            }}
                            style={{
                              background:
                                "linear-gradient(135deg, #667EEA, #764BA2)",
                              border: "none",
                              borderRadius: 12,
                              fontWeight: 700,
                            }}
                          >
                            📝 Sign Up Flair Chess
                          </Button>
                        </>
                      ) : joined ? (
                        <Button
                          type="default"
                          block
                          disabled
                          style={{
                            background: "#E8F8EE",
                            color: "#23864A",
                            borderColor: "#9AD9AF",
                            borderRadius: 12,
                            fontWeight: 700,
                          }}
                        >
                          ✅ Already Registered
                        </Button>
                      ) : available ? (
                        <Button
                          type="primary"
                          block
                          loading={joiningId === id}
                          onClick={() => joinTournament(tournament)}
                          style={{
                            borderRadius: 12,
                            fontWeight: 700,
                          }}
                        >
                          ♟️ Register Tournament
                        </Button>
                      ) : (
                        <Button block disabled>
                          Registration Closed
                        </Button>
                      )}

                      <Button
                        block
                        size="large"
                        icon={<ShareAltOutlined />}
                        onClick={() =>
                          shareTournament(tournament)
                        }
                        style={{
                          marginTop: 10,
                          borderRadius: 12,
                          border: "1px solid #8b5cf6",
                          color: "#7c3aed",
                          fontWeight: 700,
                        }}
                      >
                        Share Tournament Link
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      {/* Achievements */}

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

      {/* Signup Modal */}

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
        width={380}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: "#7b2ff7",
            }}
          >
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <p style={{ color: "#666", marginTop: 4 }}>
            {isLogin
              ? "Login to continue"
              : "Sign up to get started"}
          </p>
        </div>

        <Signup
          onSuccess={() => setModalOpen(false)}
          setUser={setUser}
        />
      </Modal>
    </div>
  );
};

export default MyTask;
