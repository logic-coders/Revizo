import { getAllSubjectSlugs, getSubjectBySlug } from "@/data/subjects";
import type { Metadata } from "next";
import SubjectPage from "./SubjectClient";

export function generateStaticParams() {
  return getAllSubjectSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) {
    return { title: "Subject Not Found — Revizo" };
  }

  return {
    title: `${subject.title} Interview Questions — Revizo`,
    description: subject.description,
    keywords: [
      `${subject.title} interview questions`,
      `${subject.title} interview preparation`,
      "software engineer interview",
      "coding interview",
    ],
    openGraph: {
      title: `${subject.title} Interview Questions — Revizo`,
      description: subject.description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SubjectPage slug={slug} />;
}
