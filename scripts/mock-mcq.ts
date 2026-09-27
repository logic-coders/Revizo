import * as fs from "fs";
import * as path from "path";

const mcqs = [
  {
    "id": "spring-boot-auto-configuration-001",
    "subject": "Spring Boot",
    "subtopic": "Auto-Configuration",
    "difficulty": "Beginner",
    "questionText": "Which annotation triggers Spring Boot's auto-configuration mechanism?",
    "questionType": "MCQ",
    "options": [
      "@SpringBootConfiguration",
      "@EnableAutoConfiguration",
      "@AutoConfigure",
      "@ComponentScan"
    ],
    "correctAnswer": "@EnableAutoConfiguration",
    "explanation": "@EnableAutoConfiguration tells Spring Boot to start adding beans based on classpath settings, other beans, and various property settings. It is usually implicitly applied via @SpringBootApplication.",
    "tags": ["core", "annotations"],
    "createdBy": "AI-generated",
    "reviewed": false
  },
  {
    "id": "spring-boot-auto-configuration-002",
    "subject": "Spring Boot",
    "subtopic": "Auto-Configuration",
    "difficulty": "Intermediate",
    "questionText": "How does Spring Boot determine which auto-configuration classes to evaluate at startup?",
    "questionType": "MCQ",
    "options": [
      "By scanning all packages for classes ending in 'AutoConfiguration'",
      "By reading the spring.factories file or org.springframework.boot.autoconfigure.AutoConfiguration.imports file",
      "By reflecting over all classes annotated with @Configuration",
      "By checking the application.properties for the 'spring.autoconfigure.classes' property"
    ],
    "correctAnswer": "By reading the spring.factories file or org.springframework.boot.autoconfigure.AutoConfiguration.imports file",
    "explanation": "Spring Boot uses the SpringFactoriesLoader mechanism (or the new .imports file in Boot 2.7+) to locate the fully qualified names of auto-configuration classes bundled inside starter jars.",
    "tags": ["internals", "startup"],
    "createdBy": "AI-generated",
    "reviewed": false
  },
  {
    "id": "spring-boot-auto-configuration-003",
    "subject": "Spring Boot",
    "subtopic": "Auto-Configuration",
    "difficulty": "Intermediate",
    "questionText": "Which conditional annotation ensures an auto-configuration bean is only created if a specific class is present on the classpath?",
    "questionType": "MCQ",
    "options": [
      "@ConditionalOnBean",
      "@ConditionalOnClass",
      "@ConditionalOnProperty",
      "@ConditionalOnResource"
    ],
    "correctAnswer": "@ConditionalOnClass",
    "explanation": "@ConditionalOnClass is evaluated during the auto-configuration phase to check if a required dependency (class) exists on the classpath before attempting to configure its related beans.",
    "tags": ["conditionals", "classpath"],
    "createdBy": "AI-generated",
    "reviewed": false
  },
  {
    "id": "spring-boot-auto-configuration-004",
    "subject": "Spring Boot",
    "subtopic": "Auto-Configuration",
    "difficulty": "Intermediate",
    "questionText": "You want to completely disable a specific auto-configuration class (e.g., DataSourceAutoConfiguration). What is the most standard way to do this?",
    "questionType": "MCQ",
    "options": [
      "Remove the database driver from the classpath.",
      "Use the 'exclude' attribute on @SpringBootApplication or @EnableAutoConfiguration.",
      "Set 'spring.datasource.enabled=false' in application.properties.",
      "Override the DataSource bean and return null."
    ],
    "correctAnswer": "Use the 'exclude' attribute on @SpringBootApplication or @EnableAutoConfiguration.",
    "explanation": "The exclude attribute (e.g., @SpringBootApplication(exclude = DataSourceAutoConfiguration.class)) explicitly tells Spring Boot to skip that specific auto-configuration class entirely.",
    "tags": ["configuration", "overrides"],
    "createdBy": "AI-generated",
    "reviewed": false
  },
  {
    "id": "spring-boot-auto-configuration-005",
    "subject": "Spring Boot",
    "subtopic": "Auto-Configuration",
    "difficulty": "Advanced",
    "questionText": "In what order are auto-configuration classes processed relative to user-defined @Configuration classes?",
    "questionType": "MCQ",
    "options": [
      "Auto-configuration classes are processed strictly BEFORE user-defined @Configuration classes.",
      "Auto-configuration classes are processed strictly AFTER user-defined @Configuration classes.",
      "They are processed concurrently in alphabetical order.",
      "The order is non-deterministic unless @AutoConfigureOrder is used."
    ],
    "correctAnswer": "Auto-configuration classes are processed strictly AFTER user-defined @Configuration classes.",
    "explanation": "Spring Boot evaluates user-defined beans first. This allows auto-configuration to back off (e.g., via @ConditionalOnMissingBean) if the user has already explicitly defined a bean of that type.",
    "tags": ["internals", "bean-lifecycle"],
    "createdBy": "AI-generated",
    "reviewed": false
  }
];

const outputDir = path.join(process.cwd(), "content", "mcq-generated");
fs.mkdirSync(outputDir, { recursive: true });

const filePath = path.join(outputDir, "spring-boot-auto-configuration.json");
fs.writeFileSync(filePath, JSON.stringify(mcqs, null, 2));

console.log(`✅ Saved 5 Mock MCQs to ${filePath}`);
