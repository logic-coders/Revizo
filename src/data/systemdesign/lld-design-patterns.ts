import { Category } from "@/types";

export const lldDesignPatternsCategory: Category = {
  id: "lld-design-patterns",
  title: "Low-Level Design (LLD) & Design Patterns",
  subTopics: [
    {
      id: "solid-principles",
      title: "SOLID Principles & Clean Architecture",
      questions: [
        {
          id: "lld-solid-1",
          question: "What is the Single Responsibility Principle (SRP) and how do you spot and refactor violations?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A class should have one, and only one, reason to change. A common violation is a 'God Class' that mixes business calculations, database persistence, and email notifications in a single class. Refactor by extracting persistence to a Repository, formatting to a Presenter, and notifications to an EmailService.",
            mentalModel: "A Swiss Army Knife has scissors, a knife, and a corkscrew, but it's terrible at cutting steak, opening wine, and trimming hair. In software, you want specialized chef's knives, dedicated scissors, and professional corkscrews so sharpening the knife doesn't break the scissors.",
            whatItIs: "The 'S' in SOLID, coined by Robert C. Martin (Uncle Bob). 'Reason to change' refers to stakeholders: if marketing changes email rules, accounting changes tax math, and DBAs change table schemas, all three should NOT touch the same class.",
            whyItExists: "High cohesion and low coupling: classes with a single responsibility are easy to test in isolation, reuse across features, and merge in Git without merge conflicts.",
            codeDemo: {
              language: "java",
              code: "// ❌ SRP VIOLATION: 3 reasons to change (business logic, DB, email formatting)\npublic class InvoiceService {\n    public void calculateTotal(Invoice inv) { /* math logic */ }\n    public void saveToDatabase(Invoice inv) { /* raw SQL INSERT */ }\n    public void sendEmailNotification(Invoice inv) { /* HTML email template */ }\n}\n\n// ✅ REFACTORED TO SRP: Each class has 1 single responsibility\npublic class InvoiceCalculator {\n    public BigDecimal calculateTotal(Invoice inv) { ... }\n}\n\npublic class InvoiceRepository {\n    public void save(Invoice inv) { ... }\n}\n\npublic class InvoiceNotifier {\n    public void sendNotification(Invoice inv) { ... }\n}"
            },
            tradeoffs: "Over-fragmentation: breaking code into too many tiny 5-line classes can introduce excessive boilerplate and make tracing execution flow difficult. Balance responsibility with practical cohesion.",
            theyMightAskNext: [
              {
                question: "How does SRP relate to Microservices?",
                answer: "SRP applies at the architectural service level as well: a microservice should model a single business domain capability (e.g. Order Service vs Notification Service vs Payment Service) with one team ownership."
              }
            ],
            usedInProduction: "Standard code review requirement in enterprise Java: services never contain raw database SQL, and controllers never contain business calculations.",
            relatedTopics: ["Open/Closed Principle", "Interface Segregation", "Dependency Inversion"]
          }
        },
        {
          id: "lld-solid-2",
          question: "How do you implement the Open/Closed Principle (OCP) using the Strategy Pattern to eliminate switch-cases?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Software entities (classes, modules, functions) should be OPEN for extension, but CLOSED for modification. When adding a new feature (like a new Payment Method), you should write a new class implementing an interface rather than modifying an existing 200-line `switch(paymentType)` statement.",
            mentalModel: "Think of an electrical wall outlet: the socket is closed for modification (you don't tear down the drywall to plug in a toaster). It is open for extension: anyone can plug in a lamp, a vacuum, or a computer as long as it adheres to the standard 3-prong plug interface.",
            whatItIs: "The 'O' in SOLID. Enables adding new business rules by writing additive code (new classes) without risking regression bugs in battle-tested existing code.",
            whyItExists: "Modifying existing methods with growing `if-else` or `switch` blocks requires re-testing the entire legacy system and risks introducing regressions.",
            codeDemo: {
              language: "java",
              code: "// ❌ OCP VIOLATION: Every new payment method requires modifying this method!\npublic class PaymentProcessor {\n    public void processPayment(String type, double amount) {\n        if (type.equals(\"CREDIT_CARD\")) { /* charge card */ }\n        else if (type.equals(\"PAYPAL\")) { /* redirect paypal */ }\n        else if (type.equals(\"CRYPTO\")) { /* crypto wallet */ }\n    }\n}\n\n// ✅ OCP IMPLEMENTATION via Strategy Pattern: Open for extension, closed for modification\npublic interface PaymentStrategy {\n    void pay(double amount);\n}\n\n@Component(\"CREDIT_CARD\")\npublic class CreditCardPayment implements PaymentStrategy {\n    public void pay(double amount) { /* specific logic */ }\n}\n\n@Component(\"CRYPTO\")\npublic class CryptoPayment implements PaymentStrategy {\n    public void pay(double amount) { /* specific logic */ }\n}\n\n// Factory auto-injects all strategies via Spring Map:\n@Service\npublic class PaymentService {\n    private final Map<String, PaymentStrategy> strategies;\n    public PaymentService(Map<String, PaymentStrategy> strategies) { this.strategies = strategies; }\n    public void execute(String type, double amount) {\n        strategies.get(type).pay(amount); // Zero switch-case! New payments require ZERO edits here!\n    }\n}"
            },
            tradeoffs: "Applying OCP everywhere upfront can lead to premature abstraction and over-engineering. Apply OCP to areas of the codebase that are genuinely expected to change frequently.",
            theyMightAskNext: [
              {
                question: "What design patterns naturally promote OCP?",
                answer: "Strategy Pattern, Factory Method, Decorator Pattern, and Observer Pattern."
              }
            ],
            usedInProduction: "Used in discount calculation engines (Black Friday discounts, VIP coupons) and shipping rate calculators across e-commerce giants.",
            relatedTopics: ["Strategy Pattern", "Factory Method", "Single Responsibility"]
          }
        },
        {
          id: "lld-solid-3",
          question: "What is the Liskov Substitution Principle (LSP) and why is the Square-Rectangle problem the classic violation?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Subtypes must be substitutable for their base types without altering the correctness of the program. A subclass must fulfill all contracts of the superclass: it cannot strengthen preconditions (demand more) or weaken postconditions (guarantee less). In the Square-Rectangle problem, making Square inherit Rectangle breaks client assumptions because modifying a Square's width unexpectedly mutates its height.",
            mentalModel: "A plastic toy duck vs a live mallard duck: in real life, a plastic duck looks like a duck. But if your system has a `Duck` class with a `fly()` and `quack()` method, and your `PlasticDuck` throws an `UnsupportedOperationException` on `fly()`, you have violated Liskov Substitution.",
            whatItIs: "Formulated by Barbara Liskov in 1987. Inheritance must model behavioral subtyping, not just naive real-world taxonomic classification.",
            whyItExists: "Prevents subtle runtime bugs when polymorphic code receives unexpected subclass behavior that breaks assumptions.",
            codeDemo: {
              language: "java",
              code: "// ❌ LSP VIOLATION: Square extends Rectangle\npublic class Rectangle {\n    protected int width, height;\n    public void setWidth(int w) { this.width = w; }\n    public void setHeight(int h) { this.height = h; }\n    public int getArea() { return width * height; }\n}\n\npublic class Square extends Rectangle {\n    @Override public void setWidth(int w) { this.width = w; this.height = w; } // Unexpected side-effect!\n    @Override public void setHeight(int h) { this.width = h; this.height = h; }\n}\n\n// Client code testing substitution:\nvoid testRectangle(Rectangle r) {\n    r.setWidth(5);\n    r.setHeight(4);\n    assert r.getArea() == 20; // 💥 FAILS FOR SQUARE! Square area is 16!\n}\n\n// ✅ FIX: Prefer composition or common Shape interface without stateful mutations\npublic interface Shape { int getArea(); }"
            },
            tradeoffs: "Inheritance is often overused in OOP. Following LSP frequently leads to favoring Composition over Inheritance (`Shape` interface with independent `Square` and `Rectangle` implementations).",
            theyMightAskNext: [
              {
                question: "What are the rules regarding Exceptions under LSP?",
                answer: "A subclass method should NOT throw checked exceptions that are broader or unhandled by the superclass method signature."
              }
            ],
            usedInProduction: "Standard principle in API and SDK design: collections in the Java standard library (`List`, `Set`) must be seamlessly interchangeable.",
            relatedTopics: ["Interface Segregation", "Open/Closed Principle", "Composition over Inheritance"]
          }
        },
        {
          id: "lld-solid-4",
          question: "What is the Interface Segregation Principle (ISP) and how does it prevent 'Fat Interfaces'?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Clients should not be forced to depend upon interfaces that they do not use. Instead of one fat, bloated interface with 20 methods, split it into smaller, cohesive, role-based interfaces. Implementers only implement what they actually need.",
            mentalModel: "Think of an all-in-one printer/scanner/fax/coffee-maker. If an office worker only needs to print documents, but the machine forces them to refill coffee beans and paper fax rolls before printing, the interface is bloated. Split it into `Printer`, `Scanner`, and `Fax`.",
            whatItIs: "The 'I' in SOLID. Discourages giant interfaces like `Worker` containing `work()`, `eat()`, `sleep()`, and `getPaid()`.",
            whyItExists: "Fat interfaces force client classes to write empty or dummy implementations (`throw new UnsupportedOperationException()`) for methods they don't support.",
            codeDemo: {
              language: "java",
              code: "// ❌ FAT INTERFACE VIOLATION\npublic interface Worker {\n    void work();\n    void eat();\n    void sleep();\n}\n\npublic class RobotWorker implements Worker {\n    public void work() { /* assemble car */ }\n    public void eat() { /* robots don't eat! Empty dummy method */ }\n    public void sleep() { /* robots don't sleep! Empty dummy method */ }\n}\n\n// ✅ REFACTORED TO ISP: Role-based segregated interfaces\npublic interface Workable { void work(); }\npublic interface Feedable { void eat(); }\n\npublic class HumanWorker implements Workable, Feedable {\n    public void work() { ... }\n    public void eat() { ... }\n}\n\npublic class RobotWorker implements Workable {\n    public void work() { ... } // Clean! Only implements what it uses!\n}"
            },
            tradeoffs: "Creating hundreds of tiny 1-method interfaces can lead to interface explosion. In Java, functional interfaces (`Runnable`, `Callable`, `Comparable`) are natural examples of ISP.",
            theyMightAskNext: [
              {
                question: "How does the Java Standard Library demonstrate ISP?",
                answer: "Interfaces like `Readable`, `Appendable`, `Closeable`, `AutoCloseable`, and `Serializable` are clean, single-purpose interfaces that can be mixed and matched."
              }
            ],
            usedInProduction: "Critical in clean architecture ports-and-adapters (Hexagonal architecture) where repository interfaces only expose operations needed by specific use-cases.",
            relatedTopics: ["Single Responsibility", "Liskov Substitution", "Adapter Pattern"]
          }
        },
        {
          id: "lld-solid-5",
          question: "What is the Dependency Inversion Principle (DIP) and how does it differ from Dependency Injection (DI)?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "DIP is a high-level design principle: High-level modules should not depend on low-level modules; both should depend on abstractions (interfaces). Dependency Injection (DI) is a concrete structural technique/pattern used to implement DIP by injecting dependencies from the outside via constructors.",
            mentalModel: "DIP is the architectural rule that your laptop charger should plug into a standardized wall socket (abstraction), not solder directly into the power plant's copper wires (concrete implementation). DI is the physical act of your hand plugging the charger into the socket.",
            whatItIs: "The 'D' in SOLID. Inverts the traditional top-down dependency graph so that core business logic does not depend on database drivers, message brokers, or external UI frameworks.",
            whyItExists: "Decouples domain business rules from external technology choices, enabling painless mocking in unit tests and swapping of infrastructure libraries.",
            comparisonTable: {
              title: "Dependency Inversion Principle (DIP) vs Dependency Injection (DI) vs Inversion of Control (IoC)",
              headers: ["Concept", "Nature / Level", "Definition & Focus", "Example in Code / Framework"],
              rows: [
                ["Dependency Inversion Principle (DIP)", "High-level architectural PRINCIPLE (SOLID)", "Modules should depend on abstractions (interfaces), not concrete classes", "`NotificationService` depends on `UserRepository` interface"],
                ["Inversion of Control (IoC)", "Broad architectural PHILOSOPHY", "Inverts control of execution flow from caller to runtime framework", "Spring ApplicationContext manages lifecycle & calls methods"],
                ["Dependency Injection (DI)", "Concrete design PATTERN / Technique", "Objects receive dependencies from external callers rather than creating them", "`public NotificationService(UserRepository repo)` constructor injection"],
                ["IoC Container", "Concrete TOOL / Framework Library", "Automates dependency instantiation, wiring, and lifecycle scoping", "Spring BeanFactory, Google Guice, Dagger"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// ❌ DIP VIOLATION: High-level service directly depends on concrete MySQL repository!\npublic class NotificationService {\n    private MySQLUserRepository userRepo = new MySQLUserRepository(); // Tight coupling!\n}\n\n// ✅ DIP + DI BEST PRACTICE\n// 1. Abstraction (owned by business domain):\npublic interface UserRepository {\n    User findById(UUID id);\n}\n\n// 2. High-level service depends ONLY on abstraction:\n@Service\npublic class NotificationService {\n    private final UserRepository userRepo;\n\n    // Dependency Injection via constructor:\n    public NotificationService(UserRepository userRepo) {\n        this.userRepo = userRepo;\n    }\n}\n\n// 3. Low-level infrastructure implements abstraction:\n@Repository\npublic class PostgresUserRepository implements UserRepository { ... }"
            },
            tradeoffs: "Introducing interfaces for every trivial single-implementation class can feel redundant; in small utility scripts, pragmatic direct instantiation may suffice.",
            theyMightAskNext: [
              {
                question: "What is Inversion of Control (IoC)?",
                answer: "A broader architectural concept where the framework controls the program's execution flow (Hollywood Principle: 'Don't call us, we'll call you'), implemented via DI containers like Spring."
              }
            ],
            usedInProduction: "Fundamental backbone of Spring Framework, NestJS, and Hexagonal / Clean Architecture across enterprise codebases.",
            relatedTopics: ["Dependency Injection", "Single Responsibility", "Factory Method"]
          }
        },
        {
          id: "lld-solid-6",
          question: "What is the Law of Demeter (Principle of Least Knowledge) and why is train-wreck method chaining dangerous?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A method of an object should only call methods on: its own fields, its parameters, objects it creates, or itself. It should NEVER talk to 'strangers' via train-wreck method chaining (`order.getCustomer().getAddress().getCity()`). Violations introduce brittle coupling to internal object graphs and cause NullPointerExceptions.",
            mentalModel: "When paying a paperboy for the morning newspaper, you hand him cash from your hand. You do NOT let the paperboy reach into your pocket, pull out your leather wallet, open the card slot, and extract a $5 bill.",
            whatItIs: "A design guideline for loose coupling: 'Only talk to your immediate friends.'",
            whyItExists: "If `Customer` changes `Address` to an `AddressBook` collection, all 50 classes doing `order.getCustomer().getAddress().getCity()` will break.",
            codeDemo: {
              language: "java",
              code: "// ❌ LAW OF DEMETER VIOLATION ('Train Wreck' chaining)\npublic String getCustomerCity(Order order) {\n    return order.getCustomer().getAddress().getCity(); // NullPointer risk & high coupling!\n}\n\n// ✅ FIX via Delegation ('Tell, Don't Ask'):\npublic class Order {\n    private Customer customer;\n    public String getCustomerCity() {\n        return customer.getCity(); // Order delegates to Customer\n    }\n}\npublic class Customer {\n    private Address address;\n    public String getCity() {\n        return address.getCity(); // Customer delegates to Address\n    }\n}\n\n// Client code:\nString city = order.getCustomerCity(); // Clean, encapsulated!"
            },
            tradeoffs: "Note: Fluent APIs and Builders (e.g. `Stream.filter().map().collect()`) are NOT Law of Demeter violations because each step transforms a pipeline and returns known pipeline monads, not exposing internal object guts.",
            theyMightAskNext: [
              {
                question: "What does 'Tell, Don't Ask' mean?",
                answer: "Instead of querying an object's internal state and making decisions on its behalf, tell the object what you want it to do and let it manage its own internal state."
              }
            ],
            usedInProduction: "Enforced by static analysis tools (PMD / SonarQube) to eliminate deeply nested NullPointerExceptions and refactor domain models.",
            relatedTopics: ["Single Responsibility", "Builder Pattern", "Clean Code"]
          }
        }
      ]
    },
    {
      id: "creational-patterns",
      title: "Creational Design Patterns",
      questions: [
        {
          id: "lld-create-1",
          question: "How do you implement a thread-safe Singleton pattern in Java, and why is volatile mandatory in Double-Checked Locking?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The recommended approaches are: 1. Enum Singleton (simplest, reflection-proof, serialization-safe), 2. Bill Pugh Static Inner Holder (lazy, thread-safe, zero lock overhead), or 3. Double-Checked Locking with `volatile`. In Double-Checked Locking, `volatile` is mandatory to prevent CPU instruction reordering from publishing a partially-initialized object reference to other threads.",
            mentalModel: "Ordering a custom wedding cake: Double-checked locking checks if the cake is ready. If not, the baker locks the kitchen door, checks again (in case a coworker just finished it), and bakes it. `volatile` prevents the baker from showing the cake on the counter before the frosting is dry.",
            whatItIs: "Ensures a class has only one instance and provides a global point of access.",
            whyItExists: "For shared resources like database connection pools, thread pools, logging managers, and hardware drivers.",
            codeDemo: {
              language: "java",
              code: "// Approach 1: Double-Checked Locking (Classic Interview Question)\npublic class DclSingleton {\n    // VOLATILE IS MANDATORY to prevent instruction reordering!\n    private static volatile DclSingleton instance;\n    private DclSingleton() {}\n\n    public static DclSingleton getInstance() {\n        if (instance == null) { // 1st check (no locking)\n            synchronized (DclSingleton.class) {\n                if (instance == null) { // 2nd check (with lock)\n                    instance = new DclSingleton(); \n                    // Without volatile, bytecode: 1. Alloc memory -> 2. Assign reference -> 3. Init ctor\n                    // Thread B could see non-null instance before ctor finishes!\n                }\n            }\n        }\n        return instance;\n    }\n}\n\n// Approach 2: Bill Pugh Holder (Elegantly Lazy & Thread-Safe)\npublic class BillPughSingleton {\n    private BillPughSingleton() {}\n    private static class Holder {\n        private static final BillPughSingleton INSTANCE = new BillPughSingleton();\n    }\n    public static BillPughSingleton getInstance() {\n        return Holder.INSTANCE; // Class loaded only when called!\n    }\n}\n\n// Approach 3: Enum Singleton (Effective Java Recommendation - Immune to reflection/serialization attacks)\npublic enum EnumSingleton {\n    INSTANCE;\n    public void doWork() { ... }\n}"
            },
            tradeoffs: "Singletons make unit testing hard (they introduce hidden global state and cannot be mocked easily). In modern enterprise Java, Spring IoC manages bean singleton lifecycles cleanly without manual static singletons.",
            theyMightAskNext: [
              {
                question: "How can reflection break a private constructor Singleton?",
                answer: "Using `constructor.setAccessible(true)` to instantiate a new instance. Defend by throwing an exception inside the constructor if an instance already exists, or use Enum singletons (the JVM prevents reflection instantiation on Enums)."
              }
            ],
            usedInProduction: "Enum singletons are used for shared lookup registries; Spring IoC singletons power 99% of business service beans.",
            relatedTopics: ["Java Memory Model", "Spring Bean Scopes", "Factory Method"]
          }
        },
        {
          id: "lld-create-2",
          question: "How does the Factory Method Pattern work and how does it decouple object creation from client code?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Factory Method defines an interface or abstract method for creating an object, but lets subclasses decide which specific class to instantiate. It replaces direct `new ConcreteProduct()` calls with a method call, decoupling business logic from concrete product classes.",
            mentalModel: "Think of a car dealership: you tell the sales desk 'I need an economy vehicle'. The dealer's factory system decides whether to assemble a Sedan, an EV, or a Hybrid based on your region without you having to step onto the assembly line with a wrench.",
            whatItIs: "A creational pattern that implements the Open/Closed Principle for object creation.",
            whyItExists: "Hardcoding `new MySQLConnection()` inside 50 classes makes switching to `PostgresConnection` a nightmare.",
            codeDemo: {
              language: "java",
              code: "// Product Interface\npublic interface Notification {\n    void send(String message);\n}\n\npublic class EmailNotification implements Notification {\n    public void send(String msg) { /* Send via SMTP */ }\n}\npublic class SmsNotification implements Notification {\n    public void send(String msg) { /* Send via Twilio */ }\n}\n\n// Factory Method Pattern\npublic class NotificationFactory {\n    public Notification createNotification(String channel) {\n        if (channel == null || channel.isEmpty()) return null;\n        return switch (channel.toUpperCase()) {\n            case \"EMAIL\" -> new EmailNotification();\n            case \"SMS\" -> new SmsNotification();\n            default -> throw new IllegalArgumentException(\"Unknown channel: \" + channel);\n        };\n    }\n}"
            },
            tradeoffs: "Creates extra classes and hierarchies. For simple, static objects that never change, direct instantiation is simpler than introducing factory boilerplate.",
            theyMightAskNext: [
              {
                question: "How does Factory Method differ from Abstract Factory?",
                answer: "Factory Method creates ONE product using a single method or subclass. Abstract Factory is a factory of factories: it creates FAMILIES of related products (e.g. MacButton + MacCheckbox vs WindowsButton + WindowsCheckbox) without specifying their concrete classes."
              }
            ],
            usedInProduction: "Standard in logging frameworks (`LoggerFactory.getLogger()`), Java Collections (`List.of()`), and database connection pools.",
            relatedTopics: ["Abstract Factory", "Builder Pattern", "Open/Closed Principle"]
          }
        },
        {
          id: "lld-create-3",
          question: "What is the Builder Pattern and how do you implement validation and immutability with it?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Builder Pattern separates the construction of a complex object from its representation, using a fluent step-by-step API (`new User.Builder().setName(\"Alice\").build()`). It eliminates 'telescoping constructors' (constructors with 10 parameters), enforces object immutability, and centralizes cross-field validation in the `build()` method.",
            mentalModel: "Ordering a custom Subway sandwich: instead of shouting 15 ingredients to the cashier in one breath, you walk down the counter step-by-step: pick bread -> pick cheese -> pick veggies -> wrap sandwich. At the final wrapping step, the cashier validates that you didn't pick an impossible combination.",
            whatItIs: "A creational pattern providing fluent method chaining where the target class has private constructors and only getters (immutable).",
            whyItExists: "Telescoping constructors (`User(id, name, null, null, true, null, 0)`) are unreadable, error-prone, and risk passing arguments in the wrong order.",
            codeDemo: {
              language: "java",
              code: "public class UserProfile {\n    private final String username; // Immutable\n    private final String email;\n    private final int age;\n\n    private UserProfile(Builder builder) {\n        this.username = builder.username;\n        this.email = builder.email;\n        this.age = builder.age;\n    }\n\n    public static class Builder {\n        private String username;\n        private String email;\n        private int age;\n\n        public Builder username(String username) { this.username = username; return this; }\n        public Builder email(String email) { this.email = email; return this; }\n        public Builder age(int age) { this.age = age; return this; }\n\n        public UserProfile build() {\n            // Centralized Validation before object instantiation\n            if (username == null || username.isBlank()) throw new IllegalStateException(\"Username required\");\n            if (age < 18) throw new IllegalStateException(\"User must be 18+\");\n            return new UserProfile(this);\n        }\n    }\n}"
            },
            tradeoffs: "Adds verbosity (writing the inner Builder class). In modern Java, Lombok `@Builder` or Java 17 Records can reduce boilerplate, though records require all components in canonical constructors.",
            theyMightAskNext: [
              {
                question: "Can a Builder return different concrete subclasses based on configuration?",
                answer: "Yes, the `build()` method can inspect configured parameters and return different polymorphic implementations of an interface."
              }
            ],
            usedInProduction: "Standard across HTTP request builders (`HttpRequest.newBuilder()`), Spring `RestClient.builder()`, and Protocol Buffers generated classes.",
            relatedTopics: ["Factory Method", "Prototype Pattern", "Clean Code"]
          }
        },
        {
          id: "lld-create-4",
          question: "What is the Prototype Pattern and how do Deep Copy and Shallow Copy differ in object cloning?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Prototype Pattern creates new objects by cloning an existing prototype instance rather than instantiating via `new`. A Shallow Copy copies primitive fields but copies only the MEMORY REFERENCES of nested objects (so mutating a child in the clone mutates the original). A Deep Copy duplicates the entire object graph, creating independent copies of all nested objects.",
            mentalModel: "Shallow copy is photocopying a document that contains a web URL link: both copies point to the same website; if someone edits the website, both readers see the change. Deep copy is photocopying the document AND downloading a permanent offline printout of the entire website.",
            whatItIs: "Implements `Cloneable` or provides custom copy constructors / serialization-based deep cloning.",
            whyItExists: "When creating an object from scratch is computationally expensive (e.g., requires database queries or complex XML parsing), cloning a pre-warmed prototype and tweaking a few fields is 100x faster.",
            comparisonTable: {
              title: "Shallow Copy vs Deep Copy in Object Cloning",
              headers: ["Dimension", "Shallow Copy", "Deep Copy"],
              rows: [
                ["Primitive Fields", "Copied by value (independent primitive copies in memory)", "Copied by value (independent primitive copies in memory)"],
                ["Nested Reference Objects", "Copies ONLY memory address pointers (shared references)", "Recursively allocates brand-new objects and copies state"],
                ["Mutation Side-Effects", "Modifying nested object in clone MUTATES the original!", "Completely isolated: modifying clone NEVER affects original"],
                ["Cloning Performance", "Blazing fast (single shallow bitwise memory copy)", "Slower (traverses and re-allocates entire object graph)"],
                ["Cyclic Reference Handling", "Trivial (only copies references)", "Requires visited identity map to avoid infinite recursion stack overflow"],
                ["Java Implementation", "`Object.clone()` default, `new ArrayList<>(original)`", "Copy constructors, Apache SerializationUtils, Jackson/Gson"],
                ["Best Use Cases", "Immutable nested objects (e.g. `String`, `Integer`, records)", "Mutable nested collections, game state, complex domain aggregates"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public class GameCharacter implements Cloneable {\n    private String name;\n    private List<Item> inventory; // Nested mutable object\n\n    // Deep Copy Constructor (Recommended over Java clone())\n    public GameCharacter(GameCharacter prototype) {\n        this.name = prototype.name;\n        // Deep copy nested list so modifying clone inventory does NOT affect original:\n        this.inventory = new ArrayList<>();\n        for (Item item : prototype.inventory) {\n            this.inventory.add(new Item(item));\n        }\n    }\n}"
            },
            tradeoffs: "Java's native `Object.clone()` is widely considered broken by Joshua Bloch (Effective Java) because it bypasses constructors and has weak typing. Always use Copy Constructors or Factory Methods for deep copying.",
            theyMightAskNext: [
              {
                question: "How do you achieve deep copying of complex cyclic object graphs?",
                answer: "Use JSON/Kryo serialization, or recursive copy constructors with an identity map tracking already-visited objects to prevent infinite recursion."
              }
            ],
            usedInProduction: "Game development (spawning thousands of NPC monsters with preset stats), and chessboard game engines simulating future move trees.",
            relatedTopics: ["Builder Pattern", "Factory Method", "Memory Management"]
          }
        },
        {
          id: "lld-create-5",
          question: "How does the Object Pool Pattern work and how do HikariCP and Thread Pools manage resource reuse?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Object Pool pattern manages a cache of pre-initialized, reusable objects (e.g. database connections, socket handles, threads). When a client needs an object, it borrows it from the pool; when finished, it returns it to the pool instead of destroying it.",
            mentalModel: "Bowling shoe rental at an alley: the alley doesn't manufacture a brand-new pair of shoes when you arrive and incinerate them when you leave. You borrow shoes from the counter, bowl your game, spray them clean, and return them for the next customer.",
            whatItIs: "A creational pattern designed for high-overhead resource management using concurrent data structures (`BlockingQueue` or `ConcurrentBag`).",
            whyItExists: "Opening a physical TCP/TLS database connection costs 20–50ms of network round-trips and socket allocation. Reusing warm connections drops acquisition time to under 10 microseconds.",
            codeDemo: {
              language: "java",
              code: "// Conceptual Generic Object Pool using BlockingQueue\npublic class GenericObjectPool<T> {\n    private final BlockingQueue<T> pool;\n    private final Supplier<T> creator;\n\n    public GenericObjectPool(int size, Supplier<T> creator) {\n        this.pool = new ArrayBlockingQueue<>(size);\n        this.creator = creator;\n        for (int i = 0; i < size; i++) pool.offer(creator.get());\n    }\n\n    public T acquire() throws InterruptedException {\n        return pool.take(); // Blocks if pool is empty\n    }\n\n    public void release(T object) {\n        if (object != null) pool.offer(object); // Returns to pool\n    }\n}"
            },
            tradeoffs: "Resource leaks: if client code borrows a connection and forgets to release it (e.g., missing `try-with-resources`), the pool is eventually exhausted. Pools must implement `leakDetectionThreshold` timers.",
            theyMightAskNext: [
              {
                question: "How does HikariCP achieve faster connection pooling than Apache DBCP?",
                answer: "Using `ConcurrentBag` (lock-free thread-local caching of connections), bytecode-level micro-optimizations, and `FastList` to eliminate `ArrayList` bounds checks."
              }
            ],
            usedInProduction: "Core engine of HikariCP (JDBC), Netty ByteBuf pools, and Java `ThreadPoolExecutor`.",
            relatedTopics: ["HikariCP Connection Pool", "Concurrency LLD", "Singleton Pattern"]
          }
        },
        {
          id: "lld-create-6",
          question: "When should you use the Abstract Factory Pattern over the Factory Method Pattern?",
          difficulty: "Advanced",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Use Factory Method when creating a single product. Use Abstract Factory when you need to create whole FAMILIES of related or dependent products without specifying their concrete classes, ensuring products from one family are never accidentally mixed with products from another.",
            mentalModel: "Interior decorating: a 'Modern Furniture Factory' produces a glass table and a minimalist chair. A 'Victorian Furniture Factory' produces an ornate wooden table and a velvet chair. You don't want a system accidentally pairing an ornate Victorian table with a cheap plastic gamer chair.",
            whatItIs: "An interface declaring factory methods for each member of a product family (e.g. `createButton()`, `createCheckbox()`).",
            whyItExists: "Enforces visual or architectural consistency across an entire suite of components (e.g. Dark Mode vs Light Mode theme widgets, or AWS vs GCP cloud storage & queue clients).",
            codeDemo: {
              language: "java",
              code: "// Abstract Products\npublic interface Button { void render(); }\npublic interface Checkbox { void render(); }\n\n// Abstract Factory for Product Family\npublic interface GUIFactory {\n    Button createButton();\n    Checkbox createCheckbox();\n}\n\n// Concrete Factory 1: Mac\npublic class MacFactory implements GUIFactory {\n    public Button createButton() { return new MacButton(); }\n    public Checkbox createCheckbox() { return new MacCheckbox(); }\n}\n\n// Concrete Factory 2: Windows\npublic class WindowsFactory implements GUIFactory {\n    public Button createButton() { return new WinButton(); }\n    public Checkbox createCheckbox() { return new WinCheckbox(); }\n}"
            },
            tradeoffs: "Rigid to extend: adding a new product type (e.g., `createSlider()`) requires modifying the `GUIFactory` interface and updating every concrete factory class in the system.",
            theyMightAskNext: [
              {
                question: "How does Spring use Abstract Factory?",
                answer: "`BeanFactory` acts as an Abstract Factory producing beans of various types across different scopes."
              }
            ],
            usedInProduction: "Cross-platform UI toolkits (Qt, Swing), multi-cloud storage abstraction layers (supporting S3 + SQS vs GCS + PubSub).",
            relatedTopics: ["Factory Method", "Builder Pattern", "Interface Segregation"]
          }
        }
      ]
    },
    {
      id: "structural-patterns",
      title: "Structural Design Patterns",
      questions: [
        {
          id: "lld-struct-1",
          question: "How does the Adapter Pattern work and how does it bridge incompatible interfaces?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Adapter pattern converts the interface of a class into another interface that clients expect. It acts as a wrapper that translates calls from your application's domain interface into a legacy or third-party vendor's incompatible API.",
            mentalModel: "An international power plug adapter: when traveling to the UK with an American two-prong laptop charger, you don't rebuild the hotel wall wiring or cut off your laptop plug. You use a $10 UK plug adapter that sits between the socket and your plug.",
            whatItIs: "Can be implemented as an Object Adapter (composition: contains an instance of the adaptee) or Class Adapter (inheritance: extends adaptee and implements target interface).",
            whyItExists: "Allows integrating third-party libraries (e.g., Stripe, PayPal, XML parsers) without letting their proprietary data models pollute your clean domain interfaces.",
            codeDemo: {
              language: "java",
              code: "// 1. Target interface expected by our application domain\npublic interface PaymentGateway {\n    void charge(String customerId, BigDecimal amount);\n}\n\n// 2. Incompatible 3rd-party vendor SDK class\npublic class StripeApi {\n    public void makePayment(String stripeToken, long amountInCents) { /* Stripe logic */ }\n}\n\n// 3. Adapter bridging the two\npublic class StripePaymentAdapter implements PaymentGateway {\n    private final StripeApi stripeApi;\n    public StripePaymentAdapter(StripeApi stripeApi) { this.stripeApi = stripeApi; }\n\n    @Override\n    public void charge(String customerId, BigDecimal amount) {\n        long cents = amount.multiply(BigDecimal.valueOf(100)).longValue();\n        stripeApi.makePayment(customerId, cents); // Translates dollars -> cents and method call\n    }\n}"
            },
            tradeoffs: "Increases code indirection. If you only ever have one third-party service and never expect to swap it, an adapter might be unnecessary overhead.",
            theyMightAskNext: [
              {
                question: "How does Adapter differ from Facade?",
                answer: "Adapter makes an existing interface WORK with an incompatible expected interface (1-to-1 translation). Facade defines a SIMPLIFIED high-level interface over a complex subsystem of many classes."
              }
            ],
            usedInProduction: "Standard pattern in payment processing adapters, legacy SOAP-to-REST wrappers, and `Arrays.asList()` in the JDK.",
            relatedTopics: ["Facade Pattern", "Proxy Pattern", "Decorator Pattern"]
          }
        },
        {
          id: "lld-struct-2",
          question: "How does the Decorator Pattern allow dynamic behavior extension without class explosion?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Decorator pattern attaches additional responsibilities to an object dynamically at runtime. Decorators provide a flexible alternative to subclassing for extending functionality by wrapping the original object and implementing the same interface.",
            mentalModel: "Ordering a custom coffee: instead of creating 30 rigid subclasses (`EspressoWithMilk`, `EspressoWithMilkAndCaramel`, `EspressoWithSugar`), you start with a base `SimpleCoffee` and wrap it dynamically: `new CaramelDecorator(new MilkDecorator(new SimpleCoffee()))`.",
            whatItIs: "Implements the same interface as the wrapped object, holds a reference to a wrapped component, and delegates calls while adding behavior before or after.",
            whyItExists: "Prevents combinatorial subclass explosion (N features would require 2^N subclasses with static inheritance).",
            codeDemo: {
              language: "java",
              code: "// Base Component Interface\npublic interface Coffee {\n    double getCost();\n    String getDescription();\n}\npublic class SimpleCoffee implements Coffee {\n    public double getCost() { return 2.0; }\n    public String getDescription() { return \"Coffee\"; }\n}\n\n// Abstract Decorator\npublic abstract class CoffeeDecorator implements Coffee {\n    protected final Coffee decoratedCoffee;\n    public CoffeeDecorator(Coffee coffee) { this.decoratedCoffee = coffee; }\n    public double getCost() { return decoratedCoffee.getCost(); }\n    public String getDescription() { return decoratedCoffee.getDescription(); }\n}\n\n// Concrete Decorator\npublic class MilkDecorator extends CoffeeDecorator {\n    public MilkDecorator(Coffee coffee) { super(coffee); }\n    @Override public double getCost() { return super.getCost() + 0.5; }\n    @Override public String getDescription() { return super.getDescription() + \", Milk\"; }\n}\n\n// Usage: Nesting decorators dynamically at runtime!\nCoffee myOrder = new MilkDecorator(new SimpleCoffee()); // Cost: 2.50"
            },
            tradeoffs: "Nesting 10 decorators can make debugging call stacks and inspecting object equality difficult; removing a specific decorator from the middle of a chain is awkward.",
            theyMightAskNext: [
              {
                question: "Where is the Decorator Pattern used in Java standard library?",
                answer: "The `java.io` stream hierarchy: `new BufferedReader(new InputStreamReader(new FileInputStream(\"data.txt\")))`."
              }
            ],
            usedInProduction: "HTTP request/response wrappers in Servlet filters (`HttpServletRequestWrapper`), Spring WebClient filters, and UI window borders.",
            relatedTopics: ["Proxy Pattern", "Adapter Pattern", "Open/Closed Principle"]
          }
        },
        {
          id: "lld-struct-3",
          question: "What is the difference between the Proxy Pattern and the Decorator Pattern?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "While both wrap an underlying object and share the same interface, their INTENT is different: Decorator dynamically ENHANCES or adds new behavior to an object. Proxy CONTROLS ACCESS to an object (lazy initialization, caching, security access checks, remote RPC invocation, or transaction demarcation). Proxies typically manage the lifecycle of the underlying object; Decorators receive pre-existing objects from clients.",
            mentalModel: "A Decorator is adding whipped cream and sprinkles onto an ice cream cone (adding features). A Proxy is a bodyguard standing in front of a celebrity: checking your VIP badge before letting you speak to the celebrity (access control).",
            whatItIs: "Types of Proxies: Virtual Proxy (defers expensive creation until needed), Protection Proxy (verifies user permissions), Remote Proxy (handles network serialization, e.g. RMI/gRPC stub), Caching Proxy.",
            whyItExists: "Separates security, caching, and network mechanics from core business domain logic.",
            comparisonTable: {
              title: "Proxy Pattern vs Decorator Pattern Comparison",
              headers: ["Dimension", "Proxy Pattern", "Decorator Pattern"],
              rows: [
                ["Primary Intent", "CONTROL ACCESS to the underlying subject", "ENHANCE BEHAVIOR dynamically without subclassing"],
                ["Lifecycle Management", "Proxy often creates and manages lifecycle of real object", "Decorator accepts pre-created instance passed into constructor"],
                ["Relationship to Subject", "Typically 1-to-1 relationship with target subject", "Can be chained/nested recursively (Decorator of Decorator)"],
                ["Interface Consistency", "Implements same interface; rarely adds new public methods", "Implements same interface; may add new helper methods"],
                ["Common Variants", "Virtual (lazy loading), Protection (auth), Remote (RPC), Caching", "Logging, buffering, encryption, compression, visual borders"],
                ["Real-World Examples", "Hibernate Lazy Proxy, Spring `@Transactional` proxy", "`new BufferedReader(new InputStreamReader(in))` in `java.io`"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Virtual Proxy for High-Resolution Image (Lazy Loading)\npublic interface Image { void display(); }\n\npublic class RealImage implements Image {\n    private final String filename;\n    public RealImage(String filename) { this.filename = filename; loadFromDisk(); }\n    private void loadFromDisk() { System.out.println(\"Heavy disk loading...\"); }\n    public void display() { System.out.println(\"Displaying: \" + filename); }\n}\n\npublic class ProxyImage implements Image {\n    private final String filename;\n    private RealImage realImage; // Lazy loaded!\n\n    public ProxyImage(String filename) { this.filename = filename; }\n    public void display() {\n        if (realImage == null) realImage = new RealImage(filename); // Instantiated on-demand\n        realImage.display();\n    }\n}"
            },
            tradeoffs: "Dynamic proxies (Java reflection proxies or CGLIB) introduce a minor reflection/dispatch overhead and make stack traces more complex.",
            theyMightAskNext: [
              {
                question: "How does Spring Framework use Dynamic Proxies?",
                answer: "Spring wraps beans in JDK Dynamic Proxies (for interface-based beans) or CGLIB proxies (for class-based beans) to intercept method calls for `@Transactional`, `@Async`, and `@Secured`."
              }
            ],
            usedInProduction: "Hibernate lazy loading proxies (`LazyInitializationException`), Spring AOP, and gRPC generated client stubs.",
            relatedTopics: ["Decorator Pattern", "Adapter Pattern", "Spring AOP"]
          }
        },
        {
          id: "lld-struct-4",
          question: "How does the Facade Pattern simplify complex subsystem interactions?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Facade pattern provides a simplified, unified high-level interface to a complex set of interfaces in a subsystem. It defines a higher-level interface that makes the subsystem easier to use, hiding internal plumbing, class coordination, and dependency ordering.",
            mentalModel: "The 'Watch Movie' button on a universal remote control: pressing one button turns on the projector, rolls down the screen, sets HDMI input to Blu-ray, powers on the soundbar, and dims the room lights. You don't have to fiddle with 5 separate remotes and 10 menu settings.",
            whatItIs: "A structural wrapper that coordinates multiple subsystem classes without preventing power users from accessing low-level classes directly if needed.",
            whyItExists: "Reduces coupling between client code and internal library subsystems, shielding clients from internal implementation refactoring.",
            codeDemo: {
              language: "java",
              code: "// Complex Subsystem Classes\nclass AudioCodec { void decode() {} }\nclass VideoCodec { void compress() {} }\nclass BitrateOptimizer { void optimize() {} }\n\n// Facade providing simple 1-line API for clients\npublic class VideoConverterFacade {\n    public File convertVideo(String filename, String format) {\n        AudioCodec audio = new AudioCodec();\n        VideoCodec video = new VideoCodec();\n        BitrateOptimizer opt = new BitrateOptimizer();\n        \n        audio.decode();\n        video.compress();\n        opt.optimize();\n        return new File(filename + \".\" + format);\n    }\n}\n\n// Client usage: Simple & clean\nVideoConverterFacade converter = new VideoConverterFacade();\nFile mp4 = converter.convertVideo(\"vacation.mov\", \"mp4\");"
            },
            tradeoffs: "A facade can easily become a 'God Object' if developers continuously cram unrelated subsystem methods into it.",
            theyMightAskNext: [
              {
                question: "How does SLF4J act as a Facade?",
                answer: "SLF4J (Simple Logging Facade for Java) is a facade that provides a standard logging interface (`Logger.info()`), routing calls to underlying logging engines like Logback, Log4j2, or java.util.logging."
              }
            ],
            usedInProduction: "Order placement facade (coordinating inventory reservation, payment charging, tax calculation, and order saving in a single `placeOrder()` call).",
            relatedTopics: ["Adapter Pattern", "Single Responsibility", "Clean Architecture"]
          }
        },
        {
          id: "lld-struct-5",
          question: "How does the Composite Pattern allow treating individual objects and compositions uniformly?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Composite pattern composes objects into tree structures to represent part-whole hierarchies. It lets clients treat individual objects (leaf nodes) and compositions of objects (composite nodes with children) uniformly through a common component interface.",
            mentalModel: "A computer file system: a folder can contain individual text files (leaves) as well as subfolders (composites). When you right-click and click 'Calculate Size', the operation runs recursively across files and folders uniformly.",
            whatItIs: "Tree data structure pattern where both `Leaf` and `Composite` implement `Component`.",
            whyItExists: "Eliminates tedious `if (node instanceof Folder)` type checks and recursive loops in client code.",
            codeDemo: {
              language: "java",
              code: "// Component\npublic interface FileSystemItem {\n    long getSize();\n    void print(String indent);\n}\n\n// Leaf\npublic class FileItem implements FileSystemItem {\n    private final String name;\n    private final long size;\n    public FileItem(String name, long size) { this.name = name; this.size = size; }\n    public long getSize() { return size; }\n    public void print(String indent) { System.out.println(indent + \"- File: \" + name); }\n}\n\n// Composite (Holds children)\npublic class DirectoryItem implements FileSystemItem {\n    private final String name;\n    private final List<FileSystemItem> children = new ArrayList<>();\n    public DirectoryItem(String name) { this.name = name; }\n    public void add(FileSystemItem item) { children.add(item); }\n\n    public long getSize() {\n        return children.stream().mapToLong(FileSystemItem::getSize).sum(); // Recursive calculation!\n    }\n    public void print(String indent) {\n        System.out.println(indent + \"+ Directory: \" + name);\n        children.forEach(c -> c.print(indent + \"  \"));\n    }\n}"
            },
            tradeoffs: "Can make the design overly general: it is difficult to restrict a composite to only accept certain types of children at compile time.",
            theyMightAskNext: [
              {
                question: "What UI architectures rely on the Composite Pattern?",
                answer: "DOM tree in HTML browsers, UI component hierarchies in React/Swing/Flutter (where a `Container` can hold buttons, text, or nested containers)."
              }
            ],
            usedInProduction: "Organization charts, file systems, graphical drawing editors, and XML/JSON DOM parsers.",
            relatedTopics: ["Iterator Pattern", "Decorator Pattern", "Flyweight Pattern"]
          }
        },
        {
          id: "lld-struct-6",
          question: "How does the Flyweight Pattern achieve extreme memory optimization for massive numbers of objects?",
          difficulty: "Advanced",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Flyweight pattern minimizes memory usage by sharing common, immutable state (Intrinsic State) across thousands of similar objects, while passing variable, context-specific state (Extrinsic State) as method parameters rather than storing it in each instance.",
            mentalModel: "A multiplayer video game forest with 1,000,000 pine trees: storing 3D mesh polygons and high-res textures (intrinsic state) 1,000,000 times would consume 50GB of RAM and crash the GPU. Instead, you load ONE pine tree model into memory, and draw it at 1,000,000 different (x, y, z) coordinates (extrinsic state).",
            whatItIs: "A memory-optimization structural pattern using an internal Flyweight Factory and hash cache.",
            whyItExists: "Prevents OutOfMemoryErrors when systems must render or process millions of small fine-grained objects.",
            codeDemo: {
              language: "java",
              code: "// Intrinsic Shared State (Heavy, Immutable)\npublic record TreeType(String name, String color, byte[] texture3D) {\n    public void draw(int x, int y) {\n        // Uses intrinsic texture + extrinsic x, y coordinates\n        System.out.println(\"Drawing \" + name + \" at (\" + x + \",\" + y + \")\");\n    }\n}\n\n// Flyweight Factory ensuring instances are shared\npublic class TreeFactory {\n    private static final Map<String, TreeType> types = new HashMap<>();\n    public static TreeType getTreeType(String name, String color, byte[] texture) {\n        return types.computeIfAbsent(name, k -> new TreeType(name, color, texture));\n    }\n}\n\n// Extrinsic Context (Lightweight)\npublic class Tree {\n    private int x, y;\n    private TreeType type; // Shared reference!\n    public Tree(int x, int y, TreeType type) { this.x = x; this.y = y; this.type = type; }\n    public void render() { type.draw(x, y); }\n}"
            },
            tradeoffs: "Increases code complexity and trades memory for CPU cycles (calculating extrinsic state on the fly). Only worth implementing when object counts exceed 100,000+.",
            theyMightAskNext: [
              {
                question: "How does Java use Flyweight in core classes?",
                answer: "`Integer.valueOf(int)` caches integer objects between -128 and 127; Java String Interning (`String.intern()`) shares identical string literals in the JVM String Pool."
              }
            ],
            usedInProduction: "Word processors (Google Docs caching character glyph fonts), 3D game engines, and map tile rendering in Google Maps.",
            relatedTopics: ["Singleton Pattern", "Object Pool Pattern", "Composite Pattern"]
          }
        }
      ]
    },
    {
      id: "behavioral-concurrency-patterns",
      title: "Behavioral & Concurrency Patterns",
      questions: [
        {
          id: "lld-behav-1",
          question: "How does the Strategy Pattern work and when should you choose it over the State Pattern?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Strategy pattern defines a family of interchangeable algorithms, encapsulates each one, and makes them swappable at runtime. While both Strategy and State rely on composition and polymorphism, their INTENT is opposite: In Strategy, the client selects an independent algorithm (e.g., BubbleSort vs QuickSort). In State, the context transitions automatically between internal states (e.g., Order: DRAFT -> PAID -> SHIPPED) based on events.",
            mentalModel: "Strategy is choosing how to travel to work: you can pick SubwayStrategy, BikeStrategy, or DriveStrategy depending on traffic; the subway doesn't magically turn into a bicycle. State is water changing its nature: ice turns into liquid water when heated, and steam when boiled.",
            whatItIs: "Defines an algorithm interface, concrete strategy classes, and a context object that delegates execution.",
            whyItExists: "Eliminates nested conditional logic and complies directly with the Open/Closed Principle.",
            codeDemo: {
              language: "java",
              code: "// Strategy Interface\npublic interface RouteStrategy {\n    Route buildRoute(Point start, Point end);\n}\npublic class WalkingRouteStrategy implements RouteStrategy { ... }\npublic class DrivingRouteStrategy implements RouteStrategy { ... }\npublic class PublicTransitRouteStrategy implements RouteStrategy { ... }\n\n// Context\npublic class Navigator {\n    private RouteStrategy strategy;\n    public void setStrategy(RouteStrategy strategy) { this.strategy = strategy; }\n    public Route calculate(Point a, Point b) {\n        return strategy.buildRoute(a, b); // Swappable at runtime!\n    }\n}"
            },
            tradeoffs: "Clients must understand the differences between strategies in order to select the appropriate one.",
            theyMightAskNext: [
              {
                question: "How does Strategy compare with Template Method?",
                answer: "Strategy uses object COMPOSITION to swap an entire algorithm at runtime. Template Method uses INHERITANCE to let subclasses override specific steps of an algorithm while keeping the overarching skeleton fixed."
              }
            ],
            usedInProduction: "Spring `PasswordEncoder`, layout managers in UI frameworks, and route navigation engines in Google Maps/Uber.",
            relatedTopics: ["Open/Closed Principle", "State Pattern", "Template Method"]
          }
        },
        {
          id: "lld-behav-2",
          question: "How does the Observer Pattern work and how do you prevent Memory Leaks with Weak References?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Observer pattern defines a one-to-many dependency between objects: when one subject changes state, all registered observers are notified automatically. A major trap is the 'Lapsed Listener' memory leak: the subject holds strong references to observers in an internal list, preventing the garbage collector from reclaiming observers even when clients discard them. Fix using WeakReferences (`WeakHashMap`) or explicit unsubscribe lifecycle hooks.",
            mentalModel: "Subscribing to a YouTube channel: when a creator uploads a video (event), all 1,000,000 subscribers receive a push notification. If you delete your account without unsubscribing, the channel shouldn't keep sending letters to your abandoned mailbox.",
            whatItIs: "The in-memory foundation for Event-Driven Architecture, Reactive Streams, and Model-View-Controller (MVC).",
            whyItExists: "Decouples the event publisher from subscriber classes; subjects don't know concrete observer implementations.",
            codeDemo: {
              language: "java",
              code: "public interface StockObserver {\n    void onPriceUpdate(String stock, double price);\n}\n\npublic class StockTicker {\n    // Strong reference list can cause memory leaks if listeners never unsubscribe!\n    // Set<StockObserver> observers = Collections.newSetFromMap(new WeakHashMap<>());\n    private final List<StockObserver> observers = new CopyOnWriteArrayList<>();\n\n    public void register(StockObserver o) { observers.add(o); }\n    public void unregister(StockObserver o) { observers.remove(o); }\n\n    public void updatePrice(String stock, double price) {\n        for (StockObserver o : observers) {\n            o.onPriceUpdate(stock, price); // Notify all registered observers\n        }\n    }\n}"
            },
            tradeoffs: "Notifications can be sent in random order; slow observers in synchronous loops block all subsequent observers. In high-concurrency systems, use asynchronous event buses or queues.",
            theyMightAskNext: [
              {
                question: "What is the difference between Push and Pull observer models?",
                answer: "Push passes all detailed event data directly in the callback parameters (`update(temp, humidity, pressure)`). Pull passes only a reference to the subject, letting observers fetch only the specific fields they care about."
              }
            ],
            usedInProduction: "Spring `ApplicationEventPublisher`, Java Swing `ActionListener`, and RxJava / Project Reactor observable streams.",
            relatedTopics: ["Spring Application Events", "Strategy Pattern", "Mediator Pattern"]
          }
        },
        {
          id: "lld-behav-3",
          question: "How does the State Pattern eliminate complex switch-case statements in Finite State Machines (FSM)?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The State pattern allows an object to alter its behavior when its internal state changes, appearing to change its class. It encapsulates each state into an independent class implementing a common `State` interface, and delegates state transitions cleanly, completely eliminating 500-line conditional `switch(state)` blocks.",
            mentalModel: "A smartphone lock button: if the phone state is `ScreenOffState`, pressing the power button turns on the lock screen. If state is `ScreenOnState`, pressing power turns off the screen. If state is `RingingCallState`, pressing power silences the ringtone. The exact same physical button press executes completely different behavior based on current internal state.",
            whatItIs: "An object-oriented implementation of a Finite State Machine (FSM).",
            whyItExists: "Adding new states (e.g. `REFUND_PENDING`) in traditional code requires modifying 20 different methods with fragile switch statements, violating OCP.",
            codeDemo: {
              language: "java",
              code: "// State Interface\npublic interface OrderState {\n    void pay(OrderContext ctx);\n    void ship(OrderContext ctx);\n    void cancel(OrderContext ctx);\n}\n\npublic class CreatedState implements OrderState {\n    public void pay(OrderContext ctx) {\n        System.out.println(\"Payment processed.\");\n        ctx.setState(new PaidState()); // Transition to next state!\n    }\n    public void ship(OrderContext ctx) { throw new IllegalStateException(\"Cannot ship unpaid order!\"); }\n    public void cancel(OrderContext ctx) { ctx.setState(new CancelledState()); }\n}\n\npublic class PaidState implements OrderState {\n    public void pay(OrderContext ctx) { throw new IllegalStateException(\"Already paid!\"); }\n    public void ship(OrderContext ctx) { ctx.setState(new ShippedState()); }\n    public void cancel(OrderContext ctx) { /* trigger refund */ ctx.setState(new RefundedState()); }\n}"
            },
            tradeoffs: "Increases class count (each state is a separate class). If a state machine has only 2 simple states that will never change, an enum with a boolean check is simpler.",
            theyMightAskNext: [
              {
                question: "Where should state transitions be defined: in the Context or in the Concrete States?",
                answer: "If transitions are fixed and sequential, states transitioning themselves promotes autonomy. If transitions are dynamic or driven by external business rules, managing transitions in the Context or an orchestrator is cleaner."
              }
            ],
            usedInProduction: "Vending machines, ATM controllers, e-commerce order status lifecycles, and TCP connection state machines (`LISTEN`, `SYN_SENT`, `ESTABLISHED`).",
            relatedTopics: ["Strategy Pattern", "Command Pattern", "Open/Closed Principle"]
          }
        },
        {
          id: "lld-behav-4",
          question: "How does the Command Pattern enable Undo/Redo operations and Transactional Queues?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Command pattern encapsulates a request as a standalone object containing all information needed to execute the action: the receiver, the method, and the arguments. This enables queuing requests, logging actions, scheduling, and implementing reversible operations by adding an `undo()` method that inverts the state changes.",
            mentalModel: "A restaurant waiter taking an order: the waiter writes your order on an individual ticket (Command object). The ticket sits in the kitchen queue, can be logged, delayed, prioritized, or cancelled/voided (undo) before the cook (Receiver) prepares the meal.",
            whatItIs: "An object-oriented callback abstraction. Usually declares `execute()` and `undo()`.",
            whyItExists: "Decouples the invoker (e.g. a UI button or scheduler) from the receiver executing the business logic.",
            codeDemo: {
              language: "java",
              code: "public interface Command {\n    void execute();\n    void undo();\n}\n\npublic class BoldCommand implements Command {\n    private final TextEditor editor;\n    private String previousState;\n\n    public BoldCommand(TextEditor editor) { this.editor = editor; }\n\n    public void execute() {\n        previousState = editor.getText();\n        editor.setText(\"<b>\" + previousState + \"</b>\");\n    }\n    public void undo() {\n        editor.setText(previousState); // Reverts back to snapshot!\n    }\n}\n\n// Invoker managing Undo/Redo history stack:\npublic class CommandManager {\n    private final Deque<Command> history = new ArrayDeque<>();\n    public void executeCommand(Command c) {\n        c.execute();\n        history.push(c);\n    }\n    public void undo() {\n        if (!history.isEmpty()) history.pop().undo();\n    }\n}"
            },
            tradeoffs: "Maintaining undo stacks consumes memory because the system must store snapshots of previous states or inverse deltas.",
            theyMightAskNext: [
              {
                question: "How does Command Pattern relate to the Memento Pattern?",
                answer: "The Command pattern encapsulates the action to be performed, while the Memento pattern captures and externalizes an object's internal state snapshot without violating encapsulation, often used together for undo history."
              }
            ],
            usedInProduction: "GUI text editors (Ctrl+Z), database transaction commit/rollback managers, and task queues in distributed workflow engines.",
            relatedTopics: ["State Pattern", "Chain of Responsibility", "Transactional Outbox Pattern"]
          }
        },
        {
          id: "lld-behav-5",
          question: "How does the Chain of Responsibility Pattern work in middleware and Servlet Filters?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Chain of Responsibility pattern passes a request along a chain of handlers. Upon receiving a request, each handler decides either to process the request and pass it to the next handler in the chain, or short-circuit and reject the request immediately.",
            mentalModel: "Airport security checkpoint: Step 1 verifies boarding pass (rejects if invalid). Step 2 scans luggage for metal. Step 3 checks passport at immigration. If any officer rejects your passport, the line ends immediately; only if all officers approve do you reach the departure gate.",
            whatItIs: "Decouples request senders from receivers by giving multiple objects a chance to handle or sanitize the request.",
            whyItExists: "Allows adding, reordering, and disabling filters (e.g. Auth -> RateLimit -> CORS -> Logging) dynamically without touching controller code.",
            codeDemo: {
              language: "java",
              code: "public abstract class Middleware {\n    private Middleware next;\n\n    public static Middleware link(Middleware first, Middleware... chain) {\n        Middleware head = first;\n        for (Middleware nextInChain : chain) {\n            head.next = nextInChain;\n            head = nextInChain;\n        }\n        return first;\n    }\n\n    public abstract boolean check(String user, String role);\n\n    protected boolean checkNext(String user, String role) {\n        if (next == null) return true;\n        return next.check(user, role);\n    }\n}\n\npublic class RateLimitMiddleware extends Middleware {\n    public boolean check(String user, String role) {\n        if (isRateLimited(user)) return false; // Short-circuit!\n        return checkNext(user, role); // Forward down the chain\n    }\n}"
            },
            tradeoffs: "A request can reach the end of the chain unhandled if no handler claims it, requiring a sensible default fallback.",
            theyMightAskNext: [
              {
                question: "How do Spring Security Filters implement Chain of Responsibility?",
                answer: "Via `SecurityFilterChain`: requests flow through `CorsFilter`, `CsrfFilter`, `JwtAuthFilter`, and `AuthorizationFilter`, each invoking `filterChain.doFilter(request, response)`."
              }
            ],
            usedInProduction: "Java Servlet `FilterChain`, Express.js middleware, Spring Security, and multi-tier corporate expense approval systems ($100 manager -> $1,000 director -> $10,000 VP).",
            relatedTopics: ["Spring Security Filter Chain", "Decorator Pattern", "Command Pattern"]
          }
        },
        {
          id: "lld-behav-6",
          question: "How do you implement a Thread-Safe Producer-Consumer Queue in Java using ReentrantLock and Condition?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Use a circular array or linked nodes guarded by a `ReentrantLock` with TWO conditions: `notFull` (producers await when buffer is at capacity) and `notEmpty` (consumers await when buffer is empty). When a producer pushes an item, it signals `notEmpty`; when a consumer polls an item, it signals `notFull`.",
            mentalModel: "A restaurant order carousel: if the shelf is full (10 plates), chefs stop cooking and wait (`notFull.await()`). When a waiter grabs a plate, the shelf has space, so the waiter taps the chef (`notFull.signal()`). If the shelf is empty, waiters wait (`notEmpty.await()`) until a chef places food down.",
            whatItIs: "The core algorithmic implementation of `java.util.concurrent.ArrayBlockingQueue`.",
            whyItExists: "Decouples producing and consuming threads operating at different speeds without busy-waiting (100% CPU burn loops).",
            codeDemo: {
              language: "java",
              code: "public class CustomBlockingQueue<T> {\n    private final Object[] items;\n    private int count, putIndex, takeIndex;\n    private final ReentrantLock lock = new ReentrantLock();\n    private final Condition notEmpty = lock.newCondition();\n    private final Condition notFull = lock.newCondition();\n\n    public CustomBlockingQueue(int capacity) { this.items = new Object[capacity]; }\n\n    public void put(T item) throws InterruptedException {\n        lock.lock();\n        try {\n            while (count == items.length) {\n                notFull.await(); // Buffer full: wait for consumers\n            }\n            items[putIndex] = item;\n            if (++putIndex == items.length) putIndex = 0;\n            count++;\n            notEmpty.signal(); // Notify waiting consumers\n        } finally { lock.unlock(); }\n    }\n\n    @SuppressWarnings(\"unchecked\")\n    public T take() throws InterruptedException {\n        lock.lock();\n        try {\n            while (count == 0) {\n                notEmpty.await(); // Buffer empty: wait for producers\n            }\n            T item = (T) items[takeIndex];\n            if (++takeIndex == items.length) takeIndex = 0;\n            count--;\n            notFull.signal(); // Notify waiting producers\n            return item;\n        } finally { lock.unlock(); }\n    }\n}"
            },
            tradeoffs: "Always check condition in a `while` loop (not `if`), to guard against Spurious Wakeups where threads wake up without any signal.",
            theyMightAskNext: [
              {
                question: "Why is signal() preferred over signalAll() in this blocking queue?",
                answer: "Because adding 1 item only creates capacity for 1 waiting consumer; `signalAll()` wakes up 50 threads only for 49 of them to immediately re-enter sleep, causing wasteful context-switching thundering herd overhead."
              }
            ],
            usedInProduction: "Core engine of Java's `ArrayBlockingQueue`, thread pool work queues, and event dispatchers.",
            relatedTopics: ["ReentrantLock vs Synchronized", "Object Pool Pattern", "Observer Pattern"]
          }
        },
        {
          id: "lld-behav-7",
          question: "What is the Template Method Pattern and how does it enforce the Hollywood Principle ('Don't call us, we'll call you')?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Template Method pattern defines the skeleton of an algorithm in a base class method (marked `final`), deferring some specific steps to subclasses without changing the algorithm's overarching structure. Subclasses override hook methods, but the parent class controls the execution flow.",
            mentalModel: "Baking a cake according to a master culinary formula: Step 1: Pre-heat oven to 350°F (fixed). Step 2: Mix batter (hook: chocolate vs vanilla). Step 3: Bake for 30 mins (fixed). Step 4: Add frosting (hook: sprinkles vs chocolate fudge). Subclasses cannot change the temperature or bake time; they only customize the batter and frosting.",
            whatItIs: "Behavioral pattern using inheritance. The base method is `final` to prevent overriding the flow.",
            whyItExists: "Eliminates code duplication when multiple workflows share 90% identical step sequencing with 10% custom logic.",
            codeDemo: {
              language: "java",
              code: "public abstract class DataParserTemplate {\n    // Template method: Marked final to preserve invariant step ordering!\n    public final void processData() {\n        readRawData();\n        parse();       // Hook overridden by subclasses\n        validate();\n        saveToDatabase();\n    }\n\n    protected abstract void parse(); // Subclass provides concrete parsing\n    private void readRawData() { System.out.println(\"Reading file from disk\"); }\n    private void validate() { System.out.println(\"Validating schema\"); }\n    private void saveToDatabase() { System.out.println(\"Saving records to DB\"); }\n}\n\npublic class CsvParser extends DataParserTemplate {\n    @Override protected void parse() { System.out.println(\"Parsing CSV columns\"); }\n}\npublic class JsonParser extends DataParserTemplate {\n    @Override protected void parse() { System.out.println(\"Parsing JSON nodes\"); }\n}"
            },
            tradeoffs: "Template Method relies on inheritance, creating compile-time coupling. If you need to swap the parsing algorithm dynamically at runtime, use the Strategy Pattern with composition instead.",
            theyMightAskNext: [
              {
                question: "How does Spring Framework use Template Method?",
                answer: "`JdbcTemplate`, `RestTemplate`, and `TransactionTemplate`: they handle connection acquisition, transaction commit/rollback, and cleanup, letting you supply only the query or row mapper callback."
              }
            ],
            usedInProduction: "ETL pipelines, data import processors, and Spring `AbstractController` lifecycles.",
            relatedTopics: ["Strategy Pattern", "Factory Method", "Open/Closed Principle"]
          }
        }
      ]
    }
  ]
};
