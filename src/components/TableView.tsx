"use client";

import React, { useState } from "react";

export interface ParsedTable {
  title?: string;
  headers: string[];
  rows: string[][];
}

export function parseTableData(code: string, language: string): ParsedTable | null {
  if (!code || typeof code !== "string") return null;
  const langLower = (language || "").toLowerCase();

  // If language is a programming language, don't parse as table
  const codeLanguages = [
    "java", "python", "javascript", "typescript", "c", "cpp", "csharp",
    "go", "rust", "bash", "sh", "sql", "json", "yaml", "xml", "html"
  ];
  if (codeLanguages.includes(langLower)) {
    return null;
  }

  // Box-drawing ASCII diagrams are architecture diagrams, not data tables
  if (
    code.includes("┌") ||
    code.includes("└") ||
    code.includes("├──") ||
    code.includes("──>") ||
    code.includes("-->") ||
    code.includes("[Client App]") ||
    code.includes("[Follower]")
  ) {
    return null;
  }

  const lines = code.trim().split("\n");
  if (lines.length < 2) return null;

  // Pattern 1: Pipe Table (| Col 1 | Col 2 | ...)
  const pipeLines = lines.filter((l) => l.includes("|"));
  if (pipeLines.length >= 2) {
    let title: string | undefined;
    const firstLine = lines[0].trim();
    if (!firstLine.includes("|") && (firstLine.endsWith(":") || firstLine.length < 60)) {
      title = firstLine.replace(/[:#]+$/, "").trim();
    }

    const firstPipe = pipeLines[0].trim();
    const headers = firstPipe
      .split("|")
      .map((c) => c.trim())
      .filter((c, idx, arr) => (idx === 0 && c === "" ? false : idx === arr.length - 1 && c === "" ? false : true));

    if (headers.length >= 2) {
      const dataRows: string[][] = [];
      const remainingPipes = pipeLines.slice(1);
      for (const line of remainingPipes) {
        // Skip separator line like |---|---|
        if (/^[\s|:-]+$/.test(line.trim())) continue;
        const cols = line
          .split("|")
          .map((c) => c.trim())
          .filter((c, idx, arr) => (idx === 0 && c === "" ? false : idx === arr.length - 1 && c === "" ? false : true));
        if (cols.length > 0) {
          while (cols.length < headers.length) cols.push("");
          dataRows.push(cols.slice(0, headers.length));
        }
      }
      if (dataRows.length >= 1) {
        return { title, headers, rows: dataRows };
      }
    }
  }

  // Pattern 2: Dashed Separator Table (Header \n ---------------- \n Row 1 ...)
  const dashLineIndices = lines
    .map((l, idx) => (/^[-=\s]{5,}$/.test(l.trim()) ? idx : -1))
    .filter((idx) => idx !== -1);

  if (dashLineIndices.length >= 1) {
    const firstDash = dashLineIndices[0];
    let headerIndex = -1;
    for (let i = firstDash - 1; i >= 0; i--) {
      if (lines[i].trim().length > 0) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex >= 0) {
      let title: string | undefined;
      for (let i = headerIndex - 1; i >= 0; i--) {
        if (lines[i].trim().length > 0) {
          title = lines[i].replace(/[:#]+$/, "").trim();
          break;
        }
      }

      const headerText = lines[headerIndex];
      const rawHeaders = headerText.trim().split(/\s{2,}|\t+/);
      if (rawHeaders.length >= 2) {
        const colStarts: number[] = [];
        let searchOffset = 0;
        for (const h of rawHeaders) {
          const idx = headerText.indexOf(h, searchOffset);
          colStarts.push(idx >= 0 ? idx : searchOffset);
          searchOffset = (idx >= 0 ? idx : searchOffset) + h.length;
        }

        const dataRows: string[][] = [];
        let currentRow: string[] | null = null;
        const secondDash = dashLineIndices.length > 1 ? dashLineIndices[1] : firstDash;

        for (let i = secondDash + 1; i < lines.length; i++) {
          const line = lines[i];
          if (/^[-=\s]{5,}$/.test(line.trim())) continue;
          if (!line.trim()) continue;

          // Check if start of line has text in first column
          const firstColSlice = line.slice(0, colStarts[1] || 15).trim();
          if (firstColSlice) {
            const cols: string[] = [];
            for (let c = 0; c < colStarts.length; c++) {
              const start = colStarts[c];
              const end = c < colStarts.length - 1 ? colStarts[c + 1] : undefined;
              const val = end !== undefined ? line.slice(start, end) : line.slice(start);
              cols.push(val.trim());
            }
            if (cols.some((c) => c.length > 0)) {
              currentRow = cols;
              dataRows.push(cols);
            }
          } else if (currentRow) {
            // Continuation line
            for (let c = 1; c < colStarts.length; c++) {
              const start = colStarts[c];
              const end = c < colStarts.length - 1 ? colStarts[c + 1] : undefined;
              const val = (end !== undefined ? line.slice(start, end) : line.slice(start)).trim();
              if (val) {
                currentRow[c] = currentRow[c] ? `${currentRow[c]} ${val}` : val;
              }
            }
          }
        }

        if (dataRows.length >= 1) {
          return { title, headers: rawHeaders, rows: dataRows };
        }
      }
    }
  }

  // Pattern 3: Aligned Multi-Column Text (like CFT vs BFT)
  const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);
  if (nonEmpty.length >= 3) {
    let title: string | undefined;
    let startIdx = 0;

    if (
      nonEmpty[0].endsWith(":") ||
      /^(comparison|matrix|table|breakdown|summary|tier)/i.test(nonEmpty[0]) ||
      nonEmpty[0].includes(" vs ")
    ) {
      title = nonEmpty[0].replace(/[:#]+$/, "").trim();
      startIdx = 1;
    }

    if (startIdx < nonEmpty.length) {
      const headerLine = nonEmpty[startIdx];
      const candidateHeaders = headerLine.split(/\s{2,}|\t+/);
      if (candidateHeaders.length >= 2 && candidateHeaders.length <= 6) {
        const rows: string[][] = [];
        for (let i = startIdx + 1; i < nonEmpty.length; i++) {
          const rowLine = nonEmpty[i];
          if (rowLine.startsWith("*") || rowLine.startsWith("- ") || rowLine.startsWith("//")) {
            break;
          }
          const cols = rowLine.split(/\s{2,}|\t+/);
          if (cols.length >= 2) {
            while (cols.length < candidateHeaders.length) {
              cols.push("");
            }
            if (cols.length > candidateHeaders.length) {
              const base = cols.slice(0, candidateHeaders.length - 1);
              base.push(cols.slice(candidateHeaders.length - 1).join(" "));
              rows.push(base);
            } else {
              rows.push(cols);
            }
          }
        }

        if (rows.length >= 2) {
          return {
            title,
            headers: candidateHeaders.map((h) => h.trim()),
            rows,
          };
        }
      }
    }
  }

  return null;
}

interface TableViewProps {
  table: ParsedTable;
  onCopy?: () => void;
  copied?: boolean;
  explanation?: string;
  rawView?: React.ReactNode;
}

export default function TableView({
  table,
  onCopy,
  copied,
  explanation,
  rawView,
}: TableViewProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [internalCopied, setInternalCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      return;
    }
    // Fallback: convert table to markdown
    const mdLines: string[] = [];
    if (table.title) mdLines.push(`### ${table.title}\n`);
    mdLines.push(`| ${table.headers.join(" | ")} |`);
    mdLines.push(`| ${table.headers.map(() => "---").join(" | ")} |`);
    table.rows.forEach((row) => {
      mdLines.push(`| ${row.join(" | ")} |`);
    });
    navigator.clipboard.writeText(mdLines.join("\n"));
    setInternalCopied(true);
    setTimeout(() => setInternalCopied(false), 2000);
  };

  const isCopied = copied !== undefined ? copied : internalCopied;

  // Helper to render cell content nicely
  const renderCellContent = (cell: string, colIdx: number, isFirstCol: boolean) => {
    if (!cell) return <span style={{ color: "var(--text-tertiary)" }}>—</span>;

    // First column: attribute / dimension label
    if (isFirstCol) {
      return <span className="table-first-col">{cell}</span>;
    }

    // Formulas or code chips
    if (
      /^[N = 2F \+ 1|N = 3F \+ 1|\(N \/ 2\) \+ 1|\(2N \/ 3\) \+ 1|O\(log N\)|3F \+ 1]/.test(cell) ||
      cell.includes("N = ") ||
      cell.includes("QPS") ||
      cell.includes("O(")
    ) {
      return <code className="table-formula-chip">{cell}</code>;
    }

    // Cost chip: $, $$, $$$, $$$$$
    if (/^\${1,5}$/.test(cell.trim())) {
      const level = cell.trim().length;
      return (
        <span className={`table-cost-chip cost-level-${level}`}>
          {cell}
        </span>
      );
    }

    // Node count badge: "3 nodes", "4 nodes", "7 nodes"
    if (/^\d+\s*nodes$/i.test(cell.trim())) {
      return <span className="table-badge-chip">{cell}</span>;
    }

    return <span>{cell}</span>;
  };

  return (
    <div className="styled-table-card">
      <div className="styled-table-topbar">
        <div className="styled-table-title-area">
          <span className="styled-table-icon">📊</span>
          <span className="styled-table-title">
            {table.title || "Architectural Comparison Matrix"}
          </span>
          <span className="styled-table-tag">Structured Table</span>
        </div>

        <div className="styled-table-actions">
          {rawView && (
            <>
              <button
                type="button"
                className={`table-view-toggle-btn ${!showRaw ? "active" : ""}`}
                onClick={() => setShowRaw(false)}
                title="View as interactive formatted table"
              >
                📊 Table
              </button>
              <button
                type="button"
                className={`table-view-toggle-btn ${showRaw ? "active" : ""}`}
                onClick={() => setShowRaw(true)}
                title="View as raw text"
              >
                💻 Raw
              </button>
            </>
          )}
          <button
            type="button"
            className={`copy-btn ${isCopied ? "copied" : ""}`}
            onClick={handleCopy}
            aria-label="Copy table content"
          >
            {isCopied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {showRaw ? (
        <div className="table-raw-container">{rawView}</div>
      ) : (
        <div className="styled-table-scroll-wrapper">
          <table className="styled-comparison-table">
            <thead>
              <tr>
                {table.headers.map((header, hIdx) => (
                  <th key={hIdx} className={hIdx === 0 ? "th-primary" : "th-secondary"}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? "tr-even" : "tr-odd"}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className={cIdx === 0 ? "td-first" : "td-data"}>
                      {renderCellContent(cell, cIdx, cIdx === 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {explanation && (
        <div className="code-explanation">
          <span style={{ marginRight: "6px" }}>💡</span>
          {explanation}
        </div>
      )}
    </div>
  );
}
