import React, { useState } from 'react'
import { Card, Typography, Row, Col } from 'antd'
import {
  PieChartOutlined,
  AppstoreOutlined,
  AimOutlined,
  CalculatorOutlined,
  BookOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import FractionTopicsQuiz from './FractionTopicsQuiz'
import MeasurementTopicsQuiz from './MeasurementTopicsQuiz'

const { Title, Text } = Typography

const topicsList = [
  { id: 'conversion', label: 'Conversion', icon: <PieChartOutlined /> },
  { id: 'addsub', label: 'Add sub', icon: <AppstoreOutlined /> },
  { id: 'wordproblems', label: 'Word Problems', icon: <BookOutlined /> }
]

const MeasurementTopics = ({ category, level, selectedLevel, user, addPointsToBackend }) => {
  const [topics, setTopics] = useState(null)

  return (
    <div
     
    >

      {/* Change Topic Button */}
      {topics && (
        <div style={{ textAlign: 'center', marginTop:0 }}>
          <button
            style={{
              padding: 'clamp(6px, 1vw, 10px) clamp(10px, 2vw, 18px)',
              borderRadius: 14,
              border: 'none',
              background: 'rgb(229, 70, 168)',
              color: '#fff',
              fontSize: 'clamp(12px, 2vw, 18px)',
              cursor: 'pointer'
            }}
            onClick={() => setTopics(null)}
          >
            Change Topics
          </button>
     <br></br>
        
        </div>
      )}

      {/* Topic Selection */}
      {!topics && (
        <Card
          style={{
            width: '100%',
            maxWidth: 600,
            borderRadius: 24
          }}
          bodyStyle={{ padding: 'clamp(16px, 3vw, 28px)' }}
          bordered={false}
        >
          <Title
            level={3}
            style={{
              textAlign: 'center',
              color: '#7e22ce',
              fontSize: 'clamp(18px, 4vw, 28px)'
            }}
          >
            🎮 Choose Your Level
          </Title>

          <hr />

          <Row gutter={[12, 12]}>
            {topicsList.map((item) => (
              <Col
                key={item.id}
                xs={24}   // mobile
                sm={12}   // tablet
                md={12}   // small laptop
                lg={8}    // desktop
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => setTopics(item.id)}
                    hoverable
                    style={{
                      textAlign: 'center',
                      borderRadius: 20,
                      background:
                        topics === item.id
                          ? '#a855f7'
                          : 'linear-gradient(135deg, #ff9d2f, #ff6126)',
                      color: topics === item.id ? '#fff' : '#333'
                    }}
                    bodyStyle={{ padding: 'clamp(12px, 2vw, 18px)' }}
                  >
                    <div
                      style={{
                        fontSize: 'clamp(22px, 4vw, 30px)',
                        marginBottom: 8
                      }}
                    >
                      {item.icon}
                    </div>
                    <Text strong style={{ fontSize: 'clamp(14px, 2vw, 18px)' }}>
                      {item.label}
                    </Text>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Quiz Section */}
      {topics && (
        <MeasurementTopicsQuiz
          category={category}
          level={level}
          selectedLevel={selectedLevel}
          addPointsToBackend={addPointsToBackend}
          topics={topics}
        />
      )}
    </div>
  )
}

export default MeasurementTopics
