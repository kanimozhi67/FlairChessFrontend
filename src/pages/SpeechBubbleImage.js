import React, { useEffect } from "react";
import { Card, Button } from "antd";

const SpeechBubbleImage = ({
  lessonImg,
  customText = "",
  showNext = false,
  onNext,
}) => {

  // ================= FORMAT SPEECH =================
  const formatSpeechText = (text) => {
    return text
      .replace(/STALK/gi, ". STALK.")
      .replace(/VEINS/gi, ". VEINS.")
      .replace(/LEAF BLADE/gi, ". LEAF BLADE.")
      .replace(/\./g, ". ")
      .replace(/,/g, ", ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // ================= SPEAK =================
  const speakText = () => {

    if (!customText) return;

    const finalText =
      formatSpeechText(customText);

    // stop previous speech
    window.speechSynthesis.cancel();

    const voices =
      window.speechSynthesis.getVoices();

    const femaleVoice =
      voices.find((voice) =>
        voice.name.includes("Zira")
      ) ||
      voices.find((voice) =>
        voice.name
          .toLowerCase()
          .includes("female")
      ) ||
      voices[0];

    const speech =
      new SpeechSynthesisUtterance(
        finalText
      );

    speech.lang = "en-US";
    speech.rate = 0.82;
    speech.pitch = 1.2;
    speech.volume = 1;
    speech.voice = femaleVoice;

    window.speechSynthesis.speak(speech);
  };

  // ================= AUTO SPEAK =================
  useEffect(() => {

    window.speechSynthesis.getVoices();

    window.speechSynthesis.onvoiceschanged =
      () => {
        speakText();
      };

    const timer = setTimeout(() => {
      speakText();
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };

  }, [customText]);

  return (
    <Card
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "20px auto",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow:
          "0 4px 15px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{
        padding:
          window.innerWidth < 600
            ? 12
            : 20,
      }}
    >
      {/* IMAGE */}
      <img
        src={lessonImg}
        alt="lesson"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 10,
          objectFit: "contain",
        }}
      />

      <br />
      <br />

      {/* BUTTONS */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {/* LISTEN BUTTON */}
        <Button
          type="primary"
          onClick={speakText}
          style={{
            width:
              window.innerWidth < 600
                ? "100%"
                : "auto",
            height: 40,
            fontSize: 16,
            borderRadius: 10,
          }}
        >
          🔊 Listen Again
        </Button>

        {/* NEXT BUTTON ONLY IF ENABLED */}
        {showNext && (
          <Button
            type="primary"
            onClick={onNext}
            style={{
              width:
                window.innerWidth < 600
                  ? "100%"
                  : "auto",
              height: 40,
              fontSize: 16,
              borderRadius: 10,
            }}
          >
            Next ➡️
          </Button>
        )}
      </div>
    </Card>
  );
};

export default SpeechBubbleImage;