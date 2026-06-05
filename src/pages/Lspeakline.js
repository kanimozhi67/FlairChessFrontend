import React, { useEffect, useState } from "react";
import { Card, Button, Spin } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import Tesseract from "tesseract.js";

import gp2 from "../images/gp2.png";

const Lspeakline = ({lessonImg=gp2}) => {

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= LOAD =================
  useEffect(() => {
    // Load voices
    window.speechSynthesis.getVoices();

    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };

    extractText();
  }, [lessonImg]);

  // ================= CLEAN OCR TEXT =================
  const removeMeaninglessWords = (text) => {

    const garbageWords = [
      "RE",
      "ARRAS",
      "PR",
      "Ber",
      "Hn",
      "Zh",
      "fo",
      "ale",
      "la",
      "pe",
      "IN",
        "eccececceccesccececececceces",
    "cesses",
    "ccececceecese",
    "pT",
    "MEER",
    "TY",
    "Ea",
    "H",
    "ST",
    "Leav",
"leave",
    "the ¢","©","@"," | ","¢",
      "er",
   
      "ie"
    ];

    let cleanedText = text;

    // remove garbage words
    garbageWords.forEach((word) => {

      const regex = new RegExp(`\\b${word}\\b`, "gi");

      cleanedText = cleanedText.replace(regex, "");
    });

    // remove + symbol
    cleanedText = cleanedText.replace(/\+/g, "");

    // remove unwanted symbols
    cleanedText = cleanedText.replace(/[~#&=,_]/g, "");

    // remove extra spaces
    cleanedText = cleanedText.replace(/\s+/g, " ");

    // add line breaks
    cleanedText = cleanedText
      .replace(/Plants/g, "\nPlants")
      .replace(/About/g, "\nAbout")
      .replace(/How/g, "\nHow")
      .replace(/depend/g, "\ndepend");

    return cleanedText.trim();
  };

  const formatSpeechText = (text) => {
  return text
    // Add pauses after headings
    .replace(/STALK/gi, ". STALK.")
    .replace(/VEINS/gi, ". VEINS.")
    .replace(/LEAF BLADE/gi, ". LEAF BLADE.")

    // Add pauses after sentences
    .replace(/\./g, ". ")

    // Add speaking pauses
    .replace(/,/g, ", ")

    // Add pauses before important words
    .replace(/called/gi, " called ")
    .replace(/middle/gi, " middle ")
    .replace(/underside/gi, " underside ")

    // Remove extra spaces
    .replace(/\s+/g, " ")
    .trim();
};  

  // ================= GIRL VOICE =================
//   const speakText = (customText = "") => {

//     const finalText =
//       typeof customText === "string" && customText.length > 0
//         ? customText
//         : text;

//          const finalText = formatSpeechText(rawText);
//     if (!finalText) return;
//     window.speechSynthesis.cancel();

//     const speech =
//       new SpeechSynthesisUtterance(finalText);

//     speech.lang = "en-US";

//     // teacher voice settings
//     speech.rate = 0.85;
//     speech.pitch = 1.3;
//     speech.volume = 1;

//     const voices =
//       window.speechSynthesis.getVoices();

//     // choose female voice
//     const femaleVoice =
//       voices.find((voice) =>
//         voice.name.includes("Zira")
//       ) ||
//       voices.find((voice) =>
//         voice.name.toLowerCase().includes("female")
//       ) ||
//       voices.find((voice) =>
//         voice.name.toLowerCase().includes("woman")
//       ) ||
//       voices[0];

//     speech.voice = femaleVoice;

//     window.speechSynthesis.speak(speech);
//   };
const speakText = (customText = "") => {
  const rawText =
    typeof customText === "string" &&
    customText.length > 0
      ? customText
      : text;

  const finalText = formatSpeechText(rawText);

  if (!finalText) return;

  // stop previous speech
  window.speechSynthesis.cancel();

  const voices =
    window.speechSynthesis.getVoices();

  const femaleVoice =
    voices.find((voice) =>
      voice.name.includes("Zira")
    ) ||
    voices.find((voice) =>
      voice.name.toLowerCase().includes("female")
    ) ||
    voices[0];

  // split text sentence by sentence
  const lines = finalText
    .split(".")
    .filter((line) => line.trim() !== "");

  lines.forEach((line, index) => {
    const speech =
      new SpeechSynthesisUtterance(line);

    speech.lang = "en-US";

    speech.rate = 0.82;
    speech.pitch = 1.2;
    speech.volume = 1;

    speech.voice = femaleVoice;

    // speak one by one
    setTimeout(() => {
      window.speechSynthesis.speak(speech);
    }, index * 2500);
  });
};
  // ================= OCR =================
  const extractText = async () => {

    try {

      setLoading(true);

   

         const img = new Image();
      img.src = lessonImg;

      img.onload = async () => {

        const canvas =
          document.createElement("canvas");

        const ctx =
          canvas.getContext("2d");

        // crop left side text area
        canvas.width = img.width * 0.45;
        canvas.height = img.height;

        ctx.drawImage(
          img,
          0,
          0,
          img.width * 0.45,
          img.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // improve clarity
        ctx.filter =
          "contrast(180%) brightness(120%)";

        const processedImage =
          canvas.toDataURL("image/png");

        // OCR
        const result =
          await Tesseract.recognize(
            processedImage,
            "eng",
            {
              logger: (m) =>
                console.log(m),

              tessedit_pageseg_mode: 6,
            }
          );

        console.log(result.data.text);

        // clean OCR text
        const cleaned =
          removeMeaninglessWords(
            result.data.text
          );

        setText(cleaned);

        // auto speak
        setTimeout(() => {
          speakText(cleaned);
        }, 500);

        setLoading(false);
      };

    } catch (err) {

      console.log(err);

      setLoading(false);
    }
  };

  return (

 
    <Card
      style={{
        width: "95%",
        maxWidth: 1000,
        margin: "20px auto",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{
        padding:
          window.innerWidth < 600 ? 12 : 20,
      }}>

      {/* IMAGE */}
    <img
  src={lessonImg}
  alt="book"
  style={{
    width: "100%",
    height: "auto",
    borderRadius: 10,
    objectFit: "contain",
  }}
/>

      <br />
      <br />

      {/* LOADING */}
      {loading ? (

        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
        </div>

      ) : (

        <>

          {/* BUTTON */}
         <Button
  type="primary"
  icon={<AudioOutlined />}
  onClick={() => speakText()}
  style={{
    width: window.innerWidth < 600 ? "100%" : "auto",
    height: 35,
    fontSize: 16,
  }}
>
  Listen
</Button> 

          {/* TEXT */}
          <div
  style={{
    marginTop: 20,
    padding: window.innerWidth < 600 ? 12 : 20,
    background: "#f5f5f5",
    borderRadius: 10,
    whiteSpace: "pre-wrap",
    lineHeight: 1.8,
    fontSize: window.innerWidth < 600 ? 14 : 16,
    overflowWrap: "break-word",
  }}
>
  {text}
</div>
        

        </>
      )}

    </Card>
  );
};

export default Lspeakline;