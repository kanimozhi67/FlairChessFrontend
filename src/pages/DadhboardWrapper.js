import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { message } from "antd";
import Dashboard from "./Dashboard";

const DashboardWrapper = ({}) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
const [me,setMe]=useState("")
  useEffect(() => {
    const fetchUser = async () => {
        const token = localStorage.getItem("token");

    if (!token) return; // ⛔ stop auto-login
      setLoadingUser(true);
      try {
        const res = await api.get("/auth/getMe"); // fetch logged-in user
        setUser(res.data);
        console.log(res.data.username)
        setMe(res.data.username)
      } catch (err) {
        console.error("Failed to fetch user:", err);
        message.error("Failed to load user. Please login.");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  if (loadingUser) {
    return <p style={{ fontSize: 20, textAlign: "center", marginTop: 50 }}>Loading user info...</p>;
  }

  if (!user) {
    return <p style={{ fontSize: 20, textAlign: "center", marginTop: 50 }}>User not found. Please login.</p>;
  }

  return <Dashboard userId={user._id}  me={me} setUser={setUser}/>;
};

export default DashboardWrapper;
