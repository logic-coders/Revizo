import { Subject } from "@/types";
import { hldFundamentalsCategory } from "./systemdesign/hld-fundamentals";
import { lldDesignPatternsCategory } from "./systemdesign/lld-design-patterns";
import { distributedSystemsCategory } from "./systemdesign/distributed-systems";
import { interviewFrameworkCategory } from "./systemdesign/interview-framework";
import { hldCaseStudiesCategory } from "./systemdesign/hld-case-studies";
import { lldCaseStudiesCategory } from "./systemdesign/lld-case-studies";
import { hldFlowDiagrams } from "./systemdesign/hld-flow-diagrams";
import { lldFlowDiagrams } from "./systemdesign/lld-flow-diagrams";
import { hldNetworkFlows } from "./systemdesign/hld-network-flows";
import { lldClassDiagrams } from "./systemdesign/lld-class-diagrams";
import { hldPenPaperCode } from "./systemdesign/hld-pen-paper-code";

// Attach working network architecture flows, diagrams & pen-paper code to HLD case studies
hldCaseStudiesCategory.subTopics.forEach((sub) => {
  sub.questions.forEach((q) => {
    if (hldFlowDiagrams[q.id]) {
      q.answer.flowDiagram = hldFlowDiagrams[q.id];
    }
    if (hldNetworkFlows[q.id]) {
      q.answer.hldNetworkFlow = hldNetworkFlows[q.id];
    }
    if (hldPenPaperCode[q.id]) {
      q.answer.penPaperCode = hldPenPaperCode[q.id];
    }
  });
});

// Attach runtime flow architecture & UML class diagrams to all 10 LLD case studies
lldCaseStudiesCategory.subTopics.forEach((sub) => {
  sub.questions.forEach((q) => {
    if (lldFlowDiagrams[q.id]) {
      q.answer.flowDiagram = lldFlowDiagrams[q.id];
    }
    if (lldClassDiagrams[q.id]) {
      q.answer.classDiagram = lldClassDiagrams[q.id];
    }
  });
});

export const systemDesignSubject: Subject = {
  id: "system-design",
  slug: "system-design",
  title: "System Design",
  tagline: "High-Level Design, Low-Level Design, and Distributed Systems blueprints",
  description: "Master modern High-Level Design (HLD), Low-Level Machine Coding (LLD), Object-Oriented Design Patterns, Capacity Estimation, and 20 Production Case Studies with complete 7-step interview frameworks.",
  icon: "📐",
  difficulty: "Intermediate to Advanced",
  totalQuestions: 120,
  color: "#0ea5e9",
  gradient: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
  categories: [
    hldFundamentalsCategory,
    lldDesignPatternsCategory,
    distributedSystemsCategory,
    interviewFrameworkCategory,
    hldCaseStudiesCategory,
    lldCaseStudiesCategory,
  ],
};
