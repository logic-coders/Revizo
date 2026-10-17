import { Subject } from "@/types";
import { springBootCoreCategory } from "./springboot/core-config";
import { springBootWebCategory } from "./springboot/web-rest";
import { springBootDataCategory } from "./springboot/data-access";
import { springBootSecurityCategory } from "./springboot/security";
import { springBootMicroservicesCategory } from "./springboot/microservices";
import { springBootActuatorTestingCategory } from "./springboot/actuator-testing";

export const springBootSubject: Subject = {
  id: "spring-boot",
  slug: "spring-boot",
  title: "Spring Boot",
  tagline: "Build production-ready cloud applications, microservices, and enterprise APIs",
  description: "Master modern Spring Boot 3 — from Auto-Configuration, IoC, REST APIs, and Spring Data JPA to Spring Security 6, Distributed Tracing, Kafka, Resilience4j, and GraalVM Native Images.",
  icon: "🍃",
  difficulty: "Intermediate to Advanced",
  totalQuestions: 100,
  color: "#6db33f",
  gradient: "linear-gradient(135deg, #6db33f 0%, #4a8c2a 100%)",
  categories: [
    springBootCoreCategory,
    springBootWebCategory,
    springBootDataCategory,
    springBootSecurityCategory,
    springBootMicroservicesCategory,
    springBootActuatorTestingCategory,
  ],
};
