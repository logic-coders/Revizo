import { Category } from "@/types";

export const java8BasicsCategory: Category = {
  id: "java8-basics",
  title: "Core Java 8 Features",
  subTopics: [
    {
      id: "lambda-expressions",
      title: "Lambda Expressions",
      questions: [
        {
          id: "j8-lambda-1",
          question: "What are Lambda Expressions in Java 8 and how do they work under the hood?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-09-15",
          answer: {
            quickAnswer: "A lambda is an anonymous function — a concise way to pass behavior as data using (parameters) -> expression, compiled via invokedynamic rather than generating an inner class.",
            mentalModel: "Think of a lambda like a sticky note with instructions. Instead of writing a full formal contract (anonymous inner class) every time you want to instruct someone, you jot down key steps on a sticky note. The receiver doesn't care who wrote it — just what action to execute.",
            whatItIs: "A lambda expression is a block of executable code passed without declaring a named method or class. It implements the single abstract method of a Functional Interface. Syntax: (parameters) -> expression or (parameters) -> { statements; }. Under the hood, the compiler creates a private synthetic method containing the lambda body and emits an invokedynamic instruction that bootstraps a CallSite producing an instance of the target functional interface at runtime.",
            whyItExists: "Prior to Java 8, passing behavior required cumbersome anonymous inner classes with 6+ lines of boilerplate. Lambdas enable functional programming, concise event handling, and make fluent APIs like Streams, Optional, and CompletableFuture practical.",
            codeDemo: {
              language: "java",
              code: "// Pre-Java 8: Anonymous class boilerplate\nComparator<String> oldComp = new Comparator<String>() {\n    @Override\n    public int compare(String s1, String s2) {\n        return s1.compareToIgnoreCase(s2);\n    }\n};\n\n// Java 8: Lambda expression (compact, type-inferred)\nComparator<String> newComp = (s1, s2) -> s1.compareToIgnoreCase(s2);\n\n// Inline with collections\nList<String> techStack = Arrays.asList(\"Kafka\", \"Redis\", \"Docker\");\ntechStack.forEach(item -> System.out.println(\"Deploying: \" + item));",
              explanation: "Compiler infers parameter types s1 and s2 from the target Comparator<String> interface context."
            },
            tradeoffs: "Lambdas cannot hold instance state (no instance fields) and cannot implement multiple methods. Deeply nested lambdas severely hurt readability and produce obscure stack traces containing synthetic names like lambda$main$0.",
            followUpQuestions: [
              {
                question: "Can a lambda modify a local variable from its enclosing scope?",
                answer: "No. Local variables captured by a lambda must be effectively final (assigned once). This eliminates thread-safety and race conditions when lambdas run concurrently on background threads."
              },
              {
                question: "What does 'this' refer to inside a lambda expression?",
                answer: "'this' refers to the enclosing class instance where the lambda is defined, unlike an anonymous inner class where 'this' refers to the anonymous class instance itself."
              }
            ],
            usedInProduction: "Used ubiquitously across Spring Boot controllers, filter chains, reactive Mono/Flux streams, and collection operations across Netflix, Uber, and Amazon backend microservices.",
            relatedTopics: ["Functional Interfaces", "Method References", "invokedynamic", "Stream API"]
          }
        },
        {
          id: "j8-lambda-2",
          question: "What is the difference between a Lambda and an Anonymous Inner Class?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-09-10",
          answer: {
            quickAnswer: "Lambdas implement single-method functional interfaces using invokedynamic without producing .class files; anonymous classes can extend any class or interface, have their own 'this' scope, and generate separate .class files.",
            mentalModel: "An anonymous class is hiring an external contractor who arrives with their own office, security badge, and identity. A lambda is handing a coworker a task slip — they execute it under your company badge in your office.",
            whatItIs: "Key differences: (1) Scope: Lambdas inherit lexical scope and 'this' from the enclosing class. Anonymous classes create their own 'this' scope. (2) Target: Lambdas only implement Functional Interfaces (single abstract method); anonymous classes can extend abstract/concrete classes and implement multi-method interfaces. (3) Compilation: Lambdas use invokedynamic bytecode and generate synthetic methods. Anonymous classes generate a disk file (e.g., MyClass$1.class) and full object overhead.",
            whyItExists: "Anonymous inner classes were designed in Java 1.1 for GUI callbacks but incurred heavy memory footprints and boilerplates. Java 8 introduced lambdas for zero-ceremony behavior passing.",
            comparisonTable: {
              title: "Lambda Expression vs Anonymous Inner Class Comparison",
              headers: ["Feature / Dimension", "Lambda Expression", "Anonymous Inner Class"],
              rows: [
                ["Target Type Supported", "Functional Interfaces strictly (interfaces with exactly one abstract method)", "Any interface (single or multi-method), abstract class, or concrete class"],
                ["Keyword 'this' Scoping", "Lexical scope: 'this' refers to the enclosing class instance", "Own scope: 'this' refers to the anonymous inner class instance itself"],
                ["Compilation Output", "No separate .class file generated; uses `invokedynamic` (LambdaMetafactory)", "Generates a separate physical bytecode file on disk (`OuterClass$1.class`)"],
                ["Instance Variables / State", "Cannot define instance fields (only local variables or captures)", "Can declare instance variables, initializer blocks, and multiple methods"],
                ["Memory & GC Impact", "Very low: stateless lambdas are cached/reused as singletons by the JVM runtime", "Higher: allocates a brand-new heap object with hidden outer reference on every instantiation"],
                ["Method Shadowing", "Cannot shadow enclosing local variables with same name", "Can shadow enclosing variables with its own member field names"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public class ScopeDemo {\n    private String label = \"OuterScope\";\n\n    public void test() {\n        // Anonymous class has its own 'this'\n        Runnable anon = new Runnable() {\n            private String label = \"AnonScope\";\n            @Override\n            public void run() {\n                System.out.println(this.label); // Prints \"AnonScope\"\n            }\n        };\n\n        // Lambda shares enclosing class 'this'\n        Runnable lambda = () -> {\n            System.out.println(this.label); // Prints \"OuterScope\"\n        };\n\n        anon.run();\n        lambda.run();\n    }\n}",
              explanation: "In the lambda, 'this' directly accesses the enclosing ScopeDemo fields, preventing shadowing confusion."
            },
            tradeoffs: "Use lambdas for 95% of single-method functional transformations. Use anonymous classes when you need mutable instance fields, multiple method overrides, or when overriding methods from concrete/abstract classes.",
            followUpQuestions: [
              {
                question: "Which has lower memory footprint?",
                answer: "Lambdas have lower memory overhead. The JVM caches and reuses stateless lambda call-site instances via LambdaMetafactory instead of creating new heap objects on every invocation."
              }
            ],
            usedInProduction: "Performance-critical reactive libraries like Project Reactor and RxJava utilize lambdas heavily to handle millions of events per second with minimal garbage collection churn.",
            relatedTopics: ["invokedynamic", "Memory Optimization", "Anonymous Inner Classes"]
          }
        },
        {
          id: "j8-lambda-3",
          question: "Why do local variables referenced in a Lambda have to be final or effectively final?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-09-12",
          answer: {
            quickAnswer: "Lambdas capture copies of local variables, not references to the stack frame. If local variables could be mutated, the lambda copy and stack variable would desynchronize, creating race conditions.",
            mentalModel: "Imagine photographing a whiteboard recipe before leaving the office. If someone later modifies the whiteboard after you leave, your photo doesn't magically change. To prevent confusion, Java demands the whiteboard remain untouched (effectively final).",
            whatItIs: "Local variables live on the thread stack frame and vanish when the enclosing method returns. If a lambda executes asynchronously on another thread (e.g., in a thread pool), the stack frame is already destroyed. Therefore, Java copies the value into the lambda object. For the illusion of shared scope to remain sound and thread-safe, the variable must never change after assignment.",
            whyItExists: "To prevent insidious concurrency bugs, heap/stack desynchronization, and memory leaks across threads.",
            codeDemo: {
              language: "java",
              code: "public void process() {\n    int threshold = 100; // Effectively final\n    List<Integer> numbers = Arrays.asList(50, 120, 200);\n\n    // Valid: reading effectively final local variable\n    numbers.stream().filter(n -> n > threshold).forEach(System.out::println);\n\n    // Compile Error if threshold is modified:\n    // threshold = 200; // Error: local variables referenced from a lambda must be final or effectively final\n\n    // Workaround for mutable counter (use AtomicInteger or holder object):\n    AtomicInteger counter = new AtomicInteger(0);\n    numbers.forEach(n -> counter.incrementAndGet());\n}",
              explanation: "AtomicInteger's reference remains final, while the internal heap state is safely mutated via atomic CAS operations."
            },
            tradeoffs: "Using AtomicInteger or array holders [0] to bypass effectively final rules in multi-threaded streams can introduce race conditions and violates functional purity.",
            followUpQuestions: [
              {
                question: "What is an 'effectively final' variable?",
                answer: "A variable whose value is never changed after initialization, even if the explicit 'final' keyword is omitted."
              },
              {
                question: "Why are instance/static variables exempt from the effectively final rule?",
                answer: "Instance and static variables reside in heap memory (not the stack), so threads share the exact same memory location rather than a captured stack copy."
              }
            ],
            usedInProduction: "Thread-pool executors and parallel stream tasks rely on effectively final immutability to ensure parallel workers read consistent configuration snapshots.",
            relatedTopics: ["Memory Model", "Concurrency", "Thread Stacks"]
          }
        },
        {
          id: "j8-lambda-4",
          question: "How does the JVM compile and execute Lambda expressions using invokedynamic?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "The Java compiler generates a private synthetic method containing the lambda logic and emits an invokedynamic instruction that delegates to LambdaMetafactory to dynamically construct a CallSite.",
            mentalModel: "Instead of printing a hardbound textbook at compile time (a .class file per anonymous class), the compiler writes a recipe ticket. When first requested, the chef (JVM) whips up an optimized dish and caches the result for future diners.",
            whatItIs: "Prior to Java 8, every anonymous class generated a physical .class file, causing JAR bloat and class-loader overhead. With invokedynamic: (1) Compiler compiles lambda body into a synthetic method (e.g., lambda$main$0). (2) An invokedynamic instruction points to LambdaMetafactory.metafactory. (3) On first call, LambdaMetafactory generates an inner class in memory using ASM and links a CallSite. (4) Subsequent invocations invoke the cached CallSite with direct method invocation speed.",
            whyItExists: "Decouples lambda translation strategy from bytecode generation, allowing future JVM updates to optimize lambda performance without recompiling existing code.",
            codeDemo: {
              language: "java",
              code: "// Source code:\nFunction<String, Integer> len = s -> s.length();\n\n// Conceptual compiler translation:\n// 1. Private synthetic method:\n// private static Integer lambda$main$0(String s) { return s.length(); }\n//\n// 2. Bytecode generated at call site:\n// invokedynamic #2,  0:apply:()Ljava/util/function/Function;\n//\n// 3. Runtime bootstrap via java.lang.invoke.LambdaMetafactory",
              explanation: "The JVM generates the call site dynamically at runtime, avoiding disk I/O and classloader pollution."
            },
            tradeoffs: "Invokedynamic gives near-zero startup penalty and superior steady-state optimization, but inspecting raw bytecode dumps during low-level profiling requires understanding method handles.",
            followUpQuestions: [
              {
                question: "Does invokedynamic create an instance every time for stateless lambdas?",
                answer: "No. For stateless lambdas (capturing no outer variables), the JVM returns a cached singleton instance on every call, avoiding heap allocations."
              }
            ],
            usedInProduction: "Crucial for high-throughput messaging brokers and low-latency financial systems where creating millions of short-lived objects would overwhelm garbage collection.",
            relatedTopics: ["invokedynamic", "JVM Architecture", "LambdaMetafactory"]
          }
        },
        {
          id: "j8-lambda-5",
          question: "How do you handle checked exceptions inside Lambda expressions?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "Standard functional interfaces do not declare checked exceptions; you must wrap the throwing call in a try-catch, wrap it in an unchecked RuntimeException, or create a custom ThrowingFunctionalInterface.",
            mentalModel: "Think of an airport security conveyor belt designed for carry-on bags. If you have an oversized hazardous package (checked exception), you must package it inside a standard approved container (RuntimeException) to pass through.",
            whatItIs: "Functional interfaces in java.util.function (like Function<T, R> or Consumer<T>) do not have throws clauses in their abstract methods. If your code calls a method declaring a checked exception (like IOException or SQLException), the compiler will reject the lambda unless handled.",
            whyItExists: "Checked exceptions were intentionally excluded from java.util.function to keep stream pipelines concise and unpolluted by exception signatures.",
            codeDemo: {
              language: "java",
              code: "// Approach 1: Inline try-catch wrapping in RuntimeException\nList<String> paths = Arrays.asList(\"file1.txt\", \"file2.txt\");\npaths.stream().map(path -> {\n    try {\n        return Files.readAllLines(Paths.get(path));\n    } catch (IOException e) {\n        throw new UncheckedIOException(e); // Clean standard wrapper\n    }\n}).forEach(System.out::println);\n\n// Approach 2: Reusable higher-order wrapper function\n@FunctionalInterface\npublic interface ThrowingFunction<T, R, E extends Exception> {\n    R apply(T t) throws E;\n}\n\npublic static <T, R> Function<T, R> unchecked(ThrowingFunction<T, R, Exception> f) {\n    return t -> {\n        try { return f.apply(t); }\n        catch (Exception e) { throw new RuntimeException(e); }\n    };\n}\n// Usage:\npaths.stream().map(unchecked(Files::readAllLines));",
              explanation: "The unchecked wrapper cleanly encapsulates the boilerplate, making stream pipelines readable and safe."
            },
            tradeoffs: "Wrapping in RuntimeException can hide errors from upstream handlers if not documented, while returning custom Result/Either types adds monadic overhead.",
            followUpQuestions: [
              {
                question: "What is SneakyThrows in Lombok?",
                answer: "Lombok's @SneakyThrows uses JVM bytecode manipulation to throw checked exceptions without declaring them in the method signature, bypassing compiler checks."
              }
            ],
            usedInProduction: "Widely used in ETL batch jobs and API gateways where reading files, parsing JSON, or network I/O must seamlessly operate within Java Streams.",
            relatedTopics: ["Exception Handling", "Functional Interfaces", "Lombok"]
          }
        },
        {
          id: "j8-lambda-6",
          question: "What is Target Typing and Type Inference in Java 8 Lambda Expressions?",
          difficulty: "Medium",
          frequency: 3,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "Target typing is how the Java compiler determines the type of a lambda expression based on the expected context (e.g., variable type, method parameter, or return type).",
            mentalModel: "A key (lambda) has no label indicating which lock it opens; you determine its purpose by testing which keyhole (target functional interface) it fits into.",
            whatItIs: "A lambda expression has no intrinsic type on its own. The compiler determines its type from its surrounding context, known as the target type. The target type must be a functional interface whose abstract method signature matches the lambda's parameters and return type.",
            whyItExists: "Enables developers to omit explicit type declarations on parameters (e.g., (s) -> s.length() instead of (String s) -> Integer), dramatically reducing code clutter.",
            codeDemo: {
              language: "java",
              code: "// Same lambda syntax, two completely different target types:\nCallable<String> callable = () -> \"Hello World\"; // Target: Callable<String>, can throw Exception\nSupplier<String> supplier = () -> \"Hello World\"; // Target: Supplier<String>, no checked exceptions\n\n// Ambiguity resolution via explicit cast:\nExecutorService executor = Executors.newSingleThreadExecutor();\n// If a method is overloaded with both Runnable and Callable:\nexecutor.submit((Callable<String>) () -> \"Result\"); // Disambiguated by cast",
              explanation: "The compiler inspects the target interface to deduce whether 'Hello World' satisfies Callable or Supplier."
            },
            tradeoffs: "Overloaded methods taking different functional interfaces with identical signatures (e.g., Consumer vs Action) can cause compiler ambiguity errors.",
            followUpQuestions: [
              {
                question: "Can a lambda expression be assigned to Object?",
                answer: "No, Object is not a functional interface. You must cast it: Object o = (Runnable) () -> System.out.println('hi');."
              }
            ],
            usedInProduction: "Standard pattern across Spring Framework API methods taking callbacks, allowing developers to pass lambdas naturally to overloaded methods.",
            relatedTopics: ["Type Inference", "Functional Interfaces", "Method Overloading"]
          }
        }
      ]
    },
    {
      id: "method-references",
      title: "Method References",
      questions: [
        {
          id: "j8-methodref-1",
          question: "What are Method References in Java 8 and what are the 4 distinct types?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-09-18",
          answer: {
            quickAnswer: "Method references are compact shorthands for lambdas that directly call an existing method using the :: operator, classified into 4 distinct types.",
            mentalModel: "If a lambda expression is like writing out instructions ('take this letter and mail it'), a method reference is like pointing to the mailbox ('Mailbox::deposit').",
            whatItIs: "When a lambda does nothing more than invoke an already existing method with its passed arguments, a method reference provides a cleaner syntax: ClassOrInstance::methodName. The 4 types are: (1) Reference to a static method: ContainingClass::staticMethod. (2) Reference to an instance method of a particular object: instance::instanceMethod. (3) Reference to an instance method of an arbitrary object of a particular type: ContainingClass::instanceMethod. (4) Reference to a constructor: ClassName::new.",
            whyItExists: "Reduces syntactic ceremony and highlights the name of the operation being performed rather than the parameter routing.",
            codeDemo: {
              language: "java",
              code: "List<String> names = Arrays.asList(\"Charlie\", \"Alice\", \"Bob\");\n\n// 1. Static method reference: (s -> Integer.parseInt(s))\nFunction<String, Integer> parser = Integer::parseInt;\n\n// 2. Bound instance method reference: (s -> System.out.println(s))\nConsumer<String> printer = System.out::println;\n\n// 3. Unbound instance method reference: ((s1, s2) -> s1.compareToIgnoreCase(s2))\nnames.sort(String::compareToIgnoreCase);\n\n// 4. Constructor reference: (name -> new Person(name))\nFunction<String, Person> personFactory = Person::new;",
              explanation: "Each method reference cleanly maps directly to its corresponding functional interface signature."
            },
            tradeoffs: "Method references cannot accept custom parameters or modify arguments before delegating; if argument alteration is needed, an explicit lambda must be used.",
            followUpQuestions: [
              {
                question: "How does the compiler distinguish between type 1 (static) and type 3 (arbitrary instance)?",
                answer: "The compiler inspects the target functional interface: if the first parameter of the functional interface matches the class type, it treats it as an unbound instance method (passing the first arg as 'this')."
              }
            ],
            usedInProduction: "Widely used across Stream transformations, DTO mapping pipelines, and logging calls in enterprise production systems.",
            relatedTopics: ["Lambda Expressions", "Constructor References", "Functional Programming"]
          }
        },
        {
          id: "j8-methodref-2",
          question: "What is the difference between Bound and Unbound Method References?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "A bound method reference is attached to an existing, pre-specified object instance, whereas an unbound method reference has the target object supplied as the first argument at invocation time.",
            mentalModel: "Bound: Telling someone to 'call Alice's phone number' (target is fixed). Unbound: Telling someone to 'call the phone number of whichever customer is next in line' (target is provided dynamically).",
            whatItIs: "Bound reference (instance::method): An instance already exists when the reference is created. The lambda takes N arguments, which become arguments to the instance method. Unbound reference (Class::method): No instance exists beforehand. The first argument of the target functional interface becomes the receiver object on which the method is invoked, and remaining arguments become method parameters.",
            whyItExists: "Allows clean functional mapping over collections of objects where each item in the collection is the target of the method call.",
            comparisonTable: {
              title: "Bound vs Unbound Method References in Java 8",
              headers: ["Dimension", "Bound Method Reference (instance::method)", "Unbound Method Reference (Class::method)"],
              rows: [
                ["Receiver Object Status", "Pre-existing instance is bound at reference creation time", "No instance bound; receiver instance is passed dynamically at invocation time"],
                ["Syntax Format", "`myObject::instanceMethod` or `System.out::println`", "`ClassName::instanceMethod` or `String::toUpperCase`"],
                ["Argument Mapping", "Lambda parameters become method parameters: `x -> obj.doWork(x)`", "First lambda argument becomes the target caller: `(x, y) -> x.doWork(y)`"],
                ["Functional Interface Arity", "Takes N arguments matching the method's parameters", "Takes N + 1 arguments (receiver object + method parameters)"],
                ["Garbage Collection Effect", "Holds a strong reference to the bound object, delaying GC", "Holds no instance reference; zero heap memory retention overhead"],
                ["Common Production Use", "Logging callbacks, pre-configured event listeners, UI button handlers", "Stream operations: `list.stream().map(User::getName).collect(...)`"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "String prefix = \"USER_\";\n\n// Bound: 'prefix' is already instantiated and bound\nPredicate<String> startsWithBound = prefix::startsWith;\n// Equivalent lambda: str -> prefix.startsWith(str)\n\n// Unbound: String::toUpperCase applies to whatever String is passed\nFunction<String, String> upperUnbound = String::toUpperCase;\n// Equivalent lambda: (String s) -> s.toUpperCase()\n\n// Unbound with two arguments (BiPredicate):\nBiPredicate<String, String> equalsUnbound = String::equalsIgnoreCase;\n// Equivalent lambda: (s1, s2) -> s1.equalsIgnoreCase(s2)",
              explanation: "In the unbound example, the first argument 's' becomes the caller (s.toUpperCase())."
            },
            tradeoffs: "Bound references hold a hard reference to the bound object, preventing garbage collection until the functional interface instance is collected.",
            followUpQuestions: [
              {
                question: "Can an unbound method reference target a private method?",
                answer: "Only if the functional interface is instantiated within the same class context where the private method is accessible."
              }
            ],
            usedInProduction: "Unbound references (e.g., User::getEmail, Order::getAmount) power 90% of Java 8 stream mapping and sorting operations in commercial applications.",
            relatedTopics: ["Method References", "Garbage Collection", "Stream API"]
          }
        },
        {
          id: "j8-methodref-3",
          question: "How do Constructor References (ClassName::new) work with collections and factories?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "Constructor references bind to ClassName::new and map to Supplier (no-arg), Function (1-arg), BiFunction (2-arg), or custom functional interfaces matching constructor signatures.",
            mentalModel: "Think of ClassName::new as giving someone a blueprint voucher. Whenever they redeem the voucher with parameters, the factory produces a freshly minted instance.",
            whatItIs: "A constructor reference is a specialized method reference that creates a new instance of a class. Syntax: ClassName::new or Type[]::new for array constructors. The compiler chooses which constructor to invoke based on the parameters required by the functional interface.",
            whyItExists: "Eliminates repetitive factory boilerplate code when instantiating DTOs, entities, or custom collections inside Stream collectors.",
            codeDemo: {
              language: "java",
              code: "// No-arg constructor -> Supplier\nSupplier<List<String>> listFactory = ArrayList::new;\nList<String> list = listFactory.get();\n\n// Single-arg constructor -> Function\nFunction<String, StringBuilder> sbFactory = StringBuilder::new;\nStringBuilder sb = sbFactory.apply(\"Initial\");\n\n// Array constructor -> IntFunction\nIntFunction<String[]> arrayFactory = String[]::new;\nString[] stringArray = arrayFactory.apply(10); // new String[10]\n\n// Real-world Stream collector with custom collection type:\nTreeSet<String> sortedSet = list.stream()\n    .collect(Collectors.toCollection(TreeSet::new));",
              explanation: "Collectors.toCollection(TreeSet::new) takes a Supplier that instantiates the exact collection type required."
            },
            tradeoffs: "Cannot invoke constructors that throw checked exceptions without custom exception wrappers or try-catch blocks.",
            followUpQuestions: [
              {
                question: "How do you pass constructor references for arrays in Stream.toArray()?",
                answer: "stream.toArray(String[]::new) passes an IntFunction<A[]> factory that allocates an array of the exact required size."
              }
            ],
            usedInProduction: "Standard pattern in Spring WebClient and Jackson deserialization pipelines for mapping JSON payloads into immutable domain models.",
            relatedTopics: ["Collectors", "Factory Pattern", "Generics"]
          }
        },
        {
          id: "j8-methodref-4",
          question: "When should you use a Lambda Expression instead of a Method Reference?",
          difficulty: "Easy",
          frequency: 3,
          lastVerified: "2026-10-06",
          answer: {
            quickAnswer: "Use a lambda when you need to transform or pass additional parameters, handle complex logic, resolve method ambiguity, or when the lambda is clearer than a convoluted method reference.",
            mentalModel: "If a direct shortcut exists with clear signage, take it (method reference). If you need to make a stop along the way to pick up an extra passenger or check your map, write out the route (lambda).",
            whatItIs: "Method references are preferred for brevity when an exact signature match exists. However, lambdas are required when: (1) You need to pass additional constant or calculated arguments. (2) Argument ordering differs. (3) Type ambiguity confuses the compiler. (4) The method reference name is misleading or less readable than parameter names.",
            whyItExists: "Balancing conciseness with code readability and intent.",
            codeDemo: {
              language: "java",
              code: "// Scenario 1: Passing additional arguments\n// Cannot do: list.forEach(printer::printWithPrefix);\n// Must use lambda:\nString prefix = \"[LOG] \";\nlist.forEach(item -> printer.printWithPrefix(prefix, item));\n\n// Scenario 2: Better readability when method name is ambiguous\n// Ambiguous or less clear:\nFunction<Person, Boolean> check1 = Person::isActive;\n// Clearer in some complex domains:\nPredicate<Person> check2 = person -> person.hasActiveSubscription();\n\n// Scenario 3: Null checks before invocation\nlist.stream()\n    .filter(obj -> obj != null && obj.isValid())\n    .forEach(System.out::println);",
              explanation: "Null checks, multi-parameter calls, and parameter transformations cannot be performed with method references."
            },
            tradeoffs: "Overusing method references when names are obscure or when methods are overloaded can lead to compiler errors or reduced readability.",
            followUpQuestions: [
              {
                question: "Does a method reference run faster than an equivalent lambda?",
                answer: "No, both are compiled via invokedynamic and execute with identical runtime performance."
              }
            ],
            usedInProduction: "Production codebases enforce style guides preferring method references only when they improve scannability without obscuring parameter logic.",
            relatedTopics: ["Code Readability", "Refactoring", "Clean Code"]
          }
        }
      ]
    },
    {
      id: "default-static-methods",
      title: "Default & Static Methods in Interfaces",
      questions: [
        {
          id: "j8-default-1",
          question: "Why were Default Methods introduced in interfaces and how do they enable backward compatibility?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-09-20",
          answer: {
            quickAnswer: "Default methods allow developers to add new methods with concrete implementations to existing interfaces without breaking any existing classes that implement those interfaces.",
            mentalModel: "Imagine a housing community contract that all homeowners signed. If the committee wants to add a new recycling program, forcing everyone to sign a new contract would cause chaos. Instead, the committee provides a default blue bin for everyone; if someone wants a custom bin, they can supply their own.",
            whatItIs: "A default method is an interface method marked with the 'default' keyword and containing a method body. Implementing classes inherit this method implementation by default without being forced to override it. They can optionally override it if specialized behavior is needed.",
            whyItExists: "Java 8 needed to add methods like stream(), parallelStream(), and forEach() to the java.util.Collection and Iterable interfaces. If interfaces could only have abstract methods, billions of lines of legacy code worldwide (e.g., Hibernate, Guava, custom collections) would fail to compile on Java 8.",
            codeDemo: {
              language: "java",
              code: "public interface PaymentProcessor {\n    void processPayment(double amount); // Core abstract method\n\n    // Added in v2.0 without breaking existing v1.0 clients\n    default void logTransaction(String transactionId) {\n        System.out.println(\"Default audit log for transaction: \" + transactionId);\n    }\n}\n\n// Existing legacy class compiles without changes!\npublic class LegacyPayPalProcessor implements PaymentProcessor {\n    @Override\n    public void processPayment(double amount) {\n        System.out.println(\"Processing $\" + amount + \" via PayPal\");\n    }\n    // Inherits logTransaction automatically\n}",
              explanation: "LegacyPayPalProcessor continues to compile and execute without implementing logTransaction."
            },
            tradeoffs: "Overusing default methods can turn interfaces into bloated pseudo-classes with utility methods, eroding clean separation of concerns.",
            followUpQuestions: [
              {
                question: "Can an interface have instance variables along with default methods?",
                answer: "No. All interface fields remain strictly public, static, and final (constants). Default methods can only access other interface methods and parameters, not mutable instance state."
              }
            ],
            usedInProduction: "The entire Java Collections framework (Collection.stream, List.sort, Map.computeIfAbsent) was retrofitted using default methods in Java 8.",
            relatedTopics: ["Interface Evolution", "Backward Compatibility", "Diamond Problem"]
          }
        },
        {
          id: "j8-default-2",
          question: "How does Java 8 resolve the Diamond Problem (multiple inheritance conflicts) with default methods?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-09-22",
          answer: {
            quickAnswer: "If a class implements two interfaces declaring the exact same default method signature, the compiler forces the implementing class to explicitly override the method and resolve the ambiguity.",
            mentalModel: "If two managers give you conflicting instructions on how to handle a customer dispute, company policy requires you to stand up, make a decision yourself, or explicitly delegate which manager's rule to follow.",
            whatItIs: "When Class C implements Interface A and Interface B, and both A and B declare default void display(), a diamond conflict occurs. Java resolves this with strict rules: (1) Class wins: Any method declared in a superclass always takes priority over any interface default method. (2) Sub-interface wins: If Interface B extends Interface A, B's default method wins (most specific). (3) Conflict: If neither extends the other, compilation fails until Class C overrides the method.",
            whyItExists: "Multiple inheritance in C++ created notorious runtime ambiguities. Java 8 resolves this cleanly at compile time by forcing explicit programmer intent.",
            codeDemo: {
              language: "java",
              code: "interface A {\n    default void log() { System.out.println(\"Log from Interface A\"); }\n}\n\ninterface B {\n    default void log() { System.out.println(\"Log from Interface B\"); }\n}\n\n// Compilation error without explicit override:\npublic class DiamondService implements A, B {\n    @Override\n    public void log() {\n        // Option 1: Explicitly delegate to interface A's implementation\n        A.super.log();\n\n        // Option 2: Or delegate to B: B.super.log();\n        // Option 3: Or provide entirely custom logic\n        System.out.println(\"Custom resolution in DiamondService\");\n    }\n}",
              explanation: "Using A.super.log() explicitly invokes the desired interface's default implementation."
            },
            tradeoffs: "Developers must remember the InterfaceName.super.methodName() syntax to disambiguate interface defaults.",
            followUpQuestions: [
              {
                question: "What happens if one interface provides a default method and the other provides an abstract method?",
                answer: "The class still must override the method! An abstract method always forces an implementation, even if a peer interface has a default."
              }
            ],
            usedInProduction: "Microservice event-driven listeners implementing both Auditable and Traceable interfaces use this disambiguation to route telemetry streams.",
            relatedTopics: ["Diamond Problem", "Multiple Inheritance", "OOP Principles"]
          }
        },
        {
          id: "j8-default-3",
          question: "Can a default method override methods from java.lang.Object (equals, hashCode, toString)?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-09-25",
          answer: {
            quickAnswer: "No, the Java compiler forbids default methods from overriding methods from java.lang.Object, because the 'Class Wins' rule means Object's implementation would always take precedence anyway.",
            mentalModel: "All roads lead to Rome. Since every single Java class descends from java.lang.Object, any method in Object already has a class implementation that would override and hide the interface's default method.",
            whatItIs: "If an interface attempts to declare default String toString() or default boolean equals(Object o), a compile-time error occurs: 'default method toString in interface MyInterface overrides a member of java.lang.Object'. Under Java 8 resolution rules, class implementations always override interface default methods. Because java.lang.Object is the root of all classes, Object.toString() would always win, making an interface default method dead, unreachable code.",
            whyItExists: "Prevents confusing runtime semantics and preserves the fundamental contract of Object equality and identity across Java.",
            codeDemo: {
              language: "java",
              code: "public interface BadInterface {\n    // COMPILE ERROR:\n    // default boolean equals(Object obj) {\n    //     return true;\n    // }\n\n    // COMPILE ERROR:\n    // default String toString() {\n    //     return \"InterfaceToString\";\n    // }\n\n    // LEGAL: Abstract declaration is fine\n    boolean equals(Object obj); // Valid abstract declaration (e.g. in Comparator)\n}",
              explanation: "Declaring abstract methods that re-declare Object methods is allowed (like Comparator.equals), but default implementations are forbidden."
            },
            tradeoffs: "Interfaces cannot define default structural equality; that responsibility remains strictly with concrete domain classes or records.",
            followUpQuestions: [
              {
                question: "Why does java.util.Comparator declare equals(Object obj) if it's already in Object?",
                answer: "It serves as API documentation to emphasize that two distinct Comparators can be equal if they enforce identical ordering, and it allows documentation of equality contracts."
              }
            ],
            usedInProduction: "Standard interview litmus test used by top tech companies to verify deep comprehension of the Java 8 type system.",
            relatedTopics: ["java.lang.Object", "Type Hierarchy", "Class Wins Rule"]
          }
        },
        {
          id: "j8-default-4",
          question: "What are Static Methods in interfaces and how do they differ from default methods?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-09-26",
          answer: {
            quickAnswer: "Static methods in interfaces contain utility implementations that belong strictly to the interface type, are not inherited by implementing classes, and must be called using InterfaceName.methodName().",
            mentalModel: "A default method is a tool included in the standard toolbox that every apprentice receives. A static method is a stationary machine bolted to the factory wall — you must walk up to the machine itself to use it.",
            whatItIs: "Java 8 allows static methods in interfaces. Unlike default methods: (1) Static methods are NOT inherited by implementing classes. (2) They cannot be overridden. (3) They cannot be invoked via instance references; they must be accessed directly via the interface name: MyInterface.staticMethod().",
            whyItExists: "Eliminates the need for companion utility classes (like Collections for Collection, or Paths for Path). Utility methods can now reside directly inside the interface they pertain to.",
            codeDemo: {
              language: "java",
              code: "public interface Validator {\n    boolean isValid(String input);\n\n    // Static utility method inside interface\n    static boolean isNullOrEmpty(String str) {\n        return str == null || str.trim().isEmpty();\n    }\n}\n\npublic class UserValidator implements Validator {\n    @Override\n    public boolean isValid(String input) {\n        // Invoking interface static method\n        return !Validator.isNullOrEmpty(input);\n    }\n}\n\n// Usage:\nboolean empty = Validator.isNullOrEmpty(\"\"); // Must use Validator.isNullOrEmpty\n// UserValidator.isNullOrEmpty(\"\"); // COMPILE ERROR: Not inherited by child class!",
              explanation: "Static methods are scoped to the interface namespace only and never pollute the namespace of implementing classes."
            },
            tradeoffs: "Developers often mistakenly attempt to invoke static interface methods via implementing class references, leading to confusion.",
            followUpQuestions: [
              {
                question: "Can an interface static method be private?",
                answer: "In Java 8, no (public only). Java 9 introduced private static and private instance methods in interfaces for helper logic reuse."
              }
            ],
            usedInProduction: "Heavily used in modern Java standard library: Stream.of(), Comparator.comparing(), Function.identity(), and Map.entry().",
            relatedTopics: ["Static Methods", "Utility Classes", "Comparator.comparing"]
          }
        },
        {
          id: "j8-default-5",
          question: "What are the differences between an Abstract Class and an Interface with default methods?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-09-28",
          answer: {
            quickAnswer: "Abstract classes have constructors, instance fields (mutable state), and participate in single inheritance; interfaces with default methods support multiple inheritance, cannot have instance state, and have no constructors.",
            mentalModel: "An abstract class is a parent DNA lineage — you can only have one biological parent, and you inherit physical traits (state). An interface is a club membership — you can join many clubs, and each gives you privileges (methods), but no physical organs.",
            whatItIs: "Even with default methods, interfaces are fundamentally different from abstract classes: (1) State: Interfaces cannot have instance fields (only public static final constants). Abstract classes can have mutable instance variables. (2) Constructors: Abstract classes have constructors invoked via super(); interfaces have no constructors. (3) Inheritance: A class can implement multiple interfaces but extend only one class. (4) Access modifiers: Interface methods are implicitly public; abstract classes can have protected and package-private members.",
            whyItExists: "Interfaces define capabilities ('what a class can do'), whereas abstract classes define identity ('what a class is').",
            comparisonTable: {
              title: "Abstract Class vs Interface with Default Methods",
              headers: ["Feature / Capability", "Abstract Class", "Interface with Default Methods"],
              rows: [
                ["Inheritance Model", "Single inheritance (a class can extend only one abstract class)", "Multiple inheritance (a class can implement multiple interfaces)"],
                ["Instance State / Fields", "Can have mutable instance variables and non-final fields", "Cannot have instance state; only `public static final` constants allowed"],
                ["Constructors", "Can declare constructors invoked by subclasses via `super()`", "No constructors allowed"],
                ["Access Modifiers", "Can have public, protected, package-private, or private methods and fields", "All methods and constants are implicitly `public` (private allowed in Java 9+)"],
                ["Speed & Bytecode Dispatch", "Faster invocation via `invokevirtual` with direct vtable lookup", "Slightly slower initial resolution via `invokeinterface` with itable lookup"],
                ["Design Philosophy", "\"Is-a\" relationship (identity, shared state, class hierarchy)", "\"Can-do\" relationship (capabilities, behavioral contracts, mixins)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public abstract class AbstractVehicle {\n    protected String vin; // Instance state allowed\n    public AbstractVehicle(String vin) { this.vin = vin; } // Constructor allowed\n    public abstract void drive();\n}\n\npublic interface ElectricVehicle {\n    // Cannot have: private int batteryLevel;\n    // Cannot have constructor!\n\n    default void charge() {\n        System.out.println(\"Charging at standard 220V...\");\n    }\n}\n\n// Combining both:\npublic class TeslaModel3 extends AbstractVehicle implements ElectricVehicle {\n    public TeslaModel3(String vin) { super(vin); }\n    @Override\n    public void drive() { System.out.println(\"Driving silently...\"); }\n}",
              explanation: "TeslaModel3 inherits state from AbstractVehicle and behavioral defaults from ElectricVehicle."
            },
            tradeoffs: "Use interfaces when defining behavioral contracts across disparate hierarchies. Use abstract classes when sharing internal state, constructors, or non-public methods among tightly related subclasses.",
            followUpQuestions: [
              {
                question: "Can an interface have protected default methods?",
                answer: "No, all interface members in Java 8 are public."
              }
            ],
            usedInProduction: "Spring Security and Kafka consumer architectures combine abstract base classes (holding socket state and thread pools) with interfaces defining callback contracts.",
            relatedTopics: ["Polymorphism", "Abstract Classes", "OOP Architecture"]
          }
        },
        {
          id: "j8-default-6",
          question: "What is the 'Class Wins' rule in Java 8 method conflict resolution?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "The 'Class Wins' rule states that a method implementation declared in a superclass or class hierarchy always takes precedence over any default method provided by an implemented interface.",
            mentalModel: "Family heritage beats company policy. If your family tradition dictates how you prepare dinner, that always overrules any default suggestions in a community cooking handbook.",
            whatItIs: "When resolving method invocations in a class that both extends a base class and implements an interface: if the base class provides a concrete implementation of a method with matching signature, that class method is ALWAYS executed. The interface's default method is completely ignored and overridden.",
            whyItExists: "Preserves backward compatibility and prevents interface defaults from silently breaking existing class hierarchy behaviors when upgrading to Java 8.",
            codeDemo: {
              language: "java",
              code: "public class BasePrinter {\n    public void print() {\n        System.out.println(\"BasePrinter: Printing on paper\");\n    }\n}\n\npublic interface DigitalPrinter {\n    default void print() {\n        System.out.println(\"DigitalPrinter: Printing PDF\");\n    }\n}\n\n// MultiPrinter inherits both BasePrinter and DigitalPrinter\npublic class MultiPrinter extends BasePrinter implements DigitalPrinter {\n    // No need to override print() — Class Wins rule applies!\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        MultiPrinter p = new MultiPrinter();\n        p.print(); // Prints: \"BasePrinter: Printing on paper\"\n    }\n}",
              explanation: "BasePrinter.print() wins over DigitalPrinter.print() without causing any compilation error or ambiguity."
            },
            tradeoffs: "If a developer intended to use the interface's default method, they must explicitly override the method in the subclass and call DigitalPrinter.super.print().",
            followUpQuestions: [
              {
                question: "What happens if the superclass method is abstract?",
                answer: "If the superclass method is abstract, the subclass must implement it; the interface default method does NOT satisfy the abstract class requirement."
              }
            ],
            usedInProduction: "Crucial rule when upgrading enterprise frameworks to Java 8, ensuring existing base classes maintain their behavioral integrity.",
            relatedTopics: ["Class Wins Rule", "Inheritance", "Diamond Problem"]
          }
        }
      ]
    }
  ]
};
