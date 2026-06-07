import React, { useState } from "react";
import { Card, Typography, Row, Col, Button, Modal } from "antd";
import {
  PlayCircleFilled,
  ExperimentOutlined,
  BugOutlined,
  CloudOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;



const LearnByVideo = ({level,category,selectedLevel}) => {
  const [open, setOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");

const topics =
category==="plantadaptations"
   ?
[
  {
    title: "Aquatic Plants",
    description: "Plants that live and grow in water.",
    icon: <CloudOutlined />,
    color: "#4FC3F7",
    videoId: "JTQYXy7XrhA",
  },
  {
    title: "Terrestrial Plants",
    description: "Plants that grow on land.",
    icon: <ThunderboltOutlined />,
    color: "#81C784",
    videoId: "YqrupjLcXcE",
  },
  {
    title: "Mountain & Hill Plants",
    description: "Plants adapted to cold and hilly regions.",
    icon: <BugOutlined />,
    color: "#FFB74D",
    videoId: "PTYQ-Mn5nfE",
  },
  {
    title: "Plains Plants",
    description: "Plants commonly found in plains.",
    icon: <CloudOutlined />,
    color: "#64B5F6",
    videoId: "hQ24AU4A574",
  },
  {
    title: "Marshy Area Plants",
    description: "Plants adapted to waterlogged soil.",
    icon: <ExperimentOutlined />,
    color: "#BA68C8",
    videoId: "UoyWupRJRlQ",
  },
  {
    title: "Forest Plants",
    description: "Plants that thrive in dense forests.",
    icon: <PlayCircleFilled />,
    color: "#E57373",
    videoId: "0OyEEn9q9HU",
  },
  {
    title: "Insectivorous Plants",
    description: "Plants that trap and digest insects.",
    icon: <BugOutlined />,
    color: "#FF8A65",
    videoId: "O_py1V40CYk",
  },
  // {
  //   title: "Desert Plants",
  //   description: "Plants adapted to dry and hot conditions.",
  //   icon: <ThunderboltOutlined />,
  //   color: "#FFD54F",
  //   videoId: "",
  // },
  // {
  //   title: "Mangrove Plants",
  //   description: "Plants that grow in coastal marshes.",
  //   icon: <ExperimentOutlined />,
  //   color: "#7986CB",
  //   videoId: "",
  // },
] :
category==="solarsystem" ?
    [{
    title: "Solar System",
    description: "",
    icon: <BugOutlined />,
    color: "#FF8A65",
    videoId: "1EDlLBSTFzg",
  },
//  {
//     title: "Excretory System",
//     description: "",
//     icon: <ExperimentOutlined />,
//     color: "#BA68C8",
//     videoId: "bQcmvO0a8Mg",
//   },

] :
category==="soil" ?
    [{
    title: "Soil",
    description: "",
    icon: <BugOutlined />,
    color: "#FF8A65",
    videoId: "dak4t5fAfAo",
  },
//  {
//     title: "Excretory System",
//     description: "",
//     icon: <ExperimentOutlined />,
//     color: "#BA68C8",
//     videoId: "bQcmvO0a8Mg",
//   },

] :
category==="cesystem" ?
    [{
    title: "Circulatory System",
    description: "The system that transports blood, oxygen, nutrients, and hormones throughout the body.",
    icon: <BugOutlined />,
    color: "#FF8A65",
    videoId: "5RiB50fksJc",
  },
 {
    title: "Excretory System",
    description: "The system that removes waste products and maintains the body's fluid balance.",
    icon: <ExperimentOutlined />,
    color: "#BA68C8",
    videoId: "bQcmvO0a8Mg",
  },

] :
category==="greenplants" ?
    [{
    title: "Parts of the Plants & leaf",
    description: "",
    icon: <BugOutlined />,
    color: "#FF8A65",
    videoId: "pohRvP1DqkA",
  },
 {
    title: "Photosynthesis & Interdependence",
    description: "",
    icon: <ExperimentOutlined />,
    color: "#BA68C8",
    videoId: "A7G6jAS2iKI",
  },

] :
category==="food" ?
    [{
    title: "Food",
    description: "",
    icon: <BugOutlined />,
    color: "#FF8A65",
    videoId: "kM5qKtdvwJU",
  },
 {
    title: "Food Groups",
    description: "",
    icon: <ExperimentOutlined />,
    color: "#BA68C8",
    videoId: "LtLQYuWDBPE",
  },
    {
    title: "Balanced Diet",
    description: "",
    icon: <CloudOutlined />,
    color: "#64B5F6",
    videoId: "pjpOTzpd16A",
  },
  {
    title: "Food Preservation",
    description: "",
    icon: <ExperimentOutlined />,
    color: "#BA68C8",
    videoId: "1ZDygqaCVtg",
  },
  // {
  //   title: "Forest Plants",
  //   description: "",
  //   icon: <PlayCircleFilled />,
  //   color: "#E57373",
  //   videoId: "0OyEEn9q9HU",
  // },

] :
category==="airwaterweather" ?
    [{
    title: "Weather",
    description: "",
    icon: <BugOutlined />,
    color: "#FF8A65",
    videoId: "i31jgdS-sMIr",
  },
 {
    title: "Water",
    description: "",
    icon: <ExperimentOutlined />,
    color: "#BA68C8",
    videoId: "FscR0q1M4HQ",
  },
    {
    title: "Water Cycle",
    description: "",
    icon: <CloudOutlined />,
    color: "#64B5F6",
    videoId: "4n364bTp4V4",
  },
  {
    title:"Save Water",
    description: "",
    icon: <ExperimentOutlined />,
    color: "#BA68C8",
    videoId: "DFbfoYkjxMI",
  },
  // {
  //   title: "Forest Plants",
  //   description: "",
  //   icon: <PlayCircleFilled />,
  //   color: "#E57373",
  //   videoId: "0OyEEn9q9HU",
  // },
]
: 
    [{
    title: "You are not a Premium Subscriber",
    description: "Subscribe to learn more",
    icon: <BugOutlined />,
    color: "#FF8A65",
    videoId: "",
  },];
  const playVideo = (videoId) => {
    if (!videoId) return;

    setSelectedVideo(videoId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVideo("");
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "20px",
        background:
          "linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 50%, #FFF9C4 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <Title
          level={1}
          style={{
            textAlign: "center",
            color: "#2E7D32",
            fontWeight: "bold",
            marginBottom: "10px",
            textShadow: "2px 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          🌱 Learn  Through Videos 🌱
        </Title>

        <Paragraph
          style={{
            textAlign: "center",
            fontSize: "18px",
            color: "#555",
            marginBottom: "40px",
          }}
        >
          Explore via engaging educational videos.
           {/* different types of plants and their adaptations  */}
          
          
        </Paragraph>

        {/* Cards */}
        <Row gutter={[24, 24]} justify="center">
          {topics.map((topic, index) => (
            <Col
              key={index}
              xs={24}
              sm={24}
              md={24}
              lg={24}
              xl={24}
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Card
                hoverable
                styles={{
                  body: {
                    padding: "30px 20px",
                  },
                }}
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  borderRadius: "24px",
                  textAlign: "center",
                  background: topic.color,
                  border: "none",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "60px",
                    color: "#fff",
                    marginBottom: "15px",
                  }}
                >
                  {topic.icon}
                </div>

                <Title
                  level={3}
                  style={{
                    color: "#fff",
                    minHeight: "70px",
                    marginBottom: "10px",
                  }}
                >
                  {index + 1}. {topic.title}
                </Title>

                {/* <Paragraph
                  style={{
                    color: "#fff",
                    fontSize: "15px",
                    minHeight: "55px",
                    marginBottom: "20px",
                  }}
                >
                  {topic.description}
                </Paragraph> */}

                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  icon={<PlayCircleFilled />}
                  disabled={!topic.videoId}
                  onClick={() => playVideo(topic.videoId)}
                  style={{
                    background: "#fff",
                    color: topic.color,
                    border: "none",
                    fontWeight: "bold",
                    height: "48px",
                    paddingLeft: "2px",
                    paddingRight: "2px",
                  }}
                >
                  Watch Video
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Video Modal */}
        <Modal
          open={open}
          footer={null}
          onCancel={handleClose}
          width="90%"
          centered
          destroyOnClose
        >
          {/* <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
            }}
          >
            <iframe
              title="Plant Adaptation Video"
              // src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
            src={`https://www.youtube-nocookie.com/embed/${selectedVideo}?autoplay=1&controls=0&modestbranding=1&rel=0`}
            maskClosable={false}
              keyboard={false}  
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "80%",
                borderRadius: "12px",
              }}
            />
          </div> */}
          <div style={{ position: "relative" }}>
  <iframe
  title="YouTube Video"
  src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&controls=0&modestbranding=1&rel=0&mute=0`}
  allow="autoplay; encrypted-media"
  allowFullScreen
  style={{
    width: "100%",
    height: "500px",
    border: "none",
  }}
/>

  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      background: "transparent",
    }}
  />
</div>
        </Modal>
      </div>
    </div>
  );
};

export default LearnByVideo;