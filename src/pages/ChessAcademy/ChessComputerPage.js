import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import {
  Button,
  Card,
  Col,
  Progress,
  Row,
  Select,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BulbOutlined,
  ReloadOutlined,
  UndoOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import "./ChessComputerPage.css";
import api from "../../api/axiosClient";
import { useSearchParams, useOutletContext } from "react-router-dom";

const { Title, Text } = Typography;
const FILES = "abcdefgh";

const PIECE_VALUES = {
  p: 10,
  n: 30,
  b: 32,
  r: 50,
  q: 90,
  k: 900,
};

function getKingSquares(game) {
  const board = game.board();
  const kings = {};

  for (let rank = 0; rank < board.length; rank++) {
    for (let file = 0; file < board[rank].length; file++) {
      const piece = board[rank][file];

      if (piece?.type === "k") {
        kings[piece.color] = `${FILES[file]}${8 - rank}`;
      }
    }
  }

  return kings;
}

function getComputerMove(game, difficulty) {
  const moves = game.moves({ verbose: true });

  if (!moves.length) return null;

  const scored = moves.map((move) => {
    let score = Math.random() * 5;

    if (move.captured) {
      score += PIECE_VALUES[move.captured] * 1.2;
    }

    if (move.promotion) {
      score += PIECE_VALUES[move.promotion] || 0;
    }

    if (move.san.includes("+")) score += 12;
    if (move.san.includes("#")) score += 10000;

    const file = FILES.indexOf(move.to[0]);
    const rank = Number(move.to[1]);

    if (file >= 2 && file <= 5 && rank >= 3 && rank <= 6) {
      score += 3;
    }

    return { move, score };
  });

  scored.sort((a, b) => b.score - a.score);

  if (difficulty === "hard") {
    return scored[0].move;
  }

  const count =
    difficulty === "easy"
      ? Math.max(1, Math.ceil(scored.length * 0.65))
      : Math.max(1, Math.ceil(scored.length * 0.3));

  const choices = scored.slice(0, count);
  return choices[Math.floor(Math.random() * choices.length)].move;
}

export default function ChessComputerPage({ user }) {
  const gameRef = useRef(new Chess());
  const timerRef = useRef(null);
  const gameResultHandledRef = useRef(false);

  const [savingPoints, setSavingPoints] = useState(false);
  const [fen, setFen] = useState(gameRef.current.fen());
  const [difficulty, setDifficulty] = useState("easy");
  const [thinking, setThinking] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [hintSquare, setHintSquare] = useState(null);
  const [hintTarget, setHintTarget] = useState(null);
  const [boardKey, setBoardKey] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [gamesDrawn, setGamesDrawn] = useState(0);
console.log(user)
  const outletCtx = useOutletContext?.() || {};
  const updateTodayScore =
    outletCtx?.updateTodayScore ||
    outletCtx?.fetchTodayScore ||
    (() => {});

    
  const game = gameRef.current;
  const gameOver = game.isGameOver();
  const [searchParams] = useSearchParams();

  const level = searchParams.get("level");

  const refreshBoard = useCallback(() => {
    setFen(gameRef.current.fen());
    setSelectedSquare(null);
    setHintSquare(null);
    setHintTarget(null);
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = null;
    gameResultHandledRef.current = false;
    gameRef.current = new Chess();

    setFen(gameRef.current.fen());
    setThinking(false);
    setSelectedSquare(null);
    setHintSquare(null);
    setHintTarget(null);
    setBoardKey((value) => value + 1);
  }, []);

  // Computer plays Black.
  const makeComputerMove = useCallback(() => {
    const currentGame = gameRef.current;

    if (currentGame.isGameOver() || currentGame.turn() !== "b") {
      setThinking(false);
      return;
    }

    const move = getComputerMove(currentGame, difficulty);

    if (move) {
      currentGame.move({
        from: move.from,
        to: move.to,
        promotion: "q",
      });
    }

    setThinking(false);
    refreshBoard();
  }, [difficulty, refreshBoard]);

  useEffect(() => {
    if (
      gameRef.current.isGameOver() ||
      gameRef.current.turn() !== "b"
    ) {
      return;
    }

    setThinking(true);

    timerRef.current = setTimeout(() => {
      makeComputerMove();
      timerRef.current = null;
    }, 650);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fen, makeComputerMove]);

  // Save earned points through the existing backend endpoint.
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



  // Award points only once when the game ends.
  useEffect(() => {
    const currentGame = gameRef.current;

    if (
      !currentGame.isGameOver() ||
      gameResultHandledRef.current
    ) {
      return;
    }

    gameResultHandledRef.current = true;

    if (currentGame.isCheckmate()) {
      if (currentGame.turn() === "b") {
        // Player (White) wins.
        setGamesWon((value) => value + 1);
        message.success("Amazing! You won! 🏆");
        void addPointsToBackend(10);
      } else {
        // Computer (Black) wins.
        message.info("Good game! Keep practising! ♟️");
      }
    } else if (currentGame.isDraw()) {
      setGamesDrawn((value) => value + 1);
      message.info("It's a draw! Both kings are safe! 🤝");
      void addPointsToBackend(5);
    }
  }, [fen, addPointsToBackend]);

  // Drag-and-drop support.
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }) => {
      const currentGame = gameRef.current;

      if (
        !sourceSquare ||
        !targetSquare ||
        thinking ||
        currentGame.isGameOver() ||
        currentGame.turn() !== "w"
      ) {
        return false;
      }

      try {
        const move = currentGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        if (!move) return false;

        refreshBoard();
        return true;
      } catch {
        return false;
      }
    },
    [thinking, refreshBoard]
  );

  // Tap a piece, then tap its destination.
  const handleSquareClick = useCallback(
    ({ square }) => {
      const currentGame = gameRef.current;

      if (
        thinking ||
        currentGame.isGameOver() ||
        currentGame.turn() !== "w"
      ) {
        return;
      }

      const piece = currentGame.get(square);

      if (!selectedSquare) {
        if (piece?.color === "w") {
          setSelectedSquare(square);
        }
        return;
      }

      if (piece?.color === "w") {
        setSelectedSquare(square);
        return;
      }

      try {
        const move = currentGame.move({
          from: selectedSquare,
          to: square,
          promotion: "q",
        });

        if (move) {
          refreshBoard();
        } else {
          setSelectedSquare(null);
        }
      } catch {
        setSelectedSquare(null);
      }
    },
    [selectedSquare, thinking, refreshBoard]
  );
    const undoMove = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setThinking(false);

    const currentGame = gameRef.current;

    if (!currentGame.history().length) {
      message.info("No moves to undo yet.");
      return;
    }

    currentGame.undo();

    // Undo the player's move and the computer's reply together.
    if (
      currentGame.history().length &&
      currentGame.turn() === "b"
    ) {
      currentGame.undo();
    }

    gameResultHandledRef.current = false;
    refreshBoard();
    setBoardKey((value) => value + 1);
  }, [refreshBoard]);

  const showHint = useCallback(() => {
    const currentGame = gameRef.current;

    if (
      currentGame.isGameOver() ||
      currentGame.turn() !== "w" ||
      thinking
    ) {
      return;
    }

    const move = getComputerMove(currentGame, difficulty);

    if (move) {
      setHintSquare(move.from);
      setHintTarget(move.to);
      setSelectedSquare(null);

      message.success(
        `Try ${move.from.toUpperCase()} to ${move.to.toUpperCase()}! 💡`
      );
    }
  }, [difficulty, thinking]);

  const customSquareStyles = useMemo(() => {
    const styles = {};
    const currentGame = gameRef.current;
    const moves = currentGame.history({ verbose: true });

    // Highlight the previous move.
    if (moves.length) {
      const lastMove = moves[moves.length - 1];

      styles[lastMove.from] = {
        backgroundColor: "rgba(255, 211, 91, 0.65)",
      };

      styles[lastMove.to] = {
        backgroundColor: "rgba(255, 211, 91, 0.75)",
      };
    }

    // Highlight the selected piece.
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "rgba(255, 211, 91, 0.9)",
        boxShadow: "inset 0 0 0 4px #e5a72c",
      };
    }

    // Highlight hint squares.
    if (hintSquare) {
      styles[hintSquare] = {
        backgroundColor: "rgba(74, 222, 128, 0.7)",
        boxShadow: "inset 0 0 0 3px #168044",
      };
    }

    if (hintTarget) {
      styles[hintTarget] = {
        backgroundColor: "rgba(74, 222, 128, 0.7)",
        boxShadow: "inset 0 0 0 3px #168044",
      };
    }

    const kings = getKingSquares(currentGame);

    // Losing king is red after checkmate.
    if (currentGame.isCheckmate()) {
      const losingKing = kings[currentGame.turn()];

      if (losingKing) {
        styles[losingKing] = {
          backgroundColor: "#ff414d",
          boxShadow: "inset 0 0 0 4px #b5122b",
          borderRadius: "5px",
        };
      }
    }
    // Both kings are green in a draw.
    else if (currentGame.isDraw()) {
      ["w", "b"].forEach((color) => {
        const square = kings[color];

        if (square) {
          styles[square] = {
            backgroundColor: "#55e68a",
            boxShadow: "inset 0 0 0 4px #07863c",
            borderRadius: "5px",
          };
        }
      });
    }

    return styles;
  }, [fen, selectedSquare, hintSquare, hintTarget]);

  const status = game.isCheckmate()
    ? game.turn() === "b"
      ? {
          emoji: "🏆",
          title: "You are the Chess Champion!",
          subtitle: "Checkmate! The black king is highlighted in red.",
          type: "win",
        }
      : {
          emoji: "♟️",
          title: "Checkmate!",
          subtitle: "Good game! Try again to become a champion.",
          type: "loss",
        }
    : game.isDraw()
    ? {
        emoji: "🤝",
        title: "It's a draw!",
        subtitle: "Both kings are green. Great effort from both sides!",
        type: "draw",
      }
    : game.isCheck()
    ? {
        emoji: "⚠️",
        title: "Check!",
        subtitle: "Your king is under attack. Protect it!",
        type: "check",
      }
    : {
        emoji: thinking ? "🤖" : "♟️",
        title: thinking ? "Computer is thinking..." : "Your turn!",
        subtitle: thinking
          ? "The computer is choosing its next move."
          : "Tap a piece, then tap the square where you want to move it.",
        type: "playing",
      };

  const boardOptions = {
    position: fen,
    onPieceDrop,
    onSquareClick: handleSquareClick,
    boardOrientation: "white",
    squareStyles: customSquareStyles,
    allowDragging: !thinking && !gameOver,
    animationDuration: 200,
  };

  return (
    <div className="chess-academy-page">
      <div className="chess-hero">
        <div className="chess-hero-content">
          <Tag color="purple">🌟 Chess Academy</Tag>

          <Title level={2}>
            Let's Play Chess! ♟️
          </Title>

          <Text>
            Learn, think, and become a chess champion!
          </Text>
        </div>

        <div className="chess-hero-emoji" aria-hidden="true">
          🏆
        </div>
      </div>

      <Row gutter={[16, 16]} className="chess-main-row">
        <Col xs={24} lg={16}>
          <Card className="chess-board-card">
            <div className="chess-status">
              <div className={`chess-status-icon ${status.type}`}>
                {status.emoji}
              </div>

              <div className="chess-status-text">
                <Title level={4}>{status.title}</Title>
                <Text>{status.subtitle}</Text>
              </div>
            </div>

            <div className="chess-board-wrapper">
              <Chessboard
                key={boardKey}
                options={{
                  ...boardOptions,
                  darkSquareStyle: {
                    backgroundColor: "#91445b",
                  },
                  lightSquareStyle: {
                    backgroundColor: "#f9e9d2",
                  },
                }}
              />
            </div>

            <div className="chess-controls">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={resetGame}
                className="chess-play-again"
              >
                Play Again!
              </Button>

              <Button
                icon={<UndoOutlined />}
                onClick={undoMove}
                disabled={thinking || !game.history().length}
              >
                Undo Move
              </Button>

              <Button
                icon={<BulbOutlined />}
                onClick={showHint}
                disabled={thinking || gameOver}
              >
                Hint
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="chess-side-card">
            <Title level={4}>🎯 Game Settings</Title>

            <Text>Choose your challenge level:</Text>

            <Select
              value={difficulty}
              onChange={setDifficulty}
              disabled={thinking || game.history().length > 0}
              style={{ width: "100%", marginTop: 12 }}
              options={[
                { value: "easy", label: "🐣 Easy" },
                { value: "medium", label: "🚀 Medium" },
                { value: "hard", label: "🧠 Hard" },
              ]}
            />

            <div className="chess-stats">
              <div className="chess-stat-item">
                <span>🏆</span>
                <div>
                  <Text type="secondary">Wins</Text>
                  <Title level={3}>{gamesWon}</Title>
                </div>
              </div>

              <div className="chess-stat-item">
                <span>🤝</span>
                <div>
                  <Text type="secondary">Draws</Text>
                  <Title level={3}>{gamesDrawn}</Title>
                </div>
              </div>
            </div>

            <div className="chess-points-info">
              <TrophyOutlined />
              <div>
                <Title level={5}>Earn Stars!</Title>
                <Text>Win a game and earn 10 points.</Text>
                <br />
                <Text>Draw a game and earn 5 points.</Text>
              </div>
            </div>

            <div className="chess-progress">
              <Text strong>♟️ Your challenge</Text>
              <Progress
                percent={Math.min(gamesWon * 10, 100)}
                status="active"
                strokeColor={{
                  "0%": "#8e44ad",
                  "100%": "#f39c12",
                }}
              />
              <Text type="secondary">
                Keep practising to improve your skills!
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}