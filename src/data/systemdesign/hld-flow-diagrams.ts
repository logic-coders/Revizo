import { SystemFlowDiagram } from "@/types";

// Flow diagrams for all 10 HLD case studies
export const hldFlowDiagrams: Record<string, SystemFlowDiagram> = {
  "sd-hld-case-1": {
    title: "How TinyURL Works ?",
    subtitle: "Distributed ID Generation, In-Memory Caching & Edge Redirection Flow",
    steps: [
      { step: 1, title: "User Submits Long URL", desc: "POST /api/v1/urls with original URL and optional alias", icon: "🔗" },
      { step: 2, title: "Snowflake Ticket Generator", desc: "Allocates unique 64-bit monotonic sequence ID", icon: "🎫" },
      { step: 3, title: "Base62 Encoding", desc: "Converts 64-bit ID to 7-character string (zero hash collision!)", icon: "🔢" },
      { step: 4, title: "Store in DynamoDB & Redis", desc: "Persists short_key mapping and pre-warms in-memory cache", icon: "🗄️" },
      { step: 5, title: "Return Short Link to User", desc: "Delivers https://tiny.url/aZ81k9q to client app", icon: "🚀" }
    ],
    branches: {
      condition: "Client Clicks Short URL",
      options: [
        {
          label: "Edge / Cache Hit (95%)",
          color: "green",
          steps: [
            { step: "6a", title: "Cloudflare CDN / Redis Hit", desc: "Fetches original long URL in < 2ms", icon: "⚡" },
            { step: "7a", title: "Immediate HTTP 301 / 302 Redirect", desc: "Client browser redirected to destination page", icon: "🌐" }
          ]
        },
        {
          label: "Cache Miss (5%)",
          color: "amber",
          steps: [
            { step: "6b", title: "DynamoDB Fallback Query", desc: "O(1) lookup on short_key primary partition key", icon: "🔍" },
            { step: "7b", title: "Write-Back to Redis & Redirect", desc: "Populates cache and completes redirect", icon: "🔄" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 8, title: "Async Kafka Analytics Stream", desc: "Tracks clicks, browser, country, and referrer without blocking redirect", icon: "📊" },
      { step: 9, title: "DynamoDB TTL Automatic Purge", desc: "Expired URLs removed in background with zero compute cost", icon: "🧹" }
    ],
    advancedFeatures: [
      { title: "Custom Alias Check", desc: "Atomically reserves custom short vanity codes", icon: "🏷️" },
      { title: "Anycast DNS Routing", desc: "Directs client to nearest global edge datacenter", icon: "🌍" },
      { title: "Malware URL Quarantine", desc: "Google Safe Browsing API scanning", icon: "🛡️" }
    ]
  },

  "sd-hld-case-2": {
    title: "How Distributed Rate Limiter Works ?",
    subtitle: "Token Bucket Throttling, Atomic Lua Execution & API Protection",
    steps: [
      { step: 1, title: "Inbound HTTP Request", desc: "Client makes API call through Edge Load Balancer", icon: "🌐" },
      { step: 2, title: "Client Fingerprint Extracted", desc: "Extracts User ID, API Token, Client IP, and TLS JA3 hash", icon: "🔑" },
      { step: 3, title: "Atomic Lua Script Dispatched", desc: "API Gateway executes Sliding Window script in Redis Cluster", icon: "⚡" }
    ],
    branches: {
      condition: "Token Quota Available?",
      options: [
        {
          label: "Quota Available (Pass)",
          color: "green",
          steps: [
            { step: "4a", title: "Decrement Token Quota", desc: "Records timestamp in Redis ZSET with TTL expiration", icon: "🟢" },
            { step: "5a", title: "Forward to Microservices", desc: "Routes request to downstream application services", icon: "⏩" },
            { step: "6a", title: "Inject Rate Limit Headers", desc: "Returns X-RateLimit-Remaining and X-RateLimit-Limit", icon: "📋" }
          ]
        },
        {
          label: "Quota Exceeded (Throttled)",
          color: "amber",
          steps: [
            { step: "4b", title: "Request Dropped at Gateway", desc: "Bypasses backend microservices to protect database", icon: "🛑" },
            { step: "5b", title: "Return HTTP 429 Error", desc: "Instant 429 Too Many Requests response in < 1ms", icon: "⚠️" },
            { step: "6b", title: "Inject Retry-After Header", desc: "Advises client on backoff window (e.g. Retry-After: 42s)", icon: "⏳" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 7, title: "Prometheus Metrics & Alerts", desc: "Streams rate violation telemetry to Grafana & Security SIEM", icon: "📈" }
    ],
    advancedFeatures: [
      { title: "Sliding Window Counter", desc: "Eliminates 2x burst vulnerability at window boundaries", icon: "🪟" },
      { title: "Cloudflare Edge DDoS Guard", desc: "Absorbs volumetric L3/L4 attacks at Anycast edge", icon: "🛡️" },
      { title: "Fail-Open Circuit Breaker", desc: "Allows traffic if Redis cluster becomes unreachable", icon: "🔌" }
    ]
  },

  "sd-hld-case-3": {
    title: "How WhatsApp Works ?",
    subtitle: "Real-Time WebSocket Architecture, End-to-End Encryption & Offline Queueing",
    steps: [
      { step: 1, title: "User Sends Message via WhatsApp", desc: "Client drafts message on mobile device", icon: "💬" },
      { step: 2, title: "Message Encrypted -> Sent to WhatsApp Server", desc: "Encrypted via Signal Protocol and transmitted over WebSocket", icon: "🔒" },
      { step: 3, title: "Server Checks Recipient Status", desc: "Chat Gateway queries Redis Session Registry for active socket", icon: "🖥️" }
    ],
    branches: {
      condition: "Recipient Connection Status",
      options: [
        {
          label: "Recipient Online",
          color: "green",
          steps: [
            { step: 4, title: "Deliver Message Instantly", desc: "Pushes ciphertext down recipient's open WebSocket connection", icon: "🚀" }
          ]
        },
        {
          label: "Recipient Offline",
          color: "amber",
          steps: [
            { step: 5, title: "Queue Message for Later", desc: "Stores message payload in Cassandra / ScyllaDB cluster", icon: "📬" },
            { step: 7, title: "Hold Until Recipient Online", desc: "Retains message in inbox queue until client reconnects", icon: "⏳" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 6, title: "Sync Across Devices", desc: "Replicates message state to recipient's connected web and desktop sessions", icon: "📱" },
      { step: 8, title: "Message Displayed in Recipient's App", desc: "Decrypted on device and rendered with delivery checkmark", icon: "📲" },
      { step: 9, title: "Read Receipt Sent", desc: "User opens chat; delivery acknowledgment triggers double blue ticks for sender", icon: "👁️" }
    ],
    advancedFeatures: [
      { title: "Group Chat Sync", desc: "Multi-Recipient fanout engine with channel pub/sub", icon: "👥" },
      { title: "Push Notifications", desc: "APNS / FCM alerts offline users of new incoming messages", icon: "🔔" },
      { title: "End-to-End Encryption", desc: "Signal Protocol Double Ratchet secures message content", icon: "🔐" }
    ]
  },

  "sd-hld-case-4": {
    title: "How YouTube & Netflix Work ?",
    subtitle: "Direct-to-S3 Upload, Parallel FFmpeg Chunking & Adaptive Bitrate CDN Delivery",
    steps: [
      { step: 1, title: "Creator Requests S3 Pre-Signed URL", desc: "App server generates secure direct multipart upload link", icon: "📤" },
      { step: 2, title: "Direct Upload to S3 Object Storage", desc: "Transfers raw 4K video file bypassing application servers", icon: "☁️" },
      { step: 3, title: "S3 Event Triggers Ingestion Queue", desc: "ObjectCreated event dispatched to Kafka / Step Functions", icon: "✂️" },
      { step: 4, title: "Video Chunker Splits into 10s Segments", desc: "FFmpeg segments movie into 10-second .ts chunks", icon: "🎞️" },
      { step: 5, title: "GPU Worker Pool Transcodes in Parallel", desc: "Encodes chunks simultaneously into 1080p, 720p, 480p, and AV1", icon: "⚙️" },
      { step: 6, title: "Generate Master HLS Playlist", desc: "Creates master.m3u8 playlist file and publishes to CDN edge", icon: "📑" }
    ],
    branches: {
      condition: "Viewer Network Bandwidth",
      options: [
        {
          label: "Fast Wi-Fi Connection",
          color: "green",
          steps: [
            { step: "7a", title: "Stream 1080p / 4K Chunks", desc: "Player fetches highest bitrate chunks for crystal clear video", icon: "📺" }
          ]
        },
        {
          label: "Flaky Mobile Cellular",
          color: "amber",
          steps: [
            { step: "7b", title: "Dynamic Drop to 480p / 360p", desc: "Adaptive Bitrate Streaming switches chunks without pausing", icon: "📱" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 8, title: "Micro-Batched Redis View Counter", desc: "Buffers views in RAM and flushes aggregated counts to DB every 10s", icon: "👁️" }
    ],
    advancedFeatures: [
      { title: "Adaptive Bitrate Streaming", desc: "HLS / MPEG-DASH seamless bitrate switching", icon: "📶" },
      { title: "Open Connect Appliances", desc: "Custom Netflix storage appliances inside ISP datacenters", icon: "🏢" },
      { title: "Direct S3 Pre-Signed Upload", desc: "Eliminates server memory exhaustion for multi-GB uploads", icon: "⚡" }
    ]
  },

  "sd-hld-case-5": {
    title: "How Flash Sale Systems Work ?",
    subtitle: "Multi-Tier Traffic Shedding, In-Memory Lua Stock Reservation & Async Queues",
    steps: [
      { step: 1, title: "Users Open Product Page at 00:00:00", desc: "100% of static catalog assets served from Cloudflare CDN edge", icon: "⏱️" },
      { step: 2, title: "Virtual Waiting Room Gatekeeper", desc: "Controls ingress traffic rate to protect checkout backend", icon: "🚪" },
      { step: 3, title: "Ingestion Server Executes Redis Lua Script", desc: "Sub-millisecond atomic check and decrement in RAM", icon: "⚡" }
    ],
    branches: {
      condition: "Inventory Stock Available?",
      options: [
        {
          label: "Stock Available (> 0)",
          color: "green",
          steps: [
            { step: "4a", title: "Atomically Decrement Stock", desc: "DECR stock key & add user ID to 'purchased' Set", icon: "🎟️" },
            { step: "5a", title: "Enqueue Order to Kafka Topic", desc: "Asynchronously decouples order from relational DB", icon: "📬" },
            { step: "6a", title: "Return HTTP 200 Reserved", desc: "User receives order token with 10-minute payment countdown", icon: "💳" }
          ]
        },
        {
          label: "Stock Sold Out (<= 0)",
          color: "amber",
          steps: [
            { step: "4b", title: "Immediate In-Memory Rejection", desc: "Bypasses database completely in < 2ms", icon: "❌" },
            { step: "5b", title: "Return HTTP 409 Sold Out", desc: "Renders friendly 'Sold out! Better luck next time' message", icon: "🛑" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 7, title: "Database Worker Consumes Kafka Queue", desc: "Inserts pending order record into PostgreSQL at smooth rate", icon: "🗄️" },
      { step: 8, title: "Payment Settlement or Expiration", desc: "If paid: Confirm order; If expired: Lua INCR returns stock back to pool", icon: "🔄" }
    ],
    advancedFeatures: [
      { title: "Virtual Waiting Room", desc: "Token bucket queue throttling millions of concurrent clicks", icon: "⏳" },
      { title: "HMAC Time-Tokenized Buy URL", desc: "Prevents auto-clicker bots before sale countdown hits zero", icon: "🤖" },
      { title: "Redis Synchronous Replication", desc: "WAIT command prevents stock count loss on master failover", icon: "🛡️" }
    ]
  },

  "sd-hld-case-6": {
    title: "How Uber Ride Hailing Works ?",
    subtitle: "H3 Hexagonal Geospatial Indexing, Telemetry Ingestion & Real-Time Dispatch",
    steps: [
      { step: 1, title: "1M Drivers Broadcast Location Every 4s", desc: "High-frequency GPS telemetry sent over persistent WebSockets", icon: "📡" },
      { step: 2, title: "Convert GPS to Uber H3 Hexagon Index", desc: "Maps (lat, lng) to Resolution 8 hexagonal cell ID (~460m)", icon: "⬡" },
      { step: 3, title: "Update In-Memory Geospatial Grid", desc: "Redis stores available driver IDs in hexagonal cell sets", icon: "🗺️" },
      { step: 4, title: "Rider Requests Ride in App", desc: "Sends pickup coordinates, drop-off location, and ride tier", icon: "📍" },
      { step: 5, title: "Dispatcher Searches H3 Neighbor Rings", desc: "Queries pickup hexagon and 2 concentric neighbor rings (19 cells)", icon: "🔍" }
    ],
    branches: {
      condition: "Candidate Driver Response",
      options: [
        {
          label: "Driver Accepts within 15s",
          color: "green",
          steps: [
            { step: "6a", title: "Acquire Redis Distributed Lock", desc: "Locks driver ID to prevent concurrent duplicate dispatch", icon: "🔒" },
            { step: "7a", title: "Trip Transitions to ACCEPTED", desc: "PostgreSQL optimistic lock updates trip status with version increment", icon: "✅" }
          ]
        },
        {
          label: "Driver Declines / Times Out",
          color: "amber",
          steps: [
            { step: "6b", title: "Release Distributed Lock", desc: "Driver returned to available spatial pool", icon: "🔓" },
            { step: "7b", title: "Dispatch to Next Closest Driver", desc: "System cascades ride offer to candidate driver #2", icon: "🔁" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 8, title: "Live Map WebSocket Tracking", desc: "Streams driver car GPS coordinates smoothly onto rider map screen", icon: "🚗" }
    ],
    advancedFeatures: [
      { title: "Uber H3 Hexagonal Grid", desc: "Uniform neighbor distances model radial movement accurately", icon: "⬢" },
      { title: "Real-Time Surge Pricing Engine", desc: "Flink stream aggregates supply vs demand in each hexagon", icon: "📈" },
      { title: "Optimistic Concurrency Control", desc: "Guarantees zero driver double-booking during peak hours", icon: "🛡️" }
    ]
  },

  "sd-hld-case-7": {
    title: "How Twitter & X Feed Work ?",
    subtitle: "Hybrid Fan-Out Architecture, Redis Timeline ZSETs & Celebrity Optimization",
    steps: [
      { step: 1, title: "User Publishes a Tweet", desc: "Client sends text and media metadata to Tweet Service", icon: "✍️" },
      { step: 2, title: "Write to PostgreSQL & Publish Event", desc: "Persists tweet record and publishes event to Kafka topic", icon: "📨" },
      { step: 3, title: "Fan-Out Router Evaluates Follower Count", desc: "Bifurcates routing based on author popularity threshold", icon: "🔀" }
    ],
    branches: {
      condition: "Author Follower Classification",
      options: [
        {
          label: "Normal User (< 25K Followers)",
          color: "green",
          steps: [
            { step: "4a", title: "PUSH (Fan-Out on Write)", desc: "Worker pushes Tweet ID into each follower's Redis ZSET timeline", icon: "📤" }
          ]
        },
        {
          label: "Celebrity (> 25K Followers)",
          color: "amber",
          steps: [
            { step: "4b", title: "PULL (Fan-Out on Read)", desc: "Stores in author's timeline only; DO NOT push to 100M inboxes!", icon: "🌟" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 5, title: "Follower Opens Home Timeline", desc: "Timeline Aggregator queries precomputed Redis ZSET in < 15ms", icon: "📱" },
      { step: 6, title: "Merge Celebrity Followees in Memory", desc: "Fetches recent tweets from followed celebrities and merge-sorts", icon: "🔀" },
      { step: 7, title: "Deliver Feed via Keyset Cursor Pagination", desc: "Streams top 20 tweets using cursor pagination (WHERE id < cursor)", icon: "📜" }
    ],
    advancedFeatures: [
      { title: "Hybrid Push-Pull Router", desc: "Balances sub-50ms reads with low write amplification", icon: "⚖️" },
      { title: "Redis Sorted Set (ZSET)", desc: "Monotonic timestamp scores ensure instant chronological sorting", icon: "⚡" },
      { title: "Inactive User Cold-Start Rebuild", desc: "Skips precomputing timelines for users inactive for 14+ days", icon: "❄️" }
    ]
  },

  "sd-hld-case-8": {
    title: "How Redis Cluster Works ?",
    subtitle: "16,384 Hash Slots, Gossip Protocol Failover & In-Memory Eviction",
    steps: [
      { step: 1, title: "Client Calculates Hash Slot", desc: "Computes slot = CRC16(key) % 16384 locally in client driver", icon: "🔑" },
      { step: 2, title: "Direct Connection to Target Master Node", desc: "Consults cached cluster slot map and connects directly in O(1) time", icon: "🎯" }
    ],
    branches: {
      condition: "Master Node Health",
      options: [
        {
          label: "Master Healthy",
          color: "green",
          steps: [
            { step: "3a", title: "Execute In-Memory Command", desc: "Runs GET / SET in sub-millisecond RAM", icon: "⚡" },
            { step: "4a", title: "Replicate Asynchronously to Replica", desc: "Streams write command to standby node", icon: "🔄" }
          ]
        },
        {
          label: "Master Node Crashes",
          color: "amber",
          steps: [
            { step: "3b", title: "Gossip Protocol Detects PFAIL", desc: "Cluster bus nodes ping and vote node as FAIL", icon: "⚠️" },
            { step: "4b", title: "Replica Promotes to New Master", desc: "Standby node claims slots and restores cluster in < 5 seconds", icon: "👑" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 5, title: "Approximated LRU Memory Eviction", desc: "When RAM is full, samples 5 keys and evicts the oldest", icon: "🧹" },
      { step: 6, title: "Persistence via Hybrid RDB + AOF", desc: "Compact RDB snapshots with incremental AOF delta logging", icon: "💾" }
    ],
    advancedFeatures: [
      { title: "16,384 Fixed Hash Slots", desc: "Enables zero-downtime resharding and node additions", icon: "🔢" },
      { title: "P2P Gossip Cluster Bus", desc: "Decentralized consensus eliminates ZooKeeper dependency", icon: "🗣️" },
      { title: "Approximated LRU Eviction", desc: "99% true LRU accuracy with zero pointer memory overhead", icon: "🧠" }
    ]
  },

  "sd-hld-case-9": {
    title: "How Googlebot Web Crawler Works ?",
    subtitle: "Two-Stage URL Frontier, Politeness Delays & In-Memory Bloom Filter Deduplication",
    steps: [
      { step: 1, title: "Pull URLs from Priority Queue", desc: "PageRank and domain authority determine crawl priority", icon: "📥" },
      { step: 2, title: "Politeness Manager Routes by Hostname", desc: "Directs URL into dedicated per-domain FIFO queue", icon: "🏛️" },
      { step: 3, title: "Enforce Politeness Delay Threshold", desc: "Ensures at least 1,000ms delay between hits to the same website", icon: "⏱️" },
      { step: 4, title: "DNS Resolution & Robots.txt Check", desc: "Validates allow/disallow paths against cached robots.txt", icon: "🤖" },
      { step: 5, title: "Download HTML & Save Snapshot to S3", desc: "Fetches raw HTML document and stores in distributed object store", icon: "💾" },
      { step: 6, title: "Content Parser Extracts Hyperlinks", desc: "Parses HTML DOM and collects all outgoing URLs", icon: "🔗" }
    ],
    branches: {
      condition: "URL Deduplication Check",
      options: [
        {
          label: "Seen in Bloom Filter",
          color: "amber",
          steps: [
            { step: "7a", title: "Already Crawled / Enqueued", desc: "Discards duplicate URL immediately", icon: "🗑️" }
          ]
        },
        {
          label: "Unseen / New URL",
          color: "green",
          steps: [
            { step: "7b", title: "Add to Bloom Filter & Enqueue", desc: "Pushes fresh URL into URL Frontier for next crawling pass", icon: "➕" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 8, title: "Document Fed into Indexing Pipeline", desc: "Tokens indexed into distributed inverted index for search", icon: "🔎" }
    ],
    advancedFeatures: [
      { title: "Two-Stage URL Frontier", desc: "Decouples importance ranking from per-domain politeness", icon: "🚦" },
      { title: "In-Memory Bloom Filter", desc: "Deduplicates 10 Billion URLs in just 18 GB of RAM", icon: "🌸" },
      { title: "SimHash Near-Duplicate Detection", desc: "Skips identical content hosted under different URLs", icon: "🧬" }
    ]
  },

  "sd-hld-case-10": {
    title: "How Notification Service Works ?",
    subtitle: "Priority-Partitioned Kafka Queues, Vendor Integration & Retry DLQs",
    steps: [
      { step: 1, title: "Microservice Ingests Notification Event", desc: "Submits recipient, channel (Push/SMS/Email), and priority", icon: "📨" },
      { step: 2, title: "Deduplication & Schema Validation", desc: "Checks Redis SETNX deduplication key within 5m window", icon: "🔍" },
      { step: 3, title: "User Preferences & Quiet Hours Filter", desc: "Inspects opt-in settings and suppresses marketing during night hours", icon: "⚙️" }
    ],
    branches: {
      condition: "Notification Priority Tier",
      options: [
        {
          label: "High Priority (OTP / Security)",
          color: "green",
          steps: [
            { step: "4a", title: "Dedicated High-Priority Kafka Topic", desc: "Isolated partition guarantees zero bulk queue delays", icon: "🚨" },
            { step: "5a", title: "Instant Dispatch Worker (< 2s SLA)", desc: "Immediate SMS / Push notification transmission", icon: "⚡" }
          ]
        },
        {
          label: "Low Priority (Marketing / Promo)",
          color: "amber",
          steps: [
            { step: "4b", title: "Throttled Bulk Marketing Queue", desc: "Buffers promotional emails for off-peak delivery", icon: "📢" },
            { step: "5b", title: "Batched Worker Processing", desc: "Dispatches emails in batches respecting provider rate limits", icon: "⏳" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 6, title: "Dispatch to External Vendor", desc: "Pushes to Apple APNS, Google FCM, Twilio, or SendGrid", icon: "🚀" },
      { step: 7, title: "Log Delivery Receipt to Analytics", desc: "Records message ID and delivery status in ClickHouse database", icon: "✅" },
      { step: 8, title: "Exponential Backoff Retry & DLQ", desc: "On provider 5xx error, retries with jitter then routes to Dead Letter Queue", icon: "🔁" }
    ],
    advancedFeatures: [
      { title: "Isolated Priority Queues", desc: "Protects critical login OTPs from bulk promotional email delays", icon: "🚦" },
      { title: "Multi-Vendor Circuit Breaker", desc: "Automatically fails over from Twilio to AWS SNS on provider outages", icon: "🔌" },
      { title: "Quiet Hours Scheduler", desc: "Delays non-critical alerts based on recipient local timezone", icon: "🌙" }
    ]
  }
};
