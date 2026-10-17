"use client";

import React, { useState } from "react";
import { SystemFlowDiagram, FlowStep, FlowBranch } from "@/types";

interface FlowDiagramProps {
  diagram: SystemFlowDiagram;
}

export default function FlowDiagram({ diagram }: FlowDiagramProps) {
  const [activeStepId, setActiveStepId] = useState<string | number | null>(null);

  if (!diagram) return null;

  return (
    <div className="flow-diagram-container">
      {/* 1. Diagram Main Header */}
      <div className="flow-diagram-header">
        <div className="flow-diagram-badge">
          <span className="pulse-dot" />
          ARCHITECTURE FLOW DIAGRAM
        </div>
        <h2 className="flow-diagram-title">{diagram.title}</h2>
        {diagram.subtitle && (
          <p className="flow-diagram-subtitle">{diagram.subtitle}</p>
        )}
        <div className="flow-diagram-meta-bar">
          <span className="meta-pill">
            <span className="meta-dot cyan" /> Sequential Hops
          </span>
          {diagram.branches && (
            <span className="meta-pill">
              <span className="meta-dot amber" /> Conditional Branching
            </span>
          )}
          {diagram.postBranchSteps && (
            <span className="meta-pill">
              <span className="meta-dot emerald" /> Async Convergence
            </span>
          )}
        </div>
      </div>

      <div className="flow-canvas">
        {/* Phase 1: Sequential Ingestion Hops */}
        <div className="flow-phase-tag">
          <span className="phase-icon">⚡</span>
          <span>PHASE 1: REQUEST PIPELINE & EVALUATION</span>
        </div>

        {diagram.steps &&
          diagram.steps.map((step, idx) => {
            const isLastStep = idx === diagram.steps.length - 1;
            const hasBranches = Boolean(diagram.branches);
            const isCurrentActive = activeStepId === step.step;

            return (
              <React.Fragment key={`step-${idx}`}>
                <div
                  className={`flow-node ${step.highlight || isCurrentActive ? "flow-node-highlight" : ""}`}
                  onMouseEnter={() => setActiveStepId(step.step)}
                  onMouseLeave={() => setActiveStepId(null)}
                >
                  <div className="flow-node-badge">
                    <span className="badge-step-lbl">STEP</span>
                    <span className="badge-step-num">{step.step}</span>
                  </div>
                  <div className="flow-node-content">
                    <div className="flow-node-icon-tile">{step.icon || "⚡"}</div>
                    <div className="flow-node-text-group">
                      <div className="flow-node-title">{step.title}</div>
                      {step.desc && (
                        <div className="flow-node-desc">{step.desc}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prominent High-Visibility Directional Flow Arrow */}
                <div className="flow-connector">
                  <div className="flow-connector-track">
                    <div className="flow-connector-line">
                      <span className="flow-pulse-particle" />
                    </div>
                    <div className="flow-arrow-head-wrap">
                      <svg
                        className="flow-arrow-svg"
                        viewBox="0 0 24 16"
                        width="20"
                        height="14"
                      >
                        <path
                          d="M12 16L0 2h24L12 16z"
                          fill="url(#cyanFlowGrad)"
                        />
                        <defs>
                          <linearGradient
                            id="cyanFlowGrad"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#818cf8" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

        {/* Phase 2: Decision Gateway & Visual Branching Tree */}
        {diagram.branches && (
          <div className="flow-branches-wrapper">
            {/* Decision Gate Hub Card */}
            <div className="flow-decision-gate-card">
              <div className="decision-gate-icon">⚖️</div>
              <div className="decision-gate-content">
                <div className="decision-gate-badge">
                  <span className="branch-cond-icon">🔀</span>
                  <span>EVALUATION DECISION GATE</span>
                </div>
                <div className="decision-gate-title">
                  {diagram.branches.condition}
                </div>
                <div className="decision-gate-subtitle">
                  State evaluated atomically — branches diverge based on outcome
                </div>
              </div>
            </div>

            {/* Visual Bifurcation Tree with Directional Branch Arrows */}
            <div className="flow-branch-fork-visual">
              <div className="fork-stem-down" />
              <div className="fork-horizontal-bar" />
              <div className="fork-legs-row">
                {diagram.branches.options.map((branch, bIdx) => {
                  const isGreen = branch.color === "green";
                  return (
                    <div
                      key={`fork-leg-${bIdx}`}
                      className={`fork-leg fork-leg-${branch.color || "blue"}`}
                    >
                      <div className="fork-leg-line" />
                      <div className="fork-leg-label">
                        {isGreen ? "✓ ALLOW / PASS" : "✕ THROTTLE / 429"}
                      </div>
                      <div className="fork-leg-arrow">
                        <svg
                          viewBox="0 0 24 16"
                          width="18"
                          height="12"
                          className="flow-arrow-svg"
                        >
                          <path
                            d="M12 16L0 2h24L12 16z"
                            fill={isGreen ? "#4ade80" : "#f87171"}
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phase 3: Branch Columns Grid */}
            <div className="flow-branches-grid">
              {diagram.branches.options.map((branch, bIdx) => {
                const isGreen = branch.color === "green";
                const branchColorClass = `flow-branch-${branch.color || "blue"}`;

                return (
                  <div
                    key={`branch-col-${bIdx}`}
                    className={`flow-branch-column ${branchColorClass}`}
                  >
                    <div className="flow-branch-header">
                      <div className="branch-header-badge">
                        <span className="branch-badge-icon">
                          {isGreen ? "✓" : "✕"}
                        </span>
                        <span className="branch-badge-text">{branch.label}</span>
                      </div>
                      <div className="branch-header-desc">
                        {isGreen
                          ? "Execution proceeds through downstream cluster"
                          : "Request rejected at edge to protect system"}
                      </div>
                    </div>

                    <div className="flow-branch-steps">
                      {branch.steps.map((bStep, sIdx) => {
                        const isCurrentActive = activeStepId === bStep.step;
                        const isLastInBranch = sIdx === branch.steps.length - 1;

                        return (
                          <React.Fragment key={`branch-step-${sIdx}`}>
                            <div
                              className={`flow-node flow-node-branch ${isCurrentActive ? "flow-node-highlight" : ""}`}
                              onMouseEnter={() => setActiveStepId(bStep.step)}
                              onMouseLeave={() => setActiveStepId(null)}
                            >
                              <div
                                className={`flow-node-badge flow-node-badge-sm ${isGreen ? "badge-green" : "badge-red"}`}
                              >
                                {bStep.step}
                              </div>
                              <div className="flow-node-content">
                                <div className="flow-node-icon-tile flow-icon-sm">
                                  {bStep.icon || "⚙️"}
                                </div>
                                <div className="flow-node-text-group">
                                  <div className="flow-node-title">
                                    {bStep.title}
                                  </div>
                                  {bStep.desc && (
                                    <div className="flow-node-desc">
                                      {bStep.desc}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Internal Branch Connector Arrow */}
                            {!isLastInBranch && (
                              <div
                                className={`flow-connector flow-connector-branch ${isGreen ? "connector-green" : "connector-red"}`}
                              >
                                <div className="flow-connector-track branch-track">
                                  <div className="flow-connector-line">
                                    <span className="flow-pulse-particle" />
                                  </div>
                                  <div className="flow-arrow-head-wrap">
                                    <svg
                                      viewBox="0 0 24 16"
                                      width="16"
                                      height="11"
                                      className="flow-arrow-svg"
                                    >
                                      <path
                                        d="M12 16L0 2h24L12 16z"
                                        fill={isGreen ? "#4ade80" : "#f87171"}
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phase 4: Convergence Tree into Post-Branch Steps */}
            {diagram.postBranchSteps && diagram.postBranchSteps.length > 0 && (
              <div className="flow-convergence-wrapper">
                <div className="convergence-tree-visual">
                  <div className="convergence-horizontal-bar" />
                  <div className="convergence-stem-down" />
                </div>

                <div className="flow-convergence-badge">
                  <span className="pulse-dot" />
                  <span>🔀 PIPELINE CONVERGES — ASYNC TELEMETRY & SYNC</span>
                </div>

                <div className="flow-connector">
                  <div className="flow-connector-track">
                    <div className="flow-connector-line">
                      <span className="flow-pulse-particle" />
                    </div>
                    <div className="flow-arrow-head-wrap">
                      <svg
                        className="flow-arrow-svg"
                        viewBox="0 0 24 16"
                        width="20"
                        height="14"
                      >
                        <path
                          d="M12 16L0 2h24L12 16z"
                          fill="url(#cyanFlowGrad)"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 5: Post-Branch Steps (Telemetry, Invalidation, Replication) */}
        {diagram.postBranchSteps && diagram.postBranchSteps.length > 0 && (
          <div className="flow-post-branch-section">
            <div className="flow-phase-tag phase-tag-secondary">
              <span className="phase-icon">📊</span>
              <span>PHASE 3: ASYNC TELEMETRY & STATE SYNCHRONIZATION</span>
            </div>

            {diagram.postBranchSteps.map((step, idx) => {
              const isCurrentActive = activeStepId === step.step;
              const isLastPostStep = idx === diagram.postBranchSteps!.length - 1;

              return (
                <React.Fragment key={`post-step-${idx}`}>
                  <div
                    className={`flow-node ${step.highlight || isCurrentActive ? "flow-node-highlight" : ""}`}
                    onMouseEnter={() => setActiveStepId(step.step)}
                    onMouseLeave={() => setActiveStepId(null)}
                  >
                    <div className="flow-node-badge">
                      <span className="badge-step-lbl">STEP</span>
                      <span className="badge-step-num">{step.step}</span>
                    </div>
                    <div className="flow-node-content">
                      <div className="flow-node-icon-tile">{step.icon || "📱"}</div>
                      <div className="flow-node-text-group">
                        <div className="flow-node-title">{step.title}</div>
                        {step.desc && (
                          <div className="flow-node-desc">{step.desc}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isLastPostStep && (
                    <div className="flow-connector">
                      <div className="flow-connector-track">
                        <div className="flow-connector-line">
                          <span className="flow-pulse-particle" />
                        </div>
                        <div className="flow-arrow-head-wrap">
                          <svg
                            className="flow-arrow-svg"
                            viewBox="0 0 24 16"
                            width="20"
                            height="14"
                          >
                            <path
                              d="M12 16L0 2h24L12 16z"
                              fill="url(#cyanFlowGrad)"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Phase 6: Advanced Subsystems & Optimizations */}
        {diagram.advancedFeatures && diagram.advancedFeatures.length > 0 && (
          <div className="flow-advanced-features-box">
            <div className="advanced-features-header">
              <span className="advanced-features-tag">
                ⭐ Production Architectural Subsystems & Resiliency
              </span>
            </div>
            <div className="advanced-features-grid">
              {diagram.advancedFeatures.map((feat, fIdx) => (
                <div key={`feat-${fIdx}`} className="advanced-feature-card">
                  <div className="feature-icon">{feat.icon || "🚀"}</div>
                  <div className="feature-info">
                    <div className="feature-title">{feat.title}</div>
                    <div className="feature-desc">{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 7: Process Completed Terminal Node */}
        <div className="flow-terminal-node">
          <div className="terminal-dot-wrap">
            <span className="terminal-check">✓</span>
          </div>
          <div className="terminal-text-block">
            <span className="terminal-title">
              END-TO-END EXECUTION COMPLETED
            </span>
            <span className="terminal-desc">
              All pipeline stages verified • Invariants preserved • Client response dispatched
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

