"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

interface BookmarkContextType {
  bookmarks: Set<string>;
  toggleBookmark: (questionId: string) => void;
  isBookmarked: (questionId: string) => boolean;
  revisedTopics: Set<string>;
  markRevised: (topicKey: string) => void;
  isRevised: (topicKey: string) => boolean;
  getProgressForSubject: (subjectSlug: string, totalTopics: number) => number;
}

const BookmarkContext = createContext<BookmarkContextType>({
  bookmarks: new Set(),
  toggleBookmark: () => {},
  isBookmarked: () => false,
  revisedTopics: new Set(),
  markRevised: () => {},
  isRevised: () => false,
  getProgressForSubject: () => 0,
});

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [revisedTopics, setRevisedTopics] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem("revizo-bookmarks");
      if (storedBookmarks) {
        setBookmarks(new Set(JSON.parse(storedBookmarks)));
      }
      const storedRevised = localStorage.getItem("revizo-revised");
      if (storedRevised) {
        setRevisedTopics(new Set(JSON.parse(storedRevised)));
      }
    } catch {
      // ignore parse errors
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("revizo-bookmarks", JSON.stringify([...bookmarks]));
    }
  }, [bookmarks, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("revizo-revised", JSON.stringify([...revisedTopics]));
    }
  }, [revisedTopics, mounted]);

  const toggleBookmark = useCallback((questionId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (questionId: string) => bookmarks.has(questionId),
    [bookmarks]
  );

  const markRevised = useCallback((topicKey: string) => {
    setRevisedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicKey)) {
        next.delete(topicKey);
      } else {
        next.add(topicKey);
      }
      return next;
    });
  }, []);

  const isRevised = useCallback(
    (topicKey: string) => revisedTopics.has(topicKey),
    [revisedTopics]
  );

  const getProgressForSubject = useCallback(
    (subjectSlug: string, totalTopics: number) => {
      if (totalTopics === 0) return 0;
      const revised = [...revisedTopics].filter((key) =>
        key.startsWith(`${subjectSlug}/`)
      ).length;
      return Math.round((revised / totalTopics) * 100);
    },
    [revisedTopics]
  );

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        toggleBookmark,
        isBookmarked,
        revisedTopics,
        markRevised,
        isRevised,
        getProgressForSubject,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}
