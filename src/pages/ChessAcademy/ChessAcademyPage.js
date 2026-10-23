import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  message,
  Progress,
  Row,
  Spin,
  Tag,
  Typography,Modal
} from "antd";
import {
  TrophyOutlined,
  RobotOutlined,
    AppstoreOutlined,
  CrownOutlined,
  TeamOutlined,
  RightOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import "./ChessAcademyPage.css";
import Signup from "../Signup";

const { Title, Text, Paragraph } = Typography;

const ChessAcademyPage = ({ user,setUser }) => {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState("");
const [joinedTournamentIds, setJoinedTournamentIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);


const handlePlayMatch = (tournamentId, roundNumber, pairingId) => {
  navigate(
    `/chess/tournaments/${tournamentId}/match?round=${roundNumber}&pairingId=${pairingId}`
  );
};
  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError("");

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
    } catch (err) {
      console.error("Could not load tournaments:", err);
      setError(
        err?.response?.data?.message ||
          "Could not load tournaments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

 
const joinTournament = async (tournament) => {
  const id = tournament._id || tournament.id;

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

  // Update the button immediately after successful registration
  setJoinedTournamentIds((previous) =>
    previous.includes(String(id))
      ? previous
      : [...previous, String(id)]
  );

  message.success(
    response?.data?.message ||
      `You joined ${tournament.name || "the tournament"}!`
  );

  await loadTournaments();
} catch (err) {
  console.error("Tournament registration failed:", err);

  message.error(
    err?.response?.data?.message ||
      "Unable to register for this tournament."
  );
} finally {
  setJoiningId(null);
}
};


  const getStatus = (tournament) =>
    String(tournament.status || "open").toLowerCase();

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


const getStandings = async(tournament) => {
  const players = Array.isArray(tournament.players)
    ? tournament.players
    : [];
  await loadTournaments();
  return players
    .filter((player) => !player.withdrawn)
    .sort(
      (a, b) =>
        Number(b.score || 0) - Number(a.score || 0) ||
        Number(b.rating || 0) - Number(a.rating || 0) ||
        String(a.displayName || "").localeCompare(
          String(b.displayName || "")
        )
    )
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
};



const isJoined = (tournament) => {
  const tournamentId = String(tournament._id || tournament.id || "");

  // Immediately recognize successful registrations in this session
  if (joinedTournamentIds.includes(tournamentId)) {
    return true;
  }

  // Check the backend's joined status
  if (tournament.joinedByMe === true || tournament.isJoined === true) {
    return true;
  }

  // Check registered players against the logged-in user
  const currentUserId = String(
    user?._id || user?.id || user?.userId || ""
  );

  const players = tournament.players || tournament.participants || [];

  if (!currentUserId || !Array.isArray(players)) {
    return false;
  }

  return players.some((player) => {
    const registeredUserId =
      player?.userId?._id ||
      player?.userId?.id ||
      player?.userId ||
      player?.studentId?._id ||
      player?.studentId;

    return String(registeredUserId || "") === currentUserId;
  });
};

  const canJoin = (tournament) => {
    const status = getStatus(tournament);
    const players = getPlayers(tournament);
    const maxPlayers = getMaxPlayers(tournament);

    return (
      ["open", "upcoming", "registration"].includes(status) &&
      players < maxPlayers &&
      !isJoined(tournament)
    );
  };

  const getStatusColor = (status) => {
    if (["open", "registration"].includes(status)) return "green";
    if (status === "upcoming") return "blue";
    if (status === "ongoing") return "orange";
    if (status === "completed") return "default";
    return "purple";
  };

  const tournamentCount = tournaments.length;



  return (
    <div className="chess-academy-page">
      {/* HERO */}
      <section className="chess-hero">
        <div className="chess-hero-content">
          <Tag color="gold" className="chess-hero-tag">
            ♟️ YOUR CHESS ADVENTURE STARTS HERE
          </Tag>

          <Title className="chess-hero-title">
            Welcome{user?.username ? `, ${user.username}` : ""} to <span>Flair Chess Academy!</span>
          </Title>

          <Paragraph className="chess-hero-description">
            Think smart, make your move, solve puzzles, and become a
            chess champion. Every move makes you stronger!
          </Paragraph>

          <div className="chess-hero-actions">
            <Button
              size="large"
              className="chess-primary-button"
              icon={<RobotOutlined />}
              onClick={() => navigate("/chess/play/computer")}
            >
              Play Computer
            </Button>

            <Button
              size="large"
              className="chess-secondary-button"
              icon={<TrophyOutlined />}
              onClick={() => {
                document
                  .getElementById("chess-tournaments")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Tournaments
            </Button>
          </div>
        </div>

        <div className="chess-hero-art" aria-label="Chess pieces">
          <div className="chess-art-circle">
            <span className="chess-king">♚</span>
            <span className="chess-queen">♛</span>
            <span className="chess-knight">♞</span>
            <span className="chess-pawn">♟</span>
          </div>
          <div className="chess-floating-star star-one">⭐</div>
          <div className="chess-floating-star star-two">✨</div>
          <div className="chess-floating-star star-three">🏆</div>
        </div>
      </section>

      {/* QUICK STATS */}
      <Row gutter={[16, 16]} className="chess-stats">
        <Col xs={12} md={8}>
          <Card className="chess-stat-card stat-purple">
            <TrophyOutlined className="chess-stat-icon" />
            <div>
              <Title level={3}>{tournamentCount}</Title>
              <Text>Available Tournaments</Text>
            </div>
          </Card>
        </Col>

        <Col xs={12} md={8}>
          <Card className="chess-stat-card stat-orange">
            <RobotOutlined className="chess-stat-icon" />
            <div>
              <Title level={3}>∞</Title>
              <Text>Practice Matches</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="chess-stat-card stat-green">
            <AppstoreOutlined className="chess-stat-icon" />
            <div>
              <Title level={3}>Daily</Title>
              <Text>Chess Challenges</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ACTIVITY CARDS */}
      <div className="chess-section-heading">
        <div>
          <Title level={2}>Choose Your Adventure</Title>
          <Text>Pick a challenge and start playing!</Text>
        </div>
      </div>

      <Row gutter={[20, 20]} className="chess-activity-row">
        <Col xs={24} md={8}>
          <Card className="chess-activity-card activity-tournament">
            <div className="chess-activity-emoji">🏆</div>
            <Tag color="gold">COMPETE</Tag>
            <Title level={3}>Chess Tournaments</Title>
            <Paragraph>
              Join tournaments, challenge other players, and aim for
              the champion's trophy.
            </Paragraph>
            <Button
              block
              type="primary"
              icon={<TeamOutlined />}
              onClick={() =>
                document
                  .getElementById("chess-tournaments")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Find a Tournament
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="chess-activity-card activity-computer">
            <div className="chess-activity-emoji">🤖</div>
            <Tag color="blue">PRACTICE</Tag>
            <Title level={3}>Play vs Computer</Title>
            <Paragraph>
              Practice at your own pace. Choose a difficulty and
              sharpen your chess skills.
            </Paragraph>
            <Button
              block
              type="primary"
              icon={<RobotOutlined />}
              onClick={() => navigate("/chess/play/computer")}
            >
              Start a Match
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="chess-activity-card activity-puzzle">
            <div className="chess-activity-emoji">🧩</div>
            <Tag color="purple">BRAIN POWER</Tag>
            <Title level={3}>Chess Puzzles</Title>
            <Paragraph>
              Find the winning move, spot clever tactics, and earn
              points with every puzzle you solve.
            </Paragraph>
            <Button
              block
              type="primary"
              icon={<AppstoreOutlined />}
              onClick={() => navigate("/chess/puzzles")}
            >
              Solve Puzzles
            </Button>
          </Card>
        </Col>
      </Row>

      {/* TOURNAMENTS */}
      <section id="chess-tournaments" className="chess-tournament-section">
        <div className="chess-section-heading tournament-heading">
          <div>
            <Title level={2}>
              <TrophyOutlined /> Open Tournaments
            </Title>
            <Text>Join the competition and make your best move.</Text>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={loadTournaments}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <Alert
            type="error"
            showIcon
            title="Tournament loading failed"
            description={error}
            action={
              <Button size="small" onClick={loadTournaments}>
                Retry
              </Button>
            }
            className="chess-error-alert"
          />
        )}

        {loading ? (
          <div className="chess-loading">
            <Spin size="large" />
            <Text>Finding exciting tournaments...</Text>
          </div>
        ) : tournaments.length === 0 ? (
          <Card className="chess-empty-card">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4}>No tournaments yet!</Title>
                  <Text>
                    Your next chess adventure will appear here.
                  </Text>
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {tournaments.map((tournament) => {
              const id = tournament._id || tournament.id;
              const status = getStatus(tournament);
              const players = getPlayers(tournament);
              const maxPlayers = getMaxPlayers(tournament);
              const joined = isJoined(tournament);
              const available = canJoin(tournament);

              return (
                <Col xs={24} md={12} xl={8} key={id}>
                  <Card className="chess-tournament-card">
                    <div className="chess-tournament-card-top">
                      <div className="chess-tournament-icon">♟️</div>
                      <Tag color={getStatusColor(status)}>
                        {status.toUpperCase()}
                      </Tag>
                    </div>

                    <Title level={3} className="chess-tournament-name">
                      {tournament.name || "Chess Tournament"}
                    </Title>

                    <div className="chess-tournament-details">
                      <div>
                        <TeamOutlined />
                        <Text>
                          {players} / {maxPlayers} players
                        </Text>
                      </div>

                      <div>
                        <ClockCircleOutlined />
                        <Text>
                          {tournament.timeControlMinutes ||
                            tournament.timeControl ||
                            10}{" "}
                          min per player
                        </Text>
                      </div>

                      <div>
                        <FireOutlined />
                        <Text>
                          {tournament.roundsCount ||
                            tournament.rounds?.length ||
                            1}{" "}
                          rounds
                        </Text>
                      </div>
                    </div>

                    <Progress
                      percent={Math.min(
                        100,
                        Math.round((players / Math.max(maxPlayers, 1)) * 100)
                      )}
                      showInfo={false}
                      strokeColor={{
                        "0%": "#7257e8",
                        "100%": "#ff9f43",
                      }}
                      className="chess-player-progress"
                    />

                    <div className="chess-tournament-footer">
                      {["ongoing", "in-progress"].includes(status) && (
  <Button
    block
    size="large"
    type="primary"
    onClick={() => navigate(`/chess/tournaments/${id}`)}
  >
    ♟️ View Tournament Matches
  </Button>
)}
{console.log("username:", user?.username, "joined:", joined, "available:", available)}

{user?.username === "Guest" ? (<>
<p>To join tournament, </p>
<Button
    type="primary"
    block
  
    onClick={() =>  {setIsLogin(true); setModalOpen(true); }}
    style={{
      background: "linear-gradient(135deg, #667EEA, #764BA2)",
      border: "none",
      borderRadius: 12,
      fontWeight: 700,
    }}
  >
    📝 Sign Up Flair Chess 
  </Button></>)
: joined ? (
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
  >
    ♟️ Register Tournament
  </Button>
) : (
  <Button block disabled>
    Registration Closed
  </Button>
)}

                    </div>



                    
{/* 🏆 Tournament Standings */}
<div className="tournament-standings">
  <div className="tournament-standings-heading">
    <TrophyOutlined />
    <span>🏆 Live Standings</span>
  </div>

  {getStandings(tournament).length === 0 ? (
    <div className="standings-empty">
      No players registered yet. Be the first to join! ♟️
    </div>
  ) : (
    <div className="standings-list">
      {getStandings(tournament).map((player) => (
        <div
          className={`standings-player ${
            player.rank === 1 ? "standings-champion" : ""
          }`}
          key={player._id || player.userId}
        >
          <div className="standings-player-left">
            <span className="standings-rank">
              {player.rank === 1
                ? "🥇"
                : player.rank === 2
                ? "🥈"
                : player.rank === 3
                ? "🥉"
                : `#${player.rank}`}
            </span>

            <div className="standings-player-info">
              <span className="standings-player-name">
                {player.displayName || "Chess Player"}
              </span>
              <span className="standings-player-rating">
                Rating: {player.rating ?? 800}
              </span>
            </div>
          </div>

          <Tag color={player.rank === 1 ? "gold" : "purple"}>
            ⭐ {Number(player.score || 0)} pts
          </Tag>
        </div>
      ))}
    </div>
  )}
</div>

                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </section>

      {/* FOOTER BANNER */}
      <section className="chess-bottom-banner">
        <div>
          <div className="chess-banner-emoji">👑</div>
          <Title level={3}>Every Chess Champion Starts with One Move!</Title>
          <Text>
            Keep practising, think ahead, and enjoy your chess journey.
          </Text>
        </div>

        <Button
          size="large"
          onClick={() => navigate("/chess/puzzles")}
        >
          Challenge Your Brain <RightOutlined />
        </Button>
      </section>

         <Modal open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} centered width={380}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#7b2ff7" }}>
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p style={{ color: "#666", marginTop: 4 }}>
                {isLogin ? "Login to continue" : "Sign up to get started"}
              </p>
            </div>
    
          
              <Signup onSuccess={() => setModalOpen(false)} setUser={setUser} />
          
    
          
          </Modal>
    </div>
  );
};

export default ChessAcademyPage;