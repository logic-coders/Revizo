"use client";

import { Subject, Category, SubTopic } from "@/types";
import { useState, useEffect } from "react";
import { useBookmarks } from "./BookmarkProvider";

interface SidebarProps {
  subject: Subject;
  activeCategoryId: string | null;
  activeSubTopicId: string | null;
  activeQuestionId?: string | null;
  onSelectSubTopic: (categoryId: string, subTopicId: string) => void;
  onSelectQuestion?: (categoryId: string, subTopicId: string, questionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  subject,
  activeCategoryId,
  activeSubTopicId,
  activeQuestionId,
  onSelectSubTopic,
  onSelectQuestion,
  isOpen,
  onClose,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [expandedSubTopics, setExpandedSubTopics] = useState<Set<string>>(
    new Set()
  );
  const { isRevised, getProgressForSubject, isBookmarked } = useBookmarks();

  // Count total sub-topics for progress
  const totalSubTopics = subject.categories.reduce(
    (acc, cat) => acc + cat.subTopics.length,
    0
  );
  const progress = getProgressForSubject(subject.slug, totalSubTopics);

  // Dynamically compute total questions — never stale
  const totalQuestionsActual = subject.categories.reduce(
    (acc, cat) =>
      acc +
      cat.subTopics.reduce((subAcc, st) => subAcc + (st.questions?.length || 0), 0),
    0
  );

  // Expand active category by default
  useEffect(() => {
    if (activeCategoryId) {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        next.add(activeCategoryId);
        return next;
      });
    }
  }, [activeCategoryId]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleSubTopic = (subTopicId: string) => {
    setExpandedSubTopics((prev) => {
      const next = new Set(prev);
      if (next.has(subTopicId)) {
        next.delete(subTopicId);
      } else {
        next.add(subTopicId);
      }
      return next;
    });
  };

  const getTotalQuestionsForCategory = (category: Category): number => {
    return category.subTopics.reduce((acc, st) => acc + st.questions.length, 0);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 80,
          }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-subject-info">
            <div className="sidebar-subject-icon">{subject.icon}</div>
            <div>
              <div className="sidebar-subject-name">{subject.title}</div>
              <div className="sidebar-subject-count">
                {totalQuestionsActual} questions · {totalSubTopics} topics
              </div>
            </div>
          </div>
          <div className="sidebar-progress">
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-text">
              {progress}% topics revised
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {subject.categories.map((category) => (
            <div key={category.id} className="sidebar-category">
              <button
                className="sidebar-category-btn"
                onClick={() => toggleCategory(category.id)}
              >
                <span className="sidebar-category-icon">
                  {category.icon || "📂"}
                </span>
                <span>{category.title}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
                  {getTotalQuestionsForCategory(category)}
                </span>
                <span
                  className={`sidebar-category-chevron ${
                    expandedCategories.has(category.id) ? "expanded" : ""
                  }`}
                >
                  ▶
                </span>
              </button>

              {expandedCategories.has(category.id) && (
                <div className="sidebar-subtopics">
                  {category.subTopics.map((subTopic) => {
                    const topicKey = `${subject.slug}/${category.id}/${subTopic.id}`;
                    const revised = isRevised(topicKey);
                    const isSubTopicExpanded = expandedSubTopics.has(subTopic.id);
                    const hasQuestions = subTopic.questions && subTopic.questions.length > 0;

                    return (
                      <div key={subTopic.id} className="sidebar-subtopic-group">
                        <div
                          className={`sidebar-subtopic-link ${
                            activeSubTopicId === subTopic.id ? "active" : ""
                          }`}
                          onClick={() => {
                            if (hasQuestions) {
                              toggleSubTopic(subTopic.id);
                            } else {
                              onSelectSubTopic(category.id, subTopic.id);
                              onClose();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (hasQuestions) {
                                toggleSubTopic(subTopic.id);
                              } else {
                                onSelectSubTopic(category.id, subTopic.id);
                                onClose();
                              }
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isSubTopicExpanded}
                        >
                          <span style={{ fontSize: "0.7rem" }}>
                            {revised ? "✅" : "○"}
                          </span>
                          <span className="sidebar-subtopic-title">
                            {subTopic.title}
                          </span>
                          <span className="sidebar-subtopic-count">
                            {subTopic.questions.length}
                          </span>
                          {hasQuestions && (
                            <span
                              className={`sidebar-subtopic-chevron ${
                                isSubTopicExpanded ? "expanded" : ""
                              }`}
                            >
                              ▶
                            </span>
                          )}
                        </div>

                        {/* Collapsible Questions List */}
                        {isSubTopicExpanded && hasQuestions && (
                          <div className="sidebar-questions-list">
                            {subTopic.questions.map((question, qIdx) => {
                              const isQActive =
                                activeSubTopicId === subTopic.id &&
                                activeQuestionId === question.id;
                              const bookmarked = isBookmarked(question.id);

                              return (
                                <button
                                  key={question.id}
                                  type="button"
                                  className={`sidebar-question-btn ${
                                    isQActive ? "active" : ""
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectQuestion) {
                                      onSelectQuestion(category.id, subTopic.id, question.id);
                                    } else {
                                      onSelectSubTopic(category.id, subTopic.id);
                                    }
                                    onClose();
                                  }}
                                  title={question.question}
                                >
                                  <span className="sidebar-question-num">
                                    {qIdx + 1}
                                  </span>
                                  <span className="sidebar-question-title">
                                    {question.question}
                                  </span>
                                  {bookmarked && (
                                    <span
                                      className="sidebar-question-bookmark"
                                      title="Bookmarked"
                                    >
                                      🔖
                                    </span>
                                  )}
                                  {question.difficulty && (
                                    <span
                                      className={`sidebar-question-diff ${question.difficulty.toLowerCase()}`}
                                      title={`Difficulty: ${question.difficulty}`}
                                    >
                                      {question.difficulty === "Easy"
                                        ? "E"
                                        : question.difficulty === "Medium"
                                        ? "M"
                                        : "H"}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
