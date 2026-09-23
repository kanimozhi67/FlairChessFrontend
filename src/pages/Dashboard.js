
import React, { useEffect, useState } from "react";
import { Card, Progress, message, Spin ,Button,Modal} from "antd";
import api from "../api/axiosClient";
import Signup from "./Signup";

const Dashboard = ({ userId,me,setUser }) => {
  const [todayPoints, setTodayPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [schoolLeaderboard, setSchoolLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [winner,setWinner]=useState(null)
  const [modalOpen, setModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const loadData = async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      // 1️⃣ Fetch today's points and total points
      const resPoints = await api.get("/quiz/progress/today");
      const today = resPoints.data.todayPoints ?? 0;
      const totalPoints = resPoints.data.totalPoints ?? 0;
      console.log("Total Points:",totalPoints)
      setTodayPoints(today);

      // 2️⃣ Fetch global leaderboard
      const resLeaderboard = await api.get(`/quiz/progress/leaderbd?userId=${userId}`);
    const top5 = (resLeaderboard.data.top5 || []).filter(
  (u) =>
    (u.userId || u.studentId) &&
    u.username !== "Unknown" &&
    !["Admin", "SchoolAdmin", "Teacher"].includes(u.role)
);
console.log(resLeaderboard.data.top5)
      setLeaderboard(top5);


      const winnerRes = await api.get(
  "/quiz/progress/student-of-month"
);

console.log(
  "Student of Month:",
  winnerRes.data
);

setWinner(
  winnerRes.data.winner || null
);


      // 3️⃣ Setup current user object
      const backendCurrentUser = resLeaderboard.data.currentUser;
      setCurrentUser({
        userId: backendCurrentUser?.userId || backendCurrentUser?.studentId || userId,
        username: backendCurrentUser?.username || "You",
        points: totalPoints,
        rank: backendCurrentUser?.rank || null,
      });
console.log(currentUser)
      // 4️⃣ Fetch school leaderboard (only students)
    try {
  const resSchoolLeaderboard = await api.get(
    `/quiz/progress/schoolleaderbd?userId=${userId}`
  );

  console.log("School leaderboard:", resSchoolLeaderboard.data);

  const schoolTop5 = (resSchoolLeaderboard.data.top5 || []).filter(
    (u) => u.studentId && u.username !== "Unknown"
  );

  setSchoolLeaderboard(schoolTop5);
} catch (schoolError) {
  console.error("School leaderboard error:", schoolError);

  // Don't break the entire dashboard
  setSchoolLeaderboard([]);
}

    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data");
      message.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  if (!userId || loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <p style={{ fontSize: 20, color: "red", textAlign: "center" }}>
        {error}
      </p>
    );
  }
  const now = new Date();

// Current month
// const currentMonth = now.toLocaleString("default", { month: "long" });

// Previous month
const prevDate = new Date(now.getFullYear(), now.getMonth() - 1);
const previousMonth = prevDate.toLocaleString("default", { month: "long" });



  return (
    <>
    
     <div style={{  alignItems: "center" }}>
          <div style={{ background: "linear-gradient(135deg, #FF9D2F, #FF6B6B)", 
            color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", padding: 12,
             width: "100%", borderRadius: "20px 20px 0 0", boxShadow: "0 6px 15px rgba(0,0,0,0.15)" }}>
          🛡 Student of the Month {previousMonth}✨ 
          {/* <p>🏆 {winner?.username || "Aadhira"}   ⭐ {winner?.points} Points🥇</p> */}
           <p>
    {winner ? (
      <>
        🏆 {winner.username} 
   
        ⭐ {winner.points} Points 🥇
      </>
    ) : (
      "🏆 Winner will be announced soon"
    )}
  </p>
          </div>
    
</div>
    
    
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FFEEA9, #FFC9C9)", padding: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 30, maxWidth: 1100, margin: "0 auto" }}>




        {/* ================= LEFT : TODAY'S PROGRESS ================= */}
        <div style={{ flex: "1 1 320px", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ background: "linear-gradient(135deg, #FF9D2F, #FF6B6B)", 
            color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", padding: 12,
             width: "100%", borderRadius: "20px 20px 0 0", boxShadow: "0 6px 15px rgba(0,0,0,0.15)" }}>
            🏫 Daily Progress ✨
          </div>
          <Card style={{ width: "100%", borderRadius: "0 0 20px 20px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 600 }}>⭐ Today's Points ⭐</p>


              {me=="Guest" && <h1>   <Button type="primary" onClick={() => { setIsLogin(true); setModalOpen(true); }}
                    style={{
                        backgroundColor: "#1edb37",
                        fontWeight: "bold",
                        padding: "8px 18px",
                        color: "white",
                        fontSize: 16,
                        borderRadius: 20,
                        border: "none",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.backgroundColor = "#fb8c00";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.backgroundColor = "#17d627";
                      }}
                    >Enter your name</Button>  <br></br>to see your dashboard rank</h1>}
              {console.log(currentUser.username)}
              <Progress
                type="circle"
                percent={Math.min((todayPoints / 100) * 100, 100)}
                format={() => <span style={{ fontSize: 28, fontWeight: "bold", color: "#FF6B00" }}>{todayPoints}</span>}
                width={150}
                strokeWidth={10}
                strokeColor={{ "0%": "#FF9D2F", "100%": "#FF6B6B" }}
              />
              <div style={{ marginTop: 15, fontSize: 16 }}>
                <p>Keep learning 🎒✨</p>
                <p>Total Points: {currentUser?.points ?? 0}</p>
              </div>
            </div>
          </Card>
        </div>

 {/* ================= SCHOOL LEADERBOARD ================= */}
        {schoolLeaderboard.length > 0 && (
          <div style={{ flex: "1 1 380px", maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ background: "linear-gradient(135deg, #FF9D2F, #FF6B6B)", color: "#fff", fontSize: 30, fontWeight: "bold", textAlign: "center", padding: 12, width: "100%", borderRadius: "20px 20px 0 0", boxShadow: "0 6px 15px rgba(0,0,0,0.15)" }}>
              🏫 School Leaderboard ✨
            </div>
            <Card style={{ width: "100%", borderRadius: "0 0 20px 20px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)", fontSize: 20 }}>
              {schoolLeaderboard.map((user) => {
                const isCurrent = String(user.studentId) === String(userId);
                return (
                  <div
                    key={user.studentId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      marginBottom: 8,
                      borderRadius: 10,
                      backgroundColor: isCurrent ? "#FFFAE6" : "#fff",
                      fontWeight: isCurrent ? "bold" : "normal",
                      boxShadow: isCurrent ? "0 4px 10px rgba(255,107,107,0.2)" : "none",
                    }}
                  >
                    <span>
                      {user.rank}. {user.username} ({user.rollNo} | {user.className}-{user.section})
                    </span>
                    <span>⭐ {user.points}</span>
                  </div>
                );
              })}
            </Card>
          </div>
        )}


        {/* ================= RIGHT : GLOBAL LEADERBOARD ================= */}
        <div style={{ flex: "1 1 360px", maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ background: "linear-gradient(135deg, #FF9D2F, #FF6B6B)", color: "#fff", fontSize: 30, fontWeight: "bold", textAlign: "center", padding: 12, width: "100%", borderRadius: "20px 20px 0 0", boxShadow: "0 6px 15px rgba(0,0,0,0.15)" }}>
            🏆 Global Leaderboard ✨
          </div>
          <Card style={{ width: "100%", borderRadius: "0 0 20px 20px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)", fontSize: 26 }}>
            {leaderboard.map((user) => {
              const isCurrent = String(user.userId || user.studentId) === String(userId);
              return (
                <div key={user.userId || user.studentId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", marginBottom: 8, borderRadius: 10, backgroundColor: isCurrent ? "#FFFAE6" : "#fff", fontWeight: isCurrent ? "bold" : "normal", boxShadow: isCurrent ? "0 4px 10px rgba(255,107,107,0.2)" : "none" }}>
                  <span>{user.rank}. {user.username}</span>
                  <span>⭐ {user.points}</span>
                </div>
              );
            })}

            {currentUser && !leaderboard.find((u) => String(u.userId || u.studentId) === String(userId)) && (
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, backgroundColor: "#FFFAE6", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
                <span>{currentUser.rank ?? "-"} . {currentUser.username}</span>
                <span>⭐ {currentUser.points}</span>
              </div>
            )}
          </Card>
        </div>

       
      </div>
    </div>
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
    </>
  );
};

export default Dashboard;
