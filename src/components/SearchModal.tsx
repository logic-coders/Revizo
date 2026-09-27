"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { getSearchableItems } from "@/data/subjects";
import type { SearchableItem } from "@/types";

interface SearchModalProps {
  onClose: () => void;
}

export default function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fuse = useMemo(() => {
    const items = getSearchableItems();
    return new Fuse(items, {
      keys: [
        { name: "questionText", weight: 3 },
        { name: "subTopicTitle", weight: 2 },
        { name: "categoryTitle", weight: 1 },
        { name: "subjectTitle", weight: 1 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const fuseResults = fuse.search(query, { limit: 15 });
      setResults(fuseResults.map((r) => r.item));
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, fuse]);

  const navigateToResult = (item: SearchableItem) => {
    if (item.questionId) {
      router.push(`/subjects/${item.subjectSlug}/${item.subTopicId}/${item.questionId}`);
    } else {
      router.push(`/subjects/${item.subjectSlug}`);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigateToResult(results[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search questions, topics, and subjects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-primary)",
              fontSize: "0.7rem",
              color: "var(--text-tertiary)",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            ESC
          </kbd>
        </div>

        <div className="search-results">
          {query.length >= 2 && results.length === 0 && (
            <div className="search-empty">
              <p style={{ fontSize: "1.5rem", marginBottom: "8px" }}>🔍</p>
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {results.map((item, idx) => (
            <div
              key={`${item.subTopicId}-${item.questionId || "st"}-${idx}`}
              className="search-result-item"
              style={{
                background:
                  idx === selectedIndex ? "var(--bg-tertiary)" : "transparent",
              }}
              onClick={() => navigateToResult(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <span className="search-result-title">
                {item.type === "question" ? (
                  <>
                    <span style={{ color: "var(--accent-primary)", marginRight: "6px" }}>
                      Q
                    </span>
                    {item.questionText}
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: "6px" }}>📁</span>
                    {item.subTopicTitle}
                  </>
                )}
              </span>
              <span className="search-result-path">
                {item.subjectTitle} → {item.categoryTitle} → {item.subTopicTitle}
                {item.difficulty && (
                  <span
                    style={{
                      marginLeft: "8px",
                      color:
                        item.difficulty === "Easy"
                          ? "var(--success)"
                          : item.difficulty === "Medium"
                          ? "var(--warning)"
                          : "var(--error)",
                    }}
                  >
                    • {item.difficulty}
                  </span>
                )}
              </span>
            </div>
          ))}

          {query.length < 2 && (
            <div className="search-empty">
              <p style={{ fontSize: "1.5rem", marginBottom: "8px" }}>⌨️</p>
              <p>Type at least 2 characters to search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
