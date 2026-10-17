import { PenPaperCode } from "@/types";

export const hldPenPaperCode: Record<string, PenPaperCode> = {
  // Case 1: TinyURL
  "sd-hld-case-1": {
    title: "TinyURL (URL Shortener) Pen & Paper Implementation",
    designPatterns: ["Base62 Encoding", "Snowflake ID Generator", "Repository Pattern"],
    classDiagramAscii: `┌──────────────────────────────────────────────┐
│            UrlShortenerService               │
├──────────────────────────────────────────────┤
│ - idGenerator: SnowflakeIdGenerator          │
│ - urlRepository: UrlRepository               │
│ - cache: CacheService                        │
├──────────────────────────────────────────────┤
│ + shortenUrl(longUrl: String): String        │
│ + getLongUrl(shortKey: String): String       │
└──────────────────────┬───────────────────────┘
                       │ uses
                       ▼
┌──────────────────────────────────────────────┐
│           SnowflakeIdGenerator               │
├──────────────────────────────────────────────┤
│ - epoch: long                                │
│ - datacenterId: long                         │
│ - workerId: long                             │
│ - sequence: long                             │
│ - lastTimestamp: long                        │
├──────────────────────────────────────────────┤
│ + nextId(): synchronized long                │
└──────────────────────────────────────────────┘
                       │ converts
                       ▼
┌──────────────────────────────────────────────┐
│                Base62Encoder                 │
├──────────────────────────────────────────────┤
│ - BASE62: String = "0..9a..zA..Z"            │
├──────────────────────────────────────────────┤
│ + encode(id: long): String                   │
│ + decode(shortKey: String): long             │
└──────────────────────────────────────────────┘`,
    language: "java",
    code: `import java.util.concurrent.ConcurrentHashMap;

// 1. Base62 Bijective Encoding (Converts 64-bit ID to 7-char alphanumeric key)
public class Base62Encoder {
    private static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int BASE = BASE62.length();

    public static String encode(long id) {
        StringBuilder sb = new StringBuilder();
        while (id > 0) {
            sb.append(BASE62.charAt((int) (id % BASE)));
            id /= BASE;
        }
        return sb.reverse().toString();
    }

    public static long decode(String shortKey) {
        long id = 0;
        for (char c : shortKey.toCharArray()) {
            id = id * BASE + BASE62.indexOf(c);
        }
        return id;
    }
}

// 2. Thread-Safe Monotonic 64-bit Snowflake ID Generator (Zero Collision)
public class SnowflakeIdGenerator {
    private final long workerId;
    private final long datacenterId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;

    public SnowflakeIdGenerator(long workerId, long datacenterId) {
        this.workerId = workerId;
        this.datacenterId = datacenterId;
    }

    public synchronized long nextId() {
        long currentTimestamp = System.currentTimeMillis();
        if (currentTimestamp == lastTimestamp) {
            sequence = (sequence + 1) & 4095; // 12 bits sequence
            if (sequence == 0) {
                while (currentTimestamp <= lastTimestamp) {
                    currentTimestamp = System.currentTimeMillis();
                }
            }
        } else {
            sequence = 0L;
        }
        lastTimestamp = currentTimestamp;

        // 41 bits timestamp | 5 bits datacenter | 5 bits worker | 12 bits sequence
        return ((currentTimestamp - 1700000000000L) << 22)
                | (datacenterId << 17)
                | (workerId << 12)
                | sequence;
    }
}

// 3. Complete URL Shortener Service (with O(1) Cache Lookup)
public class UrlShortenerService {
    private final SnowflakeIdGenerator idGen = new SnowflakeIdGenerator(1, 1);
    private final ConcurrentHashMap<String, String> shortToLongMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> longToShortCache = new ConcurrentHashMap<>();

    public String shortenUrl(String longUrl) {
        if (longToShortCache.containsKey(longUrl)) {
            return longToShortCache.get(longUrl);
        }
        long uniqueId = idGen.nextId();
        String shortKey = Base62Encoder.encode(uniqueId);

        shortToLongMap.put(shortKey, longUrl);
        longToShortCache.put(longUrl, shortKey);
        return "https://tiny.url/" + shortKey;
    }

    public String getOriginalUrl(String shortKey) {
        return shortToLongMap.get(shortKey); // O(1) lookup
    }
}`,
    explanation: "Combines Twitter Snowflake for collision-free distributed 64-bit sequence IDs with Base62 bijective encoding for 7-character URLs.",
    interviewTalkingPoints: [
      "Explain why MD5/SHA-256 truncation causes hash collisions, whereas Snowflake sequence + Base62 has mathematically zero collisions.",
      "Base62 uses [0-9, a-z, A-Z] (62 characters). 62^7 = 3.52 trillion distinct URLs with zero collisions.",
      "In production, Cassandra/DynamoDB stores the short_key as primary partition key for O(1) lookup, paired with Redis LRU caching."
    ]
  },

  // Case 2: Distributed Rate Limiter
  "sd-hld-case-2": {
    title: "Distributed Rate Limiter Pen & Paper Implementation",
    designPatterns: ["Strategy Pattern", "Token Bucket Algorithm", "Lazy Refill Optimization"],
    classDiagramAscii: `┌──────────────────────────────────────────────┐
│               «interface»                    │
│               RateLimiter                    │
├──────────────────────────────────────────────┤
│ + allowRequest(clientId: String): boolean    │
└──────────────────────▲───────────────────────┘
                       │ implements
┌──────────────────────┴───────────────────────┐
│          TokenBucketRateLimiter              │
├──────────────────────────────────────────────┤
│ - buckets: ConcurrentHashMap<String, Bucket> │
│ - defaultCapacity: long                      │
│ - defaultRefillRate: double                  │
├──────────────────────────────────────────────┤
│ + allowRequest(clientId: String): boolean    │
└──────────────────────┬───────────────────────┘
                       │ 1 has many
                       ▼ *
┌──────────────────────────────────────────────┐
│                 TokenBucket                  │
├──────────────────────────────────────────────┤
│ - capacity: long                             │
│ - refillRatePerSec: double                   │
│ - tokens: double                             │
│ - lastRefillTimestamp: long                  │
├──────────────────────────────────────────────┤
│ + tryConsume(tokensRequested: int): boolean  │
│ - refill(): void                             │
└──────────────────────────────────────────────┘`,
    language: "java",
    code: `import java.util.concurrent.ConcurrentHashMap;

// 1. Thread-Safe Token Bucket with Lazy On-Demand Refill
public class TokenBucket {
    private final long capacity;
    private final double refillRatePerSec;
    private double tokens;
    private long lastRefillTimestamp;

    public TokenBucket(long capacity, double refillRatePerSec) {
        this.capacity = capacity;
        this.refillRatePerSec = refillRatePerSec;
        this.tokens = capacity;
        this.lastRefillTimestamp = System.currentTimeMillis();
    }

    // synchronized guarantees atomic token evaluation and deduction
    public synchronized boolean tryConsume(int tokensRequested) {
        refill();

        if (this.tokens >= tokensRequested) {
            this.tokens -= tokensRequested;
            return true; // 200 OK: Allowed through
        }
        return false; // 429 Too Many Requests: Throttled
    }

    // Lazy on-demand calculation: no background timer threads needed!
    private void refill() {
        long now = System.currentTimeMillis();
        double elapsedSeconds = (now - lastRefillTimestamp) / 1000.0;
        double tokensToAdd = elapsedSeconds * refillRatePerSec;

        this.tokens = Math.min(capacity, this.tokens + tokensToAdd);
        this.lastRefillTimestamp = now;
    }
}

// 2. Multi-Client Manager (ConcurrentHashMap for thread-safe tenancy)
public class TokenBucketRateLimiter {
    private final long defaultCapacity;
    private final double defaultRefillRate;
    private final ConcurrentHashMap<String, TokenBucket> clientBuckets = new ConcurrentHashMap<>();

    public TokenBucketRateLimiter(long defaultCapacity, double defaultRefillRate) {
        this.defaultCapacity = defaultCapacity;
        this.defaultRefillRate = defaultRefillRate;
    }

    public boolean allowRequest(String clientId) {
        // computeIfAbsent is atomic: prevents race conditions during bucket instantiation
        TokenBucket bucket = clientBuckets.computeIfAbsent(
            clientId,
            k -> new TokenBucket(defaultCapacity, defaultRefillRate)
        );
        return bucket.tryConsume(1);
    }
}`,
    explanation: "Implements the industry-standard Token Bucket algorithm using on-demand lazy refill math, avoiding JVM thread exhaustion.",
    interviewTalkingPoints: [
      "Lazy Refill Math: We do NOT use timer threads or cron jobs. When a request arrives, we calculate tokens earned: (now - lastRefillTimestamp) * refillRate.",
      "Thread Safety: ConcurrentHashMap.computeIfAbsent prevents duplicate bucket creation; synchronized on tryConsume guarantees atomic token deduction.",
      "Distributed Scaling: When migrating to multi-server Redis, the exact same logic translates into an atomic Redis Lua script (ZREMRANGEBYSCORE + ZADD)."
    ]
  },

  // Case 3: Real-Time Chat (WhatsApp / Slack)
  "sd-hld-case-3": {
    title: "Real-Time Chat & Session Gateway Pen & Paper Implementation",
    designPatterns: ["Observer Pattern", "Registry Pattern", "Full-Duplex Session Store"],
    classDiagramAscii: `┌──────────────────────────────────────────────┐
│             ChatGatewayService               │
├──────────────────────────────────────────────┤
│ - sessionRegistry: ConcurrentHashMap         │
│ - messageQueue: BlockingQueue<ChatMessage>   │
├──────────────────────────────────────────────┤
│ + onUserConnect(userId: String, conn: Conn)  │
│ + onUserDisconnect(userId: String)           │
│ + sendMessage(msg: ChatMessage): void        │
└──────────────────────────────────────────────┘`,
    language: "java",
    code: `import java.util.concurrent.ConcurrentHashMap;

public class ChatSessionManager {
    public static class ChatMessage {
        public final String msgId;
        public final String fromUser;
        public final String toUser;
        public final String text;
        public final long timestamp;

        public ChatMessage(String msgId, String from, String to, String text) {
            this.msgId = msgId;
            this.fromUser = from;
            this.toUser = to;
            this.text = text;
            this.timestamp = System.currentTimeMillis();
        }
    }

    public interface ClientConnection {
        void send(ChatMessage msg);
        boolean isOpen();
    }

    // Active WebSocket session table: UserId -> Active Connection socket
    private final ConcurrentHashMap<String, ClientConnection> activeSessions = new ConcurrentHashMap<>();

    public void registerUser(String userId, ClientConnection connection) {
        activeSessions.put(userId, connection);
    }

    public void unregisterUser(String userId) {
        activeSessions.remove(userId);
    }

    public boolean dispatchMessage(ChatMessage msg) {
        ClientConnection recipientConn = activeSessions.get(msg.toUser);
        if (recipientConn != null && recipientConn.isOpen()) {
            recipientConn.send(msg); // Instant WebSocket Push
            return true;
        } else {
            // Recipient Offline: Push to Kafka/Cassandra & Trigger APNs / FCM Push Notification
            persistOfflineMessage(msg);
            return false;
        }
    }

    private void persistOfflineMessage(ChatMessage msg) {
        // Writes to Cassandra offline queue and triggers Firebase Cloud Messaging
        System.out.println("Queued offline push notification for: " + msg.toUser);
    }
}`,
    explanation: "Manages persistent TCP/WebSocket connections, routes 1-on-1 messages with zero polling, and falls back to push notifications when offline.",
    interviewTalkingPoints: [
      "Persistent WebSockets eliminate repeated HTTP 3-way handshakes and conserve mobile battery.",
      "Session Registry in production is mapped in Redis (UserId -> GatewayServerIP) using Redis Pub/Sub to route messages across multiple gateway instances.",
      "Cassandra is chosen for message archive storage due to its high write throughput and append-only wide-column schema partitioned by (chat_id, message_id)."
    ]
  },

  // Case 6: Distributed Cache (LRU)
  "sd-hld-case-6": {
    title: "Distributed Cache (LRU Eviction) Pen & Paper Implementation",
    designPatterns: ["Doubly Linked List + HashMap", "O(1) Eviction", "Read-Through Cache"],
    classDiagramAscii: `┌──────────────────────────────────────────────┐
│                  LRUCache                    │
├──────────────────────────────────────────────┤
│ - capacity: int                              │
│ - map: HashMap<String, Node>                 │
│ - head: Node (Most Recently Used)            │
│ - tail: Node (Least Recently Used)           │
├──────────────────────────────────────────────┤
│ + get(key: String): String                   │
│ + put(key: String, value: String): void      │
│ - addToHead(node: Node): void                │
│ - removeNode(node: Node): void               │
└──────────────────────────────────────────────┘`,
    language: "java",
    code: `import java.util.HashMap;

public class LRUCache {
    private static class Node {
        String key;
        String val;
        Node prev;
        Node next;
        Node(String k, String v) { this.key = k; this.val = v; }
    }

    private final int capacity;
    private final HashMap<String, Node> map = new HashMap<>();
    private final Node head = new Node("", "");
    private final Node tail = new Node("", "");

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public synchronized String get(String key) {
        Node node = map.get(key);
        if (node == null) return null;
        moveToHead(node); // Accessed: mark as Most Recently Used
        return node.val;
    }

    public synchronized void put(String key, String val) {
        Node node = map.get(key);
        if (node != null) {
            node.val = val;
            moveToHead(node);
        } else {
            if (map.size() >= capacity) {
                // Evict Least Recently Used (tail.prev) in O(1)
                Node lru = tail.prev;
                removeNode(lru);
                map.remove(lru.key);
            }
            Node newNode = new Node(key, val);
            map.put(key, newNode);
            addFirst(newNode);
        }
    }

    private void addFirst(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }

    private void removeNode(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void moveToHead(Node node) {
        removeNode(node);
        addFirst(node);
    }
}`,
    explanation: "Classic Doubly Linked List + HashMap combination providing strict O(1) lookups, insertions, and evictions.",
    interviewTalkingPoints: [
      "Explain why HashMap alone is insufficient (cannot track order) and LinkedList alone is insufficient (O(N) search). Together they achieve O(1) everything.",
      "Sentinel dummy head and tail nodes eliminate null-check edge cases when inserting and removing.",
      "In a distributed cluster, Consistent Hashing distributes keys across Redis nodes with virtual nodes to prevent hot-spotting."
    ]
  }
};
