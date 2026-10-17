// Core data types for the Revizo platform

export interface FollowUpQuestion {
  question: string;
  answer: string;
}

export interface FlowStep {
  step: number | string;
  title: string;
  desc?: string;
  icon?: string;
  highlight?: boolean;
}

export interface FlowBranch {
  label: string;
  color?: "green" | "amber" | "blue" | "red";
  steps: FlowStep[];
}

export interface AdvancedFeature {
  title: string;
  desc: string;
  icon?: string;
}

export interface SystemFlowDiagram {
  title: string;
  subtitle?: string;
  steps: FlowStep[];
  branches?: {
    condition: string;
    options: FlowBranch[];
  };
  postBranchSteps?: FlowStep[];
  advancedFeatures?: AdvancedFeature[];
}

export interface HLDNetworkNode {
  id: string;
  name: string;
  category: "client" | "edge" | "gateway" | "compute" | "cache" | "queue" | "database" | "storage";
  icon: string;
  role: string;
  tech: string;
}

export interface HLDNetworkConnection {
  id: string;
  from: string;
  to: string;
  label: string;
  protocol: string;
  step: number;
  highlight?: boolean;
}

export interface HLDRequestFlowStep {
  step: number;
  title: string;
  action: string;
  connectionId: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface HLDPipelineStage {
  step: number;
  nodeId: string;
  name: string;
  category: "client" | "edge" | "gateway" | "compute" | "cache" | "queue" | "database" | "storage";
  icon: string;
  tech: string;
  role: string;
  action: string;
  protocolToNext?: string;
  arrowLabel?: string;
  latency?: string;
}

export interface HLDArchitectureNetwork {
  title: string;
  subtitle: string;
  scenario: string;
  nodes: HLDNetworkNode[];
  connections: HLDNetworkConnection[];
  flowSteps: HLDRequestFlowStep[];
  pipelineStages?: HLDPipelineStage[];
}

export interface UMLClassAttribute {
  visibility: "+" | "-" | "#";
  name: string;
  type: string;
}

export interface UMLClassMethod {
  visibility: "+" | "-" | "#";
  name: string;
  parameters: string;
  returnType: string;
}

export interface UMLClassEntity {
  name: string;
  stereotype?: "interface" | "abstract" | "class" | "enum";
  patternTag?: string;
  description?: string;
  attributes: UMLClassAttribute[];
  methods: UMLClassMethod[];
}

export interface UMLClassRelationship {
  from: string;
  to: string;
  type: "implements" | "extends" | "composition" | "aggregation" | "dependency";
  label?: string;
  multiplicity?: string;
}

export interface LLDClassDiagram {
  title: string;
  subtitle: string;
  designPatterns: string[];
  classes: UMLClassEntity[];
  relationships: UMLClassRelationship[];
}

export interface PenPaperCode {
  title: string;
  designPatterns: string[];
  classDiagramAscii: string;
  language: string;
  code: string;
  explanation: string;
  interviewTalkingPoints: string[];
}

export interface ComparisonTable {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface Question {
  id: string;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Beginner" | "Intermediate" | "Advanced";
  frequency: number; // 1-5 popularity rating
  lastVerified: string; // ISO date string
  answer: {
    quickAnswer: string;
    mentalModel: string;
    whatItIs: string;
    whyItExists: string;
    codeDemo: {
      language: string;
      code: string;
      explanation?: string;
    };
    tradeoffs?: string;
    tradeOffs?: string;
    flowDiagram?: SystemFlowDiagram;
    hldNetworkFlow?: HLDArchitectureNetwork;
    classDiagram?: LLDClassDiagram;
    penPaperCode?: PenPaperCode;
    comparisonTable?: ComparisonTable | string;
    followUpQuestions?: FollowUpQuestion[];
    theyMightAskNext?: FollowUpQuestion[];
    usedInProduction: string;
    relatedTopics: (string | {title: string, id: string})[];
  };
}

export interface SubTopic {
  id: string;
  title: string;
  questions: Question[];
}

export interface Category {
  id: string;
  title: string;
  icon?: string;
  subTopics: SubTopic[];
}

export interface Subject {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string; // emoji or icon identifier
  difficulty: string;
  totalQuestions: number;
  categories: Category[];
  color: string; // primary accent color for the subject
  gradient: string; // gradient CSS for card
}

export interface SearchableItem {
  type: "question" | "subtopic" | "category";
  subjectSlug: string;
  subjectTitle: string;
  categoryId: string;
  categoryTitle: string;
  subTopicId: string;
  subTopicTitle: string;
  questionId?: string;
  questionText?: string;
  difficulty?: string;
  text: string; // combined searchable text
}
