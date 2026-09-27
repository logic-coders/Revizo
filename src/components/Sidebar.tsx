"use client";

import { Subject, Category, SubTopic } from "@/types";
import { useState, useEffect } from "react";
import { useBookmarks } from "./BookmarkProvider";

interface SidebarProps {
  subject: Subject;
  activeCategoryId: string | null;
  activeSubTopicId: string | null;
  onSelectSubTopic: (categoryId: string, subTopicId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  subject,
  activeCategoryId,
  activeSubTopicId,
  onSelectSubTopic,
  isOpen,
  onClose,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const { isRevised, getProgressForSubject } = useBookmarks();

  // Count total sub-topics for progress
  const totalSubTopics = subject.categories.reduce(
    (acc, cat) => acc + cat.subTopics.length,
    0
  );
  const progress = getProgressForSubject(subject.slug, totalSubTopics);

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
                {subject.totalQuestions} questions · {totalSubTopics} topics
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
                    return (
                      <div
                        key={subTopic.id}
                        className={`sidebar-subtopic-link ${
                          activeSubTopicId === subTopic.id ? "active" : ""
                        }`}
                        onClick={() => {
                          onSelectSubTopic(category.id, subTopic.id);
                          onClose();
                        }}
                      >
                        <span style={{ fontSize: "0.7rem" }}>
                          {revised ? "✅" : "○"}
                        </span>
                        <span>{subTopic.title}</span>
                        <span className="sidebar-subtopic-count">
                          {subTopic.questions.length}
                        </span>
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
