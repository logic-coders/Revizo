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
