"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSubjectBySlug } from "@/data/subjects";
import { Subject, Category, SubTopic, Question } from "@/types";
import Sidebar from "@/components/Sidebar";
import QuestionCard from "@/components/QuestionCard";
import { useBookmarks } from "@/components/BookmarkProvider";

interface SubjectWorkspaceContentProps {
  slug: string;
  topicId?: string;
  questionId?: string;
}

export default function SubjectWorkspaceContent({
  slug,
  topicId,
  questionId,
}: SubjectWorkspaceContentProps) {
  const router = useRouter();
  const subject = useMemo(() => getSubjectBySlug(slug), [slug]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { markRevised, isRevised } = useBookmarks();

  // Compute a flat list of all questions in order
  const allQuestions = useMemo(() => {
    if (!subject) return [];
    const flat: {
      categoryId: string;
      categoryTitle: string;
      subTopic: SubTopic;
      question: Question;
      questionIndex: number; // 0-based index within the subtopic
    }[] = [];

    for (const cat of subject.categories) {
      for (const st of cat.subTopics) {
        st.questions.forEach((q, idx) => {
          flat.push({
            categoryId: cat.id,
            categoryTitle: cat.title,
            subTopic: st,
            question: q,
            questionIndex: idx,
          });
        });
      }
    }
    return flat;
  }, [subject]);

  // Handle default redirect if topicId/questionId are missing
  useEffect(() => {
    if (subject && allQuestions.length > 0) {
      if (!topicId || !questionId) {
        const first = allQuestions[0];
        router.replace(
          `/subjects/${subject.slug}/${first.subTopic.id}/${first.question.id}`
        );
      }
    }
  }, [subject, topicId, questionId, allQuestions, router]);

  // Find the active item from the flat list
  const activeItemIndex = useMemo(() => {
    if (!topicId || !questionId) return -1;
    return allQuestions.findIndex(
      (item) => item.subTopic.id === topicId && item.question.id === questionId
    );
  }, [allQuestions, topicId, questionId]);

  const activeItem = activeItemIndex >= 0 ? allQuestions[activeItemIndex] : null;

  const prevItem = activeItemIndex > 0 ? allQuestions[activeItemIndex - 1] : null;
  const nextItem =
    activeItemIndex < allQuestions.length - 1 && activeItemIndex >= 0
      ? allQuestions[activeItemIndex + 1]
      : null;

  const handleSelectSubTopic = useCallback(
    (categoryId: string, subTopicId: string) => {
      // Find the first question of the selected subtopic
      const firstQ = allQuestions.find((q) => q.subTopic.id === subTopicId);
      if (firstQ) {
        router.push(
          `/subjects/${slug}/${firstQ.subTopic.id}/${firstQ.question.id}`
        );
      }
    },
    [router, slug, allQuestions]
  );

  const navigateToQuestion = useCallback(
    (targetTopicId: string, targetQuestionId: string) => {
      router.push(`/subjects/${slug}/${targetTopicId}/${targetQuestionId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, slug]
  );

  if (!subject) {
    return (
      <div className="empty-state" style={{ paddingTop: "120px" }}>
        <div className="empty-state-icon">🔍</div>
        <h2 className="empty-state-title">Subject not found</h2>
        <p className="empty-state-text">
          The subject you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: "16px",
            color: "var(--accent-primary)",
            textDecoration: "none",
          }}
        >
          ← Back to subjects
        </Link>
      </div>
    );
  }

  if (subject.categories.length === 0 || allQuestions.length === 0) {
    return (
      <div className="empty-state" style={{ paddingTop: "120px" }}>
        <div className="empty-state-icon">🚧</div>
        <h2 className="empty-state-title">Coming Soon</h2>
        <p className="empty-state-text">
          Content for {subject.title} is being curated by our AI. Check back soon!
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: "16px",
            color: "var(--accent-primary)",
            textDecoration: "none",
          }}
        >
          ← Back to subjects
        </Link>
      </div>
    );
  }

  // If redirecting, don't render content yet to avoid flashes
  if (!activeItem) {
    return null; 
  }

  const topicKey = `${subject.slug}/${activeItem.categoryId}/${activeItem.subTopic.id}`;
  const revised = isRevised(topicKey);

  return (
    <div className="workspace-layout">
      <Sidebar
        subject={subject}
        activeCategoryId={activeItem.categoryId}
        activeSubTopicId={activeItem.subTopic.id}
        onSelectSubTopic={handleSelectSubTopic}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>

      <div className="content-area">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <Link href="/">{subject.title}</Link>
          <span className="breadcrumb-separator">›</span>
          <span>{activeItem.categoryTitle}</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{activeItem.subTopic.title}</span>
        </div>

        {/* Topic Header */}
        <div className="topic-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <h1 className="topic-title">{activeItem.subTopic.title}</h1>
            <button
              onClick={() => markRevised(topicKey)}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-full)",
                border: revised
                  ? "1px solid var(--success)"
                  : "1px solid var(--border-primary)",
                background: revised
                  ? "rgba(34, 197, 94, 0.1)"
                  : "var(--bg-tertiary)",
                color: revised ? "var(--success)" : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                transition: "all var(--transition-fast)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {revised ? "✅ Revised" : "Mark as Revised"}
            </button>
          </div>
          <p className="topic-question-count">
            Question {activeItem.questionIndex + 1} of {activeItem.subTopic.questions.length} in this topic
          </p>
        </div>

        {/* SINGLE QUESTION RENDERING */}
        <QuestionCard
          key={activeItem.question.id}
          question={activeItem.question}
          index={activeItem.questionIndex}
        />

        {/* Next/Previous Navigation (Between Questions) */}
        {(prevItem || nextItem) && (
          <div className="nav-footer">
            {prevItem ? (
              <div
                className="nav-btn prev"
                onClick={() =>
                  navigateToQuestion(prevItem.subTopic.id, prevItem.question.id)
                }
              >
                <span className="nav-btn-label">← Previous Question</span>
                <span className="nav-btn-title">
                  {/* Truncate long question text for the button */}
                  {prevItem.question.question.length > 50 
                    ? prevItem.question.question.substring(0, 50) + "..." 
                    : prevItem.question.question}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                  {prevItem.subTopic.id !== activeItem.subTopic.id 
                    ? `From: ${prevItem.subTopic.title}` 
                    : ""}
                </span>
              </div>
            ) : (
              <div />
            )}
            
            {nextItem ? (
              <div
                className="nav-btn next"
                onClick={() =>
                  navigateToQuestion(nextItem.subTopic.id, nextItem.question.id)
                }
              >
                <span className="nav-btn-label">Next Question →</span>
                <span className="nav-btn-title">
                  {nextItem.question.question.length > 50 
                    ? nextItem.question.question.substring(0, 50) + "..." 
                    : nextItem.question.question}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                  {nextItem.subTopic.id !== activeItem.subTopic.id 
                    ? `Topic: ${nextItem.subTopic.title}` 
                    : ""}
                </span>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
