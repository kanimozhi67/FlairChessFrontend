
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { io } from "socket.io-client";
import {
  Alert,
  Button,
  Card,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axiosClient";
import "./ChessTournamentMatch.css";

const { Title, Text } = Typography;

const S_API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// Socket.IO connects to the backend root, not the REST "/api" path.
const SOCKET_URL = S_API_URL.replace(/\/api$/, "");

const SOCKET_PATH = "/socket.io";

function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}
function formatTime(milliseconds) {
  const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}
export default function ChessTournamentMatch({ user }) {
  const { tournamentId } = useParams();
  const [searchParams] = useSearchParams();

  const roundNumber = Number(searchParams.get("round"));
  const pairingId = searchParams.get("pairingId");

  const socketRef = useRef(null);
  const gameRef = useRef(new Chess());

  const [fen, setFen] = useState(gameRef.current.fen());
  const [color, setColor] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [waitingForMove, setWaitingForMove] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [result, setResult] = useState("pending");
  const [opponentConnected, setOpponentConnected] = useState(false);
const [opponentName, setOpponentName] = useState(" ...");

const INITIAL_TIME = 5 * 60 * 1000; // 5 minutes per player

const [clocks, setClocks] = useState({
  w: INITIAL_TIME,
  b: INITIAL_TIME,
});

const [activeClock, setActiveClock] = useState(null);

  const playerId = user?._id || user?.id;

  const applyState = useCallback((state) => {
    if (!state?.fen) return;

    try {
      gameRef.current = new Chess(state.fen);
      setFen(state.fen);
      setGameStatus(state.status || "active");
      setResult(state.result || "pending");
      setSelectedSquare(null);
if (state.opponentName) {
  setOpponentName(state.opponentName);
}
      if (
  Number.isFinite(state.whiteTimeMs) &&
  Number.isFinite(state.blackTimeMs)
) {
  setClocks({
    w: Math.max(0, state.whiteTimeMs),
    b: Math.max(0, state.blackTimeMs),
  });
}

setActiveClock(
  state.status === "completed"
    ? null
    : state.activeClock || new Chess(state.fen).turn()
);
console.log("Chess timer state:", {
  status: state.status,
  activeClock: state.activeClock,
  whiteTimeMs: state.whiteTimeMs,
  blackTimeMs: state.blackTimeMs,
  turn: new Chess(state.fen).turn(),
});
    } catch (error) {
      console.error("Invalid chess state:", error);
      message.error("Could not load the match position.");
    }
  }, []);

  useEffect(() => {
    if (!tournamentId || !pairingId || !roundNumber) {
      setLoading(false);
      return;
    }

const socket = io(SOCKET_URL, {
  path: SOCKET_PATH,
  transports: ["websocket"],
  withCredentials: true,
  auth: {
    token: getAuthToken(),
  },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
});
    socketRef.current = socket;

   
socket.on("connect", () => {
  console.info("[Chess Socket] Connected:", socket.id);
  setConnected(true);

  socket.emit(
    "tournament:join-match",
    { tournamentId, roundNumber, pairingId },
    (response) => {
      setLoading(false);

      if (!response?.ok) {
        console.error("[Chess Socket] Join rejected:", response?.message);
        message.error(response?.message || "Unable to join match.");
        return;
      }

      setColor(response.color);
      setOpponentConnected(false);
      applyState(response.state);
    }
  );
});

socket.on("disconnect", (reason) => {
  console.warn("[Chess Socket] Disconnected:", reason);
  setConnected(false);
  setOpponentConnected(false);
});

socket.on("connect_error", (error) => {
  setLoading(false);
  setConnected(false);
  console.error("[Chess Socket] Connection failed:", {
    message: error.message,
    description: error.description,
    context: error.context,
  });
});
   
    socket.on("tournament:state", (state) => {
      applyState(state);
      setLastMove(state.lastMove || null);
      setWaitingForMove(false);
    });

    socket.on("tournament:finished", ({ message: resultMessage }) => {
      setWaitingForMove(false);
      message.success(resultMessage || "Match finished!");
    });

    socket.on("tournament:opponent-connected", () => {
      setOpponentConnected(true);
    });

    socket.on("tournament:opponent-disconnected", () => {
      setOpponentConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    tournamentId,
    roundNumber,
    pairingId,
    applyState,
  ]);

  const makeMove = useCallback(
    (from, to) => {
      if (
        !connected ||
        !color ||
        waitingForMove ||
        gameStatus === "completed"
      ) {
        return false;
      }

      if (gameRef.current.turn() !== color) {
        message.info("Please wait for your turn! ♟️");
        return false;
      }

      const piece = gameRef.current.get(from);

      if (!piece || piece.color !== color) {
        return false;
      }

      const socket = socketRef.current;

      if (!socket) return false;

      setWaitingForMove(true);

      socket.emit(
        "tournament:make-move",
        { from, to, promotion: "q" },
        (response) => {
          setWaitingForMove(false);

          if (!response?.ok) {
            message.warning(response?.message || "Move not accepted.");
            return;
          }

          applyState(response.state);
        }
      );

      return true;
    },
    [connected, color, waitingForMove, gameStatus, applyState]
  );
const clockTickRef = useRef(Date.now());

useEffect(() => {
  if (!activeClock || gameStatus !== "active") {
    return;
  }

  clockTickRef.current = Date.now();

  const timer = setInterval(() => {
    const now = Date.now();
    const elapsed = now - clockTickRef.current;

    clockTickRef.current = now;

    setClocks((previous) => ({
      ...previous,
      [activeClock]: Math.max(
        0,
        previous[activeClock] - elapsed
      ),
    }));
  }, 100);

  return () => clearInterval(timer);
}, [activeClock, gameStatus]);

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }) => {
      if (!sourceSquare || !targetSquare) return false;

      // The server remains authoritative; it validates every move.
      makeMove(sourceSquare, targetSquare);

      // Do not optimistically alter the board before server approval.
      return false;
    },
    [makeMove]
  );

  const onSquareClick = useCallback(
    ({ square }) => {
      if (!color || waitingForMove || gameStatus === "completed") return;

      const piece = gameRef.current.get(square);

      if (!selectedSquare) {
        if (piece?.color === color && gameRef.current.turn() === color) {
          setSelectedSquare(square);
        }
        return;
      }

      if (piece?.color === color) {
        setSelectedSquare(square);
        return;
      }

      const from = selectedSquare;
      setSelectedSquare(null);
      makeMove(from, square);
    },
    [color, waitingForMove, gameStatus, selectedSquare, makeMove]
  );

const boardStyles = {};

// Highlight the selected square.
if (selectedSquare) {
  boardStyles[selectedSquare] = {
    backgroundColor: "rgba(255, 211, 91, 0.85)",
    boxShadow: "inset 0 0 0 4px #e5a72c",
  };
}

// Highlight the last move.
if (lastMove?.from && lastMove?.to) {
  boardStyles[lastMove.from] = {
    backgroundColor: "rgba(255, 211, 91, 0.55)",
  };

  boardStyles[lastMove.to] = {
    backgroundColor: "rgba(255, 211, 91, 0.75)",
  };
}

// Find the current squares occupied by both kings.
let whiteKingSquare = null;
let blackKingSquare = null;

const boardPosition = gameRef.current.board();
const files = "abcdefgh";

boardPosition.forEach((row, rowIndex) => {
  row.forEach((piece, colIndex) => {
    if (piece?.type !== "k") return;

    const square = `${files[colIndex]}${8 - rowIndex}`;

    if (piece.color === "w") {
      whiteKingSquare = square;
    } else if (piece.color === "b") {
      blackKingSquare = square;
    }
  });
});

// Draw: highlight both kings in green.
if (gameStatus === "completed" && result === "1/2-1/2") {
  if (whiteKingSquare) {
    boardStyles[whiteKingSquare] = {
      backgroundColor: "#86EFAC",
      boxShadow: "inset 0 0 0 4px #16A34A",
    };
  }

  if (blackKingSquare) {
    boardStyles[blackKingSquare] = {
      backgroundColor: "#86EFAC",
      boxShadow: "inset 0 0 0 4px #16A34A",
    };
  }
}

// White wins: losing black king becomes red.
else if (gameStatus === "completed" && result === "1-0") {
  if (blackKingSquare) {
    boardStyles[blackKingSquare] = {
      backgroundColor: "#FCA5A5",
      boxShadow: "inset 0 0 0 4px #DC2626",
    };
  }
}

// Black wins: losing white king becomes red.
else if (gameStatus === "completed" && result === "0-1") {
  if (whiteKingSquare) {
    boardStyles[whiteKingSquare] = {
      backgroundColor: "#FCA5A5",
      boxShadow: "inset 0 0 0 4px #DC2626",
    };
  }
}

// While the game is active, highlight the checked king in light orange.
else if (gameStatus !== "completed" && gameRef.current.isCheck()) {
  const checkedKingSquare =
    gameRef.current.turn() === "w"
      ? whiteKingSquare
      : blackKingSquare;

  if (checkedKingSquare) {
    boardStyles[checkedKingSquare] = {
      backgroundColor: "#FED7AA",
      boxShadow: "inset 0 0 0 4px #F97316",
    };
  }
}


  if (!tournamentId || !pairingId || !roundNumber) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Match details are missing."
        description="Open your assigned match from the tournament page."
      />
    );
  }

  if (loading) {
    return (
      <div className="tournament-match-loading">
        <Spin size="large" />
        <Title level={4}>Preparing your chess match… ♟️</Title>
      </div>
    );
  }

  const myTurn =
    color && gameRef.current.turn() === color && gameStatus !== "completed";

  return (
    <div className="tournament-match-page">
      <div className="tournament-match-hero">
        <div>
          <Tag color="gold">🏆 Flair Chess Tournament</Tag>
          <Title level={2}>Your Big Match! ♟️</Title>
          <Text>Think carefully, play fairly and have fun.</Text>
        </div>
        <div className="tournament-match-trophy">🏆</div>
      </div>

      <Card className="tournament-match-card">
        <div className="tournament-match-info">
          <div className="tournament-match-player">
            <span className="tournament-player-avatar">
              {color === "w" ? "👑" : "♟️"}
            </span>
            <div>
              <Text strong>{user?.username || "You"}</Text>
              <div>
                <Tag color={color === "w" ? "default" : "purple"}>
                  {color === "w" ? "White pieces" : "Black pieces"}
                </Tag>
              </div>
            </div>
          </div>

          <div className="tournament-match-player">
            <span className="tournament-player-avatar">🤝</span>
            <div>
              <Text strong>Opponent</Text>
               <strong className="chess-player-name">
      {opponentName}
    </strong>
              <div>
                <Tag color={opponentConnected ? "success" : "default"}>
                  {opponentConnected ? "Connected" : "Waiting"}
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {!connected && (
          <Alert
            type="warning"
            showIcon
            message="Reconnecting to the match…"
            className="tournament-match-alert"
          />
        )}

        {gameStatus === "completed" ? (
          <Alert
            type="success"
            showIcon
            message={
              result === "1-0"
                ? "White wins! 🏆"
                : result === "0-1"
                ? "Black wins! 🏆"
                : "It's a draw! 🤝"
            }
            description="The match has ended."
          />
        ) : (
          <Alert
            type={myTurn ? "success" : "info"}
            showIcon
            message={
              waitingForMove
                ? "Sending your move…"
                : myTurn
                ? "Your turn! Make your move."
                : "Waiting for your opponent…"
            }
            className="tournament-match-alert"
          />
        )}
<div className="chess-match-layout">
  {/* Chessboard on the left */}
  <div className="tournament-match-board">
    <Chessboard
      options={{
        position: fen,
        boardOrientation: color === "b" ? "black" : "white",
        onPieceDrop,
        onSquareClick,
        squareStyles: boardStyles,
        allowDragging:
          connected &&
          !waitingForMove &&
          gameStatus !== "completed" &&
          !!myTurn,
        darkSquareStyle: { backgroundColor: "#91445b" },
        lightSquareStyle: { backgroundColor: "#f9e9d2" },
        animationDuration: 200,
      }}
    />
  </div>

  {/* Timers on the right */}
  <div className="chess-clock-panel">
    <div
      className={`chess-clock-card ${
        activeClock === (color === "w" ? "b" : "w")
          ? "clock-active"
          : ""
      }`}
    >
      <div className="chess-clock-avatar">🤝</div>

      <Text strong>Opponent</Text>
       <strong className="chess-player-name">
      {opponentName}
    </strong>

      <Text type="secondary">
        {color === "w" ? "Black pieces" : "White pieces"}
      </Text>

      <div
        className={`chess-clock-time ${
          clocks[color === "w" ? "b" : "w"] <= 30000
            ? "clock-low"
            : ""
        }`}
      >
        {formatTime(clocks[color === "w" ? "b" : "w"])}
      </div>

      {activeClock === (color === "w" ? "b" : "w") && (
        <Tag color="success">⏱️ Playing</Tag>
      )}
    </div>

    <div
      className={`chess-clock-card ${
        activeClock === color ? "clock-active" : ""
      }`}
    >
      <div className="chess-clock-avatar">👑</div>

      <Text strong>{user?.username || "You"}</Text>

      <Text type="secondary">
        {color === "w" ? "White pieces" : "Black pieces"}
      </Text>

      <div
        className={`chess-clock-time ${
          clocks[color] <= 30000 ? "clock-low" : ""
        }`}
      >
        {formatTime(clocks[color])}
      </div>

      {activeClock === color && (
        <Tag color="success">⏱️ Your turn</Tag>
      )}
    </div>
  </div>
</div>
        <div className="tournament-match-footer">
          <Text type="secondary">
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </Text>
          <Button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              message.success("Match link copied!");
            }}
          >
            🔗 Copy Match Link
          </Button>
        </div>
      </Card>
    </div>
  );
}
