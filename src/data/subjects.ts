import { Subject } from "@/types";
import { java8Subject } from "./java8-data";
import { java17Subject } from "./java17-data";
import { springBootSubject } from "./springboot-data";
import { systemDesignSubject } from "./systemdesign-data";
import { sqlSubject } from "./sql-data";

export const subjects: Subject[] = [
  java8Subject,
  java17Subject,
  springBootSubject,
  systemDesignSubject,
  sqlSubject,
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
    "categories": [
      {
        "id": "core-concepts",
        "title": "Core Concepts",
        "subTopics": [
          {
            "id": "topics",
            "title": "Topics & Partitions",
            "questions": []
          },
          {
            "id": "brokers",
            "title": "Brokers & Cluster",
            "questions": []
          }
        ]
      },
      {
        "id": "clients",
        "title": "Clients",
        "subTopics": [
          {
            "id": "producers-consumers",
            "title": "Producers & Consumers",
            "questions": []
          },
          {
            "id": "consumer-groups",
            "title": "Consumer Groups & Offsets",
            "questions": []
          }
        ]
      },
      {
        "id": "advanced",
        "title": "Advanced Features",
        "subTopics": [
          {
            "id": "replication",
            "title": "Replication & Fault Tolerance",
            "questions": []
          },
          {
            "id": "kafka-streams",
            "title": "Kafka Streams",
            "questions": []
          }
        ]
      }
    ]
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
    "categories": [
      {
        "id": "data-structures",
        "title": "Data Structures",
        "subTopics": [
          {
            "id": "strings",
            "title": "Strings & Lists",
            "questions": []
          },
          {
            "id": "sets-hashes",
            "title": "Sets, Hashes & Sorted Sets",
            "questions": []
          }
        ]
      },
      {
        "id": "architecture",
        "title": "Architecture & Patterns",
        "subTopics": [
          {
            "id": "persistence",
            "title": "Persistence (RDB/AOF)",
            "questions": []
          },
          {
            "id": "caching-eviction",
            "title": "Caching Patterns & Eviction Policies",
            "questions": []
          }
        ]
      },
      {
        "id": "advanced",
        "title": "Advanced Features",
        "subTopics": [
          {
            "id": "pub-sub",
            "title": "Pub/Sub & Streams",
            "questions": []
          },
          {
            "id": "clustering",
            "title": "Clustering & Replication",
            "questions": []
          }
        ]
      }
    ]
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
    "categories": [
      {
        "id": "core-ml",
        "title": "Core ML Concepts",
        "subTopics": [
          {
            "id": "ml-basics",
            "title": "Core ML Concepts",
            "questions": [
              {
                "id": "ai-ml-ml-basics-1",
                "question": "What is the difference between Supervised, Unsupervised, and Reinforcement Learning?",
                "difficulty": "Beginner",
                "frequency": 5,
                "lastVerified": "2026-09-28",
                "answer": {
                  "quickAnswer": "Supervised learning uses labeled data to predict outcomes, unsupervised learning finds hidden patterns in unlabeled data, and reinforcement learning trains an agent to make decisions through trial and error using rewards.",
                  "mentalModel": "Supervised is learning with a teacher (flashcards with answers). Unsupervised is learning by sorting (grouping similar toys without knowing their names). Reinforcement is learning like training a dog (give a treat for good behavior).",
                  "whatItIs": "These are the three main paradigms of Machine Learning. Supervised learning maps an input to an output based on example input-output pairs (e.g., classification, regression). Unsupervised learning draws inferences from datasets consisting of input data without labeled responses (e.g., clustering). Reinforcement learning concerns how software agents ought to take actions in an environment to maximize some notion of cumulative reward.",
                  "whyItExists": "Different real-world problems have different data availability. We don't always have labeled data (hence unsupervised), and sometimes we need a system to make a sequence of decisions in a dynamic environment rather than a single prediction (hence reinforcement).",
                  "codeDemo": {
                    "language": "python",
                    "code": "// Supervised (Classification)\nfrom sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression()\nmodel.fit(X_train, y_labeled_train)\n\n// Unsupervised (Clustering)\nfrom sklearn.cluster import KMeans\nkmeans = KMeans(n_clusters=3)\nkmeans.fit(X_unlabeled_data)"
                  },
                  "tradeOffs": "Supervised learning requires expensive and time-consuming manual labeling. Unsupervised learning results can be subjective and hard to evaluate. Reinforcement learning is notoriously difficult to train, often requiring massive compute and simulation environments.",
                  "theyMightAskNext": [
                    {
                      "question": "Can you give an example of a Reinforcement Learning use case?",
                      "answer": "Training AI for autonomous driving, robotics, or playing complex games like Chess and Go."
                    }
                  ],
                  "usedInProduction": "Supervised learning powers spam filters and image recognition. Unsupervised learning drives recommendation engines (grouping similar users). Reinforcement learning is used in algorithmic trading and robotics.",
                  "relatedTopics": [
                    {
                      "title": "Model Training & Evaluation",
                      "id": "model-training"
                    }
                  ]
                }
              }
            ]
          },
          {
            "id": "model-training",
            "title": "Model Training & Evaluation",
            "questions": [
              {
                "id": "ai-ml-model-training-1",
                "question": "What is Overfitting and how do you prevent it?",
                "difficulty": "Intermediate",
                "frequency": 5,
                "lastVerified": "2026-09-28",
                "answer": {
                  "quickAnswer": "Overfitting occurs when a model learns the training data too well, capturing noise instead of the underlying pattern, leading to poor performance on new, unseen data.",
                  "mentalModel": "It’s like memorizing the exact answers to a practice math test instead of learning the formulas. You’ll score 100% on the practice test, but fail the real exam.",
                  "whatItIs": "A modeling error in machine learning where a function is too closely aligned to a limited set of data points. The model has high variance and low bias.",
                  "whyItExists": "Complex models (like deep neural networks) have enough capacity to memorize the training dataset. If trained for too long without constraints, they will optimize for the training set's specific noise.",
                  "codeDemo": {
                    "language": "python",
                    "code": "# Preventing overfitting using Early Stopping in Keras\nfrom tensorflow.keras.callbacks import EarlyStopping\n\n# Stop training when validation loss stops improving for 3 epochs\nearly_stopping = EarlyStopping(monitor='val_loss', patience=3)\n\nmodel.fit(X_train, y_train, \n          validation_data=(X_val, y_val),\n          callbacks=[early_stopping])"
                  },
                  "tradeOffs": "Techniques to prevent overfitting (regularization, dropout, early stopping) can introduce bias. If you constrain the model too much, you risk 'Underfitting'—where the model is too simple to capture the underlying patterns.",
                  "theyMightAskNext": [
                    {
                      "question": "What is L1 vs L2 Regularization?",
                      "answer": "L1 (Lasso) shrinks some weights to exactly zero (feature selection), while L2 (Ridge) shrinks weights evenly but rarely to zero."
                    }
                  ],
                  "usedInProduction": "In production, ML engineers strictly separate data into Training, Validation, and Test sets, and heavily rely on Dropout layers in deep learning to prevent overfitting.",
                  "relatedTopics": [
                    {
                      "title": "Neural Networks Basics",
                      "id": "neural-networks"
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "id": "deep-learning",
        "title": "Deep Learning & Generative AI",
        "subTopics": [
          {
            "id": "neural-networks",
            "title": "Neural Networks Basics",
            "questions": [
              {
                "id": "ai-ml-neural-networks-1",
                "question": "What is the purpose of an Activation Function in a Neural Network?",
                "difficulty": "Intermediate",
                "frequency": 4,
                "lastVerified": "2026-09-28",
                "answer": {
                  "quickAnswer": "Activation functions introduce non-linearity into the neural network, allowing it to learn complex, non-linear patterns rather than just simple linear regression.",
                  "mentalModel": "Think of it as a gatekeeper for a neuron. It decides whether the neuron should 'fire' (pass the signal forward) based on the inputs it received, similar to a biological synapse.",
                  "whatItIs": "A mathematical function applied to the output of a neural network node. Without it, no matter how many layers a neural network has, it would behave exactly like a single-layer linear perceptron because the sum of linear functions is just another linear function.",
                  "whyItExists": "Real-world data (images, audio, text) is highly non-linear. To map complex inputs to correct outputs, the network needs a way to curve and bend its decision boundaries.",
                  "codeDemo": {
                    "language": "python",
                    "code": "import torch.nn as nn\n\n# Common Activation Functions in PyTorch\nrelu = nn.ReLU()       # f(x) = max(0, x)\nsigmoid = nn.Sigmoid() # f(x) = 1 / (1 + e^-x)\ntanh = nn.Tanh()       # f(x) = (e^x - e^-x) / (e^x + e^-x)"
                  },
                  "tradeOffs": "Sigmoid and Tanh suffer from the 'vanishing gradient' problem where deep layers stop learning. ReLU solves this but can suffer from 'dying ReLU' where neurons output zero forever. Leaky ReLU is often used as a compromise.",
                  "theyMightAskNext": [
                    {
                      "question": "Why is ReLU mostly used in hidden layers, but Sigmoid/Softmax in the output layer?",
                      "answer": "ReLU is fast and prevents vanishing gradients during training. Softmax/Sigmoid are used at the output to convert logits into probabilities for classification."
                    }
                  ],
                  "usedInProduction": "ReLU (and its variants like GELU) is the default activation function for hidden layers in almost all modern production deep learning models, including Transformers and CNNs.",
                  "relatedTopics": [
                    {
                      "title": "Core ML Concepts",
                      "id": "ml-basics"
                    }
                  ]
                }
              }
            ]
          },
          {
            "id": "llms-rag",
            "title": "LLMs, Prompting & RAG Basics",
            "questions": [
              {
                "id": "ai-ml-llms-rag-1",
                "question": "Explain what RAG (Retrieval-Augmented Generation) is and why it is necessary.",
                "difficulty": "Advanced",
                "frequency": 5,
                "lastVerified": "2026-09-28",
                "answer": {
                  "quickAnswer": "RAG is a technique that grounds a Large Language Model (LLM) by fetching relevant private or real-time data from a database and injecting it into the prompt before generating an answer.",
                  "mentalModel": "It’s like an open-book exam. Instead of the LLM relying on what it memorized during training (which might be outdated), RAG allows the LLM to search the library for the exact page with the answer, and then summarize it for you.",
                  "whatItIs": "RAG combines an information retrieval system (usually a vector database) with a generative text model. When a user asks a query, the system embeds the query, retrieves the top-K most semantically similar document chunks, and passes those chunks to the LLM alongside the user's prompt.",
                  "whyItExists": "LLMs suffer from hallucinations, lack of access to private enterprise data, and have a knowledge cutoff date. Retraining or fine-tuning an LLM on daily changing data is prohibitively expensive. RAG solves this cleanly.",
                  "codeDemo": {
                    "language": "python",
                    "code": "# Conceptual RAG Flow\nuser_query = \"What is our company's refund policy?\"\n\n# 1. Retrieve\nquery_embedding = embed_model.embed(user_query)\ncontext_docs = vector_db.similarity_search(query_embedding, top_k=3)\n\n# 2. Augment\nprompt = f\"Answer the user based on this context: {context_docs}. Query: {user_query}\"\n\n# 3. Generate\nresponse = llm.generate(prompt)"
                  },
                  "tradeOffs": "RAG adds latency to the system because you have to wait for the vector search before calling the LLM. It also requires maintaining an embedding pipeline and vector database infrastructure.",
                  "theyMightAskNext": [
                    {
                      "question": "What is semantic search vs keyword search?",
                      "answer": "Keyword search matches exact words (BM25). Semantic search uses embeddings to match the meaning or intent (e.g., matching 'puppy' with 'dog')."
                    }
                  ],
                  "usedInProduction": "Almost all enterprise generative AI chatbots use RAG (often built with frameworks like LangChain or LlamaIndex) to allow employees to query internal Notion pages, Confluence docs, or codebases securely.",
                  "relatedTopics": [
                    {
                      "title": "Core ML Concepts",
                      "id": "ml-basics"
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "id": "mlops",
        "title": "MLOps",
        "subTopics": [
          {
            "id": "deployment",
            "title": "MLOps & Deployment Basics",
            "questions": [
              {
                "id": "ai-ml-deployment-1",
                "question": "What is Model Drift in MLOps and how do you handle it?",
                "difficulty": "Advanced",
                "frequency": 4,
                "lastVerified": "2026-09-28",
                "answer": {
                  "quickAnswer": "Model drift is the degradation of a machine learning model's predictive accuracy over time because the real-world data it receives in production has changed compared to the data it was trained on.",
                  "mentalModel": "Imagine training a model in 2019 to predict flight prices. In 2020 (during COVID), travel patterns fundamentally changed. The 2019 model would fail miserably in 2020 because the world 'drifted' away from the training data.",
                  "whatItIs": "There are two main types: Data Drift (the distribution of input features changes) and Concept Drift (the statistical relationship between inputs and the target variable changes).",
                  "whyItExists": "The real world is dynamic. Consumer preferences change, economic conditions shift, and new trends emerge. A static model inevitably becomes stale.",
                  "codeDemo": {
                    "language": "python",
                    "code": "# Pseudo-code for detecting Data Drift in production\nfrom evidently.metrics import DataDriftTable\n\n# Compare production data distributions against training data baseline\ndrift_report = DataDriftTable()\ndrift_report.calculate(reference_data=training_df, current_data=production_df)\n\nif drift_report.has_drift():\n    alert_mlops_team()\n    trigger_retraining_pipeline()"
                  },
                  "tradeOffs": "Retraining models too frequently burns expensive compute resources and risks deploying unstable models. You must balance the cost of retraining against the business cost of a slightly degraded model.",
                  "theyMightAskNext": [
                    {
                      "question": "How do you deploy a new model without impacting users?",
                      "answer": "Use Shadow Deployment (run the new model alongside the old, but don't use its predictions) or A/B Testing/Canary Releases to gradually shift traffic."
                    }
                  ],
                  "usedInProduction": "MLOps teams at companies like Netflix and Uber use continuous monitoring tools (like Arize or Evidently) to set up automated alerts for drift, triggering CI/CD pipelines to retrain models on the latest data.",
                  "relatedTopics": [
                    {
                      "title": "Model Training & Evaluation",
                      "id": "model-training"
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
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
