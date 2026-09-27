import * as fs from "fs";
import * as path from "path";
import { subjects as currentSubjects } from "../src/data/subjects";

// 1. Read and parse subtopics
const rawText = fs.readFileSync(path.join(__dirname, "subtopics.txt"), "utf8");
const lines = rawText.split("\\n").map(l => l.trim()).filter(Boolean);

const subjectMap: Record<string, string[]> = {};
let currentSubject = "";

for (const line of lines) {
  if ([
    "Java 8", "Java 17", "Spring Boot", "Python", 
    "Apache Kafka", "Redis", "AI / ML"
  ].includes(line)) {
    currentSubject = line;
    subjectMap[currentSubject] = [];
  } else {
    if (currentSubject) {
      subjectMap[currentSubject].push(line);
    }
  }
}

// 2. Extract existing questions
// We want to preserve existing questions. We'll map them by question text (normalized)
const questionBank: Record<string, Record<string, any>> = {};

for (const s of currentSubjects) {
  const sTitle = s.title;
  questionBank[sTitle] = questionBank[sTitle] || {};
  for (const c of s.categories) {
    for (const st of c.subTopics) {
      for (const q of st.questions) {
        questionBank[sTitle][q.question.toLowerCase().trim()] = q;
      }
    }
  }
}

// 3. Rebuild subjects
const newSubjects = currentSubjects.map(s => {
  const newS = { ...s };
  const stTitles = subjectMap[s.title];
  if (!stTitles) return newS;

  // We will divide the topics into chunks to form categories
  const chunkSize = Math.ceil(stTitles.length / 3);
  const cat1 = stTitles.slice(0, chunkSize);
  const cat2 = stTitles.slice(chunkSize, chunkSize * 2);
  const cat3 = stTitles.slice(chunkSize * 2);

  const newCategories = [];
  if (cat1.length > 0) {
    newCategories.push({
      id: "part-1", title: "Core Concepts",
      subTopics: cat1.map((t, idx) => ({
        id: "topic-1-" + idx, title: t, questions: [] as any[]
      }))
    });
  }
  if (cat2.length > 0) {
    newCategories.push({
      id: "part-2", title: "Intermediate Concepts",
      subTopics: cat2.map((t, idx) => ({
        id: "topic-2-" + idx, title: t, questions: [] as any[]
      }))
    });
  }
  if (cat3.length > 0) {
    newCategories.push({
      id: "part-3", title: "Advanced Concepts",
      subTopics: cat3.map((t, idx) => ({
        id: "topic-3-" + idx, title: t, questions: [] as any[]
      }))
    });
  }

  // Assign questions back by checking if any question title fits the subtopic title loosely
  // Since we restructured, the existing questions might not map perfectly. We will just distribute them.
  // Actually, let's just dump ALL existing questions for the subject into the FIRST subtopic, 
  // or better, try to find a subtopic that shares words.
  const allQs = Object.values(questionBank[s.title] || {});
  for (const q of allQs) {
    let placed = false;
    for (const c of newCategories) {
      for (const t of c.subTopics) {
        // Simple heuristic: if any word > 4 chars matches
        const words = t.title.toLowerCase().split(/\\W+/).filter((w: string) => w.length > 3);
        if (words.some((w: string) => q.question.toLowerCase().includes(w))) {
          t.questions.push(q);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    // If not placed, put in first topic
    if (!placed && newCategories[0] && newCategories[0].subTopics[0]) {
      newCategories[0].subTopics[0].questions.push(q);
    }
  }

  newS.categories = newCategories as any;
  return newS;
});

// 4. Write back
const outputContent = `import { Subject } from "@/types";

export const subjects: Subject[] = ${JSON.stringify(newSubjects, null, 2)};

export function getSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}

export function getAllSubjectSlugs(): string[] {
  return subjects.map((s) => s.slug);
}

export function getSearchableItems(): import("@/types").SearchableItem[] {
  const items: import("@/types").SearchableItem[] = [];
  for (const subject of subjects) {
    for (const category of subject.categories) {
      for (const subTopic of category.subTopics) {
        items.push({
          type: "subtopic",
          subjectSlug: subject.slug,
          subjectTitle: subject.title,
          categoryId: category.id,
          categoryTitle: category.title,
          subTopicId: subTopic.id,
          subTopicTitle: subTopic.title,
          questionId: subTopic.questions[0]?.id,
          text: subject.title + " " + category.title + " " + subTopic.title,
        });
        for (const question of subTopic.questions) {
          items.push({
            type: "question",
            subjectSlug: subject.slug,
            subjectTitle: subject.title,
            categoryId: category.id,
            categoryTitle: category.title,
            subTopicId: subTopic.id,
            subTopicTitle: subTopic.title,
            questionId: question.id,
            questionText: question.question,
            difficulty: question.difficulty,
            text: subject.title + " " + category.title + " " + subTopic.title + " " + question.question,
          });
        }
      }
    }
  }
  return items;
}
`;

fs.writeFileSync(path.join(__dirname, "../src/data/subjects-schema.ts"), outputContent);
fs.writeFileSync(path.join(__dirname, "../src/data/subjects.ts"), outputContent);

console.log("Successfully rebuilt schema and preserved questions!");
