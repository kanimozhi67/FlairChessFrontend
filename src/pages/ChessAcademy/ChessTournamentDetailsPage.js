
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosClient";

const { Title, Text, Paragraph } = Typography;

const ChessTournamentDetailsPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Load tournament details
  const loadTournament = useCallback(async (showLoader = true) => {
    if (!tournamentId) {
      setError("Tournament ID is missing.");
      setLoading(false);
      return;
    }

    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await api.get(
        `/chess/tournaments/${tournamentId}`
      );

      console.log("Tournament API response:", response.data);

      const data = response.data?.tournament || response.data;

      if (!data || !data._id && !data.id) {
        throw new Error("Invalid tournament response from server.");
      }

      setTournament(data);
    } catch (err) {
      console.error("Failed to load tournament:", err);

      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Could not load tournament details.";

      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadTournament(true);
  }, [loadTournament]);

  // Resolve player names
  const getPlayerName = (playerId) => {
    if (!playerId) return "Not assigned";

    const id =
      playerId?._id ||
      playerId?.userId?._id ||
      playerId?.userId ||
      playerId?.studentId?._id ||
      playerId?.studentId ||
      playerId;

    const player = tournament?.players?.find((p) => {
      const registeredId =
        p?._id ||
        p?.userId?._id ||
        p?.userId ||
        p?.studentId?._id ||
        p?.studentId;

      return String(registeredId) === String(id);
    });

    if (typeof playerId === "object") {
      return (
        playerId.displayName ||
        playerId.username ||
        playerId.name ||
        player?.displayName ||
        player?.username ||
        player?.name ||
        "Unknown player"
      );
    }

    return (
      player?.displayName ||
      player?.username ||
      player?.name ||
      "Unknown player"
    );
  };

  // Navigate to individual match
  const playMatch = (roundNumber, pairingId) => {
    if (!pairingId) {
      message.error("Match ID is missing.");
      return;
    }

    navigate(
      `/chess/tournaments/${tournamentId}/match?round=${roundNumber}&pairingId=${pairingId}`
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" />
        <Paragraph>Loading your chess tournament...</Paragraph>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div style={{ padding: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/chess/academy")}
          style={{ marginBottom: 20 }}
        >
          Back to Chess Academy
        </Button>

        <Alert
          type="error"
          showIcon
          message="Tournament loading failed"
          description={error}
          action={
            <Button
              size="small"
              onClick={() => loadTournament(true)}
            >
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Tournament not found." />
        <Button onClick={() => navigate("/chess/academy")}>
          Back to Chess Academy
        </Button>
      </div>
    );
  }

  const rounds = Array.isArray(tournament.rounds)
    ? tournament.rounds
    : [];

  return (
    <div className="chess-academy-page">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/chess/academy")}
        style={{ marginBottom: 20 }}
      >
        Back to Chess Academy
      </Button>

      {/* Tournament information */}
      <Card className="chess-tournament-card">
        <Title level={2}>
          <TrophyOutlined /> {tournament.name}
        </Title>

        <Paragraph>
          {tournament.description ||
            "Let the chess adventure begin!"}
        </Paragraph>

        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}>
            <Text type="secondary">Players</Text>
            <Title level={4}>
              {tournament.players?.length || 0} /{" "}
              {tournament.maxPlayers || 16}
            </Title>
          </Col>

          <Col xs={12} md={6}>
            <Text type="secondary">Total rounds</Text>
            <Title level={4}>
              {tournament.roundsCount || rounds.length}
            </Title>
          </Col>

          <Col xs={12} md={6}>
            <Text type="secondary">Time control</Text>
            <Title level={4}>
              {tournament.timeControlMinutes || 10} min
            </Title>
          </Col>

          <Col xs={12} md={6}>
            <Text type="secondary">Status</Text>
            <div>
              <Tag color="blue">
                {(tournament.status || "unknown").toUpperCase()}
              </Tag>
            </div>
          </Col>
        </Row>

        <Button
          icon={<ReloadOutlined />}
          loading={refreshing}
          onClick={() => loadTournament(false)}
          style={{ marginTop: 12 }}
        >
          Refresh Matches
        </Button>
      </Card>

      {/* Tournament rounds */}
      <Title level={2} style={{ marginTop: 28 }}>
        ♟️ Tournament Rounds & Matches
      </Title>

      {error && (
        <Alert
          type="warning"
          showIcon
          message="Could not refresh tournament"
          description={error}
          style={{ marginBottom: 16 }}
        />
      )}

      {rounds.length === 0 ? (
        <Card>
          <Empty
            description="No matches have been generated yet. The tournament organiser needs to generate the first round."
          />
        </Card>
      ) : (
        rounds.map((round) => (
          <Card
            key={round._id || round.roundNumber}
            title={`🏆 Round ${round.roundNumber}`}
            extra={
              <Tag
                color={
                  round.status === "completed"
                    ? "green"
                    : round.status === "published"
                    ? "blue"
                    : "orange"
                }
              >
                {(round.status || "pending").toUpperCase()}
              </Tag>
            }
            style={{ marginBottom: 20 }}
          >
            {!Array.isArray(round.pairings) ||
            round.pairings.length === 0 ? (
              <Empty description="No pairings in this round." />
            ) : (
              <Row gutter={[12, 12]}>
                {round.pairings.map((pairing, index) => {
                  const isBye = pairing.status === "bye";

                  return (
                    <Col
                      xs={24}
                      md={12}
                      xl={8}
                      key={pairing._id || index}
                    >
                      <Card
                        size="small"
                        style={{
                          height: "100%",
                          borderRadius: 16,
                          background: "#fffaf0",
                        }}
                      >
                        <Text type="secondary">
                          Match {index + 1}
                        </Text>

                        <Title level={4} style={{ marginTop: 12 }}>
                          ♔ {getPlayerName(pairing.whitePlayer)}
                        </Title>

                        <div style={{ textAlign: "center" }}>
                          <Tag color="purple">VS</Tag>
                        </div>

                        <Title level={4}>
                          ♚{" "}
                          {isBye
                            ? "BYE — Free Round"
                            : getPlayerName(pairing.blackPlayer)}
                        </Title>

                        <Paragraph>
                          <Text type="secondary">Result: </Text>

                          <Tag
                            color={
                              pairing.status === "completed" || isBye
                                ? "green"
                                : "blue"
                            }
                          >
                            {isBye
                              ? "BYE"
                              : pairing.result || "PENDING"}
                          </Tag>
                        </Paragraph>

                        {!isBye && (
                          <Button
                            block
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            disabled={
                              !["published", "completed"].includes(
                                round.status
                              )
                            }
                            onClick={() =>
                              playMatch(
                                round.roundNumber,
                                pairing._id
                              )
                            }
                          >
                            {pairing.status === "completed"
                              ? "View Match"
                              : "Play Match"}
                          </Button>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

export default ChessTournamentDetailsPage;
