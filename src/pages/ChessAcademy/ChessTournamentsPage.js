import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert, Button, Card, Col, Empty, Form, Input, InputNumber, message,
  Modal, Row, Select, Space, Spin, Statistic, Table, Tag, Typography,
} from "antd";
import {
  PlusOutlined, ReloadOutlined, TrophyOutlined, TeamOutlined,
  ThunderboltOutlined, CalendarOutlined,
} from "@ant-design/icons";
import api from "../../api/axiosClient";
import "./chessAcademy.css";

const { Title, Text, Paragraph } = Typography;

const statusColor = {
  registration: "blue",
  "in-progress": "green",
  completed: "purple",
  cancelled: "default",
};

export default function ChessTournamentsPage({user}) {
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const selected = useMemo(
    () => tournaments.find((t) => t._id === selectedId) || null,
    [tournaments, selectedId]
  );

  const load = useCallback(async (preferredId) => {
    setLoading(true);
    try {
      const { data } = await api.get("/chess/tournaments/");
      const list = Array.isArray(data) ? data : [];
      setTournaments(list);
      const nextId = preferredId || selectedId;
      setSelectedId(list.some((t) => t._id === nextId) ? nextId : list[0]?._id || null);
    } catch (error) {
      message.error(error?.response?.data?.message || "Unable to load tournaments.");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { load(); }, []); // initial load only



useEffect(() => {
  let cancelled = false;

  const refreshTournamentData = async () => {
    try {
      const { data } = await api.get("/chess/tournaments/");
      if (cancelled) return;

      const list = Array.isArray(data) ? data : [];

      setTournaments(list);

      setSelectedId((currentId) =>
        list.some((t) => t._id === currentId)
          ? currentId
          : list[0]?._id || null
      );
    } catch (error) {
      console.error("Automatic tournament refresh failed:", error);
    }
  };

  const intervalId = setInterval(refreshTournamentData, 5000);

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
}, []);


  const createTournament = async (values) => {
    setSaving(true);
    try {
      console.log(user.role)
      const { data } = await api.post("/chess/tournaments/", values);
      message.success("Tournament created!");
      setCreateOpen(false);
      form.resetFields();
      await load(data._id);
    } catch (error) {
      message.error(error?.response?.data?.message || "Could not create tournament.");
    } finally {
      setSaving(false);
    }
  };

  const joinTournament = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/chess/tournaments/${selected._id}/join`);
      message.success("You're registered!");
      await load(data._id);
    } catch (error) {
      message.error(error?.response?.data?.message || "Could not register.");
    } finally {
      setSaving(false);
    }
  };

  const generatePairings = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.post(`/chess/tournaments/${selected._id}/rounds/generate`);
      message.success("Pairings generated as a draft. Review and publish them.");
      await load(selected._id);
    } catch (error) {
      message.error(error?.response?.data?.message || "Could not generate pairings.");
    } finally {
      setSaving(false);
    }
  };

  const publishRound = async (roundNumber) => {
    setSaving(true);
    try {
      await api.post(`/chess/tournaments/${selected._id}/rounds/${roundNumber}/publish`);
      message.success(`Round ${roundNumber} published.`);
      await load(selected._id);
    } catch (error) {
      message.error(error?.response?.data?.message || "Could not publish round.");
    } finally {
      setSaving(false);
    }
  };

  const recordResult = async (roundNumber, pairingId, result) => {
    setSaving(true);
    try {
      await api.post(
        `/chess/tournaments/${selected._id}/rounds/${roundNumber}/pairings/${pairingId}/result`,
        { result }
      );
      message.success("Result recorded.");
      await load(selected._id);
    } catch (error) {
      message.error(error?.response?.data?.message || "Could not record result.");
    } finally {
      setSaving(false);
    }
  };

  const playerName = (id) => {
    if (!id) return "BYE";
    const player = selected?.players?.find((p) => String(p._id) === String(id));
    return player?.displayName || "Player";
  };

  const standings = useMemo(() => {
    if (!selected) return [];
    return [...(selected.players || [])]
      .filter((p) => !p.withdrawn)
      .sort((a, b) => b.score - a.score || b.rating - a.rating || a.displayName.localeCompare(b.displayName))
      .map((p, index) => ({ ...p, rank: index + 1, key: p._id }));
  }, [selected]);

  const pairingColumns = (round) => [
    { title: "Board", dataIndex: "boardNumber", width: 75 },
    {
      title: "White",
      render: (_, p) => <Text strong>{playerName(p.whitePlayer)}</Text>,
    },
    {
      title: "Black",
      render: (_, p) => p.blackPlayer ? playerName(p.blackPlayer) : <Tag color="gold">BYE</Tag>,
    },
   
{
  title: "Result",
  render: (_, pairing) => {
    if (
      pairing.status === "bye" ||
      pairing.result === "bye"
    ) {
      return <Tag color="green">BYE · +1 point</Tag>;
    }

    if (pairing.status === "completed") {
      return (
        <Tag color="success">
          {pairing.result}
        </Tag>
      );
    }

    return (
      <Tag color="processing">
        {pairing.status === "in-progress"
          ? "Match in progress"
          : "Ready to play"}
      </Tag>
    );
  },
}

  ];

  return (
    <div className="chess-academy-page">
      <div className="chess-hero">
        <div>
          <Text className="chess-eyebrow">FLAIR OLYMPIAD • STRATEGY ARENA</Text>
          <Title level={1}>♟️ Chess Academy</Title>
          <Paragraph>Think smart. Play fair. Shine at every tournament!</Paragraph>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Create tournament
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => load()} loading={loading}>
              Refresh
            </Button>
          </Space>
        </div>
        <div className="chess-hero-badge">🏆</div>
      </div>

      <Row gutter={[16, 16]} className="chess-stats">
        <Col xs={12} md={8}><Card><Statistic title="Tournaments" value={tournaments.length} prefix={<TrophyOutlined />} /></Card></Col>
        <Col xs={12} md={8}><Card><Statistic title="Registered players" value={selected?.players?.length || 0} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Rounds planned" value={selected?.roundsCount || 0} prefix={<CalendarOutlined />} /></Card></Col>
      </Row>

      {loading ? <div className="chess-loading"><Spin size="large" /></div> : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card title="Tournament hall" className="chess-panel">
              {tournaments.length === 0 ? <Empty description="No tournaments yet. Create the first one!" /> : (
                <div className="chess-tournament-list">
                  {tournaments.map((t) => (
                    <button
                      type="button"
                      key={t._id}
                      className={`chess-tournament-item ${selectedId === t._id ? "active" : ""}`}
                      onClick={() => setSelectedId(t._id)}
                    >
                      <span className="chess-item-icon">♟</span>
                      <span className="chess-item-copy">
                        <strong>{t.name}</strong>
                        <small>{t.players?.length || 0} players · {t.rounds?.length || 0}/{t.roundsCount} rounds</small>
                      </span>
                      <Tag color={statusColor[t.status]}>{t.status}</Tag>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            {!selected ? <Card><Empty description="Choose a tournament to view details." /></Card> : (
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Card className="chess-panel">
                  <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                    <div>
                      <Title level={3}>{selected.name}</Title>
                      <Paragraph>{selected.description || "A friendly Flair chess competition."}</Paragraph>
                      <Space wrap>
                        <Tag color={statusColor[selected.status]}>{selected.status}</Tag>
                        <Tag>{selected.timeControlMinutes} min per player</Tag>
                        <Tag>{selected.roundsCount} rounds</Tag>
                      </Space>
                    </div>
                    {selected.status === "registration" && (
                      <Button type="primary" onClick={joinTournament} loading={saving}>Join tournament</Button>
                    )}
                  </Space>
                  {selected.status === "registration" && (
                    <Alert style={{ marginTop: 16 }} type="info" showIcon message="Registration is open" description="Once players have joined, an organiser can generate the first round." />
                  )}
                
                  {selected.status === "registration" && (
                    <Space wrap style={{ marginTop: 16 }}>
                      <Button type="primary" ghost icon={<ThunderboltOutlined />} onClick={generatePairings} loading={saving}>Generate Round 1</Button>
                    </Space>
                  )}
                </Card>

                {(selected.rounds || []).map((round) => (
                  <Card
                    key={round.roundNumber}
                    className="chess-panel"
                    title={`Round ${round.roundNumber}`}
                   extra={
  <Tag
    color={
      round.status === "completed"
        ? "success"
        : "processing"
    }
  >
    {round.status === "published"
      ? "Round active"
      : round.status}
  </Tag>
}
                  >
                    <Table
                      rowKey="_id"
                      size="small"
                      pagination={false}
                      dataSource={round.pairings || []}
                      columns={pairingColumns(round)}
                      scroll={{ x: 500 }}
                    />
                  </Card>
                ))}

                <Card className="chess-panel" title="🏆 Standings">
                  <Table
                    rowKey="_id"
                    size="small"
                    pagination={false}
                    dataSource={standings}
                    columns={[
                      { title: "#", dataIndex: "rank", width: 55 },
                      { title: "Player", dataIndex: "displayName", render: (v) => <Text strong>{v}</Text> },
                      { title: "Rating", dataIndex: "rating", width: 90 },
                      { title: "Points", dataIndex: "score", width: 85, render: (v) => <Tag color="gold">{v}</Tag> },
                    ]}
                    scroll={{ x: 400 }}
                  />
                </Card>
              </Space>
            )}
          </Col>
        </Row>
      )}

      <Modal
        title="✨ Create a Flair chess tournament"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ maxPlayers: 32, roundsCount: 5, timeControlMinutes: 10 }}
          onFinish={createTournament}
        >
          <Form.Item name="name" label="Tournament name" rules={[{ required: true, min: 3, message: "Enter at least 3 characters." }]}>
            <Input maxLength={100} placeholder="e.g. Flair Junior Chess Cup" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea maxLength={500} rows={3} placeholder="A friendly tournament for Flair learners..." />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="maxPlayers" label="Max players" rules={[{ required: true }]}>
                <InputNumber min={2} max={512} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="roundsCount" label="Rounds" rules={[{ required: true }]}>
                <InputNumber min={1} max={15} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="timeControlMinutes" label="Minutes" rules={[{ required: true }]}>
                <InputNumber min={1} max={180} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Alert type="warning" showIcon message="Organiser access must be configured in the backend before tournament creation and pairing controls will work." />
          <Button type="primary" htmlType="submit" block loading={saving} style={{ marginTop: 16 }}>Create tournament</Button>
        </Form>
      </Modal>
    </div>
  );
}
