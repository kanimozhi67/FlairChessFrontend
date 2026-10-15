
import React, { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "antd";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./StoryPdfViewer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const StoryPdfViewer = ({ pdfUrl, title = "My Story" ,  setStartQuiz}) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(900);
  const [loadingError, setLoadingError] = useState(false);
const [pdfFinished, setPdfFinished] = useState(false);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Responsive layout
  const isMobile = containerWidth < 600;
  const pagesPerView = isMobile ? 1 : 2;

  // Load PDF
  const onDocumentLoadSuccess = useCallback((pdf) => {
    setNumPages(pdf.numPages);
    setPageNumber(1);
    setPdfDocument(pdf);
    setLoadingError(false);
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    console.error("PDF loading error:", error);
    setLoadingError(true);
    setPdfDocument(null);
    setIsExtracting(false);
  }, []);

  // Stop speech when the PDF changes or component unmounts
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setIsExtracting(false);

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [pdfUrl]);

  // Stop speech when changing pages or switching layout
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [pageNumber, pagesPerView]);

  // Measure available width
  const containerRef = useCallback((node) => {
    if (!node) return;

    const updateWidth = () => {
      const width = node.getBoundingClientRect().width;

      if (width > 0) {
        setContainerWidth(width);
      }
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateWidth);
      observer.observe(node);
      node._pdfObserver = observer;
    }
  }, []);

  // Calculate page width for mobile and desktop
  const arrowSpace = isMobile ? 66 : 116;
  const pageGap = isMobile ? 0 : 14;

  const pageWidth = Math.max(
    80,
    Math.min(
      560,
      isMobile
        ? containerWidth - arrowSpace - 20
        : (containerWidth - arrowSpace - pageGap - 24) / 2
    )
  );

  // Determine the last valid starting page
  // Desktop: 1, 3, 5... Mobile: 1, 2, 3...
  const lastStartPage = isMobile
    ? numPages
    : numPages % 2 === 0
    ? Math.max(1, numPages - 1)
    : numPages;

  // Stop speech
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Navigate backward
  const goBack = () => {
    stopSpeaking();

    setPageNumber((prev) =>
      Math.max(1, prev - pagesPerView)
    );
  };

  // Navigate forward
  const goNext = () => {
    stopSpeaking();

    setPageNumber((prev) =>
      Math.min(lastStartPage, prev + pagesPerView)
    );
  };

  // Listen to the visible page or pages
  const speakCurrentPages = async () => {
    if (!pdfDocument) {
      alert("Please wait for the PDF to finish loading.");
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support text-to-speech.");
      return;
    }

    // Pause
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    // Resume
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    setIsExtracting(true);

    try {
      const pagesToRead = Array.from(
        { length: Math.min(pagesPerView, numPages - pageNumber + 1) },
        (_, index) => pageNumber + index
      );

      const textParts = [];

      for (const currentPage of pagesToRead) {
        const page = await pdfDocument.getPage(currentPage);
        const content = await page.getTextContent();

        // const pageText = content.items
        //   .filter(
        //     (item) =>
        //       typeof item.str === "string" &&
        //       item.str.trim().length > 0
        //   )
        //   .map((item) => item.str)
        //   .join(" ")
        //   .replace(/\s+/g, " ")
        //   .trim();


const pageText = content.items
  .filter((item) => {
    if (
      typeof item.str !== "string" ||
      !item.str.trim()
    ) {
      return false;
    }

    // Ignore footer text at the bottom of the PDF page
    const yPosition = item.transform?.[5] ?? 0;
    const pageHeight = page.view[3] - page.view[1];

    if (yPosition < pageHeight * 0.06) {
      return false;
    }

    return true;
  })
  .map((item) => item.str)
  .join(" ")
  .replace(/\s+/g, " ")
  .trim();


        if (pageText) {
          textParts.push(pageText);
        }
      }

      const text = textParts.join(". ").trim();

      if (!text) {
        alert(
          "No readable text was found. This PDF may contain images only."
        );
        return;
      }

      window.speechSynthesis.cancel();
       // Remove emojis before speaking
const cleanText = String(text)
  // Remove emoji placeholders extracted from the PDF
  .replace(/\b(?:n\s*){1,10}\b/gi, "")
  // Remove remaining emoji and symbol characters
  .replace(/[\u{1F000}-\u{1FAFF}\u{1FC00}-\u{1FFFF}]/gu, "")
  .replace(/[\u2600-\u27FF\uFE0E\uFE0F\u200D\u20E3]/gu, "")
  .replace(/\s+([.,!?;:])/g, "$1")
  .replace(/\s+/g, " ")
  .trim();


  if (!cleanText) return;
console.log("TEXT TO READ:", JSON.stringify(cleanText));
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();

      const preferredVoice = voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("en-us") &&
          /samantha|zira|jenny|aria/i.test(voice.name)
      );

      const fallbackVoice = voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("en-us")
      );

      if (preferredVoice || fallbackVoice) {
        utterance.voice = preferredVoice || fallbackVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        console.error("Speech error:", event.error);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("PDF text extraction error:", error);
      alert("Unable to read this PDF. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Current visible page range
  const visibleEndPage = Math.min(
    pageNumber + pagesPerView - 1,
    numPages
  );


const handleBackToStory = () => {
  stopSpeaking();

  setPdfFinished(false);

  // Return to the previous visible page or spread
  setPageNumber((prev) => Math.max(1, prev - pagesPerView));
};



useEffect(() => {
  if (numPages > 0 && pageNumber + pagesPerView - 1 >= numPages) {
    setPdfFinished(true);
  } else {
    setPdfFinished(false);
  }
}, [pageNumber, numPages, pagesPerView]);

  return (
    <div className="story-pdf-container">

        {!pdfFinished && <>  


        
      {/* {title && (
        <h2 className="story-pdf-title">{title}</h2>
      )} */}

      {loadingError ? (
        <div className="story-pdf-message story-pdf-error">
          <span>😕</span>
          <h3>Oops! We couldn't open this story.</h3>
          <p>Please check the PDF URL and try again.</p>
        </div>
      ) : (
        <div
          className="story-pdf-content"
          ref={containerRef}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="story-pdf-message">
                <span className="story-pdf-loading-emoji">
                  🚀
                </span>
                <p>Loading your colorful story...</p>
              </div>
            }
            error={
              <div className="story-pdf-message">
                <span>📖</span>
                <p>Unable to load this story.</p>
              </div>
            }
          >
            {numPages > 0 && (
              <div
                className={`story-pdf-viewer-row ${
                  isMobile ? "mobile-view" : "desktop-view"
                }`}
              >
                {/* Left arrow */}
                <button
                  type="button"
                  className="story-pdf-arrow"
                  onClick={goBack}
                  disabled={pageNumber <= 1}
                  aria-label="Previous page"
                  title="Previous page"
                >
                  &lt;
                </button>

                {/* PDF pages */}
                <div
                  className={`story-pdf-pages ${
                    isMobile
                      ? "story-pdf-single-page"
                      : "story-pdf-double-page"
                  }`}
                >
                  <Page
                    key={`${pdfUrl}-${pageNumber}`}
                    pageNumber={pageNumber}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="story-pdf-page"
                    loading={
                      <div className="page-placeholder">
                        ⏳
                      </div>
                    }
                  />

                  {!isMobile &&
                    pageNumber + 1 <= numPages && (
                      <Page
                        key={`${pdfUrl}-${pageNumber + 1}`}
                        pageNumber={pageNumber + 1}
                        width={pageWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="story-pdf-page"
                        loading={
                          <div className="page-placeholder">
                            ⏳
                          </div>
                        }
                      />
                    )}
                </div>

                {/* Right arrow */}
                <button
                  type="button"
                  className="story-pdf-arrow"
                  onClick={goNext}
                  disabled={pageNumber >= lastStartPage}
                  aria-label="Next page"
                  title="Next page"
                >
                  &gt;
                </button>
              </div>
            )}
          </Document>
        </div>
      )}

      {/* Listen controls */}
      {numPages > 0 && !loadingError && (
        <>
          <div className="story-pdf-audio-controls">
            <button
              type="button"
            //   className="story-pdf-button story-pdf-listen"
              onClick={speakCurrentPages}
              disabled={!pdfDocument || isExtracting}
               
                  style={{
                    width: "100%",
                    maxWidth: "220px",
                    minWidth: "140px",
                    height: "50px",
                    borderRadius: "25px",
                    fontSize: "clamp(13px, 2vw, 16px)",
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
                    border: "none",
                    color: "#6a1b4d",
                    boxShadow: "0 6px 15px rgba(255, 154, 158, 0.35)",
                    whiteSpace: "nowrap",
                    padding: "0 20px",
                  }}
             
            >
              {isExtracting
                ? "⏳ Preparing..."
                : isSpeaking
                ? isPaused
                  ? "▶️ Resume"
                  : "⏸️ Pause"
                : "🔊 Listen"}
            </button>

            {(isSpeaking || isPaused) && (
              <button
                type="button"
                className="story-pdf-button story-pdf-stop"
                onClick={stopSpeaking}
              >
                ⏹️ Stop
              </button>
            )}
          </div>

          {/* Page counter */}
          <div className="story-pdf-navigation">
            <div className="story-pdf-page-count">
              <span>📖</span>
              <strong>
                {pageNumber}
                {visibleEndPage > pageNumber
                  ? `–${visibleEndPage}`
                  : ""}
              </strong>
              <span>of {numPages}</span>
            </div>
          </div>

        </>
      )}

      {/* Progress bar */}
      {numPages > 0 && !loadingError && (
        <div className="story-pdf-progress">
          <div
            className="story-pdf-progress-fill"
            style={{
              width: `${
                (visibleEndPage / numPages) * 100
              }%`,
            }}
          />
        </div>
      )}

      </>}

{pdfFinished && (
  <div className="story-finished-screen">
    <div className="finished-confetti">✨ ⭐ 🌈 ⭐ ✨</div>

    <div className="finished-illustration">
      <span className="finished-book">📖</span>
      <span className="finished-character">🐻</span>
      <span className="finished-sparkle">🌟</span>
    </div>

    <h2 className="finished-title">
      Hooray! Story Completed!
    </h2>

    <p className="finished-subtitle">
      You did an amazing job! 🎉
    </p>

    <div className="finished-achievement">
      <span className="finished-medal">🏅</span>
      <div>
        <strong>Reading Champion!</strong>
        <p>You reached the end of your story.</p>
      </div>
      <span className="finished-star">⭐</span>
    </div>

    <div className="finished-progress">
      <div className="finished-progress-track">
        <div className="finished-progress-fill" />
      </div>
      <span>100% Story Completed!</span>
    </div>

    <p className="finished-question">
      What would you like to do next?
    </p>

    <div className="finished-actions">
      <Button
        onClick={handleBackToStory}
        className="finished-back-button"
      >
        📚 Back to Story
      </Button>

      <Button
        onClick={() => setStartQuiz(true)}
        className="finished-quiz-button"
      >
        🚀 Start Quiz
      </Button>
    </div>

    <p className="finished-footer">
      Keep reading, keep learning, keep shining! 💖
    </p>
  </div>
)}

    </div>
  );
};

export default StoryPdfViewer;
