"use client";

import { useState } from "react";
import { Question } from "@/types";
import CodeBlock from "./CodeBlock";
import FlowDiagram from "./FlowDiagram";
import HLDArchitectureFlow from "./HLDArchitectureFlow";
import LLDClassDiagramComponent from "./LLDClassDiagram";
import TableView, { parseTableData } from "./TableView";
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

  const [lldViewTab, setLldViewTab] = useState<"both" | "class" | "flow">("both");
  const [hldViewTab, setHldViewTab] = useState<"both" | "network" | "flow">("both");
  const [codeViewTab, setCodeViewTab] = useState<"both" | "blueprint" | "code">("both");

  const isProject =
    question.id.startsWith("sd-hld-case") ||
    question.id.startsWith("sd-lld-case") ||
    question.question.startsWith("Design ");

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
            {isProject ? (
              <span className="project-badge">
                <span className="project-badge-icon">📐</span>
                45-Min Case Study
              </span>
            ) : (
              <span className="ai-badge">
                <span className="ai-badge-icon">✨</span>
                Interview Guide
              </span>
            )}
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
        {/* Project 45-Minute Interview Strategy Stepper */}
        {isProject && (
          <div className="project-roadmap-banner">
            <div className="project-roadmap-header">
              <div className="project-roadmap-title">
                <span>⏱️ 45-Minute Interview Strategy Roadmap</span>
              </div>
              <span className="project-roadmap-badge">6 Steps · 45 min total</span>
            </div>
            <div className="project-steps-grid">
              <div className="project-step-card">
                <div className="step-card-header">
                  <span className="step-card-num">Step 1</span>
                  <span className="step-card-time">5 min</span>
                </div>
                <span className="step-card-name">Clarify requirements</span>
              </div>
              <div className="project-step-card">
                <div className="step-card-header">
                  <span className="step-card-num">Step 2</span>
                  <span className="step-card-time">5 min</span>
                </div>
                <span className="step-card-name">Estimate scale</span>
              </div>
              <div className="project-step-card">
                <div className="step-card-header">
                  <span className="step-card-num">Step 3</span>
                  <span className="step-card-time">5 min</span>
                </div>
                <span className="step-card-name">API + data model</span>
              </div>
              <div className="project-step-card">
                <div className="step-card-header">
                  <span className="step-card-num">Step 4</span>
                  <span className="step-card-time">10 min</span>
                </div>
                <span className="step-card-name">High-level design</span>
              </div>
              <div className="project-step-card">
                <div className="step-card-header">
                  <span className="step-card-num">Step 5</span>
                  <span className="step-card-time">15 min</span>
                </div>
                <span className="step-card-name">Deep dive on key components</span>
              </div>
              <div className="project-step-card">
                <div className="step-card-header">
                  <span className="step-card-num">Step 6</span>
                  <span className="step-card-time">5 min</span>
                </div>
                <span className="step-card-name">Bottlenecks, trade-offs, wrap-up</span>
              </div>
            </div>
          </div>
        )}

        {/* 1. Define it simply (1-2 sentences, no jargon) */}
        <div className="answer-section answer-section-quick">
          <div className="answer-section-label">
            <span className="answer-section-icon">🎯</span>
            {isProject ? "Overview & Core Concept" : "1. Define It Simply (1-2 Sentences, No Jargon)"}
          </div>
          <blockquote className="quick-answer-text">
            {question.answer.quickAnswer}
          </blockquote>
        </div>

        {/* 2. Explain the problem it solves (shows you understand why it matters) */}
        <div className="answer-section">
          <div className="answer-section-label">
            <span className="answer-section-icon">⚙️</span>
            {isProject ? "Problem It Solves & Why It Matters" : "2. Problem It Solves (Why It Matters)"}
          </div>
          <p className="answer-section-text">{question.answer.whyItExists}</p>
        </div>

        {/* Head-to-Head Comparison Table for Difference Questions */}
        {question.answer.comparisonTable && (
          <div className="answer-section answer-section-comparison">
            <div className="answer-section-label">
              <span className="answer-section-icon">⚖️</span>
              Head-to-Head Comparison Matrix (Key Differences)
            </div>
            <TableView
              table={
                typeof question.answer.comparisonTable === "string"
                  ? parseTableData(question.answer.comparisonTable, "table") || { headers: [], rows: [] }
                  : question.answer.comparisonTable
              }
            />
          </div>
        )}

        {/* 3. Explain how it works with architecture diagrams & UML models */}
        <div className="answer-section answer-section-mental">
          <div className="answer-section-label">
            <span className="answer-section-icon">🧠</span>
            {isProject ? "Architecture Models, Working Flows & UML Diagrams" : "3. How It Works (Example & Diagram)"}
          </div>
          <div className="mental-model-box">
            <p className="answer-section-text">{question.answer.mentalModel}</p>
          </div>
          {question.answer.whatItIs && question.answer.whatItIs !== question.answer.quickAnswer && (
            <div style={{ marginTop: "10px" }}>
              <p className="answer-section-text">{question.answer.whatItIs}</p>
            </div>
          )}

          {/* HLD: Working Network Flow (Client -> Gateway -> App -> Redis -> Kafka -> DB) */}
          {question.answer.hldNetworkFlow && (
            <div className="arch-view-wrapper" style={{ marginTop: "16px" }}>
              <div className="arch-view-tabs">
                <button
                  className={`arch-tab-btn ${hldViewTab === "network" ? "active" : ""}`}
                  onClick={() => setHldViewTab("network")}
                >
                  🌐 1. Working Network Architecture (Client ➔ CDN ➔ Gateway ➔ Redis ➔ Kafka ➔ DB)
                </button>
                <button
                  className={`arch-tab-btn ${hldViewTab === "flow" ? "active" : ""}`}
                  onClick={() => setHldViewTab("flow")}
                >
                  ⚡ 2. Functional Step-by-Step Flow
                </button>
                <button
                  className={`arch-tab-btn ${hldViewTab === "both" ? "active" : ""}`}
                  onClick={() => setHldViewTab("both")}
                >
                  👁️ Both HLD Views
                </button>
              </div>

              {(hldViewTab === "network" || hldViewTab === "both") && (
                <HLDArchitectureFlow network={question.answer.hldNetworkFlow} />
              )}

              {(hldViewTab === "flow" || hldViewTab === "both") && question.answer.flowDiagram && (
                <FlowDiagram diagram={question.answer.flowDiagram} />
              )}
            </div>
          )}

          {/* LLD: UML Class Diagram + Behavioral State Flow */}
          {question.answer.classDiagram && (
            <div className="arch-view-wrapper" style={{ marginTop: "16px" }}>
              <div className="arch-view-tabs">
                <button
                  className={`arch-tab-btn ${lldViewTab === "class" ? "active" : ""}`}
                  onClick={() => setLldViewTab("class")}
                >
                  📐 1. UML Class Diagram (Classes, Interfaces & Relations)
                </button>
                <button
                  className={`arch-tab-btn ${lldViewTab === "flow" ? "active" : ""}`}
                  onClick={() => setLldViewTab("flow")}
                >
                  ⚡ 2. State Machine & Behavioral Flow
                </button>
                <button
                  className={`arch-tab-btn ${lldViewTab === "both" ? "active" : ""}`}
                  onClick={() => setLldViewTab("both")}
                >
                  👁️ Both LLD Views
                </button>
              </div>

              {(lldViewTab === "class" || lldViewTab === "both") && (
                <LLDClassDiagramComponent diagram={question.answer.classDiagram} />
              )}

              {(lldViewTab === "flow" || lldViewTab === "both") && question.answer.flowDiagram && (
                <FlowDiagram diagram={question.answer.flowDiagram} />
              )}
            </div>
          )}

          {/* Fallback for general questions with flowDiagram only */}
          {!question.answer.hldNetworkFlow && !question.answer.classDiagram && question.answer.flowDiagram && (
            <FlowDiagram diagram={question.answer.flowDiagram} />
          )}
        </div>

        {/* 4. Code / 45-Minute Blueprint / Pen & Paper Code */}
        <div className="answer-section">
          <div className="answer-section-label">
            <span className="answer-section-icon">💻</span>
            {isProject
              ? "4. 45-Minute Blueprint & Pen-and-Paper Code Implementation"
              : "4. Working Code Demo & Mechanics"}
          </div>

          {question.answer.penPaperCode ? (
            <div className="code-view-wrapper">
              <div className="arch-view-tabs" style={{ marginBottom: "14px" }}>
                <button
                  className={`arch-tab-btn ${codeViewTab === "blueprint" ? "active" : ""}`}
                  onClick={() => setCodeViewTab("blueprint")}
                >
                  ⏱️ 1. 45-Min Interview Roadmap Blueprint
                </button>
                <button
                  className={`arch-tab-btn ${codeViewTab === "code" ? "active" : ""}`}
                  onClick={() => setCodeViewTab("code")}
                >
                  📝 2. Pen & Paper Class Design & Working Code
                </button>
                <button
                  className={`arch-tab-btn ${codeViewTab === "both" ? "active" : ""}`}
                  onClick={() => setCodeViewTab("both")}
                >
                  👁️ Both Blueprint & Code
                </button>
              </div>

              {(codeViewTab === "blueprint" || codeViewTab === "both") && (
                <div style={{ marginBottom: codeViewTab === "both" ? "20px" : "0" }}>
                  {codeViewTab === "both" && (
                    <div className="sub-section-header">
                      <span>⏱️ 45-Minute Interview Strategy Blueprint (Steps 1–6)</span>
                    </div>
                  )}
                  <CodeBlock
                    code={question.answer.codeDemo.code}
                    language={question.answer.codeDemo.language}
                    explanation={question.answer.codeDemo.explanation}
                  />
                </div>
              )}

              {(codeViewTab === "code" || codeViewTab === "both") && (
                <div className="pen-paper-code-container">
                  <div className="pen-paper-header">
                    <div className="pen-paper-badge">
                      <span className="pulse-dot" />
                      <span>PEN & PAPER INTERVIEW CHEAT SHEET</span>
                    </div>
                    <h4 className="pen-paper-title">{question.answer.penPaperCode.title}</h4>
                    <div className="pen-paper-patterns">
                      {question.answer.penPaperCode.designPatterns.map((pat, pIdx) => (
                        <span key={pIdx} className="pattern-pill">
                          🏷️ {pat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 1. ASCII Class Diagram */}
                  <div className="pen-paper-diagram-box">
                    <div className="diagram-box-title">
                      <span>📐 Pen & Paper Class Diagram (Draw This on Whiteboard)</span>
                    </div>
                    <pre className="pen-paper-ascii">
                      <code>{question.answer.penPaperCode.classDiagramAscii}</code>
                    </pre>
                  </div>

                  {/* 2. Concrete Production-Ready Code */}
                  <div className="pen-paper-code-block" style={{ marginTop: "14px" }}>
                    <div className="diagram-box-title" style={{ marginBottom: "8px" }}>
                      <span>💻 Thread-Safe Working Code (Write This on Paper / Whiteboard)</span>
                    </div>
                    <CodeBlock
                      code={question.answer.penPaperCode.code}
                      language={question.answer.penPaperCode.language}
                      explanation={question.answer.penPaperCode.explanation}
                    />
                  </div>

                  {/* 3. Golden Talking Points */}
                  {question.answer.penPaperCode.interviewTalkingPoints && (
                    <div className="pen-paper-talking-points" style={{ marginTop: "14px" }}>
                      <div className="talking-points-title">
                        <span>💡 What to Say to the Interviewer While Writing (Brownie Points):</span>
                      </div>
                      <ul className="talking-points-list">
                        {question.answer.penPaperCode.interviewTalkingPoints.map((pt, ptIdx) => (
                          <li key={ptIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <CodeBlock
              code={question.answer.codeDemo.code}
              language={question.answer.codeDemo.language}
              explanation={question.answer.codeDemo.explanation}
            />
          )}
        </div>

        {/* 5. Give trade-offs (when to use it and when not to) */}
        <div className="answer-section answer-section-tradeoffs">
          <div className="answer-section-label">
            <span className="answer-section-icon">⚖️</span>
            5. Trade-offs (When to Use & When NOT to Use)
          </div>
          <div className="tradeoffs-box">
            <p className="answer-section-text">{question.answer.tradeoffs || question.answer.tradeOffs}</p>
          </div>
        </div>

        {/* 6. Connect it to a real system, ideally one you've used or built */}
        <div className="answer-section answer-section-production">
          <div className="answer-section-label">
            <span className="answer-section-icon">🏭</span>
            6. Connected to a Real System (In Production)
          </div>
          <div className="production-box">
            <p className="answer-section-text">{question.answer.usedInProduction}</p>
          </div>
        </div>

        {/* 7. They Might Ask Next */}
        {((question.answer.followUpQuestions || question.answer.theyMightAskNext) ?? []).length > 0 && (
          <div className="answer-section">
            <div className="answer-section-label">
              <span className="answer-section-icon">❓</span>
              7. Interviewer Follow-up Questions & Curveballs
            </div>
            <div className="followup-list">
              {((question.answer.followUpQuestions || question.answer.theyMightAskNext) ?? []).map((fq: any, idx: number) => (
                <FollowUpItem key={idx} question={fq.question} answer={fq.answer} />
              ))}
            </div>
          </div>
        )}

        {/* 8. Related Topics */}
        {question.answer.relatedTopics.length > 0 && (
          <div className="answer-section">
            <div className="answer-section-label">
              <span className="answer-section-icon">🔗</span>
              Related Topics
            </div>
            <div className="related-topics-list">
              {question.answer.relatedTopics.map((topic, idx) => {
                const topicTitle = typeof topic === 'string' ? topic : topic.title;
                const topicId = typeof topic === 'string' ? topic : topic.id;
                return (
                  <button
                    key={idx}
                    className="related-topic-chip"
                    onClick={() => onNavigateToTopic?.(topicId)}
                  >
                    {topicTitle}
                  </button>
                );
              })}
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
