import { Subject } from "@/types";
import { java8BasicsCategory } from "./java8/basics";
import { java8FunctionalInterfacesCategory } from "./java8/functional-interfaces";
import { java8StreamsCategory } from "./java8/streams";
import { java8CollectorsCategory } from "./java8/collectors";
import { java8ConcurrencyCategory } from "./java8/concurrency";
import { java8OptionalDateTimeCategory } from "./java8/optional-datetime-utils";

export const java8Subject: Subject = {
  id: "java-8",
  slug: "java-8",
  title: "Java 8",
  tagline: "Lambda expressions, Streams, and functional programming",
  description: "Master the revolutionary features introduced in Java 8 — from lambda expressions and the Stream API to the new Date/Time API, CompletableFuture, and Optional class.",
  icon: "☕",
  difficulty: "Beginner to Advanced",
  totalQuestions: 111,
  color: "#f89820",
  gradient: "linear-gradient(135deg, #f89820 0%, #e76f00 100%)",
  categories: [
    java8BasicsCategory,
    java8FunctionalInterfacesCategory,
    java8StreamsCategory,
    java8CollectorsCategory,
    java8ConcurrencyCategory,
    java8OptionalDateTimeCategory,
  ],
};
