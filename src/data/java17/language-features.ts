import { Category } from "@/types";

export const java17LanguageFeaturesCategory: Category = {
  id: "java17-core-language",
  title: "Modern Language Features",
  subTopics: [
    {
      id: "records",
      title: "Java Records (JEP 395)",
      questions: [
        {
          id: "java-17-records-1",
          question: "What are Java Records and what problem do they solve?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-09-28",
          answer: {
            quickAnswer: "Records are immutable data carriers introduced in Java 14 (standardized in Java 16/17) that automatically generate boilerplate code like constructors, getters, equals(), hashCode(), and toString().",
            mentalModel: "Think of a Record like a sealed Tupperware container for your data. Once you snap the lid on (instantiate it), the data inside cannot be changed, and it perfectly fits the shape of what you put in it without you having to describe the container manually.",
            whatItIs: "A record is a special kind of class in Java designed to hold immutable data. By declaring public record Point(int x, int y) {}, the compiler automatically generates a canonical constructor, read-only accessor methods (e.g., x() and y()), and correct implementations of equals(), hashCode(), and toString() based on the components.",
            whyItExists: "Before records, creating a simple Data Transfer Object (DTO) required dozens of lines of boilerplate code or relying on third-party libraries like Lombok. Records solve this by making data-only classes concise, readable, and natively supported by the JDK.",
            comparisonTable: {
              title: "Java Records vs Traditional POJO vs Lombok",
              headers: ["Dimension", "Java Record (Java 16/17)", "Traditional POJO", "Lombok Class (@Data / @Value)"],
              rows: [
                ["Syntax & Boilerplate", "One liner: `public record User(String name, int age) {}`", "50+ lines (fields, constructor, getters, equals, hashCode, toString)", "Requires Lombok annotations (`@Data`, `@Value`, `@AllArgsConstructor`)"],
                ["Immutability", "Enforced shallow immutability (`final` class & `final` fields)", "Mutable by default unless manually written with `final`", "Immutable with `@Value`; mutable with `@Data`"],
                ["Inheritance", "Cannot extend other classes (already extends `java.lang.Record`)", "Arbitrary class inheritance allowed", "Arbitrary class inheritance allowed"],
                ["Accessor Method Naming", "Component name directly: `user.name()`", "JavaBeans style: `user.getName()`", "JavaBeans style: `user.getName()`"],
                ["External Dependencies", "Zero dependencies (native JDK standard library)", "Zero dependencies", "Requires Lombok compiler plugin & IDE annotation processor"],
                ["Serialization Protocol", "Deserialized strictly via canonical constructor (secure)", "Bypasses constructor; prone to reflection vulnerabilities", "Standard Java serialization or custom reflection"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Before Java 17 (Boilerplate)\npublic class User {\n    private final String name;\n    private final int age;\n    // ... constructor, getters, equals, hashCode, toString ...\n}\n\n// With Java 17 Records\npublic record User(String name, int age) {}\n\n// Usage\nUser user = new User(\"Alice\", 28);\nSystem.out.println(user.name()); // \"Alice\" (No 'get' prefix!)\nSystem.out.println(user); // User[name=Alice, age=28]",
              explanation: "Accessor methods in records match component names directly (user.name() instead of user.getName())."
            },
            tradeoffs: "Records are shallowly immutable. If a component holds a mutable List, external code can still modify the contents of that list unless defensively copied.",
            followUpQuestions: [
              {
                question: "Can a record implement an interface?",
                answer: "Yes, records can implement any number of interfaces (e.g. public record User(...) implements Serializable {}), but they cannot extend classes."
              },
              {
                question: "Can you add custom methods or override the constructor in a record?",
                answer: "Yes, you can add static or instance methods, and define compact constructors for validation."
              }
            ],
            usedInProduction: "Widely used for Spring Boot REST API request/response DTOs, Kafka event payload carriers, and CQRS query models.",
            relatedTopics: ["Immutability", "Lombok", "DTO Pattern", "Pattern Matching"]
          }
        },
        {
          id: "java-17-records-2",
          question: "What is a Compact Constructor in a Record, and how does it differ from a Canonical Constructor?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "A compact constructor has no parameter parentheses and no explicit field assignments; it runs before field assignment to validate and normalize input parameters cleanly.",
            mentalModel: "A security scanner at an airport terminal: you don't repack your luggage at the gate; you simply pass through the scanner where your passport is verified and normalized before you are seated.",
            whatItIs: "A canonical constructor takes all record components as parameters and assigns them to private final fields. A compact constructor eliminates the parameter list entirely (e.g. public Range { ... }). Inside, you can modify parameter values or throw IllegalArgumentException. At the end of the compact constructor block, the compiler automatically assigns the parameters to the fields.",
            whyItExists: "Eliminates repetitive parameter assignment boilerplate (this.x = x; this.y = y;) while giving developers a clean hook for validation and defensive copying.",
            comparisonTable: {
              title: "Compact Constructor vs Canonical Constructor in Records",
              headers: ["Dimension", "Compact Constructor (`public Range { ... }`)", "Canonical Constructor (`public Range(int start, int end) { ... }`)"],
              rows: [
                ["Parameter List", "Omitted entirely (parameters implicitly in scope)", "Explicit parameter declaration matching record components"],
                ["Field Assignment", "Implicit: compiler assigns parameters to fields at block end", "Manual: developer must explicitly write `this.field = param;`"],
                ["Modification of Parameters", "Allowed: can normalize parameters before implicit assignment", "Must assign normalized value explicitly to `this.field`"],
                ["Direct this.field Access", "Forbidden: accessing uninitialized `this.field` is a compiler error", "Mandatory: required to store constructor arguments into fields"],
                ["Primary Production Use", "Input validation (throwing IllegalArgumentException), normalization, defensive copies", "Custom constructor overriding or legacy interop requiring explicit field binding"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public record Range(int start, int end) {\n    // Compact constructor — no parameter list!\n    public Range {\n        if (start > end) {\n            throw new IllegalArgumentException(\"start cannot be greater than end\");\n        }\n        // Can normalize parameters directly:\n        if (start < 0) start = 0;\n        // Compiler automatically does: this.start = start; this.end = end;\n    }\n}\n\n// Usage:\nRange valid = new Range(-5, 10); // Normalizes start to 0 -> Range[start=0, end=10]\n// Range invalid = new Range(20, 10); // Throws IllegalArgumentException",
              explanation: "Notice the absence of parameter list and explicit this.start = start assignments."
            },
            tradeoffs: "You cannot assign fields explicitly inside a compact constructor (this.start = start is a compiler error).",
            followUpQuestions: [
              {
                question: "Can a record have overloaded constructors?",
                answer: "Yes, but every secondary constructor MUST delegate to the canonical constructor via this(...)."
              }
            ],
            usedInProduction: "Sanitizing and validating user input in REST API controllers before propagating data into core business services.",
            relatedTopics: ["Constructor Validation", "Canonical Constructor", "Fail-Fast"]
          }
        },
        {
          id: "java-17-records-3",
          question: "Why are Records shallowly immutable, and how do you achieve deep immutability with collections?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "Records make their component references final, but if a component references a mutable object (like ArrayList), its internal contents can still be mutated; deep immutability requires defensive copying in the constructor and accessors.",
            mentalModel: "A locked glass display case holding a puppy: the case is bolted to the floor (reference is final), but the puppy inside can still wag its tail and move around (internal state is mutable).",
            whatItIs: "Record fields are implicitly private and final. However, in Java, final on an object reference only guarantees the reference cannot point to a different object on the heap; it does NOT freeze the state of the object itself. If a record holds a List<String>, callers can still call record.items().add(\"hacked\").",
            whyItExists: "Developers often mistakenly assume records guarantee deep immutability out of the box, leading to accidental state mutation bugs in multi-threaded code.",
            codeDemo: {
              language: "java",
              code: "// FLAWED: Shallow immutability leak\npublic record OrderFlawed(String orderId, List<String> items) {}\n\n// SECURE: Deeply immutable record using defensive copy in compact constructor\npublic record OrderSecure(String orderId, List<String> items) {\n    public OrderSecure {\n        // Make an unmodifiable defensive copy during construction!\n        items = List.copyOf(items);\n    }\n}\n\nList<String> mutableList = new ArrayList<>(Arrays.asList(\"Book\", \"Pen\"));\nOrderSecure order = new OrderSecure(\"ORD-1\", mutableList);\n\nmutableList.add(\"Eraser\"); // Does NOT affect order.items()!\n// order.items().add(\"Pencil\"); // Throws UnsupportedOperationException!",
              explanation: "List.copyOf() creates an unmodifiable defensive copy, guaranteeing true immutability."
            },
            tradeoffs: "Defensive copying allocates memory; for read-only internal pipelines with trusted callers, evaluate if the copying overhead is acceptable.",
            followUpQuestions: [
              {
                question: "What does List.copyOf() do if the list is already an unmodifiable list?",
                answer: "It returns the existing list instance directly without making a redundant copy."
              }
            ],
            usedInProduction: "Caching systems and thread-safe messaging buses where state mutation across worker threads would cause race conditions.",
            relatedTopics: ["Defensive Copying", "List.copyOf", "Thread Safety"]
          }
        },
        {
          id: "java-17-records-4",
          question: "Can a Record extend another class or be extended by another class?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "No. A record implicitly extends java.lang.Record and is implicitly final; it cannot extend any other class, and no other class can extend a record.",
            mentalModel: "A record is a closed steel shipping container. It cannot be welded onto the chassis of a truck (cannot extend classes), and you cannot weld another container on top of it (cannot be extended).",
            whatItIs: "The Java Language Specification strictly enforces: (1) All records implicitly extend java.lang.Record. Because Java supports single class inheritance, a record cannot extend any other class (e.g. public record Point(...) extends BasePoint is a compile error). (2) All records are implicitly final; you cannot subclass a record.",
            whyItExists: "Preserves the mathematical semantics of algebraic data carriers. If a record could be extended with additional state, equals() and hashCode() contracts would break.",
            codeDemo: {
              language: "java",
              code: "// COMPILE ERROR: Cannot extend another class\n// public record ColoredPoint(int x, int y, String color) extends Point {} \n\n// COMPILE ERROR: Cannot extend a record\n// public class SubPoint extends Point {}\n\n// LEGAL: Records CAN implement interfaces:\npublic interface Auditable {\n    Instant createdAt();\n}\n\npublic record AuditRecord(String user, String action, Instant createdAt) implements Auditable {}\n// Perfectly valid!",
              explanation: "Records cannot participate in class inheritance, but can freely implement interfaces."
            },
            tradeoffs: "If you require polymorphism across class hierarchies with shared mutable state, use standard classes instead of records.",
            followUpQuestions: [
              {
                question: "Can a record be abstract?",
                answer: "No, a record cannot be declared abstract because it is implicitly final and must be instantiable."
              }
            ],
            usedInProduction: "Architecting domain transfer objects and sealed interface implementations in clean architecture.",
            relatedTopics: ["java.lang.Record", "Final Classes", "Inheritance"]
          }
        },
        {
          id: "java-17-records-5",
          question: "How do Records interact with JSON serialization libraries like Jackson and Spring Boot?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "Jackson 2.12+ (standard in Spring Boot 2.5+ and 3.x) natively supports Java records out of the box, using the canonical constructor for deserialization and accessors for serialization without annotations.",
            mentalModel: "Jackson speaks Record natively: it reads JSON keys and feeds them straight into the record's canonical constructor arguments without needing reflection hacks or private field injection.",
            whatItIs: "Traditional classes required Jackson to use a default no-arg constructor and set private fields via reflection or setters. Records have no no-arg constructor. Jackson detects records automatically, extracts constructor parameter names, and deserializes JSON directly through the canonical constructor.",
            whyItExists: "Eliminates @JsonCreator, @JsonProperty, and @NoArgsConstructor annotations, making API DTO layers exceptionally clean.",
            codeDemo: {
              language: "java",
              code: "import com.fasterxml.jackson.databind.ObjectMapper;\n\npublic record CustomerDto(Long id, String name, String email) {}\n\npublic class JacksonDemo {\n    public static void main(String[] args) throws Exception {\n        ObjectMapper mapper = new ObjectMapper();\n\n        // Serialization (Record -> JSON):\n        CustomerDto customer = new CustomerDto(1L, \"Alice\", \"alice@corp.com\");\n        String json = mapper.writeValueAsString(customer);\n        System.out.println(json); // {\"id\":1,\"name\":\"Alice\",\"email\":\"alice@corp.com\"}\n\n        // Deserialization (JSON -> Record):\n        CustomerDto deserialized = mapper.readValue(json, CustomerDto.class);\n        System.out.println(\"Restored: \" + deserialized.name());\n    }\n}",
              explanation: "No annotations needed; Jackson maps JSON fields directly to record components."
            },
            tradeoffs: "If the JSON property names differ from record parameter names (e.g. kebab-case vs camelCase), use @JsonProperty(\"customer_email\") on the record component.",
            followUpQuestions: [
              {
                question: "Can Java Records be used as JPA Entities?",
                answer: "No. JPA / Hibernate requires entities to have a no-arg constructor, non-final classes, and mutable proxyable fields; records cannot serve as JPA entities, but are ideal as JPA query projection DTOs (e.g. SELECT new com.app.UserDto(...) FROM User u)."
              }
            ],
            usedInProduction: "Standard pattern in Spring Boot 3 controllers for all incoming @RequestBody and outgoing ResponseEntity payloads.",
            relatedTopics: ["Jackson", "Spring Boot 3", "JPA Projections"]
          }
        },
        {
          id: "java-17-records-6",
          question: "What are Local Records and where are they most useful?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "Local records are records declared inside a method body, used as temporary strongly-typed tuples for intermediate calculations without polluting the class namespace.",
            mentalModel: "Scratch paper on your desk: you need a quick table to calculate intermediate numbers for your taxes, but you shred the scratch paper once the final tax return is signed.",
            whatItIs: "Java 16/17 allows declaring records inside methods. Unlike local classes, local records are implicitly static (they cannot capture local variables of the enclosing method). They provide type-safe intermediate data carriers in stream pipelines or complex algorithms.",
            whyItExists: "Before local records, developers either had to create awkward generic Pair<L, R> classes or pollute top-level package files with single-use helper classes.",
            codeDemo: {
              language: "java",
              code: "public List<String> getTopSpenders(List<Order> orders) {\n    // Local record declared directly inside the method:\n    record CustomerTotal(String customerName, double totalAmount) {}\n\n    return orders.stream()\n        .collect(Collectors.groupingBy(\n            Order::getCustomerName,\n            Collectors.summingDouble(Order::getAmount)\n        ))\n        .entrySet().stream()\n        // Map into local record for clean, readable intermediate sorting:\n        .map(e -> new CustomerTotal(e.getKey(), e.getValue()))\n        .sorted(Comparator.comparingDouble(CustomerTotal::totalAmount).reversed())\n        .limit(3)\n        .map(CustomerTotal::customerName)\n        .collect(Collectors.toList());\n}",
              explanation: "CustomerTotal is scoped strictly to getTopSpenders, preventing namespace pollution."
            },
            tradeoffs: "Local records cannot access non-static variables from the enclosing method; all required data must be passed as constructor components.",
            followUpQuestions: [
              {
                question: "Can local records capture local variables from the enclosing method?",
                answer: "No, local records are static by definition and cannot capture local enclosing scope."
              }
            ],
            usedInProduction: "Complex data transformation pipelines, report generation algorithms, and multi-key aggregations.",
            relatedTopics: ["Tuple Pattern", "Stream Mapping", "Local Classes"]
          }
        },
        {
          id: "java-17-records-7",
          question: "How does Java Serialization treat Records differently from regular classes?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-06",
          answer: {
            quickAnswer: "Record serialization is based purely on component state and cannot be customized via writeObject/readObject; deserialization always invokes the canonical constructor, guaranteeing validation cannot be bypassed.",
            mentalModel: "Standard serialization is a backdoor into your house where burglars can deposit objects directly into rooms without passing through the front door. Record serialization forces every object through the front door (canonical constructor) where guards check IDs.",
            whatItIs: "In standard Java serialization, readObject bypasses constructors entirely, allowing corrupted byte streams to instantiate objects in invalid states. For Records: (1) readObject, writeObject, and readObjectNoData methods are completely ignored. (2) Deserialization extracts the component stream and passes them directly to the canonical constructor. (3) serialVersionUID is always 0L by default.",
            whyItExists: "Fixes a 25-year-old security vulnerability in Java serialization where deserialization could bypass validation logic.",
            codeDemo: {
              language: "java",
              code: "public record VerifiedAccount(String accountId, double balance) implements Serializable {\n    public VerifiedAccount {\n        // This validation is GUARANTEED to run during deserialization!\n        if (balance < 0) {\n            throw new IllegalArgumentException(\"Negative balance not permitted\");\n        }\n    }\n    // If a hacker tampers with byte stream to set balance = -1000,\n    // deserialization fails with InvalidObjectException because the constructor runs!\n}",
              explanation: "Malicious serialized bytes cannot bypass the canonical constructor's validation checks."
            },
            tradeoffs: "You cannot implement custom serialization formats like custom readObject for records; if custom binary layouts are required, write a custom replacement class.",
            followUpQuestions: [
              {
                question: "Can you change the serialVersionUID of a record?",
                answer: "You can declare a serialVersionUID field, but it is not required because records have a fixed serialVersionUID requirement of 0L."
              }
            ],
            usedInProduction: "Secure distributed caching (Hazelcast, Redis) and safe inter-service RMI transport.",
            relatedTopics: ["Java Deserialization Vulnerability", "Serializable", "Security"]
          }
        }
      ]
    },
    {
      id: "sealed-classes",
      title: "Sealed Classes & Interfaces (JEP 409)",
      questions: [
        {
          id: "java-17-sealed-1",
          question: "What are Sealed Classes in Java 17 and what problem do they solve?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-09-29",
          answer: {
            quickAnswer: "Sealed classes and interfaces restrict which other classes or interfaces may extend or implement them, providing precise control over class hierarchies.",
            mentalModel: "A VIP guest list at a private event: instead of an open public door (anyone can enter) or a deadbolt lock (final class — no one can enter), the bouncer has an explicit permitted list of names (permits clause).",
            whatItIs: "Before Java 17, inheritance was binary: either a class was open to everyone (default/public) or closed to everyone (final). Sealed classes introduce a middle ground: public sealed class Shape permits Circle, Square, Triangle {}. Only the classes listed in the permits clause are allowed to extend Shape.",
            whyItExists: "Enables robust Domain-Driven Design (DDD), models Algebraic Data Types (ADT), and enables the compiler to verify exhaustive pattern matching without needing defensive default branches.",
            codeDemo: {
              language: "java",
              code: "// Sealed interface permitting only two outcomes:\npublic sealed interface PaymentResult permits Success, Failure {}\n\n// Subclasses MUST specify their own inheritance modifier:\npublic final class Success implements PaymentResult {\n    private final String transactionId;\n    public Success(String txId) { this.transactionId = txId; }\n    public String transactionId() { return transactionId; }\n}\n\npublic final class Failure implements PaymentResult {\n    private final String errorMessage;\n    public Failure(String msg) { this.errorMessage = msg; }\n    public String errorMessage() { return errorMessage; }\n}\n\n// Any other class attempting: class Pending implements PaymentResult {} -> COMPILE ERROR!",
              explanation: "The compiler rejects any unauthorized class attempting to implement PaymentResult."
            },
            tradeoffs: "Permitted subclasses must be known at compile-time and reside within the same module (or same package if unnamed module).",
            followUpQuestions: [
              {
                question: "What are the 3 mandatory modifiers for subclasses of a sealed class?",
                answer: "Every permitted subclass must explicitly declare either final, sealed, or non-sealed."
              }
            ],
            usedInProduction: "Modeling closed domain models like payment statuses, AST compiler nodes, and event-driven finite state machines.",
            relatedTopics: ["Algebraic Data Types", "final", "Pattern Matching"]
          }
        },
        {
          id: "java-17-sealed-2",
          question: "What is the difference between final, sealed, and non-sealed modifiers in permitted subclasses?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-09-30",
          answer: {
            quickAnswer: "final closes the branch completely; sealed continues restricted inheritance with its own permits list; non-sealed opens the branch back up to arbitrary unrestricted inheritance.",
            mentalModel: "final is a cul-de-sac (dead end). sealed is a gated private road with its own security booth. non-sealed is an open public highway connecting to the rest of the world.",
            whatItIs: "Every permitted subclass of a sealed class must declare one of three modifiers: (1) final: prevents any further subclassing. (2) sealed: permits only a specified subset of subclasses down the hierarchy. (3) non-sealed: removes the sealing restriction, allowing any arbitrary class to extend it.",
            whyItExists: "Gives library authors fine-grained control over which parts of a framework hierarchy remain closed vs open for extension.",
            comparisonTable: {
              title: "Permitted Subclass Modifiers: final vs sealed vs non-sealed",
              headers: ["Modifier", "Inheritance Restriction", "Hierarchy Status", "Effect on Switch Exhaustiveness"],
              rows: [
                ["final", "Strictly forbids any further subclassing", "Closed endpoint (leaf node in hierarchy tree)", "Compiler guarantees complete exhaustiveness without `default`"],
                ["sealed", "Restricted: permits only a specified subset of subclasses", "Controlled continuation of the gated hierarchy", "Compiler checks all downstream permitted subclasses recursively"],
                ["non-sealed", "Unrestricted: opens subclassing to any arbitrary class", "Open extension point (breaks sealing boundary)", "Compiler CANNOT guarantee exhaustiveness; `default` branch required"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public sealed class Vehicle permits Car, Truck, Motorcycle {}\n\n// 1. final: End of the line. Nobody can subclass Car.\npublic final class Car extends Vehicle {}\n\n// 2. sealed: Still restricted! Only SemiTruck and DumpTruck can extend Truck.\npublic sealed class Truck extends Vehicle permits SemiTruck, DumpTruck {}\npublic final class SemiTruck extends Truck {}\npublic final class DumpTruck extends Truck {}\n\n// 3. non-sealed: Re-opened! Anyone can extend Motorcycle now.\npublic non-sealed class Motorcycle extends Vehicle {}\npublic class HarleyDavidson extends Motorcycle {} // Legal!",
              explanation: "non-sealed allows HarleyDavidson to extend Motorcycle without being listed in Vehicle's permits clause."
            },
            tradeoffs: "Using non-sealed breaks compiler exhaustiveness checks in switch pattern matching for that sub-branch.",
            followUpQuestions: [
              {
                question: "Can an interface be declared final?",
                answer: "No, an interface cannot be final (it must be implemented). However, an interface CAN be sealed or non-sealed."
              }
            ],
            usedInProduction: "Frameworks like Spring Security restricting authentication tokens while allowing third-party plugins via non-sealed extension points.",
            relatedTopics: ["non-sealed", "Polymorphism", "Class Hierarchy"]
          }
        },
        {
          id: "java-17-sealed-3",
          question: "What are the compiler rules regarding package and module locations of permitted subclasses?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "Permitted subclasses must reside in the same module as the sealed class, or in the exact same package if working in an unnamed module (traditional classpath).",
            mentalModel: "You can't write someone into your will who lives in an uncharted, inaccessible foreign country that your lawyer cannot verify at probate time.",
            whatItIs: "The Java compiler enforces: (1) In a named module: the sealed class and all permitted subclasses must be declared in the same module (can be in different packages within that module). (2) In an unnamed module (no module-info.java): the sealed class and all permitted subclasses must reside in the exact same package.",
            whyItExists: "Ensures the compiler can discover and verify all subclasses at compile-time to guarantee hierarchy closure and exhaustiveness.",
            codeDemo: {
              language: "java",
              code: "// In module 'com.enterprise.billing':\npackage com.enterprise.billing.api;\n\n// Sealed interface:\npublic sealed interface Invoice permits \n    com.enterprise.billing.internal.StandardInvoice,\n    com.enterprise.billing.internal.ProformaInvoice {}\n\n// Legal because both packages are inside the SAME module 'com.enterprise.billing'!\npackage com.enterprise.billing.internal;\npublic final class StandardInvoice implements com.enterprise.billing.api.Invoice {}\npublic final class ProformaInvoice implements com.enterprise.billing.api.Invoice {}",
              explanation: "Across packages within the same module is legal; across different modules is strictly forbidden."
            },
            tradeoffs: "External consumer libraries cannot add implementations to a sealed interface unless granted a non-sealed extension point.",
            followUpQuestions: [
              {
                question: "When can the 'permits' clause be omitted?",
                answer: "When all permitted subclasses are declared inside the exact same source file (.java file) as the sealed class; the compiler infers them automatically."
              }
            ],
            usedInProduction: "Protecting proprietary core domain logic in enterprise libraries against unauthorized external overrides.",
            relatedTopics: ["JPMS", "Modules", "Access Control"]
          }
        },
        {
          id: "java-17-sealed-4",
          question: "How do Sealed Classes enable Exhaustive Pattern Matching in switch expressions without a default branch?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "Because the compiler knows every possible subclass of a sealed class at compile-time, it can verify whether a switch covers all cases; if exhaustive, no default branch is required.",
            mentalModel: "A traffic signal with only Red, Yellow, Green. If you program actions for all three lights, an 'other' condition is impossible because the physical universe of lights has been sealed.",
            whatItIs: "When switching over an instance of a sealed class/interface, if you handle every permitted subclass, the compiler recognizes the switch as exhaustive. This provides a massive advantage: if someone adds a new permitted subclass tomorrow, the compiler throws a compile error at every switch site, forcing developers to update their business logic.",
            whyItExists: "Traditional default branches hide bugs: when a new type is added, the code silently falls into default instead of failing at compile-time.",
            codeDemo: {
              language: "java",
              code: "public sealed interface Notification permits Email, SMS, Push {}\npublic record Email(String to, String body) implements Notification {}\npublic record SMS(String phone, String text) implements Notification {}\npublic record Push(String deviceToken, String msg) implements Notification {}\n\npublic class Dispatcher {\n    public void send(Notification notification) {\n        // EXHAUSTIVE: No 'default' branch needed!\n        switch (notification) {\n            case Email e -> sendEmail(e.to(), e.body());\n            case SMS s   -> sendSms(s.phone(), s.text());\n            case Push p  -> sendPushNotification(p.deviceToken(), p.msg());\n        }\n        // If someone adds 'record WhatsApp(...) implements Notification' later,\n        // this exact switch will FAIL TO COMPILE until WhatsApp is handled!\n    }\n}",
              explanation: "Omitting default turns runtime silent errors into immediate compile-time guarantees."
            },
            tradeoffs: "If any subclass in the hierarchy is declared non-sealed, the compiler cannot guarantee exhaustiveness and will require a default branch.",
            followUpQuestions: [
              {
                question: "Why is avoiding a 'default' branch considered a best practice with sealed classes?",
                answer: "Because a default branch silently consumes newly added subclasses, preventing the compiler from alerting you to unhandled business cases."
              }
            ],
            usedInProduction: "Compiler design, payment gateway response handling, and state machine transitions in financial trading platforms.",
            relatedTopics: ["Pattern Matching", "Switch Expressions", "Exhaustiveness"]
          }
        },
        {
          id: "java-17-sealed-5",
          question: "How do Sealed Interfaces compare with Enum types in Java?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "Enums represent fixed singletons with no distinct per-instance state; sealed interfaces represent fixed type families where each instance can have distinct state, constructors, and behavior.",
            mentalModel: "Enums are a set of color chips (RED, GREEN, BLUE — each is just a constant). Sealed classes are a set of blueprints (Circle with radius, Rectangle with width/height — each has distinct data).",
            whatItIs: "Enums are essentially sealed classes with a fixed set of singleton values. Sealed interfaces (Algebraic Data Types) allow each permitted subclass or record to carry its own custom fields, state, and methods, combining the closed hierarchy of enums with the rich data modeling of classes.",
            whyItExists: "Enums cannot hold unique per-event payload data; sealed interfaces solve this cleanly.",
            comparisonTable: {
              title: "Sealed Interfaces vs Enum Types Comparison",
              headers: ["Dimension", "Java Enum Types", "Sealed Interfaces / Algebraic Data Types"],
              rows: [
                ["Instance Cardinality", "Fixed singletons (exactly one instance per declared constant)", "Arbitrary instances instantiated dynamically at runtime"],
                ["State & Fields", "Constant data shared across all occurrences of the enum", "Each subclass/record can hold unique, varying per-instance state"],
                ["Type Hierarchy", "Implicitly extends `java.lang.Enum`; cannot extend classes", "Can define rich type hierarchies with records and classes"],
                ["Equality Checking", "Reference identity safe with `==`", "Value equality via `.equals()` or pattern matching"],
                ["Collection Support", "High-performance specialized `EnumSet` and `EnumMap`", "Standard collection types (`List`, `Set`, `Map`)"],
                ["Primary Use Case", "Fixed constant sets (HTTP status codes, days of week, currency codes)", "Domain events, AST syntax nodes, payment payload variants"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Enum: Fixed constant instances, no unique per-instance state\npublic enum ConnectionStatus {\n    CONNECTED, DISCONNECTED, CONNECTING\n}\n\n// Sealed Interface: Closed hierarchy, but EACH case holds rich unique data!\npublic sealed interface ConnectionEvent permits Connected, Disconnected, Connecting {}\n\npublic record Connected(String serverIp, int port, long latencyMs) implements ConnectionEvent {}\npublic record Disconnected(String reasonCode, Instant timestamp) implements ConnectionEvent {}\npublic record Connecting(int retryAttempt, Duration timeout) implements ConnectionEvent {}",
              explanation: "Each event type carries completely different metadata while belonging to the same closed family."
            },
            tradeoffs: "Enums can be compared with == and used in EnumMap/EnumSet; sealed interfaces require standard equals() or pattern matching.",
            followUpQuestions: [
              {
                question: "Can an enum implement a sealed interface?",
                answer: "Yes, an enum can be listed as a permitted subclass of a sealed interface."
              }
            ],
            usedInProduction: "Event sourcing architectures where different domain events carry distinct JSON payloads within a bounded stream.",
            relatedTopics: ["Enums", "Algebraic Data Types", "Event Sourcing"]
          }
        },
        {
          id: "java-17-sealed-6",
          question: "Can a Record be a permitted subclass of a Sealed Interface?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "Yes! Records are implicitly final, satisfying the requirement that permitted subclasses must specify their inheritance modifier.",
            mentalModel: "Peanut butter and jelly: Records provide transparent, immutable data containers; Sealed Interfaces provide the closed umbrella hierarchy. Together they create clean Algebraic Data Types.",
            whatItIs: "When public sealed interface Command permits AddUser, DeleteUser {} is defined, records can directly implement it: public record AddUser(String name) implements Command {}. Because records are automatically final, you don't even need to write the final keyword.",
            whyItExists: "This combination is the idiomatic modern Java way to express sum types (tagged unions) found in languages like Haskell, Scala, and Rust.",
            codeDemo: {
              language: "java",
              code: "public sealed interface MathExpr permits Constant, Add, Multiply {}\n\npublic record Constant(double value) implements MathExpr {}\npublic record Add(MathExpr left, MathExpr right) implements MathExpr {}\npublic record Multiply(MathExpr left, MathExpr right) implements MathExpr {}\n\n// Recursive evaluator using pattern matching on sealed records:\npublic double evaluate(MathExpr expr) {\n    return switch (expr) {\n        case Constant c -> c.value();\n        case Add a      -> evaluate(a.left()) + evaluate(a.right());\n        case Multiply m -> evaluate(m.left()) * evaluate(m.right());\n    };\n}",
              explanation: "A 10-line mathematical expression evaluator with compile-time type safety."
            },
            tradeoffs: "Records cannot extend abstract classes; they can only implement sealed interfaces.",
            followUpQuestions: [
              {
                question: "Do you need to write 'public final record'?",
                answer: "No, records are implicitly final; writing final is redundant."
              }
            ],
            usedInProduction: "Modeling ASTs (Abstract Syntax Trees), CQRS command handlers, and domain error hierarchies.",
            relatedTopics: ["Sum Types", "Pattern Matching", "Records"]
          }
        },
        {
          id: "java-17-sealed-7",
          question: "How do you check if a Class is sealed using the Java 17 Reflection API?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "Use classObj.isSealed() to check if a class is sealed, and classObj.getPermittedSubclasses() to retrieve an array of ClassDesc representing permitted subclasses.",
            mentalModel: "Looking at the building directory in the lobby: isSealed() checks if the building is a private membership club, and getPermittedSubclasses() reads the list of approved member firms.",
            whatItIs: "Java 17 added two new methods to java.lang.Class: (1) public boolean isSealed(): returns true if the class or interface is sealed. (2) public Class<?>[] getPermittedSubclasses(): returns an array of Class objects representing the permitted direct subclasses, or null if the class is not sealed.",
            whyItExists: "Allows frameworks, serialization engines, and bytecode generators to inspect and validate sealed type constraints at runtime.",
            codeDemo: {
              language: "java",
              code: "public sealed interface Service permits AuthService, PaymentService {}\npublic final class AuthService implements Service {}\npublic final class PaymentService implements Service {}\n\npublic class ReflectionDemo {\n    public static void main(String[] args) {\n        Class<?> clazz = Service.class;\n\n        System.out.println(\"Is sealed? \" + clazz.isSealed()); // true\n\n        Class<?>[] permitted = clazz.getPermittedSubclasses();\n        for (Class<?> sub : permitted) {\n            System.out.println(\"Permitted subclass: \" + sub.getSimpleName());\n        }\n        // Output:\n        // Permitted subclass: AuthService\n        // Permitted subclass: PaymentService\n    }\n}",
              explanation: "getPermittedSubclasses() allows programmatic inspection of the sealed hierarchy."
            },
            tradeoffs: "Reflection on permitted subclasses can trigger class loading of the subclasses if not already loaded.",
            followUpQuestions: [
              {
                question: "What does getPermittedSubclasses() return for a non-sealed class?",
                answer: "It returns null."
              }
            ],
            usedInProduction: "Schema generators (OpenAPI / Swagger) generating polymorphic JSON schemas (anyOf / oneOf) from sealed interfaces.",
            relatedTopics: ["Reflection API", "Class.isSealed", "OpenAPI Schemas"]
          }
        }
      ]
    },
    {
      id: "pattern-matching",
      title: "Pattern Matching (JEP 394 & 406)",
      questions: [
        {
          id: "java-17-pattern-1",
          question: "How does Pattern Matching for instanceof (JEP 394) simplify code and eliminate boilerplate?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "It combines the type check and explicit type cast into a single operation: if (obj instanceof String s), automatically declaring and casting the pattern variable s.",
            mentalModel: "An automated security scanner: it scans your luggage and, if approved, immediately unpacks the laptop onto the tray for you, rather than making you unlock and unpack it manually.",
            whatItIs: "In pre-Java 16 code, every instanceof check was immediately followed by a redundant cast: if (o instanceof String) { String s = (String) o; ... }. Pattern matching binds the cast object to a pattern variable s in the same expression.",
            whyItExists: "Eliminates repetitive, error-prone manual casts that cluttered Java codebases for 25 years.",
            comparisonTable: {
              title: "Pattern Matching for instanceof vs Traditional instanceof + Cast",
              headers: ["Dimension", "Traditional instanceof (Java 1-15)", "Pattern Matching for instanceof (Java 16+)"],
              rows: [
                ["Syntax & Steps", "Two steps: check type, then manual cast to new variable", "Single atomic step: check and declare pattern variable"],
                ["Code Sample", "`if (o instanceof String) { String s = (String) o; }`", "`if (o instanceof String s) { ... }`"],
                ["Risk of ClassCastException", "Possible if cast type accidentally differs from checked type", "Impossible: compiler guarantees type binding is strictly safe"],
                ["Flow Scoping", "Manual variable scoped strictly inside `{}` block", "Pattern variable scoped conditionally based on logical flow (`&&`)"],
                ["Null Safety", "Returns false; manual cast skipped", "Returns false; pattern variable never bound (zero NPE risk)"],
                ["equals() Method Impact", "6-8 lines of repetitive casting boilerplate", "Clean 2-line declarative type and field comparison"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "Object obj = \"Java 17 LTS\";\n\n// Old way (Pre-Java 16):\nif (obj instanceof String) {\n    String s = (String) obj; // Redundant manual cast\n    System.out.println(s.toLowerCase());\n}\n\n// Java 17 Pattern Matching:\nif (obj instanceof String s) {\n    // 's' is automatically cast and in scope!\n    System.out.println(s.toLowerCase());\n}",
              explanation: "Variable 's' is only in scope where the condition is guaranteed to be true."
            },
            tradeoffs: "Pattern variables cannot shadow existing local variables in the same scope.",
            followUpQuestions: [
              {
                question: "What happens if obj is null in 'if (obj instanceof String s)'?",
                answer: "The instanceof check returns false, 's' is not bound, and the if block is skipped safely without NullPointerException."
              }
            ],
            usedInProduction: "Writing equals() methods, request dispatchers, and polymorphic event listeners.",
            relatedTopics: ["Flow Scoping", "Type Casting", "equals Implementation"]
          }
        },
        {
          id: "java-17-pattern-2",
          question: "What is Flow Scoping in Pattern Matching and how does it work with && and || operators?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "A pattern variable is only in scope in code branches where the compiler can prove the pattern has matched; it works with &&, but causes compile errors with ||.",
            mentalModel: "A key that only exists inside the room it unlocks. In any room where the door did not unlock, the key does not physically exist.",
            whatItIs: "Flow scoping determines variable scope based on compiler reachability and boolean logic. In if (obj instanceof String s && s.length() > 5), the right side of && is only evaluated if the left side was true, so s is validly in scope! In contrast, in if (obj instanceof String s || ...), if the left side is false, the right side still executes where s was NOT matched, so using s on the right causes a compile error.",
            whyItExists: "Guarantees complete compile-time type safety: a pattern variable is never accessible when null or of an incorrect type.",
            codeDemo: {
              language: "java",
              code: "public void process(Object obj) {\n    // LEGAL: 's' is in scope on the right side of &&\n    if (obj instanceof String s && s.length() > 3) {\n        System.out.println(\"Long string: \" + s.toUpperCase());\n    }\n\n    // COMPILE ERROR: Cannot use || because if obj is NOT String, right side still runs!\n    // if (obj instanceof String s || s.length() > 3) {}\n\n    // LEGAL with Early Return:\n    if (!(obj instanceof String s)) {\n        return; // Exits if NOT string\n    }\n    // 's' is in scope for the REST of the method because compiler knows it matched!\n    System.out.println(\"Rest of method: \" + s.toLowerCase());\n}",
              explanation: "Notice how early return makes 's' accessible throughout the remainder of the method."
            },
            tradeoffs: "Developers unfamiliar with flow scoping may be confused when a variable remains in scope after an inverted if (!instanceof) block.",
            followUpQuestions: [
              {
                question: "Why does inverted if (!(obj instanceof String s)) allow 's' to be used after the block?",
                answer: "Because if the condition was false (meaning obj WAS a String), the method did not return, so obj is guaranteed to be String."
              }
            ],
            usedInProduction: "Writing clean validation guards at the start of service methods.",
            relatedTopics: ["Flow Scoping", "Defensive Programming", "Boolean Logic"]
          }
        },
        {
          id: "java-17-pattern-3",
          question: "How does Pattern Matching for instanceof modernize the traditional equals() method implementation?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "It condenses the classic 5-line equals() ceremony (null check, type check, casting) into a single, elegant one-line boolean expression.",
            mentalModel: "Revising a 3-page contract down to a single bullet point that says the exact same thing without the legal fluff.",
            whatItIs: "Pre-Java 16 equals() implementations required checking (o == this), checking (o instanceof MyClass), casting (MyClass other = (MyClass) o), and comparing fields. Pattern matching collapses the type check and field comparisons into a single return statement.",
            whyItExists: "Reduces boilerplate, avoids ClassCastException, and makes equality checks concise and scannable.",
            codeDemo: {
              language: "java",
              code: "public class Employee {\n    private final int id;\n    private final String name;\n\n    public Employee(int id, String name) { this.id = id; this.name = name; }\n\n    // Java 17 Idiomatic equals() — One clean expression!\n    @Override\n    public boolean equals(Object o) {\n        return o instanceof Employee other \n            && id == other.id \n            && Objects.equals(name, other.name);\n    }\n\n    @Override\n    public int hashCode() {\n        return Objects.hash(id, name);\n    }\n}",
              explanation: "If o is null or not an Employee, instanceof evaluates to false immediately and short-circuits."
            },
            tradeoffs: "If subclassing is allowed and symmetry is required, getClass() checks may be needed instead of instanceof depending on your domain.",
            followUpQuestions: [
              {
                question: "Does 'o instanceof Employee other' handle null checks automatically?",
                answer: "Yes, 'null instanceof Anything' always evaluates to false, so nulls are handled safely."
              }
            ],
            usedInProduction: "Standard implementation generated by modern IDEs (IntelliJ, Eclipse) and written in production POJOs.",
            relatedTopics: ["equals and hashCode", "Short-circuit Evaluation", "Objects.equals"]
          }
        },
        {
          id: "java-17-pattern-4",
          question: "What is Pattern Matching for Switch (JEP 406 preview in Java 17) and how does it handle types?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "Pattern matching for switch allows switching on any object type and matching case labels against types and patterns (e.g. case String s), replacing long if-else-if instanceof chains.",
            mentalModel: "An automated postal sorting machine: boxes arriving on the belt are routed to bins based on their physical shape (case Envelope e, case Parcel p, case Tube t) rather than checking a number tag.",
            whatItIs: "In Java 17 (previewed in 17, standardized in 21), switch can test for type patterns. Instead of switching only on primitives, Strings, and Enums, you can switch on any Object and bind typed pattern variables in each case branch.",
            whyItExists: "Eliminates repetitive and error-prone if-instanceof-else chains, providing cleaner syntax and compile-time exhaustiveness checking.",
            codeDemo: {
              language: "java",
              code: "public String formatValue(Object obj) {\n    // Pattern matching for switch:\n    return switch (obj) {\n        case Integer i -> String.format(\"Int: %d\", i);\n        case Long l    -> String.format(\"Long: %d\", l);\n        case Double d  -> String.format(\"Double: %.2f\", d);\n        case String s  -> String.format(\"String: '%s'\", s);\n        case null      -> \"Null value!\"; // Explicit null handling!\n        default        -> obj.toString();\n    };\n}",
              explanation: "Notice the explicit case null branch; switch statements historically threw NullPointerException on null."
            },
            tradeoffs: "In Java 17, this feature was in Preview mode (requires --enable-preview); it became fully standard in Java 21.",
            followUpQuestions: [
              {
                question: "How did traditional switch statements handle null before Java 17?",
                answer: "They immediately threw a NullPointerException upon evaluating switch(obj)."
              }
            ],
            usedInProduction: "Command dispatching, event routing, and JSON AST node evaluation in modern microservices.",
            relatedTopics: ["Switch Pattern Matching", "Preview Features", "JEP 406"]
          }
        },
        {
          id: "java-17-pattern-5",
          question: "What are Guarded Patterns (case String s when ... / &&) in switch pattern matching?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "Guarded patterns append a boolean condition to a type pattern (using && in Java 17 preview, or 'when' in Java 21), allowing a case branch to match only if both the type matches and the condition evaluates to true.",
            mentalModel: "A bouncer with a two-part VIP rule: 'If the guest is a Student (type check) AND their ID shows they are under 21 (guard condition), grant free entry.'",
            whatItIs: "Type matching alone is often not enough; you frequently need to check a property of the matched object. Guarded patterns allow refining the pattern: case String s && s.length() > 10 in Java 17 preview (standardized as case String s when s.length() > 10 in Java 21).",
            whyItExists: "Avoids nested if-else statements inside the case block, keeping the switch dispatch logic purely declarative.",
            codeDemo: {
              language: "java",
              code: "public void processInput(Object response) {\n    switch (response) {\n        // Guarded pattern: Matches String ONLY if length > 10\n        case String s && s.length() > 10 -> \n            System.out.println(\"Long text: \" + s.substring(0, 10) + \"...\");\n\n        // Standard pattern: Matches any other String\n        case String s -> \n            System.out.println(\"Short text: \" + s);\n\n        case Integer i && i > 0 -> \n            System.out.println(\"Positive integer: \" + i);\n\n        default -> System.out.println(\"Other object\");\n    }\n}",
              explanation: "The more specific guarded pattern must appear before the general pattern, or the compiler will warn of dominance/unreachability."
            },
            tradeoffs: "Case ordering matters: placing case String s before case String s && s.length() > 10 causes a compile error because the general pattern dominates and shadows the guarded pattern.",
            followUpQuestions: [
              {
                question: "What is Pattern Dominance in switch?",
                answer: "A compile-time error that occurs when a preceding case pattern matches a superset of a subsequent pattern, rendering the second pattern unreachable."
              }
            ],
            usedInProduction: "HTTP status code routers (e.g. case Response r && r.statusCode() >= 500) and business rule engines.",
            relatedTopics: ["Guarded Patterns", "Pattern Dominance", "Switch Expressions"]
          }
        },
        {
          id: "java-17-pattern-6",
          question: "How does explicit null handling work in Java 17 Switch Pattern Matching?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-06",
          answer: {
            quickAnswer: "Java 17 allows declaring case null directly inside a switch, executing a dedicated branch without throwing NullPointerException.",
            mentalModel: "Putting a designated mail slot labeled 'Blank / Unaddressed' on the sorting wall instead of letting the sorting machine jam and sound an alarm every time an unaddressed envelope appears.",
            whatItIs: "Historically, passing null to switch(x) resulted in an immediate, unavoidable NullPointerException before any case was evaluated. Modern switch allows case null -> ... or combined case null, default -> ..., making null a first-class citizen of switch control flow.",
            whyItExists: "Eliminates the defensive if (x == null) check that developers were forced to write before every switch statement.",
            codeDemo: {
              language: "java",
              code: "public static String describe(Object obj) {\n    return switch (obj) {\n        // Explicit null handling!\n        case null -> \"Received null reference\";\n        case String s -> \"String of length \" + s.length();\n        case Integer i -> \"Integer value: \" + i;\n        default -> \"Unknown type: \" + obj.getClass().getSimpleName();\n    };\n}\n\n// Test:\nSystem.out.println(describe(null)); // \"Received null reference\" (NO NPE!)\nSystem.out.println(describe(\"Hello\")); // \"String of length 5\"",
              explanation: "The switch inspects null safely without crashing."
            },
            tradeoffs: "If a switch does NOT have a case null branch and null is passed, it will still throw NullPointerException for backward compatibility.",
            followUpQuestions: [
              {
                question: "Can you combine null with default in a switch branch?",
                answer: "Yes, 'case null, default -> ...' handles both null and all unmatched values in a single branch."
              }
            ],
            usedInProduction: "Null-safe API response formatters and webhook event payload processors.",
            relatedTopics: ["Null Safety", "NullPointerException", "Switch Expressions"]
          }
        }
      ]
    },
    {
      id: "switch-text-blocks",
      title: "Switch Expressions & Text Blocks (JEP 361 & 378)",
      questions: [
        {
          id: "java-17-switch-1",
          question: "How do Switch Expressions differ from traditional Switch Statements in Java 17?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "Switch expressions return a value, use arrow syntax (->) to eliminate fall-through bugs without break, require exhaustive coverage, and end with a semicolon.",
            mentalModel: "A switch statement is like a sequence of hallways with doors where you might slide through multiple doors unless you hit a stop sign (break). A switch expression is a clean vending machine: you press a button, and exactly one item drops out into your hand.",
            whatItIs: "Traditional switch was purely a control flow statement. Standardized in Java 14 (part of Java 17 LTS), switch expressions: (1) Can return a value assigned to a variable. (2) Use case X -> expression which has no fall-through. (3) Support comma-separated multiple labels: case A, B, C ->. (4) Must be exhaustive (cover all possible input values or provide default).",
            whyItExists: "Eliminates notorious fall-through bugs where forgetting a break statement caused silent execution of subsequent cases.",
            comparisonTable: {
              title: "Switch Expressions vs Traditional Switch Statements",
              headers: ["Dimension", "Traditional Switch Statement", "Switch Expression (Java 14+)"],
              rows: [
                ["Classification", "Control-flow statement (does not evaluate to a value)", "First-class expression (evaluates to and returns a value)"],
                ["Syntax Format", "Colon syntax (`case X: ... break;`)", "Arrow syntax (`case X -> ...`) or colon with `yield`"],
                ["Fall-Through Behavior", "Falls through automatically unless explicit `break;` used", "Zero fall-through with arrow syntax (eliminates bug category)"],
                ["Exhaustiveness", "Not enforced by compiler (unhandled values fall through silently)", "Strictly enforced by compiler (all cases or `default` required)"],
                ["Multiple Labels", "Multiple stacked cases (`case A: case B:`)", "Comma-separated labels on single line (`case A, B ->`)"],
                ["Termination Character", "Closing brace `}`", "Closing brace with semicolon `};` (mandatory for expressions)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "DayOfWeek day = DayOfWeek.FRIDAY;\n\n// Traditional switch statement (prone to missing 'break' bugs):\nString legacyResult;\nswitch (day) {\n    case MONDAY:\n    case FRIDAY:\n        legacyResult = \"Busy Day\";\n        break;\n    default:\n        legacyResult = \"Normal Day\";\n}\n\n// Java 17 Switch Expression (concise, returns a value, NO break needed!):\nString modernResult = switch (day) {\n    case MONDAY, FRIDAY -> \"Busy Day\";\n    case SATURDAY, SUNDAY -> \"Weekend\";\n    default -> \"Normal Day\";\n}; // Semicolon required because it is an expression\n\nSystem.out.println(modernResult); // \"Busy Day\"",
              explanation: "The entire switch yields a value directly to modernResult without break statements."
            },
            tradeoffs: "Switch expressions must be exhaustive; if switching on an Enum or primitive, all possibilities must be handled or default must be supplied.",
            followUpQuestions: [
              {
                question: "Can you use the traditional colon syntax with switch expressions?",
                answer: "Yes, but you must use the yield keyword to return values (e.g. case MONDAY: yield 'Busy';)."
              }
            ],
            usedInProduction: "Mapping HTTP status codes, parsing command-line flags, and resolving business tier rates.",
            relatedTopics: ["yield keyword", "Arrow Syntax", "Fall-through"]
          }
        },
        {
          id: "java-17-switch-2",
          question: "What is the purpose of the yield keyword in Java 17 Switch Expressions?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "yield produces the final value of a multi-statement block inside a switch expression, distinguishing returning a value from the switch vs returning from the enclosing method.",
            mentalModel: "yield is a local return for the switch expression box. If you used 'return', you would exit the entire building (the method); 'yield' simply hands the item out of the vending machine (the switch).",
            whatItIs: "When a case branch in a switch expression requires multiple statements, you enclose the branch in curly braces {}. You cannot use return because return would terminate the enclosing method. yield specifies the value that the switch expression evaluates to.",
            whyItExists: "Solves the naming conflict between exiting a method (return) and resolving the value of a switch expression.",
            codeDemo: {
              language: "java",
              code: "int statusCode = 503;\n\nString statusMessage = switch (statusCode) {\n    case 200 -> \"OK\";\n    case 404 -> \"Not Found\";\n    case 500, 502, 503 -> {\n        // Multi-line block: perform logging or computation\n        System.err.println(\"Critical Server Error encountered: \" + statusCode);\n        String alertId = UUID.randomUUID().toString();\n        // yield produces the value for statusMessage:\n        yield \"Server Error [Alert: \" + alertId + \"]\";\n    }\n    default -> {\n        yield \"Unknown Status\";\n    }\n};\n\nSystem.out.println(statusMessage);",
              explanation: "yield exits the switch block with the computed String value."
            },
            tradeoffs: "yield is a contextual keyword, not a reserved word; existing variables named 'yield' will still compile.",
            followUpQuestions: [
              {
                question: "Can yield be used outside a switch expression?",
                answer: "No, yield can only be used inside a switch expression to yield a value."
              }
            ],
            usedInProduction: "Logging audit metrics and calculating fallback retry values in microservice error handlers.",
            relatedTopics: ["Contextual Keywords", "Multi-line Switch", "Control Flow"]
          }
        },
        {
          id: "java-17-text-1",
          question: "What are Text Blocks (JEP 378) in Java 17 and how do they handle multiline strings?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "Text Blocks are multiline string literals enclosed in triple double quotes (\"\"\") that preserve formatting without string concatenation or explicit \\n escape sequences.",
            mentalModel: "Writing an email in a rich text editor where you press Enter naturally, rather than writing a continuous telegram and typing 'STOP' at every line break.",
            whatItIs: "Standardized in Java 15 and part of Java 17 LTS, a text block opens with \"\"\" followed by a mandatory line break, and closes with \"\"\". Everything between the opening and closing delimiters is treated as a String literal, preserving newlines and quotes without escaping.",
            whyItExists: "Embedding SQL queries, JSON payloads, XML, and HTML inside Java previously required ugly string concatenations and dozens of escaped quotes (\\\" or \\n).",
            codeDemo: {
              language: "java",
              code: "// BEFORE Java 17 (Ugly, error-prone, hard to read):\nString oldJson = \"{\\n\" +\n                 \"  \\\"name\\\": \\\"Alice\\\",\\n\" +\n                 \"  \\\"role\\\": \\\"Admin\\\"\\n\" +\n                 \"}\";\n\n// JAVA 17 TEXT BLOCK (Clean, readable, natural):\nString newJson = \"\"\"\n    {\n      \"name\": \"Alice\",\n      \"role\": \"Admin\"\n    }\n    \"\"\";\n\nSystem.out.println(newJson);",
              explanation: "Quotes do not need backslash escaping; newlines are naturally preserved."
            },
            tradeoffs: "The opening \"\"\" must be followed by a line terminator; you cannot place text on the same line as the opening \"\"\".",
            followUpQuestions: [
              {
                question: "Can you place content on the same line as the opening triple-quotes?",
                answer: "No, the opening delimiter must be followed immediately by a newline, or the compiler throws an error."
              }
            ],
            usedInProduction: "Embedding SQL schemas in Flyway/Liquibase test scripts, mock JSON in Spring Boot tests, and HTML email templates.",
            relatedTopics: ["Multiline Strings", "JSON Formatting", "SQL Templates"]
          }
        },
        {
          id: "java-17-text-2",
          question: "How does the Java compiler differentiate Incidental Whitespace from Essential Whitespace in Text Blocks?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "The compiler determines common indentation by looking at the leftmost non-whitespace character across all lines and the position of the closing \"\"\", automatically stripping all shared leading indentation.",
            mentalModel: "A teacher adjusting test margins: if every student indented their paragraph by 4 inches to match the page margin, the teacher ignores the 4 inches (incidental) and only grades relative indents (essential).",
            whatItIs: "Incidental whitespace is the indentation added purely to align code with surrounding Java class methods. Essential whitespace is the indentation meant to be part of the actual string value. The compiler finds the minimum indentation across all lines (including the closing delimiter line) and removes it from every line.",
            whyItExists: "Prevents text blocks from carrying 20 unwanted leading spaces just because they were indented inside a nested Java method.",
            codeDemo: {
              language: "java",
              code: "public class IndentationDemo {\n    public static void main(String[] args) {\n        // The closing quotes are aligned with the 'SELECT':\n        String query1 = \"\"\"\n                SELECT id, name\n                FROM customers\n                WHERE active = true\n                \"\"\";\n        // The 16 leading spaces are incidental -> stripped completely!\n        System.out.println(\"Query 1 starts with: '\" + query1.charAt(0) + \"'\"); // 'S'\n\n        // Moving the closing quotes to the left preserves 4 spaces of essential indent:\n        String query2 = \"\"\"\n                SELECT id, name\n                FROM customers\n            \"\"\";\n        // query2 lines will retain 4 leading spaces because closing \"\"\" set the left margin!\n    }\n}",
              explanation: "The position of the closing triple-quotes defines the left boundary of the string."
            },
            tradeoffs: "Moving the closing \"\"\" further to the left adds leading spaces to all lines in the resulting runtime string.",
            followUpQuestions: [
              {
                question: "What method can strip indent programmatically from any string in Java?",
                answer: "string.stripIndent() (introduced in Java 15)."
              }
            ],
            usedInProduction: "Formatting multiline YAML configs and CLI help messages.",
            relatedTopics: ["stripIndent", "Whitespace Stripping", "Formatting"]
          }
        },
        {
          id: "java-17-text-3",
          question: "What are the new escape sequences \\s and \\ in Java 17 Text Blocks?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "\\s explicitly preserves trailing whitespace (which the compiler strips by default); \\ suppresses line terminators to allow writing a single logical line across multiple source lines.",
            mentalModel: "\\s is an anchor holding invisible spaces in place. \\ is a needle and thread sewing two lines of text into one seamless continuous line.",
            whatItIs: "Text blocks automatically strip trailing whitespace from every line by default. (1) \\s translates to a single ASCII space (0x20) and prevents the compiler from stripping preceding trailing spaces. (2) \\ at the end of a line acts as a line-continuation character, preventing the newline from being included in the resulting string.",
            whyItExists: "Provides precise control over trailing spaces in fixed-width formats and prevents long SQL queries from wrapping newlines if not desired.",
            codeDemo: {
              language: "java",
              code: "// 1. Using \\ to write a long single-line query without newlines:\nString singleLineQuery = \"\"\"\n    SELECT user_id, email, first_name, last_name \\\n    FROM users \\\n    WHERE account_status = 'ACTIVE'\\\n    \"\"\";\n// The string contains NO newline characters! It is one continuous line:\nSystem.out.println(\"Line count: \" + singleLineQuery.lines().count()); // 1\n\n// 2. Using \\s to preserve fixed-width padding:\nString fixedWidth = \"\"\"\n    Header      \\s\n    Row1        \\s\n    \"\"\";\n// All trailing spaces up to \\s are strictly preserved!",
              explanation: "Notice \\s preserves the trailing margin; \\ suppresses line feeds."
            },
            tradeoffs: "Placing \\s accidentally in SQL queries or JSON strings can create invisible whitespace syntax errors.",
            followUpQuestions: [
              {
                question: "Can \\s and \\ be used in standard quoted strings (\"...\")?",
                answer: "Yes, both \\s and \\ work in regular single-line string literals as well in Java 15+."
              }
            ],
            usedInProduction: "Generating fixed-width mainframe flat files (COBOL banking interfaces) and clean SQL queries.",
            relatedTopics: ["Escape Sequences", "Fixed Width Files", "String.lines"]
          }
        },
        {
          id: "java-17-text-4",
          question: "How does String.formatted() simplify templating with Text Blocks in Java 17?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "formatted(Object... args) is an instance method on String that works like String.format() but can be called fluently on any string or text block directly.",
            mentalModel: "Filling out a pre-printed form: instead of putting the form through an external printing machine (String.format(form, a, b)), the form has a self-filling stamp (form.formatted(a, b)).",
            whatItIs: "Java 15 introduced public String formatted(Object... args). Instead of wrapping a text block inside verbose String.format(\"\"\"...\"\"\", arg1, arg2), you chain .formatted() directly at the closing delimiter.",
            whyItExists: "Improves readability and eliminates awkward nested parenthesis syntax when injecting variables into multiline templates.",
            codeDemo: {
              language: "java",
              code: "String host = \"prod-db.internal\";\nint port = 5432;\nString dbName = \"orders\";\n\n// Fluent templating with .formatted():\nString dbConfig = \"\"\"\n    {\n      \"database\": {\n        \"host\": \"%s\",\n        \"port\": %d,\n        \"name\": \"%s\"\n      }\n    }\n    \"\"\".formatted(host, port, dbName);\n\nSystem.out.println(dbConfig);",
              explanation: ".formatted() is called directly on the text block, making template injection clean and readable."
            },
            tradeoffs: "Formatting specifiers like %s and %d must match argument counts and types, or an IllegalFormatException is thrown.",
            followUpQuestions: [
              {
                question: "What did Java 21 preview to improve on .formatted()?",
                answer: "String Templates (STR.\"...\"), allowing direct embedded variable expressions like STR.\"Hello \\{name}\"."
              }
            ],
            usedInProduction: "Dynamic HTML email generation, mock HTTP response stubs in WireMock, and Docker Compose YAML templating.",
            relatedTopics: ["String.format", "String Templates", "Templating"]
          }
        }
      ]
    }
  ]
};
