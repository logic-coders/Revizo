import { getAllSubjectSlugs, getSubjectBySlug } from "@/data/subjects";
import type { Metadata } from "next";
import SubjectPage from "../../SubjectClient";

export function generateStaticParams() {
  const params: { slug: string; topicId: string; questionId: string }[] = [];
  const slugs = getAllSubjectSlugs();
  
  for (const slug of slugs) {
    const subject = getSubjectBySlug(slug);
    if (!subject) continue;
    
    for (const category of subject.categories) {
      for (const topic of category.subTopics) {
        for (const question of topic.questions) {
          params.push({
            slug: subject.slug,
            topicId: topic.id,
            questionId: question.id,
          });
        }
      }
    }
  }
  
  // Legacy / transition routes so browsers on previous URLs don't hit Next.js missing param error
  const legacySqlPaths = [
    { slug: "sql", topicId: "sql-execution-order", questionId: "sql-exec-order" },
    { slug: "sql", topicId: "sql-execution-order", questionId: "sql-where-vs-having" },
    { slug: "sql", topicId: "sql-execution-order", questionId: "sql-delete-truncate-drop" },
    { slug: "sql", topicId: "sql-execution-order", questionId: "sql-union-vs-union-all" },
    { slug: "sql", topicId: "sql-execution-order", questionId: "sql-primary-vs-unique" },
    { slug: "sql", topicId: "sql-joins", questionId: "sql-joins-matrix" },
    { slug: "sql", topicId: "sql-joins", questionId: "sql-null-count" },
    { slug: "sql", topicId: "sql-joins", questionId: "sql-group-by-rollup" },
    { slug: "sql", topicId: "sql-classic-problems", questionId: "sql-nth-highest-salary" },
    { slug: "sql", topicId: "sql-classic-problems", questionId: "sql-rank-dense-rank-row-number" },
    { slug: "sql", topicId: "sql-classic-problems", questionId: "sql-find-delete-duplicates" },
    { slug: "sql", topicId: "sql-classic-problems", questionId: "sql-lag-lead-mom" },
    { slug: "sql", topicId: "sql-indexing", questionId: "sql-clustered-vs-nonclustered" },
    { slug: "sql", topicId: "sql-indexing", questionId: "sql-index-scan-vs-seek" },
    { slug: "sql", topicId: "sql-indexing", questionId: "sql-sargable-queries" },
    { slug: "sql", topicId: "sql-concurrency-acid", questionId: "sql-acid-isolation-levels" },
    { slug: "sql", topicId: "sql-concurrency-acid", questionId: "sql-cte-vs-subquery-vs-temp-table" },
    { slug: "sql", topicId: "sql-concurrency-acid", questionId: "sql-optimistic-vs-pessimistic-db" },
  ];
  for (const legacy of legacySqlPaths) {
    if (!params.some(p => p.slug === legacy.slug && p.topicId === legacy.topicId && p.questionId === legacy.questionId)) {
      params.push(legacy);
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; topicId: string; questionId: string }>;
}): Promise<Metadata> {
  const { slug, topicId, questionId } = await params;
  const subject = getSubjectBySlug(slug);
  
  if (!subject) {
    return { title: "Subject Not Found — Revizo" };
  }

  // Find specific question to set better title
  let questionTitle = "";
  for (const cat of subject.categories) {
    for (const topic of cat.subTopics) {
      if (topic.id === topicId) {
        const q = topic.questions.find(q => q.id === questionId);
        if (q) {
          questionTitle = q.question;
        }
      }
    }
  }

  const pageTitle = questionTitle 
    ? `${questionTitle} | ${subject.title} — Revizo`
    : `${subject.title} Interview Questions — Revizo`;

  return {
    title: pageTitle,
    description: subject.description,
    keywords: [
      `${subject.title} interview questions`,
      `${subject.title} interview preparation`,
      "software engineer interview",
      "coding interview",
    ],
    openGraph: {
      title: pageTitle,
      description: subject.description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; topicId: string; questionId: string }>;
}) {
  const { slug, topicId, questionId } = await params;
  return <SubjectPage slug={slug} topicId={topicId} questionId={questionId} />;
}
