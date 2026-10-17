import { Subject } from "@/types";
import { java17LanguageFeaturesCategory } from "./java17/language-features";
import { java17FoundationCategory } from "./java17/foundation-features";
import { java17ConcurrencyCategory } from "./java17/concurrency";
import { java17JvmGcCategory } from "./java17/jvm-gc-internals";
import { java17ModulesMigrationCategory } from "./java17/modules-migration";

export const java17Subject: Subject = {
  id: "java-17",
  slug: "java-17",
  title: "Java 17",
  tagline: "Records, sealed classes, pattern matching, JVM enhancements, and Project Loom",
  description: "Master modern Java 17 LTS features — from Records, Sealed Classes, Pattern Matching, and Text Blocks to Modern Garbage Collectors (ZGC, Shenandoah), JMM/Concurrency, and JPMS.",
  icon: "☕",
  difficulty: "Intermediate to Advanced",
  totalQuestions: 100,
  color: "#5382a1",
  gradient: "linear-gradient(135deg, #5382a1 0%, #f89820 100%)",
  categories: [
    java17LanguageFeaturesCategory,
    java17FoundationCategory,
    java17ConcurrencyCategory,
    java17JvmGcCategory,
    java17ModulesMigrationCategory,
  ],
};
