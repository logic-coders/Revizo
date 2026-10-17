"use client";

import React, { useState } from "react";
import { LLDClassDiagram, UMLClassEntity, UMLClassRelationship } from "@/types";

interface LLDClassDiagramProps {
  diagram: LLDClassDiagram;
}

export default function LLDClassDiagramComponent({ diagram }: LLDClassDiagramProps) {
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null);

  if (!diagram) return null;

  const classes = diagram.classes || [];
  const relationships = diagram.relationships || [];

  // Filter connections related to currently selected class
  const activeRelationships = selectedClassName
    ? relationships.filter(
        (r) => r.from === selectedClassName || r.to === selectedClassName
      )
    : relationships;

  return (
    <div className="lld-uml-container">
      {/* 1. Header & Design Patterns Banner */}
      <div className="lld-uml-header">
        <div className="lld-uml-badge">
          <span className="pulse-dot" />
          LOW-LEVEL OBJECT-ORIENTED CLASS DIAGRAM
        </div>
        <h3 className="lld-uml-title">{diagram.title}</h3>
        {diagram.subtitle && (
          <p className="lld-uml-subtitle">{diagram.subtitle}</p>
        )}
        <div className="lld-patterns-row">
          <span className="patterns-label">Design Patterns Used:</span>
          {diagram.designPatterns.map((pat, idx) => (
            <span key={idx} className="lld-pattern-chip">
              ⭐ {pat}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Interactive Class Filter Bar */}
      <div className="lld-filter-bar">
        <span className="filter-label">Filter Class Connections:</span>
        <button
          className={`filter-chip ${selectedClassName === null ? "active" : ""}`}
          onClick={() => setSelectedClassName(null)}
        >
          All Classes ({classes.length})
        </button>
        {classes.map((cls) => (
          <button
            key={cls.name}
            className={`filter-chip ${selectedClassName === cls.name ? "active" : ""}`}
            onClick={() => setSelectedClassName(selectedClassName === cls.name ? null : cls.name)}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {/* 3. Formal UML Class Cards Grid */}
      <div className="lld-classes-grid">
        {classes.map((cls) => {
          const isSelected = selectedClassName === cls.name;
          const isConnected =
            selectedClassName &&
            relationships.some(
              (r) =>
                (r.from === selectedClassName && r.to === cls.name) ||
                (r.to === selectedClassName && r.from === cls.name)
            );
          const isDimmed = selectedClassName && !isSelected && !isConnected;

          return (
            <div
              key={cls.name}
              className={`lld-class-card ${isSelected ? "class-card-selected" : ""} ${
                isConnected ? "class-card-connected" : ""
              } ${isDimmed ? "class-card-dimmed" : ""}`}
              onClick={() => setSelectedClassName(selectedClassName === cls.name ? null : cls.name)}
            >
              {/* UML Class Header */}
              <div className={`class-card-header class-type-${cls.stereotype || "class"}`}>
                {cls.stereotype && (
                  <span className="class-stereotype">«{cls.stereotype}»</span>
                )}
                <div className="class-name-row">
                  <span className="class-name">{cls.name}</span>
                  {cls.patternTag && (
                    <span className="class-pattern-tag">{cls.patternTag}</span>
                  )}
                </div>
                {cls.description && (
                  <p className="class-description">{cls.description}</p>
                )}
              </div>

              {/* Attributes Compartment */}
              {cls.attributes && cls.attributes.length > 0 && (
                <div className="class-compartment class-attributes-compartment">
                  <div className="compartment-label">ATTRIBUTES</div>
                  <ul className="uml-members-list">
                    {cls.attributes.map((attr, aIdx) => (
                      <li key={aIdx} className="uml-member-item">
                        <span className={`visibility-badge vis-${attr.visibility}`}>
                          {attr.visibility}
                        </span>
                        <span className="member-name">{attr.name}</span>:{" "}
                        <span className="member-type">{attr.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Methods Compartment */}
              {cls.methods && cls.methods.length > 0 && (
                <div className="class-compartment class-methods-compartment">
                  <div className="compartment-label">METHODS & INTERFACE CONTRACT</div>
                  <ul className="uml-members-list">
                    {cls.methods.map((method, mIdx) => (
                      <li key={mIdx} className="uml-member-item">
                        <span className={`visibility-badge vis-${method.visibility}`}>
                          {method.visibility}
                        </span>
                        <span className="member-name">{method.name}</span>
                        <span className="member-params">({method.parameters})</span>:{" "}
                        <span className="member-return">{method.returnType}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. UML Relationships & Association Map */}
      <div className="lld-relationships-panel">
        <div className="relationships-header">
          <span className="relationships-title">
            📐 Class Relationships & Associations ({activeRelationships.length})
          </span>
          <div className="uml-legend">
            <span className="legend-item"><span className="legend-sym">··▷</span> Implements</span>
            <span className="legend-item"><span className="legend-sym">──▷</span> Extends</span>
            <span className="legend-item"><span className="legend-sym">◆──</span> Composition</span>
            <span className="legend-item"><span className="legend-sym">◇──</span> Aggregation</span>
            <span className="legend-item"><span className="legend-sym">--&gt;</span> Dependency</span>
          </div>
        </div>

        <div className="relationships-grid">
          {activeRelationships.map((rel, rIdx) => {
            const relSymbol =
              rel.type === "implements"
                ? "··▷"
                : rel.type === "extends"
                ? "──▷"
                : rel.type === "composition"
                ? "◆──"
                : rel.type === "aggregation"
                ? "◇──"
                : "--&gt;";

            return (
              <div key={rIdx} className={`relationship-card rel-type-${rel.type}`}>
                <div className="rel-nodes">
                  <span className="rel-from-badge">{rel.from}</span>
                  <span className="rel-connector-symbol" title={rel.type}>
                    {relSymbol}
                  </span>
                  <span className="rel-to-badge">{rel.to}</span>
                </div>
                <div className="rel-meta">
                  <span className="rel-type-tag">{rel.type.toUpperCase()}</span>
                  {rel.label && <span className="rel-label-text">{rel.label}</span>}
                  {rel.multiplicity && (
                    <span className="rel-multiplicity">[{rel.multiplicity}]</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
