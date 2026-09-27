"use client";

import { useState } from "react";
import { Question } from "@/types";
import CodeBlock from "./CodeBlock";
import { useBookmarks } from "./BookmarkProvider";

interface QuestionCardProps {
  question: Question;
  index: number;
  onNavigateToTopic?: (topicId: string) => void;
}

export default function QuestionCard({
  question,
  index,
  onNavigateToTopic,
}: QuestionCardProps) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(question.id);

  return (
    <div className="question-card" id={question.id}>
      <div className="question-header" style={{ cursor: "default" }}>
        <div className="question-number">{index + 1}</div>
        <div className="question-title-area">
          <h3 className="question-title">{question.question}</h3>
          <div className="question-meta">
            <span
              className={`difficulty-badge difficulty-${question.difficulty.toLowerCase()}`}
            >
              {question.difficulty}
            </span>
            <div className="frequency-indicator" title={`Frequency: ${question.frequency}/5`}>
              {[1, 2, 3, 4, 5].map((dot) => (
                <span
                  key={dot}
                  className={`frequency-dot ${dot <= question.frequency ? "active" : ""}`}
                />
              ))}
            </div>
            <span className="ai-badge">
              <span className="ai-badge-icon">✨</span>
              AI Curated
            </span>
            <span className="verified-date">
              ✓ Verified {question.lastVerified}
            </span>
          </div>
        </div>
        <div className="question-actions">
          <button
            className={`bookmark-btn ${bookmarked ? "bookmarked" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(question.id);
            }}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
            title={bookmarked ? "Remove bookmark" : "Bookmark this question"}
          >
            {bookmarked ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div className="question-answer">
        {/* 1. Quick Answer */}
          <div className="answer-section answer-section-quick">
            <div className="answer-section-label">
              <span className="answer-section-icon">🎯</span>
              Quick Answer
            </div>
            <blockquote className="quick-answer-text">
              {question.answer.quickAnswer}
            </blockquote>
          </div>

          {/* 2. Mental Model */}
          <div className="answer-section answer-section-mental">
            <div className="answer-section-label">
              <span className="answer-section-icon">🧠</span>
              Mental Model
            </div>
            <div className="mental-model-box">
              <p className="answer-section-text">{question.answer.mentalModel}</p>
            </div>
          </div>

          {/* 3. What It Is */}
          <div className="answer-section">
            <div className="answer-section-label">
              <span className="answer-section-icon">📖</span>
              What It Is
            </div>
            <p className="answer-section-text">{question.answer.whatItIs}</p>
          </div>

          {/* 4. Why It Exists / Problem It Solves */}
          <div className="answer-section">
            <div className="answer-section-label">
              <span className="answer-section-icon">⚙️</span>
              Why It Exists / Problem It Solves
            </div>
            <p className="answer-section-text">{question.answer.whyItExists}</p>
          </div>

          {/* 5. Code / Command Demo */}
          <div className="answer-section">
            <div className="answer-section-label">
              <span className="answer-section-icon">💻</span>
              Code / Command Demo
            </div>
            <CodeBlock
              code={question.answer.codeDemo.code}
              language={question.answer.codeDemo.language}
              explanation={question.answer.codeDemo.explanation}
            />
          </div>

          {/* 6. Trade-offs / When NOT to Use */}
          <div className="answer-section answer-section-tradeoffs">
            <div className="answer-section-label">
              <span className="answer-section-icon">⚖️</span>
              Trade-offs / When NOT to Use
            </div>
            <div className="tradeoffs-box">
              <p className="answer-section-text">{question.answer.tradeoffs || question.answer.tradeOffs}</p>
            </div>
          </div>

          {/* 7. They Might Ask Next */}
          {(question.answer.followUpQuestions || question.answer.theyMightAskNext)?.length > 0 && (
            <div className="answer-section">
              <div className="answer-section-label">
                <span className="answer-section-icon">❓</span>
                They Might Ask Next
              </div>
              <div className="followup-list">
                {(question.answer.followUpQuestions || question.answer.theyMightAskNext).map((fq: any, idx: number) => (
                  <FollowUpItem key={idx} question={fq.question} answer={fq.answer} />
                ))}
              </div>
            </div>
          )}

          {/* 8. Used in Production */}
          <div className="answer-section answer-section-production">
            <div className="answer-section-label">
              <span className="answer-section-icon">🏭</span>
              Used in Production
            </div>
            <div className="production-box">
              <p className="answer-section-text">{question.answer.usedInProduction}</p>
            </div>
          </div>

          {/* 9. Related Topics */}
          {question.answer.relatedTopics.length > 0 && (
            <div className="answer-section">
              <div className="answer-section-label">
                <span className="answer-section-icon">🔗</span>
                Related Topics
              </div>
              <div className="related-topics-list">
                {question.answer.relatedTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    className="related-topic-chip"
                    onClick={() => onNavigateToTopic?.(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

/* Sub-component for collapsible follow-up Q&A */
function FollowUpItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`followup-item ${open ? "followup-open" : ""}`}>
      <button className="followup-question" onClick={() => setOpen(!open)}>
        <span className="followup-q-icon">Q</span>
        <span>{question}</span>
        <span className={`followup-chevron ${open ? "expanded" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="followup-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
