import React, { useState } from "react";
import {
  Upload,
  Button,
  Card,
  Typography,
  message,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Tesseract from "tesseract.js";

const { Title, Paragraph } = Typography;

export default function ImageTextReader() {
  const [imageUrl, setImageUrl] = useState("");
  const [processedImage, setProcessedImage] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file) => {
    const reader = new FileReader();

    reader.onload = () => {
      setImageUrl(reader.result);
      preprocessImage(reader.result);
    };

    reader.readAsDataURL(file);

    return false;
  };

const preprocessImage = (src) => {
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width * 2;
    canvas.height = img.height * 2;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const avg =
        (data[i] + data[i + 1] + data[i + 2]) / 3;

      const value = avg > 140 ? 255 : 0;

      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);

    setProcessedImage(canvas.toDataURL("image/png"));
  };

  img.src = src;
};

const extractText = async () => {
  if (!processedImage) {
    message.warning("Upload image first");
    return;
  }

  setLoading(true);
  setText("");

  try {
    const result = await Tesseract.recognize(
      processedImage,
      "eng",
      {
        logger: (m) => console.log(m),

        config: {
          tessedit_pageseg_mode: 6,
          tessedit_char_whitelist:
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;!?()'-/ ",
        },
      }
    );

    console.log(result);

    let detectedText = result.data.text;

    detectedText = detectedText
      .replace(/\s{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n");

    setText(detectedText || "No text detected");
  } catch (error) {
    console.error(error);
    message.error("OCR failed");
  }

  setLoading(false);
};

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: 30,
      }}
    >
      <Card style={{ width: 800 }}>
        <Title level={3}>Advanced OCR Reader</Title>

        <Upload
          beforeUpload={beforeUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>
            Upload Image
          </Button>
        </Upload>

        {imageUrl && (
          <div style={{ marginTop: 20 }}>
            <Title level={5}>Original Image</Title>

            <img
              src={imageUrl}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: 250,
              }}
            />
          </div>
        )}

        {processedImage && (
          <div style={{ marginTop: 20 }}>
            <Title level={5}>Processed Image</Title>

            <img
              src={processedImage}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: 250,
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}

        <Button
          type="primary"
          onClick={extractText}
          loading={loading}
          style={{ marginTop: 20 }}
        >
          Extract Text
        </Button>

        <div style={{ marginTop: 30 }}>
          <Title level={4}>Detected Text</Title>

          {loading ? (
            <Spin />
          ) : (
            <Paragraph
              style={{
                whiteSpace: "pre-wrap",
                background: "#f5f5f5",
                padding: 15,
                borderRadius: 8,
                minHeight: 150,
              }}
            >
              {text || "No text detected"}
            </Paragraph>
          )}
        </div>
      </Card>
    </div>
  );
}