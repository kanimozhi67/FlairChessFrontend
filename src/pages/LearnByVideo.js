import React, { useState } from "react";
import { Card, Typography, Row, Col, Button, Modal } from "antd";
import {
  PlayCircleFilled,
  CloudOutlined,
  EnvironmentOutlined,
  RiseOutlined,
  ApartmentOutlined,
  ExperimentOutlined,
  BugOutlined,
  RocketOutlined,
  FundOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  SunOutlined,
  CoffeeOutlined,
  FireOutlined,
  BranchesOutlined,
  ClusterOutlined,
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
    color: "#29B6F6",
    videoId: "JTQYXy7XrhA",
  },
  {
    title: "Terrestrial Plants",
    description: "Plants that grow on land.",
    icon: <EnvironmentOutlined />,
    color: "#66BB6A",
    videoId: "YqrupjLcXcE",
  },
  {
    title: "Mountain & Hill Plants",
    description: "Plants adapted to cold and hilly regions.",
    icon: <RiseOutlined />,
    color: "#8D6E63",
    videoId: "PTYQ-Mn5nfE",
  },
  {
    title: "Plains Plants",
    description: "Plants commonly found in plains.",
    icon: <ApartmentOutlined />,
    color: "#9CCC65",
    videoId: "hQ24AU4A574",
  },
  {
    title: "Marshy Area Plants",
    description: "Plants adapted to waterlogged soil.",
    icon: <ExperimentOutlined />,
    color: "#26A69A",
    videoId: "UoyWupRJRlQ",
  },
  {
    title: "Forest Plants",
    description: "Plants that thrive in dense forests.",
    icon: <BranchesOutlined />,
    color: "#2E7D32",
    videoId: "0OyEEn9q9HU",
  },
  {
    title: "Insectivorous Plants",
    description: "Plants that trap and digest insects.",
    icon: <BugOutlined />,
    color: "#EF5350",
    videoId: "O_py1V40CYk",
  },
]
:
category==="solarsystem"
?
[
  {
    title: "Solar System",
    description: "",
    icon: <RocketOutlined />,
    color: "#3949AB",
    videoId: "1EDlLBSTFzg",
  },
]
:
category==="soil"
?
[
  {
    title: "Soil",
    description: "",
    icon: <FundOutlined />,
    color: "#8D6E63",
    videoId: "dak4t5fAfAo",
  },
]
:
category==="cesystem"
?
[
  {
    title: "Circulatory System",
    description: "The system that transports blood, oxygen, nutrients, and hormones throughout the body.",
    icon: <HeartOutlined />,
    color: "#E53935",
    videoId: "5RiB50fksJc",
  },
  {
    title: "Excretory System",
    description: "The system that removes waste products and maintains the body's fluid balance.",
    icon: <SafetyCertificateOutlined />,
    color: "#8E24AA",
    videoId: "bQcmvO0a8Mg",
  },
]
:
category==="greenplants"
?
[
  {
    title: "Parts of the Plants & Leaf",
    description: "",
    icon: <ClusterOutlined />,
    color: "#43A047",
    videoId: "pohRvP1DqkA",
  },
  {
    title: "Photosynthesis & Interdependence",
    description: "",
    icon: <SunOutlined />,
    color: "#F9A825",
    videoId: "A7G6jAS2iKI",
  },
]
:
category==="food"
?
[
  {
    title: "Food",
    description: "",
    icon: <CoffeeOutlined />,
    color: "#FB8C00",
    videoId: "kM5qKtdvwJU",
  },
  {
    title: "Food Groups",
    description: "",
    icon: <ApartmentOutlined />,
    color: "#8E24AA",
    videoId: "LtLQYuWDBPE",
  },
  {
    title: "Balanced Diet",
    description: "",
    icon: <HeartOutlined />,
    color: "#29B6F6",
    videoId: "pjpOTzpd16A",
  },
  {
    title: "Food Preservation",
    description: "",
    icon: <SafetyCertificateOutlined />,
    color: "#26A69A",
    videoId: "1ZDygqaCVtg",
  },
]
:
category==="airwaterweather"
?
[
  {
    title: "Weather",
    description: "",
    icon: <CloudOutlined />,
    color: "#FFA726",
    videoId: "i31jgdS-sMI",
  },
  {
    title: "Water",
    description: "",
    icon: <ExperimentOutlined />,
    color: "#29B6F6",
    videoId: "FscR0q1M4HQ",
  },
  {
    title: "Water Cycle",
    description: "",
    icon: <FireOutlined />,
    color: "#42A5F5",
    videoId: "4n364bTp4V4",
  },
  {
    title: "Save Water",
    description: "",
    icon: <SafetyCertificateOutlined />,
    color: "#26A69A",
    videoId: "DFbfoYkjxMI",
  },
]
:
[
  {
    title: "You are not a Premium Subscriber",
    description: "Subscribe to learn more",
    icon: <SafetyCertificateOutlined />,
    color: "#FF7043",
    videoId: "",
  },
];
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
          maxWidth: "1800px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <Title
          level={2}
          style={{
            textAlign: "center",
            color: "#2E7D32",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          🌱 Explore through  engaging videos 
        </Title>
<hr></hr>
        {/* <Paragraph
          style={{
            textAlign: "center",
            fontSize: "18px",
            color: "#555",
            marginBottom: "40px",
          }}
        >
          Explore via engaging educational videos.
        
          
          
        </Paragraph> */}

        {/* Cards */}
        <Row gutter={[24, 24]} justify="center">
          {topics.map((topic, index) => (
            <Col
              key={index}
              xs={24}
              sm={24}
              md={12}
              lg={12}
              xl={12}
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Card
                hoverable
                styles={{
                  body: {
                    // padding: "30px 20px",
                  },
                }}
                style={{
                  width: "100%",
                  maxWidth: "250px",
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
                    // marginBottom: "15px",
                  }}
                >
                  {topic.icon}
                </div>

                <Title
                  level={3}
                  style={{
                    color: "#fff",
                    minHeight: "70px",
                    // marginBottom: "10px",
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
                  // icon={<PlayCircleFilled />}
                  disabled={!topic.videoId}
                  onClick={() => playVideo(topic.videoId)}
                  style={{
                    background: "#fff",
                    color: "red",
                    border: "none",
                    fontWeight: "bold",
                    height: "56px",
    fontSize: "30px",
    // padding: "0 32px",
    // borderRadius: "12px",
                  }}
                >
                 <PlayCircleFilled />
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Video Modal */}
        {/* <Modal
          open={open}
          footer={null}
          onCancel={handleClose}
          width="90%"
          centered
          destroyOnClose
        >
   
          <div style={{ position: "relative" }}>
  <iframe
  title="YouTube Video"
  src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&controls=1&modestbranding=1&rel=0&mute=0`}
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
      left:0,
      right: 200,
      bottom: 400,
      zIndex: 10,
       background: "transparent",
    
    }}
  />

  <div
    style={{
      position: "absolute",
      top: 370,
      left:850,
      right: 0,
      bottom: 0,
      zIndex: 10,
       background: "transparent",
     
    }}
  />
</div>
        </Modal> */}
        <Modal
  open={open}
  footer={null}
  onCancel={handleClose}
  width="90%"
 
  centered
  destroyOnClose
>
  <div
    style={{
      position: "relative",
      width: "100%",
      paddingTop: "46.25%", // 16:9 aspect ratio
    }}
  >
    <iframe
      title="YouTube Video"
      src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&controls=1&modestbranding=1&rel=0&mute=0`}
      allow="autoplay; encrypted-media"
      allowFullScreen
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "none",
        borderRadius: "12px",
      }}
    />

    {/* Top-left transparent overlay */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "86%",
        height: "30%",
        zIndex: 10,
        background: "transparent",
      }}
    />

    {/* Bottom-right transparent overlay */}
    <div
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        width: "90%",
        height: "25%",
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