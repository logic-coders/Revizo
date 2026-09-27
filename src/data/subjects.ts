import { Subject } from "@/types";

export const subjects: Subject[] = [
  {
    "id": "java-8",
    "slug": "java-8",
    "title": "Java 8",
    "tagline": "Lambda expressions, Streams, and functional programming",
    "description": "Master the revolutionary features introduced in Java 8 — from lambda expressions and the Stream API to the new Date/Time API and Optional class.",
    "icon": "☕",
    "difficulty": "Beginner to Advanced",
    "totalQuestions": 15,
    "color": "#f89820",
    "gradient": "linear-gradient(135deg, #f89820 0%, #e76f00 100%)",
    "categories": [
      {
        "id": "java8-basics",
        "title": "Core Java 8 Features",
        "icon": "⚡",
        "subTopics": [
          {
            "id": "lambda-expressions",
            "title": "Lambda Expressions",
            "questions": [
              {
                "id": "j8-lambda-1",
                "question": "What are Lambda Expressions in Java 8?",
                "difficulty": "Easy",
                "frequency": 5,
                "lastVerified": "2026-09-15",
                "answer": {
                  "quickAnswer": "A lambda is an anonymous function — a concise way to pass behavior (code) as data, using the syntax (parameters) -> expression.",
                  "mentalModel": "Think of a lambda like a sticky note with instructions. Instead of writing a full letter (anonymous inner class) every time you want to tell someone how to do something, you jot down the key steps on a sticky note and hand it over. The receiver doesn't care who wrote it — just what it says.",
                  "whatItIs": "A lambda expression is a block of code that can be passed around and executed later. It implements the single abstract method of a functional interface, without the ceremony of declaring a class. Syntax: (parameters) -> expression or (parameters) -> { statements; }. The compiler infers parameter types from the target functional interface's method signature.",
                  "whyItExists": "Before Java 8, passing behavior required verbose anonymous inner classes — 6+ lines of boilerplate just to say 'compare these two strings.' Lambdas were introduced to enable functional programming patterns, reduce visual noise, and make APIs like Collections and Streams practical. Without them, the entire Stream API would be unusably verbose.",
                  "codeDemo": {
                    "language": "java",
                    "code": "// Before Java 8 — anonymous inner class\nComparator<String> oldWay = new Comparator<String>() {\n    @Override\n    public int compare(String s1, String s2) {\n        return s1.compareTo(s2);\n    }\n};\n\n// Java 8 — lambda expression (same thing, one line)\nComparator<String> newWay = (s1, s2) -> s1.compareTo(s2);\n\n// Using lambda with forEach\nList<String> names = Arrays.asList(\"Alice\", \"Bob\", \"Charlie\");\nnames.forEach(name -> System.out.println(\"Hello, \" + name));\n\n// Lambda with Predicate\nPredicate<Integer> isEven = n -> n % 2 == 0;\nSystem.out.println(isEven.test(4)); // true\n\n// Multi-line lambda\nFunction<String, Integer> wordCount = sentence -> {\n    String[] words = sentence.split(\"\\\\s+\");\n    return words.length;\n};",
                    "explanation": "The compiler infers parameter types from the functional interface context — you never need to declare them explicitly."
                  },
                  "tradeoffs": "Lambdas can't have state (no instance fields) or implement multiple methods — use an anonymous class when you need either. Deeply nested lambdas hurt readability; extract into named methods if the logic exceeds 3-4 lines. Debugging stack traces with lambdas can be cryptic (you'll see 'lambda$main$0' instead of a method name). Also, lambdas capture 'effectively final' variables only — you can't mutate outer variables inside a lambda.",
                  "followUpQuestions": [
                    {
                      "question": "Can a lambda expression modify a local variable from the enclosing scope?",
                      "answer": "No. Lambdas can only read — not modify — local variables from the enclosing scope. The variable must be 'effectively final' (assigned once and never changed). This prevents concurrency bugs when lambdas run on different threads. You can work around this by using an AtomicInteger or a single-element array, but it's a code smell."
                    },
                    {
                      "question": "What happens if you use 'this' inside a lambda vs an anonymous class?",
                      "answer": "'this' inside a lambda refers to the enclosing class instance (the class where the lambda is written). Inside an anonymous class, 'this' refers to the anonymous class instance itself. This is a subtle but critical difference that interviewers love to test."
                    },
                    {
                      "question": "Are lambdas compiled into anonymous inner classes?",
                      "answer": "No — they use invokedynamic (introduced in Java 7). The JVM generates a lightweight method at the call site, avoiding the overhead of creating a .class file for each lambda. This makes lambdas faster to instantiate than anonymous classes."
                    }
                  ],
                  "usedInProduction": "At Netflix, lambdas are used heavily with RxJava streams to define transformation chains for real-time recommendation pipelines — each lambda step processes millions of events per second without the overhead of full class instantiation.",
                  "relatedTopics": [
                    "Functional Interfaces",
                    "Method References",
                    "Stream API",
                    "Anonymous Inner Classes"
                  ]
                }
              },
              {
                "id": "j8-lambda-2",
                "question": "What is the difference between a Lambda and an Anonymous Inner Class?",
                "difficulty": "Medium",
                "frequency": 4,
                "lastVerified": "2026-09-10",
                "answer": {
                  "quickAnswer": "Lambdas implement single-method functional interfaces with less boilerplate; anonymous classes can implement any interface/abstract class but create a separate class with its own 'this' scope.",
                  "mentalModel": "An anonymous class is like hiring a contractor who brings their own office and identity badge. A lambda is like giving someone a task on a sticky note — they work with your badge, in your office, and there's no separate paperwork.",
                  "whatItIs": "Both provide inline implementations, but they differ in three critical ways: (1) Scope — lambdas inherit the enclosing 'this', anonymous classes define their own. (2) Capability — anonymous classes can implement multi-method interfaces and have instance fields; lambdas cannot. (3) Performance — lambdas use invokedynamic (no .class file generated), anonymous classes create a full inner class at compile time.",
                  "whyItExists": "Anonymous classes existed since Java 1.1 but were too verbose for the common case of 'pass one function.' Lambdas were added in Java 8 specifically to address that single-method use case — making functional APIs (Streams, CompletableFuture) viable. The distinction matters because using an anonymous class where a lambda suffices adds unnecessary overhead and noise.",
                  "codeDemo": {
                    "language": "java",
                    "code": "public class ThisDemo {\n    private String name = \"Outer\";\n\n    public void demonstrate() {\n        // Anonymous class — 'this' is the anonymous class\n        Runnable anon = new Runnable() {\n            private String name = \"Anonymous\";\n            @Override\n            public void run() {\n                System.out.println(this.name); // \"Anonymous\"\n            }\n        };\n\n        // Lambda — 'this' is the enclosing class (ThisDemo)\n        Runnable lambda = () -> {\n            System.out.println(this.name); // \"Outer\"\n        };\n\n        anon.run();   // prints \"Anonymous\"\n        lambda.run(); // prints \"Outer\"\n    }\n}",
                    "explanation": "The 'this' scoping difference is the #1 interview gotcha. Lambdas always see the enclosing instance."
                  },
                  "tradeoffs": "Use lambdas for the 95% case (single-method callbacks, stream operations, event handlers). Use anonymous classes when you need: (1) to implement multiple abstract methods, (2) instance state (fields), (3) to override methods from a concrete class, or (4) a distinct 'this' reference. Don't blindly convert all anonymous classes to lambdas — some genuinely need the full class semantics.",
                  "followUpQuestions": [
                    {
                      "question": "Which is more memory-efficient — lambda or anonymous class?",
                      "answer": "Lambdas are more efficient. Anonymous classes generate a separate .class file at compile time and instantiate a full object at runtime. Lambdas use invokedynamic — the JVM generates a lightweight call site on first use, then reuses it. For stateless lambdas, the JVM can even cache and reuse the same instance."
                    },
                    {
                      "question": "Can you serialize a lambda?",
                      "answer": "Yes, if the target functional interface extends Serializable. Cast it: Runnable r = (Runnable & Serializable) () -> System.out.println('hi'); — but it's fragile and generally discouraged. Serialized lambdas depend on synthetic method names that can change between compiles."
                    }
                  ],
                  "usedInProduction": "Spring Boot's WebFlux framework relies on this distinction — lambda-based reactive handlers (Mono/Flux chains) are preferred over anonymous classes for performance, while traditional @Controller classes with anonymous overrides are used in servlet-based stacks.",
                  "relatedTopics": [
                    "Lambda Expressions",
                    "Functional Interfaces",
                    "invokedynamic"
                  ]
                }
              },
              {
                "id": "j8-lambda-3",
                "question": "What is a Functional Interface in Java 8?",
                "difficulty": "Easy",
                "frequency": 5,
                "lastVerified": "2026-09-12",
                "answer": {
                  "quickAnswer": "A functional interface has exactly one abstract method — it's the type that a lambda expression targets. Annotated with @FunctionalInterface.",
                  "mentalModel": "Think of a functional interface as a contract with exactly one blank to fill in. A Predicate says 'give me a rule that returns true/false,' a Function says 'give me a transformation.' The lambda is what you write in that blank.",
                  "whatItIs": "An interface with exactly one abstract method (SAM — Single Abstract Method). It can have unlimited default and static methods. Java 8 introduced @FunctionalInterface to enforce this constraint at compile time. Key built-in interfaces: Predicate<T> (T→boolean), Function<T,R> (T→R), Consumer<T> (T→void), Supplier<T> (→T), UnaryOperator<T> (T→T), and BiFunction<T,U,R>.",
                  "whyItExists": "Lambdas need a target type — the compiler needs to know what method signature the lambda is implementing. Functional interfaces provide that contract. Without them, the compiler couldn't infer parameter types or validate the lambda body. They also enabled the Stream API's design: each operation takes a specific functional interface (filter→Predicate, map→Function, forEach→Consumer).",
                  "codeDemo": {
                    "language": "java",
                    "code": "// Custom functional interface\n@FunctionalInterface\ninterface MathOperation {\n    double operate(double a, double b);\n    // Can have default methods — still functional\n    default void log(String msg) {\n        System.out.println(\"Op: \" + msg);\n    }\n}\n\n// Built-in functional interfaces in action\nPredicate<String> isLong = s -> s.length() > 10;\nFunction<String, Integer> toLength = String::length;\nConsumer<String> printer = System.out::println;\nSupplier<List<String>> listFactory = ArrayList::new;\n\n// Composing interfaces — chaining behavior\nPredicate<String> isShort = isLong.negate();\nFunction<String, String> shout = String::toUpperCase;\nFunction<String, Integer> shoutLength = shout.andThen(toLength);\n\n// Custom interface usage\nMathOperation add = (a, b) -> a + b;\nMathOperation multiply = (a, b) -> a * b;\nSystem.out.println(add.operate(5, 3));      // 8.0\nSystem.out.println(multiply.operate(5, 3)); // 15.0",
                    "explanation": "@FunctionalInterface is optional but recommended — it prevents accidentally adding a second abstract method."
                  },
                  "tradeoffs": "The @FunctionalInterface annotation is a compile-time guard only — omitting it still lets the interface work as a lambda target, but removing the guard risks accidental breakage if someone adds a second abstract method. Don't create custom functional interfaces when a built-in one (Predicate, Function, Consumer, Supplier) fits — it fragments the API. BiFunction<T,U,R> tops out at two params; beyond that, consider a named method or a DTO.",
                  "followUpQuestions": [
                    {
                      "question": "Can a functional interface extend another interface?",
                      "answer": "Yes, as long as the resulting interface still has exactly one abstract method. If the parent has an abstract method and the child adds another, it's no longer functional. If the child only adds default/static methods, it remains functional."
                    },
                    {
                      "question": "What's the difference between Predicate and Function<T, Boolean>?",
                      "answer": "Functionally similar, but Predicate<T> is semantically clearer and provides composition methods like .and(), .or(), .negate() that Function<T, Boolean> doesn't have. Always prefer Predicate for boolean-returning logic."
                    }
                  ],
                  "usedInProduction": "Spring Data's Specification API uses Predicate-based functional interfaces to build dynamic, composable database queries — each specification is a lambda that defines a WHERE clause, and they're chained with .and()/.or() for complex filters.",
                  "relatedTopics": [
                    "Lambda Expressions",
                    "Method References",
                    "Stream API",
                    "java.util.function package"
                  ]
                }
              }
            ]
          },
          {
            "id": "method-references",
            "title": "Method References",
            "questions": [
              {
                "id": "j8-methodref-1",
                "question": "What are Method References and what are their types?",
                "difficulty": "Medium",
                "frequency": 4,
                "lastVerified": "2026-09-14",
                "answer": {
                  "quickAnswer": "A method reference is a shorthand for a lambda that just calls an existing method, using the :: operator. Four types: Static (Class::method), instance of a specific object (obj::method), instance of an arbitrary object (Class::method), and constructor (Class::new).",
                  "mentalModel": "If a lambda is a sticky note with instructions, a method reference is pointing at an existing instruction manual and saying 'just follow page 5.' You're not writing new instructions — you're referencing existing ones.",
                  "whatItIs": "Method references use the :: operator to refer to a method without invoking it. The compiler converts them to lambda expressions targeting the appropriate functional interface. The four types are: (1) Static: String::valueOf (2) Bound instance: System.out::println (3) Unbound instance: String::toUpperCase (4) Constructor: ArrayList::new. Each maps to a different lambda shape.",
                  "whyItExists": "When a lambda's only job is to call an existing method, writing x -> method(x) is redundant. Method references eliminate that ceremony, making stream pipelines read like a description of what happens: .map(String::toUpperCase).filter(Objects::nonNull).forEach(System.out::println) reads almost like English.",
                  "codeDemo": {
                    "language": "java",
                    "code": "List<String> names = Arrays.asList(\"alice\", \"bob\", \"charlie\");\n\n// 1. Static method reference\n//    Lambda equivalent: s -> String.valueOf(s)\nFunction<Object, String> toString = String::valueOf;\n\n// 2. Bound instance method (specific object)\n//    Lambda equivalent: s -> System.out.println(s)\nnames.forEach(System.out::println);\n\n// 3. Unbound instance method (arbitrary object of a type)\n//    Lambda equivalent: s -> s.toUpperCase()\nList<String> upper = names.stream()\n    .map(String::toUpperCase)\n    .collect(Collectors.toList());\n\n// 4. Constructor reference\n//    Lambda equivalent: s -> new StringBuilder(s)\nFunction<String, StringBuilder> sbCreator = StringBuilder::new;\n\n// Chaining in a stream pipeline\nnames.stream()\n    .filter(Objects::nonNull)\n    .map(String::trim)\n    .map(String::toUpperCase)\n    .sorted(String::compareTo)\n    .forEach(System.out::println);",
                    "explanation": "Method references are pure syntactic sugar — the compiler converts them to identical bytecode as the equivalent lambda."
                  },
                  "tradeoffs": "Method references are cleaner than lambdas when the lambda just delegates, but they become confusing when: (1) the method is overloaded (the compiler may struggle to resolve the right overload), (2) you need to add even slight logic (x -> method(x) + 1 can't be a method reference), (3) the reference is to a poorly-named method that loses context. Always prioritize readability — if a method reference requires a comment to explain what it does, use a lambda instead.",
                  "followUpQuestions": [
                    {
                      "question": "What's the difference between String::toUpperCase and s -> s.toUpperCase()?",
                      "answer": "They compile to functionally identical code. String::toUpperCase is an 'unbound instance method reference' — the JVM supplies the instance (s) as the first argument. The lambda form is more explicit. Use method reference when the intent is clear, lambda when you want to emphasize the parameter."
                    },
                    {
                      "question": "Can you use method references with methods that throw checked exceptions?",
                      "answer": "Only if the target functional interface's method signature declares the exception. Built-in interfaces (Function, Predicate) don't declare checked exceptions, so you'd need a custom functional interface or wrap the call in a try-catch inside a lambda."
                    }
                  ],
                  "usedInProduction": "In Spring Boot REST controllers, method references like UserService::findById are commonly used in Optional chains: userRepo.findById(id).map(UserDTO::from).orElseThrow(NotFoundException::new) — making the data flow pipeline highly readable.",
                  "relatedTopics": [
                    "Lambda Expressions",
                    "Functional Interfaces",
                    "Stream API"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "id": "java8-streams",
        "title": "Stream API",
        "icon": "🌊",
        "subTopics": [
          {
            "id": "stream-basics",
            "title": "Stream Fundamentals",
            "questions": [
              {
                "id": "j8-stream-1",
                "question": "What is the Stream API in Java 8?",
                "difficulty": "Easy",
                "frequency": 5,
                "lastVerified": "2026-09-15",
                "answer": {
                  "quickAnswer": "The Stream API is a pipeline abstraction for processing sequences of elements declaratively — filter, map, reduce — without mutating the source. It's not a data structure; it doesn't store data.",
                  "mentalModel": "Imagine a factory assembly line. Raw materials (data) enter at one end, pass through stations (filter, map, sort), and a finished product (collect/reduce) comes out the other end. The assembly line doesn't store materials — they flow through. You can even run multiple lines in parallel (parallelStream).",
                  "whatItIs": "A Stream is a lazily-evaluated pipeline of operations on a sequence of elements from a source (Collection, array, I/O, generator). Operations are either intermediate (return another Stream: filter, map, sorted, distinct, limit, flatMap) or terminal (produce a result and close the stream: collect, forEach, reduce, count, findFirst). Streams support sequential and parallel execution.",
                  "whyItExists": "Before Streams, processing collections required verbose imperative loops with mutable accumulators — error-prone, hard to parallelize, and difficult to compose. Streams brought a declarative, SQL-like style to Java: describe WHAT you want (filter employees by salary, group by department, compute average), not HOW to iterate. The lazy evaluation model also enables short-circuiting and efficient pipeline fusion.",
                  "codeDemo": {
                    "language": "java",
                    "code": "List<Employee> employees = getEmployees();\n\n// Filter, transform, and collect\nList<String> seniorDevNames = employees.stream()\n    .filter(e -> e.getExperience() > 5)\n    .filter(e -> \"Engineering\".equals(e.getDepartment()))\n    .map(Employee::getName)\n    .sorted()\n    .collect(Collectors.toList());\n\n// Aggregation\ndouble avgSalary = employees.stream()\n    .mapToDouble(Employee::getSalary)\n    .average()\n    .orElse(0.0);\n\n// Grouping\nMap<String, List<Employee>> byDept = employees.stream()\n    .collect(Collectors.groupingBy(Employee::getDepartment));\n\n// Parallel processing\nlong highEarners = employees.parallelStream()\n    .filter(e -> e.getSalary() > 100_000)\n    .count();",
                    "explanation": "Intermediate operations are lazy — nothing executes until a terminal operation (collect, count) is called."
                  },
                  "tradeoffs": "Streams add overhead for small collections (< 100 elements) — a simple for-loop is faster. parallelStream() is NOT always faster; it uses the common ForkJoinPool and can hurt performance for I/O-bound or small workloads. Streams are single-use — you can't reuse a stream after a terminal operation (IllegalStateException). Debugging is harder because breakpoints inside lambdas are less intuitive than in loops. For pure side-effect operations, a for-each loop is arguably more readable than .forEach().",
                  "followUpQuestions": [
                    {
                      "question": "What's the difference between Collection and Stream?",
                      "answer": "A Collection is a data structure that stores elements in memory (eager). A Stream is a computation pipeline that processes elements on-demand (lazy). Collections are about data; Streams are about computation on that data. You can create multiple streams from one collection, but each stream can only be consumed once."
                    },
                    {
                      "question": "When should you use parallelStream()?",
                      "answer": "Only when: (1) you have a large dataset (10,000+ elements), (2) the operations are CPU-bound (not I/O), (3) the operations are stateless and non-interfering, and (4) the source supports efficient splitting (ArrayList yes, LinkedList no). Profile before assuming it's faster — thread coordination overhead can make it slower."
                    },
                    {
                      "question": "Can you reuse a Stream?",
                      "answer": "No. A stream can only be consumed once — calling a terminal operation closes it. Attempting to reuse it throws IllegalStateException. If you need to process the same data multiple times, create a new stream from the source each time, or collect intermediate results."
                    }
                  ],
                  "usedInProduction": "At Uber, the Stream API is used in backend pricing services to compute fare estimates — filtering eligible drivers, mapping to distance/time calculations, and reducing to a final price, all in a single pipeline that processes millions of ride requests per minute.",
                  "relatedTopics": [
                    "Collectors & Reduction",
                    "Lambda Expressions",
                    "Parallel Streams",
                    "Optional Class"
                  ]
                }
              },
              {
                "id": "j8-stream-2",
                "question": "What is the difference between Intermediate and Terminal operations?",
                "difficulty": "Medium",
                "frequency": 4,
                "lastVerified": "2026-09-13",
                "answer": {
                  "quickAnswer": "Intermediate operations (filter, map, sorted) are lazy and return a new Stream; terminal operations (collect, forEach, reduce) are eager, trigger the pipeline, and produce a final result.",
                  "mentalModel": "Intermediate operations are like writing a recipe — you're describing steps but not cooking yet. The terminal operation is turning on the stove — that's when everything actually executes, step by step, for each ingredient (element).",
                  "whatItIs": "Intermediate operations (filter, map, flatMap, sorted, distinct, limit, skip, peek) build a pipeline description without executing it. They're lazy — nothing happens until a terminal operation is invoked. Terminal operations (collect, forEach, reduce, count, min, max, anyMatch, allMatch, findFirst, toArray) trigger the actual processing and consume the stream. A stream can chain many intermediates but has exactly one terminal.",
                  "whyItExists": "Lazy evaluation enables pipeline fusion: the JVM processes elements one at a time through the entire chain, rather than creating intermediate collections at each step. Combined with short-circuiting terminals (findFirst, anyMatch, limit), this can avoid processing the entire source — stopping as soon as enough results are found. This makes streams both memory-efficient (no intermediate lists) and potentially faster than eager step-by-step processing.",
                  "codeDemo": {
                    "language": "java",
                    "code": "List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);\n\n// peek() proves lazy evaluation — watch execution order\nList<Integer> result = numbers.stream()\n    .peek(n -> System.out.println(\"Filter: \" + n))\n    .filter(n -> n % 2 == 0)\n    .peek(n -> System.out.println(\"Map: \" + n))\n    .map(n -> n * n)\n    .limit(3) // short-circuits after 3 results!\n    .collect(Collectors.toList());\n// Only processes [1,2,3,4,5,6] — stops at 6, skips 7-10\n// Result: [4, 16, 36]\n\n// Stream is single-use!\nStream<String> s = List.of(\"a\", \"b\").stream();\ns.forEach(System.out::println);\n// s.forEach(System.out::println); // IllegalStateException!\n\n// Terminal operations\nboolean anyEven = numbers.stream().anyMatch(n -> n % 2 == 0);\nOptional<Integer> first = numbers.stream().findFirst();\nint sum = numbers.stream().reduce(0, Integer::sum);",
                    "explanation": "Elements flow through the pipeline one at a time (not in bulk). limit(3) causes short-circuiting — processing stops early."
                  },
                  "tradeoffs": "Lazy evaluation makes debugging tricky — you can't set a breakpoint on an intermediate and see all elements at once; use peek() for tracing. sorted() is a stateful intermediate operation that requires seeing ALL elements before it can emit any — it breaks lazy streaming for upstream operations. Infinite streams are possible (Stream.generate(), Stream.iterate()) but MUST pair with a short-circuiting terminal or limit() to avoid hanging.",
                  "followUpQuestions": [
                    {
                      "question": "Is sorted() truly lazy if it needs all elements?",
                      "answer": "sorted() is a 'barrier' operation — it's technically intermediate (returns a Stream), but internally it must consume all upstream elements before it can emit any. It defeats the laziness benefit for upstream operations but still maintains laziness for downstream operations."
                    },
                    {
                      "question": "What happens if you call two terminal operations on the same stream?",
                      "answer": "IllegalStateException: 'stream has already been operated upon or closed.' Streams are single-use by design. Create a new stream from the source for each terminal operation, or use a Supplier<Stream> to defer creation."
                    }
                  ],
                  "usedInProduction": "Apache Spark's Java API mirrors Stream semantics — lazy transformations followed by eager actions — so Java developers familiar with Streams can transfer that mental model directly to distributed data processing at terabyte scale.",
                  "relatedTopics": [
                    "Stream Fundamentals",
                    "Collectors & Reduction",
                    "Lazy Evaluation"
                  ]
                }
              }
            ]
          },
          {
            "id": "collectors",
            "title": "Collectors & Reduction",
            "questions": [
              {
                "id": "j8-collect-1",
                "question": "What are Collectors in Java 8?",
                "difficulty": "Medium",
                "frequency": 4,
                "lastVerified": "2026-09-11",
                "answer": {
                  "quickAnswer": "Collectors is a utility class that provides pre-built reduction strategies for Stream.collect() — turning streams into Lists, Maps, groups, joins, and statistics without manual loops.",
                  "mentalModel": "The stream is a conveyor belt of items. Collectors are the bins at the end — one bin sorts items by color (groupingBy), another counts them (counting), another merges them into one label (joining). You just pick which bin to use.",
                  "whatItIs": "The Collectors class provides factory methods for Collector implementations used with Stream.collect(). Key methods: toList(), toSet(), toMap(), groupingBy(), partitioningBy(), joining(), counting(), summarizingInt(), and toUnmodifiableList(). Collectors support downstream composition — groupingBy can nest counting, averaging, or mapping as a second-level aggregation.",
                  "whyItExists": "Without Collectors, every terminal stream operation that produces a collection would require manual accumulator logic (create list, loop, add). Collectors encapsulate mutable reduction patterns into reusable, declarative building blocks. Downstream composition enables complex SQL-like aggregations (GROUP BY department HAVING AVG(salary) > 100k) in a single fluent expression.",
                  "codeDemo": {
                    "language": "java",
                    "code": "List<Employee> employees = getEmployees();\n\n// Basic collection\nList<String> names = employees.stream()\n    .map(Employee::getName)\n    .collect(Collectors.toList());\n\n// Grouping by department\nMap<String, List<Employee>> byDept = employees.stream()\n    .collect(Collectors.groupingBy(Employee::getDepartment));\n\n// Nested: group by dept, then count\nMap<String, Long> countByDept = employees.stream()\n    .collect(Collectors.groupingBy(\n        Employee::getDepartment, Collectors.counting()));\n\n// Partition (boolean split)\nMap<Boolean, List<Employee>> seniorVsJunior = employees.stream()\n    .collect(Collectors.partitioningBy(e -> e.getExp() > 5));\n\n// Joining strings\nString allNames = employees.stream()\n    .map(Employee::getName)\n    .collect(Collectors.joining(\", \", \"[\", \"]\"));\n// \"[Alice, Bob, Charlie]\"\n\n// Statistics\nIntSummaryStatistics stats = employees.stream()\n    .collect(Collectors.summarizingInt(Employee::getExp));\n// stats.getAverage(), stats.getMax(), stats.getCount()",
                    "explanation": "groupingBy + downstream collector is the powerhouse pattern — it replaces SQL's GROUP BY with a second-level aggregation."
                  },
                  "tradeoffs": "Collectors.toMap() throws IllegalStateException on duplicate keys by default — always provide a merge function for real-world data: toMap(keyFn, valueFn, (v1, v2) -> v1). groupingBy creates a HashMap by default; for sorted output, pass TreeMap::new as the map factory. Custom collectors (Collector.of()) are powerful but hard to get right — prefer composing built-in collectors first. For simple list collection, .toList() (Java 16+) is simpler than .collect(Collectors.toList()).",
                  "followUpQuestions": [
                    {
                      "question": "What's the difference between groupingBy and partitioningBy?",
                      "answer": "partitioningBy is a special case of groupingBy that always produces exactly two groups: true and false. groupingBy produces N groups based on the classifier function. partitioningBy guarantees both keys exist in the result map (even if one list is empty), while groupingBy only creates keys for values that exist."
                    },
                    {
                      "question": "How do you handle duplicate keys with toMap()?",
                      "answer": "Provide a merge function as the third argument: Collectors.toMap(Employee::getName, Employee::getSalary, (salary1, salary2) -> salary1). Without it, duplicate keys throw IllegalStateException at runtime — one of the most common Stream bugs in production."
                    }
                  ],
                  "usedInProduction": "LinkedIn's feed ranking system uses Collectors.groupingBy() with downstream averaging to group candidate posts by relevance category and compute average engagement scores — informing the final feed ordering for 900M+ users.",
                  "relatedTopics": [
                    "Stream Fundamentals",
                    "Intermediate vs Terminal Operations",
                    "Optional Class"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "id": "java8-optional",
        "title": "Optional & Date/Time API",
        "icon": "📦",
        "subTopics": [
          {
            "id": "optional-class",
            "title": "Optional Class",
            "questions": [
              {
                "id": "j8-optional-1",
                "question": "What is the Optional class in Java 8?",
                "difficulty": "Easy",
                "frequency": 5,
                "lastVerified": "2026-09-14",
                "answer": {
                  "quickAnswer": "Optional<T> is a container that either holds a non-null value or is empty — it replaces returning null and forces callers to explicitly handle the 'not found' case.",
                  "mentalModel": "Optional is like a gift box that might be empty. Instead of handing someone an unwrapped item (which might be nothing — null), you hand them a box. They must open it first and check if something's inside. No more surprise NullPointerExceptions — you acknowledged the box might be empty.",
                  "whatItIs": "Optional<T> is a container class with three creation methods: Optional.of(value) (non-null), Optional.ofNullable(value) (might be null), Optional.empty(). Key consuming methods: isPresent(), ifPresent(Consumer), orElse(default), orElseGet(Supplier), orElseThrow(Supplier), map(Function), flatMap(Function), filter(Predicate). It's designed for return types, not fields or parameters.",
                  "whyItExists": "NullPointerException is the most common runtime error in Java. Tony Hoare called null his 'billion-dollar mistake.' Before Optional, methods returned null to mean 'not found,' but nothing in the type system warned callers. Optional makes absence explicit in the return type: Optional<User> tells the caller 'this might not exist' at compile time. It also enables fluent chaining (map/flatMap) instead of nested null checks.",
                  "codeDemo": {
                    "language": "java",
                    "code": "// ❌ Old way — null checks everywhere\nString name = user.getName();\nif (name != null) {\n    String upper = name.toUpperCase();\n    if (upper.length() > 3) {\n        System.out.println(upper);\n    }\n}\n\n// ✅ Optional way — fluent, expressive\nOptional.ofNullable(user.getName())\n    .map(String::toUpperCase)\n    .filter(n -> n.length() > 3)\n    .ifPresent(System.out::println);\n\n// Providing defaults\nString result = Optional.ofNullable(config.get(\"key\"))\n    .orElse(\"default-value\");\n\n// Throwing custom exception\nUser user = userRepo.findById(id)\n    .orElseThrow(() -> new NotFoundException(\"ID: \" + id));\n\n// Chaining nested Optionals\nOptional<String> zip = Optional.ofNullable(user)\n    .flatMap(User::getAddress)      // Optional<Address>\n    .flatMap(Address::getZipCode);  // Optional<String>",
                    "explanation": "Use map() for plain transformations, flatMap() when the function itself returns an Optional. Never use Optional.get() without checking — defeats the purpose."
                  },
                  "tradeoffs": "Never use Optional for: (1) fields — it's not Serializable and adds memory overhead, (2) method parameters — it forces callers to wrap values, (3) collections — return an empty list instead of Optional<List>. Don't call .get() without isPresent() — use orElse/orElseThrow instead. orElse() always evaluates the default (even if value is present); use orElseGet() with a Supplier for expensive defaults. Optional adds object creation overhead — don't use it in tight loops or performance-critical paths.",
                  "followUpQuestions": [
                    {
                      "question": "What's the difference between orElse() and orElseGet()?",
                      "answer": "orElse(value) ALWAYS evaluates the default value, even if the Optional is non-empty. orElseGet(Supplier) only calls the Supplier if the Optional is empty. This matters when the default is expensive: orElse(queryDB()) always queries the DB; orElseGet(() -> queryDB()) only queries when needed."
                    },
                    {
                      "question": "Should Optional replace all null checks in my codebase?",
                      "answer": "No. Optional is for return types where absence is a valid business case (findById, search). Internal null checks, field nullability, and constructor validation are still better served by Objects.requireNonNull(), @Nullable annotations, or assertion libraries. Overusing Optional adds unnecessary object wrapping overhead."
                    }
                  ],
                  "usedInProduction": "Spring Data JPA's repository methods return Optional<Entity> by convention — findById(id) returns Optional<User>, forcing service-layer code to handle the 'user not found' case explicitly instead of risking NPE cascades through the controller layer.",
                  "relatedTopics": [
                    "NullPointerException Prevention",
                    "Stream API",
                    "Functional Interfaces",
                    "Java Records"
                  ]
                }
              }
            ]
          },
          {
            "id": "date-time-api",
            "title": "Date/Time API (java.time)",
            "questions": [
              {
                "id": "j8-datetime-1",
                "question": "Why was the new Date/Time API introduced in Java 8?",
                "difficulty": "Easy",
                "frequency": 3,
                "lastVerified": "2026-09-10",
                "answer": {
                  "quickAnswer": "The old java.util.Date was mutable, poorly designed (months 0-indexed, years offset from 1900), and thread-unsafe. The new java.time package provides immutable, fluent, ISO-8601 compliant date/time classes.",
                  "mentalModel": "The old Date API is like a shared whiteboard everyone can erase — mutable and unsafe. The new java.time API is like a printed calendar — immutable, clear, and everyone gets their own copy. When you 'change' a date, you actually get a new calendar page.",
                  "whatItIs": "The java.time package (JSR 310) provides: LocalDate (date, no time), LocalTime (time, no date), LocalDateTime (both), ZonedDateTime (with timezone), Instant (machine timestamp), Duration (time-based span), Period (date-based span), and DateTimeFormatter. All classes are immutable and thread-safe — every manipulation returns a new instance.",
                  "whyItExists": "java.util.Date had fatal design flaws: mutable (not thread-safe), months were 0-indexed (January = 0), years offset from 1900 (year 2024 = 124), Date had time info but Calendar was needed for manipulation, and SimpleDateFormat was not thread-safe. These caused so many bugs that Joda-Time became the de facto standard. Java 8 incorporated Joda-Time's designer (Stephen Colebourne) to build a proper replacement.",
                  "codeDemo": {
                    "language": "java",
                    "code": "// Clear, immutable types\nLocalDate today = LocalDate.now();           // 2026-09-15\nLocalTime now = LocalTime.now();              // 14:30:00\nLocalDateTime dt = LocalDateTime.now();       // 2026-09-15T14:30\n\n// Fluent manipulation (returns NEW instance)\nLocalDate nextWeek = today.plusWeeks(1);\nLocalDate firstOfMonth = today.withDayOfMonth(1);\n\n// Duration and Period\nPeriod age = Period.between(\n    LocalDate.of(1990, Month.MARCH, 15), today);\nSystem.out.println(\"Age: \" + age.getYears() + \" years\");\n\n// Timezone handling\nZonedDateTime tokyo = ZonedDateTime.now(ZoneId.of(\"Asia/Tokyo\"));\nZonedDateTime ny = tokyo.withZoneSameInstant(\n    ZoneId.of(\"America/New_York\"));\n\n// Formatting\nString formatted = today.format(\n    DateTimeFormatter.ofPattern(\"dd MMM yyyy\"));\n// \"15 Sep 2026\"",
                    "explanation": "Every method returns a NEW instance — the original is never modified. This is what makes it thread-safe by design."
                  },
                  "tradeoffs": "The new API is more verbose for simple cases — new Date() becomes LocalDateTime.now(). No built-in backward compatibility with java.util.Date (you need Date.from(instant) / date.toInstant() bridge methods). LocalDateTime has NO timezone — if you need timezone awareness, you must use ZonedDateTime or OffsetDateTime explicitly. Parsing strict by default — partial dates like '2026-09' will fail without a custom formatter.",
                  "followUpQuestions": [
                    {
                      "question": "How do you convert between java.util.Date and java.time?",
                      "answer": "Date → Instant: date.toInstant(). Instant → Date: Date.from(instant). For LocalDateTime: localDateTime.atZone(ZoneId.systemDefault()).toInstant() → then Date.from(). These bridge methods exist because many legacy APIs and databases still use java.util.Date."
                    },
                    {
                      "question": "What's the difference between Instant and LocalDateTime?",
                      "answer": "Instant is a point on the UTC timeline (machine-oriented, like a Unix timestamp). LocalDateTime is a human date+time with NO timezone (like what's printed on a movie ticket). Instant is for timestamps/logs/events; LocalDateTime is for displaying dates to users in a known context."
                    }
                  ],
                  "usedInProduction": "Financial trading platforms use ZonedDateTime to track market open/close times across exchanges in New York, London, and Tokyo — the immutability guarantee prevents the race conditions that plagued legacy Date objects in high-frequency, multi-threaded trade engines.",
                  "relatedTopics": [
                    "Immutability in Java",
                    "Thread Safety",
                    "Functional Programming"
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "spring-boot",
    "slug": "spring-boot",
    "title": "Spring Boot",
    "tagline": "Build production-ready applications with auto-configuration",
    "description": "Master Spring Boot — from auto-configuration and dependency injection to REST APIs, data access, security, and microservice patterns.",
    "icon": "🍃",
    "difficulty": "Intermediate to Advanced",
    "totalQuestions": 12,
    "color": "#6db33f",
    "gradient": "linear-gradient(135deg, #6db33f 0%, #4a8c2a 100%)",
    "categories": [
      {
        "id": "sb-core",
        "title": "Core Concepts",
        "icon": "🏗️",
        "subTopics": [
          {
            "id": "auto-configuration",
            "title": "Auto-Configuration",
            "questions": [
              {
                "id": "sb-auto-1",
                "question": "What is Spring Boot Auto-Configuration?",
                "difficulty": "Easy",
                "frequency": 5,
                "lastVerified": "2026-09-15",
                "answer": {
                  "quickAnswer": "Auto-configuration automatically sets up Spring beans based on what's on your classpath — add a JDBC driver JAR and Spring configures a DataSource for you, zero XML needed.",
                  "mentalModel": "It's like checking into a smart hotel. The room detects you brought a laptop (classpath has a JDBC driver) and automatically provides a desk, monitor, and WiFi password (DataSource, EntityManager, transaction manager). You didn't ask — it saw what you needed and set it up.",
                  "whatItIs": "Auto-configuration is Spring Boot's mechanism to automatically create and configure beans based on classpath contents, existing beans, and property values. Triggered by @EnableAutoConfiguration (included in @SpringBootApplication), it evaluates auto-configuration classes using conditional annotations: @ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty. Each auto-config class is a @Configuration that only activates when its conditions are met.",
                  "whyItExists": "Pre-Spring Boot, setting up a Spring app required dozens of XML files or @Configuration classes — manually wiring DataSources, ViewResolvers, TransactionManagers, and MessageConverters. A simple CRUD app needed 200+ lines of configuration. Auto-configuration applies convention-over-configuration: sensible defaults are provided, and developers only configure what's unique to their app. This reduced project setup from hours to minutes.",
                  "codeDemo": {
                    "language": "java",
                    "code": "// This single annotation enables everything:\n@SpringBootApplication  // = @Configuration\n                        //   + @EnableAutoConfiguration\n                        //   + @ComponentScan\npublic class MyApp {\n    public static void main(String[] args) {\n        SpringApplication.run(MyApp.class, args);\n    }\n}\n\n// Override defaults via application.properties:\n// server.port=8081\n// spring.datasource.url=jdbc:mysql://localhost/mydb\n\n// Exclude specific auto-configurations:\n@SpringBootApplication(\n    exclude = {DataSourceAutoConfiguration.class})\npublic class MyApp { }\n\n// Custom auto-configuration:\n@Configuration\n@ConditionalOnClass(MyService.class)\n@ConditionalOnMissingBean(MyService.class)\npublic class MyServiceAutoConfig {\n    @Bean\n    public MyService myService() {\n        return new DefaultMyService();\n    }\n}\n\n// Debug what's auto-configured:\n// Run with: --debug or debug=true in properties",
                    "explanation": "Auto-config classes live in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports — Spring evaluates each class's @Conditional annotations at startup."
                  },
                  "tradeoffs": "Auto-configuration can hide what's happening — developers may not realize a DataSource, security filter, or cache manager was silently created. Use --debug to audit. Ordering matters: if your @Bean is created before auto-configuration runs, @ConditionalOnMissingBean won't detect it. Auto-configuration classes run AFTER user @Configuration classes — design custom beans accordingly. Excluding an auto-config can have cascading effects (e.g., excluding DataSource breaks JPA, which breaks Spring Data repositories).",
                  "followUpQuestions": [
                    {
                      "question": "How does Spring Boot decide which auto-configurations to apply?",
                      "answer": "It reads all auto-configuration class names from META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports on the classpath. Each class is a @Configuration with @Conditional annotations — Spring evaluates every condition (class present? property set? bean missing?) and only registers the beans if ALL conditions are met."
                    },
                    {
                      "question": "What's the difference between @ConditionalOnClass and @ConditionalOnBean?",
                      "answer": "@ConditionalOnClass checks if a CLASS is on the classpath (compile-time dependency). @ConditionalOnBean checks if a BEAN is already registered in the ApplicationContext (runtime state). Auto-configs typically use @ConditionalOnClass to detect library presence, then @ConditionalOnMissingBean to avoid overriding user-defined beans."
                    }
                  ],
                  "usedInProduction": "Every Spring Boot microservice at Alibaba Cloud uses auto-configuration — adding spring-cloud-starter-alibaba-nacos automatically configures service discovery, config management, and health endpoints without a single line of explicit setup across 10,000+ microservices.",
                  "relatedTopics": [
                    "Spring Boot Starters",
                    "Dependency Injection",
                    "@Conditional Annotations",
                    "application.properties"
                  ]
                }
              },
              {
                "id": "sb-auto-2",
                "question": "What are Spring Boot Starters?",
                "difficulty": "Easy",
                "frequency": 4,
                "lastVerified": "2026-09-12",
                "answer": {
                  "quickAnswer": "Starters are curated dependency bundles — add one POM entry like spring-boot-starter-web and get Tomcat, Jackson, Spring MVC, and validation, all with tested-compatible versions.",
                  "mentalModel": "Starters are like meal kits. Instead of buying flour, yeast, cheese, and tomato sauce separately (and hoping they go together), you order a 'pizza kit' (starter-web) and everything arrives pre-measured and compatible.",
                  "whatItIs": "Starters are dependency descriptors following the pattern spring-boot-starter-*. Each starter declares a curated set of transitive dependencies AND their corresponding auto-configuration. Examples: starter-web (Spring MVC + Tomcat + Jackson), starter-data-jpa (Hibernate + HikariCP + Spring Data), starter-security (Spring Security + auto-config), starter-test (JUnit 5 + Mockito + AssertJ). Version management is handled by the parent BOM.",
                  "whyItExists": "Before starters, adding JPA required manually finding compatible versions of Hibernate, HikariCP, Spring Data JPA, and the JDBC driver — a common source of classpath hell. Starters solve this: one dependency entry pulls in everything you need with versions the Spring team has tested together. You never specify versions for Spring-managed dependencies.",
                  "codeDemo": {
                    "language": "xml",
                    "code": "<!-- pom.xml — one starter = everything you need -->\n<parent>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-parent</artifactId>\n    <version>3.2.0</version>\n</parent>\n\n<dependencies>\n    <!-- Web: Tomcat + MVC + Jackson + Validation -->\n    <dependency>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-web</artifactId>\n    </dependency>\n\n    <!-- Data: Hibernate + HikariCP + Spring Data JPA -->\n    <dependency>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-data-jpa</artifactId>\n    </dependency>\n\n    <!-- Test: JUnit 5 + Mockito + AssertJ + TestContainers -->\n    <dependency>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-test</artifactId>\n        <scope>test</scope>\n    </dependency>\n</dependencies>\n<!-- No <version> tags needed — parent BOM manages all -->",
                    "explanation": "The parent BOM (Bill of Materials) manages all dependency versions. Never specify versions for Spring-managed dependencies."
                  },
                  "tradeoffs": "Starters pull in transitive dependencies you might not need (starter-web includes Tomcat even if you want Netty — use exclusions). The 'magic' can obscure what's actually on your classpath; run mvn dependency:tree to audit. Creating custom starters requires careful attention to auto-configuration ordering and conditional bean registration. Upgrading the parent version can introduce breaking changes across many transitive dependencies at once.",
                  "followUpQuestions": [
                    {
                      "question": "How do you replace Tomcat with Jetty or Undertow?",
                      "answer": "Exclude spring-boot-starter-tomcat from spring-boot-starter-web, then add spring-boot-starter-jetty or spring-boot-starter-undertow. Auto-configuration detects which embedded server is on the classpath and configures it automatically."
                    },
                    {
                      "question": "Can you create a custom starter for your organization?",
                      "answer": "Yes. Create two modules: (1) an auto-configuration module with @Configuration + @Conditional beans, and (2) a starter module that depends on the auto-config module plus any required libraries. Register the auto-config class in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports."
                    }
                  ],
                  "usedInProduction": "At Spotify, custom Spring Boot starters encapsulate company-wide standards — a single 'spotify-starter-service' dependency adds observability (Prometheus metrics + Jaeger tracing), standardized error handling, and mTLS configuration to every new microservice with zero per-team setup.",
                  "relatedTopics": [
                    "Auto-Configuration",
                    "Dependency Management",
                    "Spring Boot Parent POM"
                  ]
                }
              }
            ]
          },
          {
            "id": "dependency-injection",
            "title": "Dependency Injection",
            "questions": [
              {
                "id": "sb-di-1",
                "question": "What is Dependency Injection and how does Spring implement it?",
                "difficulty": "Medium",
                "frequency": 5,
                "lastVerified": "2026-09-15",
                "answer": {
                  "quickAnswer": "DI is giving an object its dependencies from outside rather than letting it create them itself. Spring's IoC container manages this via constructor injection (preferred), setter injection, or field injection (@Autowired).",
                  "mentalModel": "Without DI, a chef goes to the market, buys ingredients, grows herbs, and then cooks. With DI, the ingredients are delivered to the kitchen — the chef just cooks. The chef doesn't know (or care) where the ingredients came from, and you can easily swap suppliers.",
                  "whatItIs": "Dependency Injection is a pattern where an object's collaborators are provided externally rather than created internally. Spring's IoC (Inversion of Control) container manages the lifecycle and wiring of all @Component/@Service/@Repository/@Controller beans. Three injection types: Constructor (recommended — dependencies are final, immutable, explicit), Setter (for optional dependencies), Field (@Autowired — convenient but hides dependencies). The container resolves dependencies by type, with @Qualifier for disambiguation.",
                  "whyItExists": "Tight coupling (new MyRepo() inside a service) makes code untestable, inflexible, and fragile. DI provides: (1) testability — mock dependencies in unit tests, (2) loose coupling — swap implementations without modifying dependent classes, (3) configurability — change behavior via profiles/qualifiers, (4) lifecycle management — Spring handles creation, scoping, and destruction.",
                  "codeDemo": {
                    "language": "java",
                    "code": "// ✅ Constructor Injection (RECOMMENDED)\n@Service\npublic class OrderService {\n    private final OrderRepository orderRepo;\n    private final PaymentGateway gateway;\n    private final NotificationService notifier;\n\n    // @Autowired is optional for single constructor\n    public OrderService(OrderRepository orderRepo,\n                        PaymentGateway gateway,\n                        NotificationService notifier) {\n        this.orderRepo = orderRepo;\n        this.gateway = gateway;\n        this.notifier = notifier;\n    }\n}\n\n// ⚠️ Field Injection — avoid in production\n@Service\npublic class BadService {\n    @Autowired private SomeRepo repo;\n    // Hidden dependency, can't be final, hard to test\n}\n\n// Using @Qualifier for multiple implementations\n@Service\npublic class NotificationRouter {\n    public NotificationRouter(\n        @Qualifier(\"email\") NotificationService email,\n        @Qualifier(\"sms\") NotificationService sms\n    ) { /* ... */ }\n}",
                    "explanation": "Constructor injection: dependencies are final, explicit, always fully initialized, and trivially testable with 'new OrderService(mockRepo, mockGateway, mockNotif)'."
                  },
                  "tradeoffs": "Constructor injection can lead to 'constructor bloat' when a class has 7+ dependencies — this is usually a design smell (Single Responsibility Principle violation), not a DI problem. Field injection is tempting for brevity but makes dependencies invisible, prevents final fields, and requires Spring to instantiate the object (can't new it in tests). Circular dependencies (A→B→A) cause startup failures — redesign with an intermediary, @Lazy, or events. DI adds indirection — tracing 'who created this object?' requires understanding the container.",
                  "followUpQuestions": [
                    {
                      "question": "Why is constructor injection preferred over field injection?",
                      "answer": "Four reasons: (1) Dependencies are final/immutable — no accidental reassignment. (2) All dependencies are visible in the constructor signature — no hidden surprises. (3) Objects are always fully initialized — no partially constructed state. (4) Easy to unit test without Spring: just call new Service(mock1, mock2). Field injection requires reflection or a full Spring context to test."
                    },
                    {
                      "question": "How does Spring resolve circular dependencies?",
                      "answer": "With constructor injection, circular dependencies cause a BeanCurrentlyInCreationException at startup — Spring can't create A without B, but B needs A. Solutions: (1) Redesign to remove the cycle (best), (2) Use @Lazy on one constructor param (Spring injects a proxy), (3) Use setter injection on one side (Spring can create partial objects), (4) Use ApplicationEventPublisher to decouple via events."
                    }
                  ],
                  "usedInProduction": "At Amazon, Spring DI with @Profile annotations enables seamless environment switching — the same OrderService works with a DynamoDB repository in production and an in-memory HashMap repository in local development, without changing a single line of service-layer code.",
                  "relatedTopics": [
                    "Auto-Configuration",
                    "Spring Bean Scopes",
                    "ApplicationContext",
                    "@Profile and @Conditional"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "id": "sb-rest",
        "title": "REST APIs",
        "icon": "🌐",
        "subTopics": [
          {
            "id": "rest-controllers",
            "title": "REST Controllers",
            "questions": [
              {
                "id": "sb-rest-1",
                "question": "How do you create REST APIs in Spring Boot?",
                "difficulty": "Easy",
                "frequency": 5,
                "lastVerified": "2026-09-14",
                "answer": {
                  "quickAnswer": "Annotate a class with @RestController, define handler methods with @GetMapping/@PostMapping etc., and Spring auto-serializes return values to JSON via Jackson.",
                  "mentalModel": "A REST controller is like a restaurant host. The host (@RestController) receives guests (HTTP requests) at specific doors (@GetMapping('/users')), directs them to the right table (handler method), and sends them home with their order (JSON response). Jackson is the kitchen that plates everything into JSON.",
                  "whatItIs": "@RestController combines @Controller + @ResponseBody — every method's return value is automatically serialized to JSON (via Jackson) and written to the HTTP response body. Mapping annotations — @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping — bind HTTP methods to handler methods. Parameters come from @PathVariable, @RequestParam, @RequestBody, and @RequestHeader. ResponseEntity<T> gives full control over status code, headers, and body.",
                  "whyItExists": "Without @RestController, building a REST API in Spring MVC required @Controller + @ResponseBody on every method + manual content negotiation. Spring Boot simplified this to a single annotation, added Jackson auto-configuration, and provided embedded Tomcat — reducing a REST API from a multi-file, multi-config undertaking to a single class.",
                  "codeDemo": {
                    "language": "java",
                    "code": "@RestController\n@RequestMapping(\"/api/v1/users\")\npublic class UserController {\n    private final UserService service;\n\n    public UserController(UserService service) {\n        this.service = service;\n    }\n\n    @GetMapping\n    public ResponseEntity<List<UserDTO>> getAll(\n            @RequestParam(defaultValue = \"0\") int page,\n            @RequestParam(defaultValue = \"20\") int size) {\n        return ResponseEntity.ok(service.findAll(page, size));\n    }\n\n    @GetMapping(\"/{id}\")\n    public ResponseEntity<UserDTO> getById(@PathVariable Long id) {\n        return service.findById(id)\n            .map(ResponseEntity::ok)\n            .orElse(ResponseEntity.notFound().build());\n    }\n\n    @PostMapping\n    public ResponseEntity<UserDTO> create(\n            @Valid @RequestBody CreateUserRequest req) {\n        UserDTO created = service.create(req);\n        URI loc = URI.create(\"/api/v1/users/\" + created.id());\n        return ResponseEntity.created(loc).body(created);\n    }\n\n    @DeleteMapping(\"/{id}\")\n    @ResponseStatus(HttpStatus.NO_CONTENT)\n    public void delete(@PathVariable Long id) {\n        service.delete(id);\n    }\n}",
                    "explanation": "ResponseEntity gives full control over HTTP status codes and headers. Use @Valid with Bean Validation for automatic input validation."
                  },
                  "tradeoffs": "Don't expose JPA entities directly from controllers — use DTOs to control the API surface and prevent lazy-loading exceptions (LazyInitializationException). @RestController returns JSON by default; for content negotiation (XML, CSV), configure HttpMessageConverters. PUT vs PATCH semantics matter: PUT replaces the entire resource, PATCH updates specific fields — mixing them up is a common API design mistake. Versioning (/v1/) should be decided early; changing it later breaks clients.",
                  "followUpQuestions": [
                    {
                      "question": "What's the difference between @Controller and @RestController?",
                      "answer": "@Controller returns view names (for SSR/Thymeleaf). @RestController returns data (serialized to JSON/XML via Jackson). @RestController = @Controller + @ResponseBody on every method. Use @Controller for server-rendered HTML pages, @RestController for APIs."
                    },
                    {
                      "question": "How do you handle exceptions globally in REST APIs?",
                      "answer": "Use @ControllerAdvice with @ExceptionHandler methods. Create a GlobalExceptionHandler class annotated with @RestControllerAdvice. Each @ExceptionHandler method catches a specific exception type and returns a standardized error response (ErrorDTO with status, message, timestamp). This centralizes error handling instead of try-catch in every controller."
                    }
                  ],
                  "usedInProduction": "At Stripe, REST controllers with ResponseEntity and @ControllerAdvice provide the idempotent, versioned API layer that processes billions of payment requests — each endpoint returns precise HTTP status codes (201 Created, 402 Payment Required, 429 Too Many Requests) that client SDKs rely on.",
                  "relatedTopics": [
                    "Dependency Injection",
                    "@ControllerAdvice",
                    "Spring Data JPA",
                    "Bean Validation"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "id": "sb-data",
        "title": "Data Access",
        "icon": "💾",
        "subTopics": [
          {
            "id": "spring-data-jpa",
            "title": "Spring Data JPA",
            "questions": [
              {
                "id": "sb-jpa-1",
                "question": "What is Spring Data JPA and how does it simplify data access?",
                "difficulty": "Medium",
                "frequency": 4,
                "lastVerified": "2026-09-13",
                "answer": {
                  "quickAnswer": "Spring Data JPA auto-generates repository implementations from interfaces — define findByDepartment(String dept) and Spring writes the SQL and boilerplate for you.",
                  "mentalModel": "It's like a librarian who understands plain English. You say 'find books by author and published after 2020, sorted by title' (method name), and the librarian knows exactly which shelf to check and how to sort the results. You never write the catalog query yourself.",
                  "whatItIs": "A Spring module that abstracts JPA/Hibernate. You define a repository interface extending JpaRepository<Entity, ID>, and Spring generates the implementation at startup — CRUD operations, pagination, sorting, and query derivation from method names are all automatic. Custom queries use @Query with JPQL or native SQL. Supports projections, specifications, and auditing out of the box.",
                  "whyItExists": "Without Spring Data, every DAO required: EntityManager injection, manual JPQL queries, transaction handling, pagination logic, and boilerplate exception translation. For a typical entity, this meant 100+ lines of repetitive code. Spring Data reduces it to an interface declaration — the implementation is generated at startup, eliminating the most tedious layer of enterprise Java development.",
                  "codeDemo": {
                    "language": "java",
                    "code": "// Entity\n@Entity\n@Table(name = \"employees\")\npublic class Employee {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String department;\n    private Double salary;\n}\n\n// Repository — Spring generates implementation!\npublic interface EmployeeRepo\n        extends JpaRepository<Employee, Long> {\n\n    // Derived query from method name\n    List<Employee> findByDepartment(String department);\n\n    // Custom JPQL\n    @Query(\"SELECT e FROM Employee e WHERE e.salary > :min\")\n    List<Employee> findHighEarners(@Param(\"min\") double min);\n\n    // Pagination built-in\n    Page<Employee> findByDepartment(String dept, Pageable p);\n}\n\n// Usage in service\n@Service\n@Transactional\npublic class EmployeeService {\n    private final EmployeeRepo repo;\n\n    public Page<Employee> getByDept(String dept, int page) {\n        return repo.findByDepartment(dept,\n            PageRequest.of(page, 20, Sort.by(\"name\")));\n    }\n}",
                    "explanation": "Method name parsing: findBy + FieldName + Keyword (And, Or, Between, LessThan, Like, OrderBy). Spring generates SQL at startup, catching query errors early."
                  },
                  "tradeoffs": "Derived queries get unreadable fast: findByDepartmentAndSalaryGreaterThanAndNameContainingIgnoreCaseOrderByHireDateDesc — use @Query instead. N+1 query problem is still possible with lazy-loaded relationships; use @EntityGraph or JOIN FETCH. Spring Data hides the generated SQL — enable spring.jpa.show-sql=true during development. For complex analytics or batch operations, consider dropping to JdbcTemplate or native queries rather than forcing JPA.",
                  "followUpQuestions": [
                    {
                      "question": "How do you handle the N+1 query problem with Spring Data JPA?",
                      "answer": "Use @EntityGraph on repository methods to specify which associations to fetch eagerly in a single query: @EntityGraph(attributePaths = {'department', 'projects'}) List<Employee> findAll(). Alternatively, use JPQL JOIN FETCH: @Query('SELECT e FROM Employee e JOIN FETCH e.department'). Avoid FetchType.EAGER on entity mappings — it applies globally and can't be turned off per query."
                    },
                    {
                      "question": "What's the difference between JpaRepository and CrudRepository?",
                      "answer": "CrudRepository provides basic CRUD (save, findById, delete, findAll). JpaRepository extends it with JPA-specific features: batch operations (saveAll, flush, deleteInBatch), pagination (findAll(Pageable)), sorting, and Example-based queries. Use JpaRepository unless you explicitly want to limit the API surface."
                    }
                  ],
                  "usedInProduction": "At DoorDash, Spring Data JPA repositories with custom @Query methods power the restaurant search and order management systems — Specification-based dynamic queries handle complex filters (cuisine, rating, distance, price range) that would be unmaintainable as derived method names.",
                  "relatedTopics": [
                    "Dependency Injection",
                    "Hibernate/JPA",
                    "Database Transactions",
                    "Connection Pooling (HikariCP)"
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "python",
    "slug": "python",
    "title": "Python",
    "tagline": "Versatile programming from scripting to machine learning",
    "description": "From core language features and data structures to advanced concepts like decorators, generators, async programming, and metaclasses — master Python for any interview.",
    "icon": "🐍",
    "difficulty": "Beginner to Advanced",
    "totalQuestions": 10,
    "color": "#3776ab",
    "gradient": "linear-gradient(135deg, #3776ab 0%, #ffd43b 100%)",
    "categories": [
      {
        "id": "py-core",
        "title": "Core Python",
        "icon": "🔤",
        "subTopics": [
          {
            "id": "python-basics",
            "title": "Language Fundamentals",
            "questions": [
              {
                "id": "py-basic-1",
                "question": "What are Python's key features that make it popular?",
                "difficulty": "Easy",
                "frequency": 4,
                "lastVerified": "2026-09-15",
                "answer": {
                  "quickAnswer": "Python is a high-level, interpreted, dynamically-typed language with clean syntax, batteries-included standard library, and the largest ecosystem for data science, web, and automation.",
                  "mentalModel": "Python is like LEGO — each brick (library/module) snaps in easily, the instructions (syntax) are visual and intuitive, and you can build anything from a toy car (script) to a full city (enterprise app). Other languages are like model kits — powerful but with 100-page manuals and tiny screws.",
                  "whatItIs": "Python is a high-level, interpreted, garbage-collected language with dynamic typing, indentation-based syntax, multiple paradigm support (OOP, functional, procedural), first-class functions, list comprehensions, generators, decorators, and a massive package ecosystem (PyPI with 500K+ packages). CPython is the reference implementation, but alternatives exist (PyPy for speed, Jython for JVM, MicroPython for embedded).",
                  "whyItExists": "Guido van Rossum created Python in 1989 to be a language that prioritizes developer productivity and code readability over machine performance. The philosophy: 'There should be one obvious way to do it.' This made Python the default choice for rapid prototyping, data science, and teaching — domains where developer time costs more than compute time.",
                  "codeDemo": {
                    "language": "python",
                    "code": "# Dynamic typing\nx = 42           # int\nx = \"hello\"      # str — type changes, no error\n\n# List comprehension (Pythonic!)\nsquares = [x**2 for x in range(10) if x % 2 == 0]\n# [0, 4, 16, 36, 64]\n\n# Dictionary comprehension\nlengths = {w: len(w) for w in [\"hello\", \"world\", \"python\"]}\n\n# First-class functions\ndef apply(func, items):\n    return [func(item) for item in items]\nresult = apply(str.upper, [\"hello\", \"world\"])\n\n# Multiple return values\ndef min_max(nums):\n    return min(nums), max(nums)\nlo, hi = min_max([3, 1, 4, 1, 5, 9])\n\n# Context manager (auto-cleanup)\nwith open(\"data.txt\") as f:\n    content = f.read()  # File auto-closed\n\n# F-strings (3.6+)\nname, age = \"Alice\", 30\nprint(f\"{name} is {age}, will be {age+1} next year\")",
                    "explanation": "Python's readability comes from enforced indentation, minimal syntax noise, and expressive built-in constructs like comprehensions and context managers."
                  },
                  "tradeoffs": "Python is slow for CPU-bound tasks (50-100x slower than C/Java due to the GIL and interpretation). Dynamic typing catches errors at runtime, not compile time — use type hints (PEP 484) and mypy for large codebases. The GIL (Global Interpreter Lock) prevents true multi-threaded parallelism — use multiprocessing or async for concurrency. Package management is fragmented (pip, conda, poetry, pipenv) — pick one and stick with it. Python 2 vs 3 migration caused years of ecosystem pain (resolved now, but legacy code still exists).",
                  "followUpQuestions": [
                    {
                      "question": "What is the GIL and why does it matter?",
                      "answer": "The Global Interpreter Lock is a mutex in CPython that allows only one thread to execute Python bytecode at a time, even on multi-core CPUs. This means multi-threading doesn't provide true parallelism for CPU-bound tasks. Workarounds: use multiprocessing (separate processes, separate GILs), asyncio (for I/O-bound tasks), or C extensions (NumPy releases the GIL). Python 3.13+ introduces experimental free-threaded mode."
                    },
                    {
                      "question": "Is Python compiled or interpreted?",
                      "answer": "Both. Python source (.py) is compiled to bytecode (.pyc) which runs on the Python Virtual Machine (PVM). But unlike Java, this compilation is transparent and happens at import time. CPython interprets bytecode; PyPy JIT-compiles it for ~7x speed improvement."
                    }
                  ],
                  "usedInProduction": "Instagram runs one of the world's largest Django (Python) deployments, serving 2+ billion users — proving Python's scalability when combined with proper architecture, caching (Memcached/Redis), and selective C extensions for hot paths.",
                  "relatedTopics": [
                    "Python Data Structures",
                    "OOP in Python",
                    "Decorators",
                    "Virtual Environments"
                  ]
                }
              },
              {
                "id": "py-basic-2",
                "question": "What is the difference between a List, Tuple, Set, and Dictionary?",
                "difficulty": "Easy",
                "frequency": 5,
                "lastVerified": "2026-09-14",
                "answer": {
                  "quickAnswer": "List = ordered, mutable, duplicates OK. Tuple = ordered, immutable. Set = unordered, unique, O(1) lookup. Dict = key-value pairs, O(1) lookup by key.",
                  "mentalModel": "List = a shopping list (ordered, can add/remove items). Tuple = a printed receipt (ordered, can't change it). Set = a bag of unique marbles (no order, no duplicates). Dict = a phone book (look up any name instantly to get their number).",
                  "whatItIs": "Four built-in collection types: List [] — ordered, mutable, allows duplicates, O(n) search. Tuple () — ordered, immutable, allows duplicates, hashable (can be dict key). Set {} — unordered, mutable, unique elements only, O(1) membership test via hash table. Dict {k:v} — ordered (3.7+), mutable, unique keys, O(1) lookup/insert/delete via hash table.",
                  "whyItExists": "Each collection optimizes for a different access pattern. Lists for sequential access and modification. Tuples for immutable records (safe as dict keys, function returns, constants). Sets for fast membership testing and deduplication. Dicts for fast key-based lookup. Choosing the wrong collection means either O(n) where O(1) was available, or mutable data where immutability was needed.",
                  "codeDemo": {
                    "language": "python",
                    "code": "# List — mutable, ordered\nfruits = [\"apple\", \"banana\", \"apple\"]\nfruits.append(\"cherry\")\nfruits.sort()\n\n# Tuple — immutable, ordered\npoint = (10, 20)\n# point[0] = 5  # TypeError!\nx, y = point    # Unpacking\n\n# Set — unordered, unique, fast lookup\na = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\nprint(a & b)  # Intersection: {3, 4}\nprint(a | b)  # Union: {1, 2, 3, 4, 5, 6}\nprint(a - b)  # Difference: {1, 2}\nprint(5 in b) # O(1) lookup: True\n\n# Dict — key-value, fast lookup\nstudent = {\"name\": \"Alice\", \"age\": 25}\nstudent[\"email\"] = \"alice@ex.com\"\nprint(student.get(\"phone\", \"N/A\"))\n\n# Performance: 'in' operator\nbig_list = list(range(1_000_000))\nbig_set = set(range(1_000_000))\n# 999_999 in big_list  → O(n) ≈ slow\n# 999_999 in big_set   → O(1) ≈ instant",
                    "explanation": "The 'in' operator is O(n) for lists but O(1) for sets/dicts — choosing the right collection can be a 1000x performance difference."
                  },
                  "tradeoffs": "Lists use contiguous memory — great for iteration, expensive for insertions in the middle (O(n) shift). Tuples have lower memory overhead than lists (no over-allocation buffer) but can't be modified. Sets can't contain unhashable items (lists, dicts) — use frozenset for immutable sets. Dicts use ~2x the memory of lists for the same data due to hash table overhead. For ordered unique items, use dict.fromkeys() (3.7+) since sets don't preserve insertion order.",
                  "followUpQuestions": [
                    {
                      "question": "Why can a tuple be a dictionary key but a list can't?",
                      "answer": "Dictionary keys must be hashable (have a stable __hash__). Tuples are immutable, so their hash never changes — safe as keys. Lists are mutable — if the contents changed after being used as a key, the hash would change, corrupting the dict's internal hash table. This is why Python requires immutability for hashability."
                    },
                    {
                      "question": "When would you choose a tuple over a list?",
                      "answer": "Use tuples for: (1) data that shouldn't change (coordinates, RGB values), (2) dictionary keys or set elements, (3) function return values (return x, y), (4) named tuples as lightweight immutable data classes. Tuples also use less memory and are slightly faster to create than lists."
                    }
                  ],
                  "usedInProduction": "Redis's Python client uses dicts for O(1) key-value access, sets for tracking unique connection pools and pub/sub channels, and tuples for immutable connection parameters (host, port, db) — each collection type is chosen for its specific access pattern guarantee.",
                  "relatedTopics": [
                    "Language Fundamentals",
                    "OOP in Python",
                    "Hash Tables",
                    "Collections Module"
                  ]
                }
              }
            ]
          },
          {
            "id": "python-oop",
            "title": "OOP in Python",
            "questions": [
              {
                "id": "py-oop-1",
                "question": "How does Python implement Object-Oriented Programming?",
                "difficulty": "Medium",
                "frequency": 4,
                "lastVerified": "2026-09-13",
                "answer": {
                  "quickAnswer": "Python supports full OOP — classes, inheritance (including multiple), polymorphism via duck typing, encapsulation by convention (underscore prefixes), and abstraction via ABC. Everything is an object.",
                  "mentalModel": "Java OOP is like a strict company with job titles and org charts — everything is defined by its title (type). Python OOP is like a startup — if you can do the job (have the right methods), you're hired, regardless of your title. That's duck typing: 'If it quacks like a duck, it's a duck.'",
                  "whatItIs": "Python classes use 'self' explicitly as the first instance method parameter. Supports single and multiple inheritance (with MRO — Method Resolution Order via C3 linearization). Encapsulation is by convention: _protected (single underscore), __private (name-mangled). Polymorphism uses duck typing — no interfaces needed. @property for getter/setter, @classmethod/@staticmethod for alternative constructors and utilities. @dataclass (3.7+) reduces boilerplate for data-holding classes.",
                  "whyItExists": "Python's OOP philosophy is 'we're all consenting adults here' — encapsulation is advisory, not enforced. This pragmatic approach reduces boilerplate (no public/private/protected keywords) while trusting developers to follow conventions. Duck typing eliminates the need for Java-style interface hierarchies, making code more flexible and less coupled to type hierarchies.",
                  "codeDemo": {
                    "language": "python",
                    "code": "from abc import ABC, abstractmethod\nfrom dataclasses import dataclass\n\n# Abstract base class\nclass Shape(ABC):\n    @abstractmethod\n    def area(self) -> float: ...\n\n    def describe(self) -> str:\n        return f\"{self.__class__.__name__}: area={self.area():.2f}\"\n\n# @dataclass — auto __init__, __repr__, __eq__\n@dataclass\nclass Rectangle(Shape):\n    width: float\n    height: float\n\n    def area(self) -> float:\n        return self.width * self.height\n\n# Encapsulation via naming convention\nclass BankAccount:\n    def __init__(self, balance: float = 0):\n        self.__balance = balance  # Name-mangled\n\n    @property\n    def balance(self) -> float:\n        return self.__balance\n\n    def deposit(self, amount: float):\n        if amount <= 0:\n            raise ValueError(\"Must be positive\")\n        self.__balance += amount\n\n# Duck typing — no interface needed!\nclass Duck:\n    def quack(self): print(\"Quack!\")\n\nclass Person:\n    def quack(self): print(\"I'm quacking!\")\n\ndef make_quack(thing):  # Works with ANY object\n    thing.quack()       # that has .quack()\n\nmake_quack(Duck())    # \"Quack!\"\nmake_quack(Person())  # \"I'm quacking!\"",
                    "explanation": "Python OOP: no interfaces needed for polymorphism, @dataclass eliminates boilerplate, and encapsulation is by convention not enforcement."
                  },
                  "tradeoffs": "Duck typing means type errors surface at runtime, not compile time — use type hints + mypy for safety in large codebases. Multiple inheritance creates diamond problem complexity; prefer composition or mixins over deep inheritance hierarchies. Python's __private name mangling (_ClassName__field) is easily circumvented — it's obfuscation, not true access control. @dataclass is great for simple data holders but doesn't support slots by default (use @dataclass(slots=True) in 3.10+) and struggles with complex inheritance.",
                  "followUpQuestions": [
                    {
                      "question": "What is MRO (Method Resolution Order) in Python?",
                      "answer": "MRO determines the order in which base classes are searched when calling a method on a derived class. Python uses C3 linearization to create a deterministic, consistent order. Check it with ClassName.__mro__ or ClassName.mro(). It prevents the 'diamond problem' by ensuring each class appears exactly once in the resolution order."
                    },
                    {
                      "question": "What's the difference between @classmethod and @staticmethod?",
                      "answer": "@classmethod receives the CLASS (cls) as the first argument — useful for alternative constructors (e.g., User.from_json()). @staticmethod receives NO implicit argument — it's a regular function namespaced inside the class. Use @classmethod when you need to access or create class instances; @staticmethod when the method is logically related to the class but doesn't use class or instance state."
                    }
                  ],
                  "usedInProduction": "Django's ORM uses Python OOP extensively — Model classes with metaclass magic automatically generate database tables, and duck-typed QuerySet chains (.filter().exclude().order_by()) process millions of database queries across sites like Pinterest and Mozilla.",
                  "relatedTopics": [
                    "Language Fundamentals",
                    "Decorators",
                    "Metaclasses",
                    "Design Patterns in Python"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "id": "py-advanced",
        "title": "Advanced Python",
        "icon": "🚀",
        "subTopics": [
          {
            "id": "decorators",
            "title": "Decorators",
            "questions": [
              {
                "id": "py-dec-1",
                "question": "What are Decorators in Python?",
                "difficulty": "Medium",
                "frequency": 5,
                "lastVerified": "2026-09-15",
                "answer": {
                  "quickAnswer": "A decorator wraps a function to add behavior (logging, timing, auth) without modifying its source code — using @decorator syntax, which is sugar for func = decorator(func).",
                  "mentalModel": "A decorator is like gift wrapping. The gift (function) stays the same, but the wrapping (decorator) adds presentation, a tag, and a bow. You can stack multiple layers of wrapping (@timer @retry @auth), and the recipient still gets the same gift inside.",
                  "whatItIs": "A decorator is a higher-order function that takes a function as input, wraps it in a closure that adds behavior, and returns the wrapper. The @decorator syntax is syntactic sugar for func = decorator(func). Decorators can accept arguments via a three-level nested function pattern. @functools.wraps preserves the original function's name, docstring, and module for introspection. Built-in decorators: @staticmethod, @classmethod, @property, @functools.lru_cache.",
                  "whyItExists": "Without decorators, cross-cutting concerns (logging, timing, authentication, rate limiting) would require copy-pasting the same boilerplate into every function. Decorators separate 'what a function does' from 'how it's monitored/protected/cached.' They implement the Open/Closed Principle: extend behavior without modifying existing code. Frameworks like Flask and Django are built entirely around decorators (@app.route, @login_required).",
                  "codeDemo": {
                    "language": "python",
                    "code": "import functools, time\n\n# Basic decorator\ndef timer(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        print(f\"{func.__name__}: {time.perf_counter()-start:.4f}s\")\n        return result\n    return wrapper\n\n# Decorator WITH arguments (3 nesting levels)\ndef retry(max_attempts=3, delay=1):\n    def decorator(func):\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs):\n            for attempt in range(1, max_attempts + 1):\n                try:\n                    return func(*args, **kwargs)\n                except Exception as e:\n                    if attempt == max_attempts:\n                        raise\n                    print(f\"Attempt {attempt} failed: {e}\")\n                    time.sleep(delay)\n        return wrapper\n    return decorator\n\n# Stacking decorators\n@timer\n@retry(max_attempts=3, delay=0.5)\ndef fetch_data(url: str) -> dict:\n    \"\"\"Fetch data from URL.\"\"\"\n    import random\n    if random.random() < 0.5:\n        raise ConnectionError(\"Timeout\")\n    return {\"status\": \"ok\"}\n\n# Built-in: memoization cache\n@functools.lru_cache(maxsize=128)\ndef fibonacci(n: int) -> int:\n    if n < 2: return n\n    return fibonacci(n-1) + fibonacci(n-2)",
                    "explanation": "Decorators apply bottom-up: @timer wraps the result of @retry wrapping fetch_data. Always use @functools.wraps to preserve metadata."
                  },
                  "tradeoffs": "Decorators add a function call overhead per invocation — avoid on hot-path, microsecond-sensitive code. Stacking many decorators makes debugging stack traces harder (which wrapper raised the error?). Decorator-with-arguments requires three nesting levels — easy to get wrong. @lru_cache holds strong references to arguments, which can cause memory leaks with large objects. Decorated functions lose their signature in some IDEs — @functools.wraps helps but doesn't fully solve it. Class-based decorators (__call__) are more readable for complex state.",
                  "followUpQuestions": [
                    {
                      "question": "What does @functools.wraps do and why is it important?",
                      "answer": "@functools.wraps(func) copies the original function's __name__, __doc__, __module__, and __dict__ to the wrapper function. Without it, the decorated function appears as 'wrapper' in stack traces, help(), and debugging tools. It also preserves __wrapped__, which lets you access the original unwrapped function."
                    },
                    {
                      "question": "Can you decorate a class, not just a function?",
                      "answer": "Yes. Class decorators receive the class as an argument and return a modified class. @dataclass is a class decorator — it modifies the class by adding __init__, __repr__, and __eq__. You can use class decorators to register classes in a registry, add methods, or wrap all methods with logging."
                    }
                  ],
                  "usedInProduction": "Flask's entire routing system is built on decorators — @app.route('/users') registers URL patterns to handler functions. At Airbnb, custom @rate_limit and @authenticate decorators protect API endpoints, keeping business logic clean while enforcing security and throttling policies.",
                  "relatedTopics": [
                    "Closures",
                    "First-Class Functions",
                    "OOP in Python",
                    "functools Module"
                  ]
                }
              }
            ]
          },
          {
            "id": "generators",
            "title": "Generators & Iterators",
            "questions": [
              {
                "id": "py-gen-1",
                "question": "What are Generators and how do they differ from regular functions?",
                "difficulty": "Medium",
                "frequency": 4,
                "lastVerified": "2026-09-12",
                "answer": {
                  "quickAnswer": "A generator uses 'yield' to produce values lazily, one at a time, suspending its state between calls — unlike a regular function that computes everything at once and returns.",
                  "mentalModel": "A regular function is like a vending machine that makes all the drinks at once and hands you a tray. A generator is like a barista — makes one drink at a time, remembers your order between cups, and only works when you ask for the next one. Uses almost no counter space (memory).",
                  "whatItIs": "A generator function uses yield instead of return. When called, it returns a generator object (an iterator) without executing the body. Each next() call resumes execution from the last yield point, produces one value, and suspends again. Generator expressions (x for x in range(n)) are the lazy equivalent of list comprehensions. Generators implement the iterator protocol (__iter__, __next__) automatically.",
                  "whyItExists": "Processing large datasets (millions of rows, multi-GB files) by loading everything into a list would exhaust memory. Generators enable streaming: produce and consume one element at a time, using constant memory regardless of dataset size. They also enable infinite sequences (IDs, timestamps) and pipeline-style composition where each stage processes one element before passing it downstream — exactly like Unix pipes.",
                  "codeDemo": {
                    "language": "python",
                    "code": "import sys\n\n# Regular function — all in memory\ndef squares_list(n):\n    return [x**2 for x in range(n)]\n\n# Generator function — one at a time\ndef squares_gen(n):\n    for x in range(n):\n        yield x**2\n\n# Memory comparison\nbig_list = squares_list(1_000_000)\nbig_gen = squares_gen(1_000_000)\nprint(sys.getsizeof(big_list))  # ~8 MB\nprint(sys.getsizeof(big_gen))   # ~200 bytes!\n\n# Infinite sequence\ndef fibonacci():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\nfrom itertools import islice\nfirst_10 = list(islice(fibonacci(), 10))\n# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n\n# Pipeline pattern (like Unix pipes)\ndef read_lines(path):\n    with open(path) as f:\n        for line in f:\n            yield line.strip()\n\ndef grep(lines, pattern):\n    for line in lines:\n        if pattern in line:\n            yield line\n\n# Chained — one line at a time through entire pipe\nerrors = grep(read_lines(\"app.log\"), \"ERROR\")",
                    "explanation": "The generator uses ~200 bytes regardless of dataset size. The list uses memory proportional to n. This is the key advantage."
                  },
                  "tradeoffs": "Generators are single-pass — you can't index (gen[5]) or iterate twice without recreating. Once exhausted, they're done. len() doesn't work on generators (can't know the length without consuming all values). Debugging is harder because the function suspends mid-execution. Generator pipelines can be difficult to reason about — each stage's state is independent. For small datasets (< 1000 items), the overhead of generator protocol calls makes them slightly slower than a list comprehension.",
                  "followUpQuestions": [
                    {
                      "question": "What's the difference between yield and return?",
                      "answer": "return exits the function permanently and sends back one value. yield suspends the function, sends back a value, and remembers where it left off — the next next() call resumes from that point. A function can yield many times; each yield produces the next value in the sequence. After the function body completes, StopIteration is raised automatically."
                    },
                    {
                      "question": "What is 'yield from' and when would you use it?",
                      "answer": "'yield from iterable' delegates to a sub-generator, yielding each of its values. It replaces: 'for item in iterable: yield item'. Used for: (1) flattening nested generators, (2) composing generator pipelines, (3) coroutine delegation in asyncio. It also properly propagates .send() and .throw() to the sub-generator."
                    }
                  ],
                  "usedInProduction": "Apache Airflow's DAG execution engine uses generators to lazily evaluate task dependencies — only materializing the next task when the scheduler is ready, enabling orchestration of thousands of concurrent data pipelines at companies like Spotify and Lyft without loading entire DAG graphs into memory.",
                  "relatedTopics": [
                    "Iterators & Iterator Protocol",
                    "List Comprehensions",
                    "asyncio & Coroutines",
                    "itertools Module"
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "kafka",
    "slug": "kafka",
    "title": "Apache Kafka",
    "tagline": "Distributed event streaming platform",
    "description": "Learn Kafka architecture, producers, consumers, partitioning, and real-world streaming patterns for building event-driven systems.",
    "icon": "📨",
    "difficulty": "Intermediate to Advanced",
    "totalQuestions": 0,
    "color": "#231f20",
    "gradient": "linear-gradient(135deg, #231f20 0%, #4a4a4a 50%, #e8520e 100%)",
    "categories": []
  },
  {
    "id": "redis",
    "slug": "redis",
    "title": "Redis",
    "tagline": "In-memory data structure store and cache",
    "description": "Master Redis data structures, caching strategies, pub/sub, persistence, and high-availability patterns.",
    "icon": "⚡",
    "difficulty": "Beginner to Advanced",
    "totalQuestions": 0,
    "color": "#dc382d",
    "gradient": "linear-gradient(135deg, #dc382d 0%, #a12b23 100%)",
    "categories": []
  },
  {
    "id": "java-17",
    "slug": "java-17",
    "title": "Java 17",
    "tagline": "Modern Java with records, sealed classes, and pattern matching",
    "description": "Explore Java 17 LTS features — sealed classes, records, pattern matching, text blocks, switch expressions, and more.",
    "icon": "☕",
    "difficulty": "Intermediate",
    "totalQuestions": 0,
    "color": "#5382a1",
    "gradient": "linear-gradient(135deg, #5382a1 0%, #f89820 100%)",
    "categories": []
  },
  {
    "id": "ai-ml",
    "slug": "ai-ml",
    "title": "AI / ML",
    "tagline": "Machine learning concepts, algorithms, and frameworks",
    "description": "From supervised learning basics to neural networks, model evaluation, and deployment — prepare for AI/ML interview questions.",
    "icon": "🤖",
    "difficulty": "Intermediate to Advanced",
    "totalQuestions": 0,
    "color": "#9b59b6",
    "gradient": "linear-gradient(135deg, #9b59b6 0%, #3498db 100%)",
    "categories": []
  }
];

export function getSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}

export function getAllSubjectSlugs(): string[] {
  return subjects.map((s) => s.slug);
}

export function getSearchableItems(): import("@/types").SearchableItem[] {
  const items: import("@/types").SearchableItem[] = [];
  for (const subject of subjects) {
    for (const category of subject.categories) {
      for (const subTopic of category.subTopics) {
        items.push({
          type: "subtopic",
          subjectSlug: subject.slug,
          subjectTitle: subject.title,
          categoryId: category.id,
          categoryTitle: category.title,
          subTopicId: subTopic.id,
          subTopicTitle: subTopic.title,
          questionId: subTopic.questions[0]?.id,
          text: `${subject.title} ${category.title} ${subTopic.title}`,
        });
        for (const question of subTopic.questions) {
          items.push({
            type: "question",
            subjectSlug: subject.slug,
            subjectTitle: subject.title,
            categoryId: category.id,
            categoryTitle: category.title,
            subTopicId: subTopic.id,
            subTopicTitle: subTopic.title,
            questionId: question.id,
            questionText: question.question,
            difficulty: question.difficulty,
            text: `${subject.title} ${category.title} ${subTopic.title} ${question.question}`,
          });
        }
      }
    }
  }
  return items;
}
