
import React, { useEffect, useState } from "react";
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
  const [error, setError] = useState("");

  const loadTournament = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/chess/tournaments/${tournamentId}`
      );

      setTournament(response.data);
    } catch (err) {
      console.error("Failed to load tournament:", err);
      setError(
        err?.response?.data?.message ||
          "Could not load tournament details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  const getPlayerName = (playerId) => {
    if (!playerId) return "Not assigned";

    const player = tournament?.players?.find(
      (p) => String(p._id) === String(playerId?._id || playerId)
    );

    return player?.displayName || "Unknown player";
  };

  const playMatch = (roundNumber, pairingId) => {
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

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Button onClick={loadTournament}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (!tournament) return null;

  const rounds = tournament.rounds || [];

  return (
    <div className="chess-academy-page">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/chess/academy")}
        style={{ marginBottom: 20 }}
      >
        Back to Chess Academy
      </Button>

      <Card className="chess-tournament-card">
        <Title level={2}>
          <TrophyOutlined /> {tournament.name}
        </Title>

        <Paragraph>
          {tournament.description || "Let the chess adventure begin!"}
        </Paragraph>

        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}>
            <Text type="secondary">Players</Text>
            <Title level={4}>
              {tournament.players?.length || 0} / {tournament.maxPlayers}
            </Title>
          </Col>

          <Col xs={12} md={6}>
            <Text type="secondary">Total rounds</Text>
            <Title level={4}>{tournament.roundsCount}</Title>
          </Col>

          <Col xs={12} md={6}>
            <Text type="secondary">Time control</Text>
            <Title level={4}>
              {tournament.timeControlMinutes} min
            </Title>
          </Col>

          <Col xs={12} md={6}>
            <Text type="secondary">Status</Text>
            <div>
              <Tag color="blue">
                {tournament.status?.toUpperCase()}
              </Tag>
            </div>
          </Col>
        </Row>

        <Button
          icon={<ReloadOutlined />}
          onClick={loadTournament}
          style={{ marginTop: 12 }}
        >
          Refresh Matches
        </Button>
      </Card>

      <Title level={2} style={{ marginTop: 28 }}>
        ♟️ Tournament Rounds & Matches
      </Title>

      {rounds.length === 0 ? (
        <Card>
          <Empty description="No matches have been generated yet. The tournament organiser needs to generate the first round." />
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
                {round.status?.toUpperCase()}
              </Tag>
            }
            style={{ marginBottom: 20 }}
          >
            {(round.pairings || []).length === 0 ? (
              <Empty description="No pairings in this round." />
            ) : (
              <Row gutter={[12, 12]}>
                {round.pairings.map((pairing, index) => {
                  const isBye = pairing.status === "bye";

                  return (
                    <Col xs={24} md={12} xl={8} key={pairing._id || index}>
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
                          ♚ {isBye
                            ? "BYE — Free Round"
                            : getPlayerName(pairing.blackPlayer)}
                        </Title>

                        <Paragraph>
                          <Text type="secondary">Result: </Text>
                          <Tag
                            color={
                              pairing.status === "completed" ||
                              isBye
                                ? "green"
                                : "blue"
                            }
                          >
                            {isBye
                              ? "BYE"
                              : pairing.result || "pending"}
                          </Tag>
                        </Paragraph>

                        {!isBye && (
                          <Button
                            block
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            disabled={round.status !== "published"}
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
