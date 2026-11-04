import React, { useCallback, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import api from "../../api/axiosClient";
import {
  Card,
  Button,
  Typography,
  Tag,
  Progress,
  message,
  Space,
  Row,
  Col,
  Spin
} from "antd";
import {
  BulbOutlined,
  ReloadOutlined,
  TrophyOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useSearchParams, useOutletContext } from "react-router-dom";

const { Title, Text } = Typography;

const API = process.env.REACT_APP_API_URL;

export default function ChessPuzzlesPage({ user }) {
  const [puzzles, setPuzzles] = useState([]);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [game, setGame] = useState(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [playedMoves, setPlayedMoves] = useState([]);
  const [points, setPoints] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [hintVisible, setHintVisible] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(true);
    const [savingPoints, setSavingPoints] = useState(false);
      const outletCtx = useOutletContext?.() || {};
  const updateTodayScore =
    outletCtx?.updateTodayScore ||
    outletCtx?.fetchTodayScore ||
    (() => {});


  const timerRef = useRef(null);

  const puzzle = puzzles[puzzleIndex];

  // Load puzzles
  useEffect(() => {
    loadPuzzles();

    return () => clearTimeout(timerRef.current);
  }, []);

  const loadPuzzles = async () => {
    try {
      const token = localStorage.getItem("token");

      const response =  await api.get("/chess/puzzles/",
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
        }
      );

      const data = response.data || [];

      setPuzzles(data);

      const done = data
        .filter(p => p.completed)
        .map(p => String(p._id));

      setCompleted(done);

      const first = data.findIndex(p => !p.completed);

      setPuzzleIndex(first === -1 ? 0 : first);

      if (first !== -1) {
        setGame(new Chess(data[first].fen));
      } else if (data.length) {
        setGame(new Chess(data[0].fen));
      }
    } catch (error) {
      message.error("Unable to load chess puzzles");
    } finally {
      setLoading(false);
    }
  };

  // Reset board when puzzle changes
  useEffect(() => {
    if (!puzzle) return;

    setGame(new Chess(puzzle.fen));
    setMoveIndex(0);
    setPlayedMoves([]);
    setHintVisible(false);
    setThinking(false);
    setSolved(completed.includes(String(puzzle._id)));

    clearTimeout(timerRef.current);
  }, [puzzleIndex, puzzles]);

useEffect(() => {
  if (puzzle && game) {
    console.log("Puzzle:", puzzle.title);
    console.log("Expected FEN:", puzzle.fen);
    console.log("Actual FEN:", game.fen());
  }
}, [puzzle, game]);

  const completePuzzle = async (allMoves) => {
    try {
      const token = localStorage.getItem("token");

      const response =await api.post(
        `/chess/puzzles/${puzzle._id}/complete`,
        { moves: allMoves },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
        }
      );

      setSolved(true);

      if (response.data.awarded) {
        setPoints(prev => prev + response.data.points);
        message.success(
          `Amazing! You earned ${response.data.points} points! 🏆`
        );
        addPointsToBackend(response.data.points);
      } else {
        message.success("Puzzle solved! 🎉");
      }

      setCompleted(prev => [
        ...new Set([...prev, String(puzzle._id)])
      ]);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
        "Could not save puzzle progress"
      );
    }
  };

  // Automatically play computer's response
  const playComputerMove = (moves, nextIndex, board) => {
    const computerMove = puzzle.solution[nextIndex];

    if (!computerMove) return;

    timerRef.current = setTimeout(() => {
      try {
        const nextGame = new Chess(board.fen());

        const move = nextGame.move({
          from: computerMove.slice(0, 2),
          to: computerMove.slice(2, 4),
          promotion: computerMove[4] || "q"
        });

        if (!move) {
          message.error("Invalid computer reply in puzzle data");
          setThinking(false);
          return;
        }

        setGame(nextGame);
        setMoveIndex(nextIndex + 1);
        setThinking(false);
      } catch (error) {
        message.error("Unable to play computer move");
        setThinking(false);
      }
    }, 650);
  };

  // Student move
  const handlePieceDrop = (sourceSquare, targetSquare) => {
    if (
      !game ||
      !targetSquare ||
      thinking ||
      solved ||
      !puzzle
    ) {
      return false;
    }

    const nextGame = new Chess(game.fen());

    let move;

    try {
      move = nextGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q"
      });
    } catch {
      return false;
    }

    if (!move) return false;

    const uci =
      move.from + move.to + (move.promotion || "");

    const expected = puzzle.solution[moveIndex];

    if (uci !== expected) {
      message.warning("Not the best move! Try again. 💡");
      return false;
    }

    const allMoves = [...playedMoves, uci];

    setPlayedMoves(allMoves);
    setGame(nextGame);

    const nextIndex = moveIndex + 1;

    // All moves completed
    if (nextIndex >= puzzle.solution.length) {
      completePuzzle(allMoves);
      return true;
    }

    // Computer's automatic reply
    setThinking(true);

    playComputerMove(
      allMoves,
      nextIndex,
      nextGame
    );

    return true;
  };


 const addPointsToBackend = useCallback(
    async (points = 0) => {
      const userId = user?._id || user?.id;
console.log(user )
      if (!userId) {
        console.error(
          "Cannot save chess points: user ID is missing.",
          user
        );
        message.error("Please log in again to save your points.");
        return false;
      }

      if (!Number.isFinite(points) || points <= 0) {
        return false;
      }

      setSavingPoints(true);

      try {
        const response = await api.post(
          "/quiz/progress/addpoints",
          {
            studentId: userId,
            points,
          }
        );

        console.log("Chess points saved:", response?.data);

        try {
          await updateTodayScore();
        } catch (refreshError) {
          console.error(
            "Could not refresh today's score:",
            refreshError
          );
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("scoreUpdated"));
        }

        message.success(`⭐ You earned ${points} points!`);
        return true;
      } catch (error) {
        console.error(
          "addPointsToBackend error:",
          error?.response?.status,
          error?.response?.data || error?.message
        );

        message.error(
          error?.response?.data?.message ||
            "Failed to save points. Please try again."
        );

        return false;
      } finally {
        setSavingPoints(false);
      }
    },
    [user, updateTodayScore]
  );

  const restartPuzzle = () => {
    clearTimeout(timerRef.current);

    setGame(new Chess(puzzle.fen));
    setMoveIndex(0);
    setPlayedMoves([]);
    setThinking(false);
    setSolved(false);
    setHintVisible(false);
  };

  const nextPuzzle = () => {
    clearTimeout(timerRef.current);

    const next = puzzles.findIndex(
      (p, i) =>
        i > puzzleIndex &&
        !completed.includes(String(p._id))
    );

    if (next !== -1) {
      setPuzzleIndex(next);
    } else {
      const firstUnsolved = puzzles.findIndex(
        p => !completed.includes(String(p._id))
      );

      if (firstUnsolved !== -1) {
        setPuzzleIndex(firstUnsolved);
      } else {
        message.success("You completed all the puzzles! 🏆");
      }
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!puzzles.length) {
    return (
      <Card style={{ textAlign: "center", borderRadius: 20 }}>
        <Title level={3}>🧠 Brain Power</Title>
        <Text>No puzzles available yet. Check back soon!</Text>
      </Card>
    );
  }

  if (!game || !puzzle) return null;

  const percentage =
    puzzles.length
      ? Math.round(completed.length / puzzles.length * 100)
      : 0;

  return (
    <div style={{
      minHeight: "100vh",
      padding: 20,
      background: "linear-gradient(135deg,#FFF0F8,#E8F4FF)"
    }}>

      <div style={{ maxWidth: 1050, margin: "auto" }}>

        {/* Header */}
        <Card
          bordered={false}
          style={{
            borderRadius: 24,
            marginBottom: 20,
            background: "linear-gradient(120deg,#6639CF,#A855F7)",
            color: "white"
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ color: "white", margin: 0 }}>
                🧠 BRAIN POWER
              </Title>
              <Text style={{ color: "#F2E8FF" }}>
                Think smart. Play clever. Become a champion!
              </Text>
            </Col>

            <Col>
              <Title level={3} style={{ color: "#FFE66D" }}>
                🏆 {points}
              </Title>
              <Text style={{ color: "white" }}>Points earned</Text>
            </Col>
          </Row>
        </Card>

        {/* Progress */}
        <Card
          bordered={false}
          style={{ borderRadius: 20, marginBottom: 20 }}
        >
          <Row justify="space-between">
            <Text strong>My puzzle progress</Text>
            <Text strong>{completed.length}/{puzzles.length}</Text>
          </Row>

          <Progress
            percent={percentage}
            strokeColor="#8B5CF6"
            status="active"
          />
        </Card>

        <Row gutter={[20, 20]}>
          {/* Chessboard */}
          <Col xs={24} md={14}>
            <Card
              bordered={false}
              style={{ borderRadius: 24 }}
            >
              <Space wrap>
                <Tag color="purple">{puzzle.difficulty}</Tag>
                <Tag color="blue">{puzzle.category}</Tag>
                <Tag color="gold">⭐ {puzzle.points} points</Tag>
              </Space>

              <Title level={3}>{puzzle.title}</Title>

              <Text type="secondary">
                Find the best move for {game.turn() === "w"
                  ? "White"
                  : "Black"}.
              </Text>

              <div style={{
                maxWidth: 520,
                margin: "20px auto"
              }}>
               <Chessboard
  options={{
    position: game.fen(),
    boardOrientation: "white",
    animationDuration: 250,
    allowDragging: !thinking && !solved,

    onPieceDrop: ({
      sourceSquare,
      targetSquare
    }) => {
      return handlePieceDrop(sourceSquare, targetSquare);
    },

    boardStyle: {
      borderRadius: "12px",
      overflow: "hidden"
    }
  }}
/>
              </div>

              {thinking && (
                <Text strong style={{ color: "#8B5CF6" }}>
                  🤖 Opponent is thinking...
                </Text>
              )}

              {solved && (
                <Card
                  style={{
                    background: "#E9FFF1",
                    border: "1px solid #86E6A8",
                    borderRadius: 15,
                    textAlign: "center"
                  }}
                >
                  <Title level={3} style={{ color: "#159447" }}>
                    🎉 Brilliant! Puzzle solved!
                  </Title>
                  <Text>Great thinking, Chess Champion!</Text>
                </Card>
              )}

              <Space wrap style={{ marginTop: 20 }}>
                <Button
                  icon={<BulbOutlined />}
                  onClick={() => setHintVisible(true)}
                  disabled={solved}
                >
                  Show Hint
                </Button>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={restartPuzzle}
                  disabled={thinking}
                >
                  Restart
                </Button>

                <Button
                  type="primary"
                  icon={<RightOutlined />}
                  disabled={!solved}
                  onClick={nextPuzzle}
                >
                  Next Puzzle
                </Button>
              </Space>

              {hintVisible && (
                <Card
                  style={{
                    marginTop: 15,
                    background: "#FFF5D6",
                    borderRadius: 15
                  }}
                >
                  💡 **Hint:** {puzzle.hint || "Look carefully at your opponent's pieces!"}
                </Card>
              )}
            </Card>
          </Col>

          {/* Right panel */}
          <Col xs={24} md={10}>
            <Card
              bordered={false}
              style={{ borderRadius: 24 }}
            >
              <Title level={4}>🌟 Your Mission</Title>

              <Text>
                Find the winning move. Your opponent will automatically
                respond after every correct move.
              </Text>

              <Progress
                type="circle"
                percent={
                  Math.round(
                    Math.min(
                      playedMoves.length / puzzle.solution.length,
                      1
                    ) * 100
                  )
                }
                strokeColor="#A855F7"
                style={{
                  display: "block",
                  margin: "25px auto"
                }}
              />

              <Title level={5}>🏅 Rewards</Title>

              <Text>⭐ Correct solution: {puzzle.points} points</Text>
              <br />
              <Text>🧠 Complete more puzzles to improve your skills.</Text>

              <div style={{
                marginTop: 25,
                padding: 15,
                borderRadius: 15,
                background: "#F5EEFF"
              }}>
                <Title level={5}>💜 Chess Champion Tip</Title>
                <Text>
                  Before moving, look for checks, captures and attacks.
                  Think one move ahead!
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}