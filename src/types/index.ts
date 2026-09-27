// Core data types for the Revizo platform

export interface FollowUpQuestion {
  question: string;
  answer: string;
}

export interface Question {
  id: string;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
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
    tradeoffs: string;
    followUpQuestions: FollowUpQuestion[];
    usedInProduction: string;
    relatedTopics: string[];
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
