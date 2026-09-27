import * as fs from "fs";
import * as path from "path";

const mockQuestion = {
  id: "java-17-records-1",
  question: "What are Java Records and what problem do they solve?",
  difficulty: "Intermediate",
  frequency: 5,
  lastVerified: "2026-09-28",
  answer: {
    quickAnswer: "Records are immutable data carriers introduced in Java 14 (standardized in 16/17) that automatically generate boilerplate code like constructors, getters, equals(), hashCode(), and toString().",
    mentalModel: "Think of a Record like a sealed Tupperware container for your data. Once you snap the lid on (instantiate it), the data inside cannot be changed, and it perfectly fits the shape of what you put in it without you having to describe the container manually.",
    whatItIs: "A record is a special kind of class in Java designed to hold immutable data. By declaring `public record Point(int x, int y) {}`, the compiler automatically generates a canonical constructor, read-only accessor methods (e.g., `x()` and `y()`), and correct implementations of `equals()`, `hashCode()`, and `toString()` based on the components.",
    whyItExists: "Before records, creating a simple Data Transfer Object (DTO) required dozens of lines of boilerplate code or relying on third-party libraries like Lombok. Records solve this by making data-only classes concise, readable, and natively supported by the JDK.",
    codeDemo: {
      language: "java",
      code: `// Before Java 17 (Boilerplate)
public class User {
    private final String name;
    private final int age;
    // ... constructor, getters, equals, hashCode, toString ...
}

// With Java 17 Records
public record User(String name, int age) {}

// Usage
User user = new User("Alice", 28);
System.out.println(user.name()); // "Alice"
System.out.println(user); // User[name=Alice, age=28]`
    },
    tradeOffs: "Records are strictly immutable (shallowly). You cannot extend a record (they are implicitly final) and they cannot extend other classes. If you need mutable state or complex inheritance hierarchies, records are not the right tool.",
    theyMightAskNext: [
      {
        question: "Can a record implement an interface?",
        answer: "Yes, records can implement interfaces (e.g., `public record User(...) implements Serializable {}`), but they cannot extend classes."
      },
      {
        question: "Can you add custom methods or override the constructor in a record?",
        answer: "Yes. You can add static or instance methods, and you can define a 'compact constructor' to add validation logic without redefining the parameters."
      }
    ],
    usedInProduction: "At modern Java shops, records are heavily used for DTOs in Spring Boot REST APIs, configuration objects, and pattern matching inside switch expressions.",
    relatedTopics: [
      { title: "Pattern Matching", id: "pattern-matching" },
      { title: "Sealed Classes", id: "sealed-classes" }
    ]
  }
};

const outputDir = path.join(process.cwd(), "content", "generated", "java-17", "records");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "java-17-records-1.json"), JSON.stringify(mockQuestion, null, 2));
console.log("Mock question created at " + path.join(outputDir, "java-17-records-1.json"));
