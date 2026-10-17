import { SubTopic } from "@/types";

export const streamCodingSubTopic: SubTopic = {
  id: "stream-coding-problems",
  title: "Top Stream Coding Problems",
  questions: [
    {
      id: "j8-code-1",
      question: "How do you count the frequency of each character in a String using Streams?",
      difficulty: "Medium",
      frequency: 5,
      lastVerified: "2026-10-01",
      answer: {
        quickAnswer: "Use str.chars().mapToObj(c -> (char) c).collect(Collectors.groupingBy(Function.identity(), Collectors.counting())).",
        mentalModel: "Like sorting physical mail into bins labeled by each letter of the alphabet, then counting how many letters landed in each bin.",
        whatItIs: "str.chars() returns an IntStream of code points. mapToObj converts each integer into a Character object. Collectors.groupingBy groups identical characters together using Function.identity() as the classification key, and Collectors.counting() counts how many times each character occurred.",
        whyItExists: "A standard interview test checking your ability to bridge primitive streams with boxed object collectors.",
        codeDemo: {
          language: "java",
          code: "String input = \"java stream api\";\n\nMap<Character, Long> charFrequencies = input.chars()\n    .filter(c -> !Character.isWhitespace(c)) // Exclude spaces if desired\n    .mapToObj(c -> (char) c)\n    .collect(Collectors.groupingBy(\n        Function.identity(), \n        Collectors.counting()\n    ));\n\nSystem.out.println(charFrequencies);\n// Output: {p=1, a=4, r=1, s=1, t=1, e=1, v=1, i=2, j=1, m=1}",
          explanation: "Function.identity() returns the character itself as the map key; Collectors.counting() produces the count as a Long."
        },
        tradeoffs: "Boxing every char code point into a Character object allocates heap; for ultra-low latency, a primitive int[256] frequency array is faster.",
        followUpQuestions: [
          {
            question: "How do you preserve insertion order of characters in the resulting map?",
            answer: "Pass LinkedHashMap::new as the map factory: Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting())."
          }
        ],
        usedInProduction: "Natural language processing tokenizers, word clouds, and string analytics engines.",
        relatedTopics: ["Collectors.groupingBy", "IntStream.mapToObj", "Function.identity"]
      }
    },
    {
      id: "j8-code-2",
      question: "How do you find duplicate elements in a List or Array using Streams?",
      difficulty: "Medium",
      frequency: 5,
      lastVerified: "2026-10-02",
      answer: {
        quickAnswer: "Filter elements using !set.add(element) to capture elements that fail insertion into a HashSet, or use Collections.frequency().",
        mentalModel: "A guest list clipboard: you try to write each guest's name on a blank sheet. If the name is already there (set.add returns false), you flag that person as an impostor/duplicate.",
        whatItIs: "Set.add(e) returns true if the element was successfully added, and false if the element already exists in the set. Negating this with !set.add(e) inside filter() identifies every element that appears for the second (or subsequent) time.",
        whyItExists: "One of the most frequently asked Java 8 coding interview questions testing stateful filtering vs grouping.",
        codeDemo: {
          language: "java",
          code: "List<Integer> numbers = Arrays.asList(5, 13, 4, 21, 13, 27, 2, 59, 59, 34);\n\n// Method 1: Using HashSet.add (O(N) time complexity - Recommended!)\nSet<Integer> seen = new HashSet<>();\nSet<Integer> duplicates = numbers.stream()\n    .filter(n -> !seen.add(n))\n    .collect(Collectors.toSet());\nSystem.out.println(\"Duplicates: \" + duplicates); // [59, 13]\n\n// Method 2: Using groupingBy & counting (O(N) time complexity)\nSet<Integer> dupesByGrouping = numbers.stream()\n    .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))\n    .entrySet().stream()\n    .filter(entry -> entry.getValue() > 1)\n    .map(Map.Entry::getKey)\n    .collect(Collectors.toSet());",
          explanation: "Method 1 runs in a single O(N) pass and avoids intermediate Map allocations."
        },
        tradeoffs: "Avoid Collections.frequency(list, n) inside stream.filter() as it results in an atrocious O(N^2) quadratic time complexity.",
        followUpQuestions: [
          {
            question: "Why is Collections.frequency inside filter an anti-pattern?",
            answer: "Because frequency() iterates through the entire list for every single element, turning an O(N) problem into an O(N^2) disaster."
          }
        ],
        usedInProduction: "Detecting duplicate database keys in ETL pipelines, validating CSV batch uploads, and reconciling billing records.",
        relatedTopics: ["HashSet.add", "Stream.filter", "Time Complexity"]
      }
    },
    {
      id: "j8-code-3",
      question: "How do you find the first non-repeated (unique) character in a String using Streams?",
      difficulty: "Medium",
      frequency: 5,
      lastVerified: "2026-10-03",
      answer: {
        quickAnswer: "Group characters into a LinkedHashMap with Collectors.counting() to preserve order, then stream the entrySet to find the first key with count == 1.",
        mentalModel: "Count votes in the exact order ballots were cast into an ordered ballot box (LinkedHashMap), then inspect boxes from left to right for the first box containing exactly one ballot.",
        whatItIs: "Uses Collectors.groupingBy with LinkedHashMap::new to preserve encounter order while calculating frequencies. Then streams entrySet().filter(e -> e.getValue() == 1L).map(Map.Entry::getKey).findFirst().",
        whyItExists: "Classic technical interview problem checking your understanding of Map ordering contracts and downstream collectors.",
        codeDemo: {
          language: "java",
          code: "String input = \"swiss\";\n\nCharacter firstNonRepeated = input.chars()\n    .mapToObj(c -> (char) c)\n    .collect(Collectors.groupingBy(\n        Function.identity(),\n        LinkedHashMap::new, // CRITICAL: Preserves encounter order!\n        Collectors.counting()\n    ))\n    .entrySet().stream()\n    .filter(entry -> entry.getValue() == 1L)\n    .map(Map.Entry::getKey)\n    .findFirst()\n    .orElse(null);\n\nSystem.out.println(\"First unique character: \" + firstNonRepeated); // 'w'",
          explanation: "In 'swiss', 's' appears 3 times, 'w' appears 1 time, 'i' appears 1 time. The first non-repeated character in encounter order is 'w'."
        },
        tradeoffs: "Failing to pass LinkedHashMap::new will default to HashMap, which scrambles key order and produces incorrect answers.",
        followUpQuestions: [
          {
            question: "What happens if all characters in the string are repeated?",
            answer: "findFirst() returns Optional.empty(), which orElse(null) safely unwraps to null."
          }
        ],
        usedInProduction: "Data sanitization, cipher decoding, and compression algorithms (e.g. Run-Length Encoding).",
        relatedTopics: ["LinkedHashMap", "findFirst", "Collectors.counting"]
      }
    },
    {
      id: "j8-code-4",
      question: "How do you find the first repeated character in a String using Streams?",
      difficulty: "Medium",
      frequency: 5,
      lastVerified: "2026-10-04",
      answer: {
        quickAnswer: "Stream chars to Character objects, filter using a stateful HashSet (!seen.add(c)), and invoke findFirst().",
        mentalModel: "Walking through a ticket gate: you keep a list of people who walked in. The very first time someone arrives whose name is already on your list, you blow the whistle immediately.",
        whatItIs: "By filtering against !seen.add(c) and immediately calling findFirst(), short-circuiting ensures traversal terminates at the exact first recurring character without processing the rest of the string.",
        whyItExists: "Tests short-circuiting stream evaluation combined with stateful filtering.",
        codeDemo: {
          language: "java",
          code: "String input = \"java stream api\";\nSet<Character> seen = new HashSet<>();\n\nCharacter firstRepeated = input.chars()\n    .filter(c -> !Character.isWhitespace(c))\n    .mapToObj(c -> (char) c)\n    .filter(c -> !seen.add(c)) // Returns true on first duplicate seen!\n    .findFirst()                // Short-circuits immediately!\n    .orElse(null);\n\nSystem.out.println(\"First repeated character: \" + firstRepeated); // 'a'",
          explanation: "In 'java stream api', 'j', 'a', 'v', 'a' -> 'a' is seen for the second time at index 3, so processing stops immediately."
        },
        tradeoffs: "Using stateful lambdas in streams should be limited to sequential streams; parallel streams could encounter race conditions in seen.add().",
        followUpQuestions: [
          {
            question: "Can this be safely executed on a parallel stream?",
            answer: "Not with a standard HashSet. You would need a ConcurrentHashMap.newKeySet(), but parallel execution would not guarantee finding the 'first' repeated character in encounter order."
          }
        ],
        usedInProduction: "Input verification, packet checksum validation, and duplicate token scanning.",
        relatedTopics: ["Short-circuiting", "findFirst", "HashSet"]
      }
    },
    {
      id: "j8-code-5",
      question: "How do you find the second highest (or Nth highest) number in a List of integers?",
      difficulty: "Medium",
      frequency: 5,
      lastVerified: "2026-10-05",
      answer: {
        quickAnswer: "Use list.stream().distinct().sorted(Comparator.reverseOrder()).skip(N - 1).findFirst().",
        mentalModel: "Lining up runners on a podium: first remove duplicate identical times (distinct), rank runners from fastest to slowest (sorted reverse), step past the gold medalist (skip(1)), and hand the silver medal to the next person (findFirst).",
        whatItIs: "distinct() removes duplicates so identical maximum values don't occupy both 1st and 2nd rank. sorted(Comparator.reverseOrder()) sorts in descending order. skip(1) skips the absolute maximum. findFirst() retrieves the second highest.",
        whyItExists: "One of the top 3 most requested coding questions in Java interviews across Indian and Global MNCs.",
        codeDemo: {
          language: "java",
          code: "List<Integer> numbers = Arrays.asList(10, 45, 90, 23, 90, 67, 85);\n\nInteger secondHighest = numbers.stream()\n    .distinct()                     // Drop duplicate 90s!\n    .sorted(Comparator.reverseOrder()) // Descending: 90, 85, 67, 45, 23, 10\n    .skip(1)                        // Skip 90\n    .findFirst()                    // Pick 85\n    .orElseThrow(() -> new IllegalArgumentException(\"List has fewer than 2 distinct elements\"));\n\nSystem.out.println(\"Second highest: \" + secondHighest); // 85",
          explanation: "Without distinct(), having two 90s would cause 90 to be mistakenly returned as the second highest."
        },
        tradeoffs: "sorted() takes O(N log N) time; for huge datasets of 100M items, a single O(N) pass tracking max and secondMax in variables is more optimal.",
        followUpQuestions: [
          {
            question: "How would you find the 3rd lowest number using this pattern?",
            answer: "numbers.stream().distinct().sorted().skip(2).findFirst()."
          }
        ],
        usedInProduction: "Leaderboards, benchmark rankings, and percentile threshold computations.",
        relatedTopics: ["sorted", "skip", "distinct"]
      }
    },
    {
      id: "j8-code-6",
      question: "How do you partition a list of numbers into odd and even using Collectors.partitioningBy?",
      difficulty: "Easy",
      frequency: 5,
      lastVerified: "2026-10-06",
      answer: {
        quickAnswer: "Use list.stream().collect(Collectors.partitioningBy(n -> n % 2 == 0)), which partitions elements into a Map<Boolean, List<T>>.",
        mentalModel: "Sorting socks into two baskets: Clean (true) and Dirty (false). You only ever have two baskets.",
        whatItIs: "Collectors.partitioningBy(Predicate) is a specialized form of groupingBy where the key is always a Boolean. It guarantees both true and false keys will be present in the returned Map, even if one list is empty.",
        whyItExists: "High performance binary splitting without having to filter the list twice.",
        codeDemo: {
          language: "java",
          code: "List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);\n\nMap<Boolean, List<Integer>> oddEven = numbers.stream()\n    .collect(Collectors.partitioningBy(n -> n % 2 == 0));\n\nList<Integer> evens = oddEven.get(true);  // [2, 4, 6, 8, 10]\nList<Integer> odds  = oddEven.get(false); // [1, 3, 5, 7, 9]\n\nSystem.out.println(\"Evens: \" + evens);\nSystem.out.println(\"Odds: \" + odds);",
          explanation: "partitioningBy evaluates the predicate once per element and routes it into true or false buckets."
        },
        tradeoffs: "If you need 3 or more partitions, you must use groupingBy instead of partitioningBy.",
        followUpQuestions: [
          {
            question: "Can partitioningBy take a downstream collector?",
            answer: "Yes, e.g. Collectors.partitioningBy(n -> n % 2 == 0, Collectors.counting()) to count even vs odd numbers."
          }
        ],
        usedInProduction: "Separating successful vs failed batch transaction records, or active vs inactive customer accounts.",
        relatedTopics: ["Collectors.partitioningBy", "Predicate", "Collectors.groupingBy"]
      }
    },
    {
      id: "j8-code-7",
      question: "How do you sort a Map<String, Integer> by its values using Streams?",
      difficulty: "Hard",
      frequency: 5,
      lastVerified: "2026-10-07",
      answer: {
        quickAnswer: "Stream map.entrySet(), sort using Map.Entry.comparingByValue(), and collect into a LinkedHashMap to preserve the sorted order.",
        mentalModel: "Take items off the shelves, arrange them on a table strictly by price tag, and reload them into an ordered display rack (LinkedHashMap) so the order never shifts.",
        whatItIs: "Standard HashMaps do not preserve order. To sort by value: (1) Stream entrySet(). (2) Sort with Map.Entry.comparingByValue(). (3) Collect into LinkedHashMap via Collectors.toMap(Entry::getKey, Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new).",
        whyItExists: "One of the most requested live-coding interview challenges for senior Java developers.",
        codeDemo: {
          language: "java",
          code: "Map<String, Integer> wordCounts = new HashMap<>();\nwordCounts.put(\"Java\", 50);\nwordCounts.put(\"Python\", 80);\nwordCounts.put(\"Rust\", 65);\nwordCounts.put(\"Go\", 40);\n\nMap<String, Integer> sortedByValue = wordCounts.entrySet().stream()\n    .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder())) // Descending\n    .collect(Collectors.toMap(\n        Map.Entry::getKey,\n        Map.Entry::getValue,\n        (oldVal, newVal) -> oldVal,\n        LinkedHashMap::new // CRITICAL: Preserves sorted order!\n    ));\n\nSystem.out.println(sortedByValue);\n// Output: {Python=80, Rust=65, Java=50, Go=40}",
          explanation: "LinkedHashMap::new is mandatory; without it, Collectors.toMap instantiates a regular HashMap, destroying the sort order."
        },
        tradeoffs: "Forgetting the merge function (oldVal, newVal) -> oldVal will prevent specifying the LinkedHashMap factory.",
        followUpQuestions: [
          {
            question: "How do you sort by key instead of value?",
            answer: "Use Map.Entry.comparingByKey() instead of comparingByValue()."
          }
        ],
        usedInProduction: "Ranking top searched keywords, sorting products by sales volume, and displaying leaderboards.",
        relatedTopics: ["Map.Entry.comparingByValue", "LinkedHashMap", "Collectors.toMap"]
      }
    },
    {
      id: "j8-code-8",
      question: "How do you flatten a List<List<String>> into a single List<String> using flatMap?",
      difficulty: "Easy",
      frequency: 5,
      lastVerified: "2026-10-08",
      answer: {
        quickAnswer: "Use nestedList.stream().flatMap(List::stream).collect(Collectors.toList()).",
        mentalModel: "Opening three boxes containing letters and dumping all letters into one continuous bag.",
        whatItIs: "flatMap takes a function that converts each inner List<T> into a Stream<T>, and seamlessly merges all individual streams into one single unified Stream<T>.",
        whyItExists: "Standard flattening problem encountered when consolidating data across groups, nested JSON, or multi-department lists.",
        codeDemo: {
          language: "java",
          code: "List<List<String>> skills = Arrays.asList(\n    Arrays.asList(\"Java\", \"Spring\"),\n    Arrays.asList(\"Kafka\", \"Docker\"),\n    Arrays.asList(\"AWS\", \"Kubernetes\")\n);\n\nList<String> flatSkills = skills.stream()\n    .flatMap(Collection::stream) // Flattens each sub-list\n    .collect(Collectors.toList());\n\nSystem.out.println(flatSkills);\n// Output: [Java, Spring, Kafka, Docker, AWS, Kubernetes]",
          explanation: "flatMap replaces nested loops with a clean, single-pass pipeline."
        },
        tradeoffs: "If inner lists contain nulls, add .filter(Objects::nonNull) before flatMap.",
        followUpQuestions: [
          {
            question: "How do you flatten an array of arrays (e.g. String[][])?",
            answer: "Arrays.stream(array).flatMap(Arrays::stream).toArray(String[]::new)."
          }
        ],
        usedInProduction: "Aggregating order line-items across a customer's order history.",
        relatedTopics: ["flatMap", "Collection::stream", "Nested Collections"]
      }
    },
    {
      id: "j8-code-9",
      question: "How do you find the highest paid employee in each department using groupingBy and maxBy?",
      difficulty: "Hard",
      frequency: 5,
      lastVerified: "2026-10-09",
      answer: {
        quickAnswer: "Use Collectors.groupingBy(Employee::getDepartment, Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary))), optionally wrapped in collectingAndThen to extract the Employee directly.",
        mentalModel: "Divide the company into department rooms. In each room, have employees compare salaries and crown the winner with the gold medal.",
        whatItIs: "Combines two levels of collectors: the primary classifier groups employees by department, and the downstream collector uses Collectors.maxBy with a salary comparator to find the maximum in each department.",
        whyItExists: "The most classic SQL-like 'GROUP BY department, MAX(salary)' coding question asked by interviewers.",
        codeDemo: {
          language: "java",
          code: "class Employee {\n    String name;\n    String dept;\n    double salary;\n    Employee(String name, String dept, double salary) {\n        this.name = name; this.dept = dept; this.salary = salary;\n    }\n    public String getDept() { return dept; }\n    public double getSalary() { return salary; }\n    public String toString() { return name + \" ($ \" + salary + \")\"; }\n}\n\nList<Employee> staff = Arrays.asList(\n    new Employee(\"Alice\", \"IT\", 95000),\n    new Employee(\"Bob\", \"IT\", 110000),\n    new Employee(\"Carol\", \"HR\", 80000),\n    new Employee(\"Dave\", \"HR\", 85000)\n);\n\n// Clean version unwrapping the Optional with collectingAndThen:\nMap<String, Employee> topEarners = staff.stream()\n    .collect(Collectors.groupingBy(\n        Employee::getDept,\n        Collectors.collectingAndThen(\n            Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary)),\n            Optional::get\n        )\n    ));\n\nSystem.out.println(topEarners);\n// Output: {IT=Bob ($ 110000.0), HR=Dave ($ 85000.0)}",
          explanation: "collectingAndThen(maxBy(...), Optional::get) cleanly unwraps the Optional so the map value is directly Employee instead of Optional<Employee>."
        },
        tradeoffs: "Optional::get is safe here because groupingBy only invokes the collector on non-empty groups.",
        followUpQuestions: [
          {
            question: "How do you find the second highest earner in each department?",
            answer: "Collect into a List via groupingBy, then sort each department list descending and pick skip(1).findFirst()."
          }
        ],
        usedInProduction: "Departmental salary budgeting, sales quota leaderboards, and regional top-performer reporting.",
        relatedTopics: ["groupingBy", "maxBy", "collectingAndThen"]
      }
    },
    {
      id: "j8-code-10",
      question: "How do you calculate the sum and average of an employee salary list using mapToDouble, sum(), and average()?",
      difficulty: "Easy",
      frequency: 4,
      lastVerified: "2026-10-10",
      answer: {
        quickAnswer: "Use stream.mapToDouble(Employee::getSalary).sum() for total salary, and mapToDouble(Employee::getSalary).average().orElse(0.0) for average.",
        mentalModel: "Tapping into the numeric stream directly with a digital calculator rather than packaging each salary into an envelope.",
        whatItIs: "mapToDouble converts the stream into a primitive DoubleStream. sum() returns a double directly. average() returns an OptionalDouble (to handle empty lists safely).",
        whyItExists: "Avoids boxed arithmetic and computes statistical totals in O(N) time with minimal memory.",
        codeDemo: {
          language: "java",
          code: "List<Employee> employees = Arrays.asList(\n    new Employee(\"Alice\", \"IT\", 90000),\n    new Employee(\"Bob\", \"IT\", 110000),\n    new Employee(\"Charlie\", \"HR\", 70000)\n);\n\n// 1. Total salary sum:\ndouble totalSalary = employees.stream()\n    .mapToDouble(Employee::getSalary)\n    .sum();\nSystem.out.println(\"Total: $\" + totalSalary); // $270,000.0\n\n// 2. Average salary:\ndouble avgSalary = employees.stream()\n    .mapToDouble(Employee::getSalary)\n    .average()\n    .orElse(0.0);\nSystem.out.println(\"Average: $\" + avgSalary); // $90,000.0\n\n// 3. Or compute everything in a single pass:\nDoubleSummaryStatistics stats = employees.stream()\n    .collect(Collectors.summarizingDouble(Employee::getSalary));\nSystem.out.println(\"Count: \" + stats.getCount() + \", Max: \" + stats.getMax());",
          explanation: "DoubleSummaryStatistics computes count, sum, min, average, and max in a single iteration over the list."
        },
        tradeoffs: "For financial applications requiring exact penny precision, use BigDecimal instead of double to prevent floating-point rounding errors.",
        followUpQuestions: [
          {
            question: "Why does average() return OptionalDouble while sum() returns double?",
            answer: "If the stream is empty, sum is mathematically 0, but average is undefined (0/0 = division by zero), requiring OptionalDouble."
          }
        ],
        usedInProduction: "Payroll accounting, monthly expense reports, and real-time billing aggregation.",
        relatedTopics: ["DoubleStream", "summaryStatistics", "OptionalDouble"]
      }
    },
    {
      id: "j8-code-11",
      question: "How do you merge two unsorted integer arrays into a single sorted array without duplicates?",
      difficulty: "Medium",
      frequency: 4,
      lastVerified: "2026-10-11",
      answer: {
        quickAnswer: "Use IntStream.concat(Arrays.stream(arr1), Arrays.stream(arr2)).distinct().sorted().toArray().",
        mentalModel: "Dumping two buckets of numbered balls onto a conveyor belt, filtering out identical numbers, lining them up in order, and packing them into a single clean box.",
        whatItIs: "IntStream.concat combines two primitive int streams. distinct() drops duplicates. sorted() arranges them in ascending order. toArray() converts back to int[].",
        whyItExists: "A concise, idiomatic modern Java solution to the classic array merging problem.",
        codeDemo: {
          language: "java",
          code: "int[] arr1 = {7, 2, 9, 1, 5};\nint[] arr2 = {5, 8, 2, 4, 10};\n\nint[] mergedSortedUnique = IntStream.concat(\n        Arrays.stream(arr1),\n        Arrays.stream(arr2)\n    )\n    .distinct()\n    .sorted()\n    .toArray();\n\nSystem.out.println(Arrays.toString(mergedSortedUnique));\n// Output: [1, 2, 4, 5, 7, 8, 9, 10]",
          explanation: "All operations happen without autoboxing, keeping performance near bare-metal C speeds."
        },
        tradeoffs: "If both arrays are already sorted, a two-pointer merge runs in O(N + M); IntStream.concat().sorted() takes O((N+M) log(N+M)).",
        followUpQuestions: [
          {
            question: "How do you merge two Object arrays (e.g. String[])?",
            answer: "Stream.concat(Arrays.stream(a1), Arrays.stream(a2)).distinct().sorted().toArray(String[]::new)."
          }
        ],
        usedInProduction: "Merging query results from multiple search shard partitions or caching tiers.",
        relatedTopics: ["IntStream.concat", "distinct", "sorted"]
      }
    },
    {
      id: "j8-code-12",
      question: "How do you check if two Strings are anagrams using Java 8 Streams?",
      difficulty: "Medium",
      frequency: 4,
      lastVerified: "2026-10-12",
      answer: {
        quickAnswer: "Normalize strings, sort their characters into joined strings via stream, and compare using equals(), or compare their character frequency maps.",
        mentalModel: "Take letters from both words, organize them alphabetically into two racks, and verify if both racks look identical.",
        whatItIs: "An anagram is a word formed by rearranging the letters of another (e.g., 'listen' and 'silent'). Using streams: (1) Sort approach: s.chars().sorted().collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append).toString(). (2) Map frequency approach: compare charCountMap1.equals(charCountMap2).",
        whyItExists: "A popular string manipulation question testing stream sorting, character codepoints, and collection comparisons.",
        codeDemo: {
          language: "java",
          code: "public static boolean isAnagram(String s1, String s2) {\n    if (s1 == null || s2 == null || s1.length() != s2.length()) return false;\n\n    // Method: Sort characters and compare\n    String sorted1 = s1.chars()\n        .sorted()\n        .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)\n        .toString();\n\n    String sorted2 = s2.chars()\n        .sorted()\n        .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)\n        .toString();\n\n    return sorted1.equals(sorted2);\n}\n\n// Test:\nSystem.out.println(isAnagram(\"listen\", \"silent\")); // true\nSystem.out.println(isAnagram(\"triangle\", \"integral\")); // true\nSystem.out.println(isAnagram(\"apple\", \"pale\")); // false",
          explanation: "collect(StringBuilder::new, appendCodePoint, append) efficiently rebuilds the sorted string."
        },
        tradeoffs: "Sorting approach takes O(N log N); counting frequencies in an int[26] array is O(N) and uses less memory for ASCII strings.",
        followUpQuestions: [
          {
            question: "How can you ignore case and whitespace?",
            answer: "Filter out whitespace using Character::isLetter and map to lower case with Character::toLowerCase before sorting."
          }
        ],
        usedInProduction: "Spell checkers, linguistic text indexing, and puzzle solver algorithms.",
        relatedTopics: ["IntStream", "appendCodePoint", "String Sorting"]
      }
    },
    {
      id: "j8-code-13",
      question: "How do you find common elements between two lists or arrays using Streams?",
      difficulty: "Easy",
      frequency: 4,
      lastVerified: "2026-10-13",
      answer: {
        quickAnswer: "Dump the second list into a HashSet for O(1) lookups, then filter the first list stream using set::contains.",
        mentalModel: "Two party invite lists: put list 2 into a computer database, then scan list 1 person by person to see who appears in the database.",
        whatItIs: "Filtering list1.stream().filter(set2::contains).distinct().collect(toList()). Using a HashSet ensures O(1) containment checks, giving an overall optimal O(N + M) time complexity.",
        whyItExists: "Tests whether a developer understands the hidden performance trap of calling list2.contains(e) (O(N*M)) vs set2.contains(e) (O(N+M)).",
        codeDemo: {
          language: "java",
          code: "List<Integer> list1 = Arrays.asList(1, 2, 3, 4, 5, 8);\nList<Integer> list2 = Arrays.asList(3, 4, 5, 6, 7, 8);\n\n// Efficient O(N + M) intersection:\nSet<Integer> set2 = new HashSet<>(list2); // O(1) lookup set\n\nList<Integer> commonElements = list1.stream()\n    .filter(set2::contains) // O(1) lookup per item!\n    .collect(Collectors.toList());\n\nSystem.out.println(\"Common: \" + commonElements); // [3, 4, 5, 8]",
          explanation: "Filtering against set2::contains gives optimal O(N) performance."
        },
        tradeoffs: "Do NOT do filter(list2::contains) on large lists, as List.contains() does a linear search O(M), degrading to O(N * M).",
        followUpQuestions: [
          {
            question: "How does this compare with list1.retainAll(list2)?",
            answer: "retainAll mutates list1 in-place, whereas streams produce a new immutable result list without mutating either input."
          }
        ],
        usedInProduction: "Finding mutual social media connections, cross-referencing customer IDs across CRM databases.",
        relatedTopics: ["HashSet.contains", "Time Complexity", "Set Intersection"]
      }
    },
    {
      id: "j8-code-14",
      question: "How do you join a list of strings with delimiter, prefix, and suffix using Collectors.joining?",
      difficulty: "Easy",
      frequency: 5,
      lastVerified: "2026-10-14",
      answer: {
        quickAnswer: "Use stream.collect(Collectors.joining(\", \", \"[\", \"]\")), which handles prefixes, delimiters, and suffixes without trailing commas.",
        mentalModel: "Wrapping presents: prefix is the opening gift wrap, delimiter is the ribbon between items, suffix is the final ribbon bow.",
        whatItIs: "Collectors.joining(delimiter, prefix, suffix) uses StringJoiner internally. It concatenates the stream elements in encounter order with the specified delimiter between items and wraps the result with the given prefix and suffix.",
        whyItExists: "Eliminates frustrating manual StringBuilder loops that had to check if (i > 0) sb.append(\", \") to avoid trailing commas.",
        codeDemo: {
          language: "java",
          code: "List<String> microservices = Arrays.asList(\"AuthService\", \"OrderService\", \"PaymentService\");\n\n// Joining with delimiter, prefix, and suffix:\nString formattedList = microservices.stream()\n    .collect(Collectors.joining(\", \", \"Services: [\", \"]\"));\n\nSystem.out.println(formattedList);\n// Output: Services: [AuthService, OrderService, PaymentService]\n\n// Simple comma delimiter:\nString csv = microservices.stream().collect(Collectors.joining(\",\"));\nSystem.out.println(csv); // AuthService,OrderService,PaymentService",
          explanation: "Collectors.joining seamlessly formats collections without trailing commas."
        },
        tradeoffs: "For non-stream collections, String.join(\", \", collection) in Java 8 is even more concise.",
        followUpQuestions: [
          {
            question: "What does Collectors.joining() return if the stream is empty?",
            answer: "If prefix and suffix are specified, it returns prefix + suffix (e.g. '[]'); otherwise an empty string."
          }
        ],
        usedInProduction: "Constructing SQL IN (?, ?) query clauses, formatting CSV exports, and generating JSON string representations.",
        relatedTopics: ["StringJoiner", "String.join", "Formatting"]
      }
    }
  ]
};
