"use client";

import React, { useState, useEffect, useRef } from "react";
import { HLDArchitectureNetwork, HLDPipelineStage } from "@/types";

interface HLDArchitectureFlowProps {
  network: HLDArchitectureNetwork;
}

export default function HLDArchitectureFlow({ network }: HLDArchitectureFlowProps) {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<"snake" | "horizontal">("snake");
  const trackRef = useRef<HTMLDivElement>(null);

  if (!network) return null;

  // Build the block-by-block pipeline stages
  const pipelineStages: HLDPipelineStage[] =
    network.pipelineStages && network.pipelineStages.length > 0
      ? network.pipelineStages
      : (network.flowSteps || []).map((st) => {
          const fromNode = network.nodes.find((n) => n.id === st.fromNodeId);
          const connection = network.connections.find((c) => c.id === st.connectionId);
          return {
            step: st.step,
            nodeId: st.fromNodeId,
            name: fromNode?.name || st.fromNodeId,
            category: (fromNode?.category || "compute") as HLDPipelineStage["category"],
            icon: fromNode?.icon || "⚙️",
            tech: fromNode?.tech || "",
            role: fromNode?.role || "",
            action: st.action,
            protocolToNext: connection?.protocol || "TCP",
            arrowLabel: connection?.label || "Next hop",
            latency: "1-5ms",
          };
        });

  // Split into rows of 3 for 3-column Grid Pipeline layout
  const rowsOf3: HLDPipelineStage[][] = [];
  for (let i = 0; i < pipelineStages.length; i += 3) {
    rowsOf3.push(pipelineStages.slice(i, i + 3));
  }

  const activeStage = pipelineStages[activeStepIdx] || pipelineStages[0];
  const nextStage = pipelineStages[activeStepIdx + 1];

  // Auto-play request animation
  useEffect(() => {
    if (!isPlaying || pipelineStages.length === 0) return;
    const interval = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % pipelineStages.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPlaying, pipelineStages.length]);

  // Scroll active card into view in horizontal track mode
  useEffect(() => {
    if (layoutMode === "horizontal" && trackRef.current) {
      const activeEl = trackRef.current.querySelector(`[data-step-index="${activeStepIdx}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeStepIdx, layoutMode]);

  const getTierColor = (category?: string) => {
    switch (category) {
      case "client":
        return "#38bdf8"; // Cyan
      case "edge":
        return "#818cf8"; // Indigo
      case "gateway":
        return "#a855f7"; // Purple
      case "compute":
        return "#22c55e"; // Green
      case "cache":
        return "#f59e0b"; // Amber
      case "queue":
        return "#f97316"; // Orange
      case "database":
        return "#ec4899"; // Rose
      case "storage":
        return "#e11d48"; // Crimson
      default:
        return "#0ea5e9";
    }
  };

  const renderStepBlock = (stage: HLDPipelineStage, globalIdx: number) => {
    const isActive = globalIdx === activeStepIdx;
    const isPassed = globalIdx < activeStepIdx;
    const tierColor = getTierColor(stage.category);

    return (
      <div
        key={globalIdx}
        className={`pipeline-block ${isActive ? "block-active" : ""} ${
          isPassed ? "block-passed" : ""
        }`}
        data-step-index={globalIdx}
        onClick={() => {
          setActiveStepIdx(globalIdx);
          setIsPlaying(false);
        }}
        style={{
          borderColor: isActive ? tierColor : undefined,
          boxShadow: isActive ? `0 0 18px ${tierColor}45` : undefined,
        }}
      >
        <div className="block-header">
          <span
            className="block-step-badge"
            style={{ background: tierColor }}
          >
            STEP {stage.step}
          </span>
          <span className="block-category-tag">
            {stage.category.toUpperCase()}
          </span>
        </div>

        <div className="block-identity">
          <span className="block-icon">{stage.icon}</span>
          <div className="block-title-group">
            <span className="block-name">{stage.name}</span>
            {stage.tech && <span className="block-tech">{stage.tech}</span>}
          </div>
        </div>

        <p className="block-action-summary">{stage.action}</p>

        <div className="block-footer-meta">
          {stage.latency && (
            <span className="block-latency-tag">
              ⏱ {stage.latency}
            </span>
          )}
          {stage.role && (
            <span className="block-role-tag">
              {stage.role}
            </span>
          )}
        </div>

        {isActive && (
          <div className="block-active-badge">
            <span className="pulse-dot" />
            ACTIVE HOP
          </div>
        )}
      </div>
    );
  };

  const renderArrowConnector = (
    stage: HLDPipelineStage,
    globalIdx: number,
    isRowTransition = false
  ) => {
    const isActive = globalIdx === activeStepIdx;

    return (
      <div
        key={`arrow-${globalIdx}`}
        className={`pipeline-arrow-connector ${isActive ? "arrow-active" : ""} ${
          isRowTransition ? "is-row-transition" : ""
        }`}
      >
        <div className="arrow-meta">
          <span className="arrow-protocol">{stage.protocolToNext}</span>
        </div>

        {/* Desktop Horizontal Line & Arrowhead */}
        <div className="arrow-line-container arrow-desktop-line">
          <div className="arrow-horizontal-line">
            <span className="arrow-pulse-particle" />
          </div>
          <svg
            className="arrow-head-svg desktop-arrow-svg"
            viewBox="0 0 16 16"
            width="14"
            height="14"
          >
            <polygon points="2,1 14,8 2,15" fill="#38bdf8" />
          </svg>
        </div>

        {/* Mobile Big Vertical Stem & Big Arrowhead */}
        <div className="arrow-line-container arrow-mobile-line">
          <div className="arrow-vertical-stem">
            <span className="arrow-vertical-pulse" />
          </div>
          <div className="arrow-big-head-wrap">
            <svg
              className="arrow-big-svg-head"
              viewBox="0 0 28 20"
              width="26"
              height="18"
            >
              <polygon points="14,20 1,3 27,3" fill="#38bdf8" />
            </svg>
          </div>
        </div>

        <span className="arrow-conn-label">{stage.arrowLabel}</span>
      </div>
    );
  };

  return (
    <div className="hld-network-container">
      {/* 1. Header Banner */}
      <div className="hld-network-header">
        <div className="hld-network-badge">
          <span className="pulse-dot" />
          SEQUENTIAL 3-COLUMN ARCHITECTURE PIPELINE
        </div>
        <h3 className="hld-network-title">{network.title}</h3>
        <p className="hld-network-subtitle">{network.subtitle}</p>
        <div className="hld-scenario-tag">
          <span className="scenario-label">End-to-End Scenario:</span>
          <span className="scenario-val">{network.scenario}</span>
        </div>
      </div>

      {/* 2. Pipeline Controls & Stepper */}
      <div className="hld-stepper-panel">
        <div className="hld-stepper-top">
          <div className="stepper-status">
            <span className="stepper-step-indicator">
              STEP {activeStepIdx + 1} OF {pipelineStages.length}
            </span>
            <span className="stepper-active-title">
              {activeStage?.name}
            </span>
          </div>

          <div className="stepper-controls-wrapper">
            {/* View Mode Toggle */}
            <div className="hld-mode-toggle">
              <button
                className={`mode-btn ${layoutMode === "snake" ? "active" : ""}`}
                onClick={() => setLayoutMode("snake")}
                title="Structured 3-column grid pipeline (Column 1 ➔ Column 2 ➔ Column 3)"
              >
                ▦ Grid Pipeline
              </button>
              <button
                className={`mode-btn ${layoutMode === "horizontal" ? "active" : ""}`}
                onClick={() => setLayoutMode("horizontal")}
                title="Continuous horizontal scroll track"
              >
                ↔ Horizontal Track
              </button>
            </div>

            {/* Simulation controls */}
            <div className="stepper-controls">
              <button
                className="stepper-btn"
                onClick={() =>
                  setActiveStepIdx((prev) =>
                    prev > 0 ? prev - 1 : pipelineStages.length - 1
                  )
                }
                aria-label="Previous step"
              >
                ◀ Prev
              </button>
              <button
                className={`stepper-btn stepper-play-btn ${isPlaying ? "playing" : ""}`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? "⏸ Pause" : "▶ Simulate Flow"}
              </button>
              <button
                className="stepper-btn"
                onClick={() =>
                  setActiveStepIdx((prev) => (prev + 1) % pipelineStages.length)
                }
                aria-label="Next step"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. The Block-by-Block Architecture Pipeline */}
      <div
        className={`hld-pipeline-viewport ${
          layoutMode === "horizontal" ? "hld-viewport-scroll" : "hld-viewport-snake"
        }`}
        ref={trackRef}
      >
        {layoutMode === "snake" ? (
          /* Structured 3-Column Grid Pipeline: Rows of 3 blocks with arrows between them */
          <div className="hld-pipeline-grid">
            {rowsOf3.map((row, rIdx) => {
              const isLastRow = rIdx === rowsOf3.length - 1;
              const nextRowFirstStage = rowsOf3[rIdx + 1]?.[0];
              const isPartialRow = row.length < 3;

              return (
                <div key={rIdx} className="grid-row-group">
                  <div className={`pipeline-grid-row ${isPartialRow ? "partial-row" : ""}`}>
                    {row.map((stage, cIdx) => {
                      const globalIdx = rIdx * 3 + cIdx;
                      const isLastInRow = cIdx === row.length - 1;
                      const isLastInWholePipeline = globalIdx === pipelineStages.length - 1;

                      return (
                        <React.Fragment key={globalIdx}>
                          {/* Step Block */}
                          {renderStepBlock(stage, globalIdx)}

                          {/* Arrow between blocks in the same row */}
                          {!isLastInRow && renderArrowConnector(stage, globalIdx, false)}

                          {/* Arrow between rows (visible in mobile view between all divs) */}
                          {isLastInRow && !isLastInWholePipeline && renderArrowConnector(stage, globalIdx, true)}

                          {/* Terminal badge at end of entire pipeline */}
                          {isLastInWholePipeline && (
                            <>
                              <div className="pipeline-arrow-connector arrow-terminal-conn">
                                <div className="arrow-meta">
                                  <span className="arrow-protocol">HTTP 200 OK</span>
                                </div>
                                <div className="arrow-line-container arrow-desktop-line">
                                  <div className="arrow-horizontal-line">
                                    <span className="arrow-pulse-particle" />
                                  </div>
                                  <svg
                                    className="arrow-head-svg desktop-arrow-svg"
                                    viewBox="0 0 16 16"
                                    width="14"
                                    height="14"
                                  >
                                    <polygon points="2,1 14,8 2,15" fill="#4ade80" />
                                  </svg>
                                </div>
                                <div className="arrow-line-container arrow-mobile-line">
                                  <div className="arrow-vertical-stem terminal-stem">
                                    <span className="arrow-vertical-pulse terminal-pulse" />
                                  </div>
                                  <div className="arrow-big-head-wrap">
                                    <svg
                                      className="arrow-big-svg-head"
                                      viewBox="0 0 28 20"
                                      width="26"
                                      height="18"
                                    >
                                      <polygon points="14,20 1,3 27,3" fill="#4ade80" />
                                    </svg>
                                  </div>
                                </div>
                                <span className="arrow-conn-label">Complete</span>
                              </div>
                              <div className="pipeline-terminal-tag">
                                <span className="terminal-check">✓</span>
                                <span className="terminal-label">RESPONSE 200 OK</span>
                              </div>
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>


                </div>
              );
            })}
          </div>
        ) : (
          /* Continuous Horizontal Scroll Track */
          <div className="hld-pipeline-track">
            {pipelineStages.map((stage, idx) => {
              const isLast = idx === pipelineStages.length - 1;

              return (
                <React.Fragment key={idx}>
                  {renderStepBlock(stage, idx)}
                  {!isLast && renderArrowConnector(stage, idx)}
                  {isLast && (
                    <div className="pipeline-terminal-tag">
                      <span className="terminal-check">✓</span>
                      <span className="terminal-label">RESPONSE 200 OK</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
