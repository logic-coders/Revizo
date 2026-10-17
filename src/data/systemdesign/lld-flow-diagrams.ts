import { SystemFlowDiagram } from "@/types";

export const lldFlowDiagrams: Record<string, SystemFlowDiagram> = {
  "sd-lld-case-1": {
    title: "How Parking Lot System Works ?",
    subtitle: "Vehicle Polymorphism, Spot Allocation Strategy & Concurrent Entry/Exit",
    steps: [
      { step: 1, title: "Vehicle Arrives at Entry Gate", desc: "Gate sensor identifies Vehicle Type (Motorcycle, Car, Truck, EV)", icon: "🚗" },
      { step: 2, title: "Spot Allocation Strategy", desc: "Finds closest vacant spot fitting vehicle sizing constraint", icon: "🔍" },
      { step: 3, title: "Atomic Spot Reservation", desc: "Synchronized park() updates isOccupied = true and stores vehicle pointer", icon: "🔒" },
      { step: 4, title: "Issue Parking Ticket", desc: "Generates Ticket with unique UUID, entry timestamp, and assigned spot ID", icon: "🎫" }
    ],
    branches: {
      condition: "Vehicle Exits via Exit Gate",
      options: [
        {
          label: "Normal Exit & Payment",
          color: "green",
          steps: [
            { step: "5a", title: "Scan Ticket at Exit", desc: "Retrieves ticket and calculates parking duration", icon: "💳" },
            { step: "6a", title: "Apply Pricing Strategy", desc: "Hourly/Vehicle-type strategy computes parking fee", icon: "💰" },
            { step: "7a", title: "Atomic Spot Release", desc: "unpark() resets spot to vacant and marks ticket completed", icon: "🟢" }
          ]
        },
        {
          label: "Parking Full (No Spot Fits)",
          color: "amber",
          steps: [
            { step: "5b", title: "Display Parking Full Board", desc: "Entry gate barrier stays down to prevent congestion", icon: "🛑" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 8, title: "Available Spot Counters Updated", desc: "Digital floor display updates vacant spot count in real-time", icon: "📊" }
    ],
    advancedFeatures: [
      { title: "Strategy Pattern Pricing", desc: "Pluggable Hourly, Daily, and Weekend surge fee calculators", icon: "⚖️" },
      { title: "Spot-Vehicle Polymorphism", desc: "Small, Compact, Large, and EV charging spot constraints", icon: "🔌" },
      { title: "Thread-Safe Concurrent Entry", desc: "Prevents race conditions across multi-gate arrivals", icon: "🛡️" }
    ]
  },

  "sd-lld-case-2": {
    title: "How Elevator System Works ?",
    subtitle: "LOOK / SCAN Directional Scheduling, TreeSet Sorting & State Machine",
    steps: [
      { step: 1, title: "Passenger Requests Elevator", desc: "Hall button pressed (Floor X, Direction UP/DOWN) or internal destination pressed", icon: "🔘" },
      { step: 2, title: "Hall Call Dispatcher Routing", desc: "Calculates cost function: Distance + DirectionMismatchPenalty to select best elevator", icon: "🧭" },
      { step: 3, title: "Add Stop to Directional TreeSet", desc: "Upward stops added to ascending TreeSet; Downward stops to descending TreeSet", icon: "🌳" }
    ],
    branches: {
      condition: "Current Elevator Direction",
      options: [
        {
          label: "Direction: UP",
          color: "green",
          steps: [
            { step: "4a", title: "Process Ascending Stops", desc: "Polls smallest floor >= currentFloor from upStops TreeSet", icon: "⬆️" },
            { step: "5a", title: "Stop at Requested Floors", desc: "Doors open for 5 seconds; passengers board and alight", icon: "🚪" }
          ]
        },
        {
          label: "Direction: DOWN",
          color: "amber",
          steps: [
            { step: "4b", title: "Process Descending Stops", desc: "Polls largest floor <= currentFloor from downStops TreeSet", icon: "⬇️" },
            { step: "5b", title: "Stop at Requested Floors", desc: "Doors open for 5 seconds; passengers board and alight", icon: "🚪" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 6, title: "Switch Direction or Idle", desc: "When current queue empties, reverse direction or enter IDLE state if no requests remain", icon: "🔄" }
    ],
    advancedFeatures: [
      { title: "LOOK / SCAN Algorithm", desc: "Services all requests in current direction before reversing", icon: "📈" },
      { title: "State Pattern Transitions", desc: "MOVING, STOPPED, DOOR_OPEN, and EMERGENCY state machine", icon: "⚙️" },
      { title: "Starvation Prevention", desc: "Guarantees every floor is serviced within deterministic bounds", icon: "🛡️" }
    ]
  },

  "sd-lld-case-3": {
    title: "How Tic-Tac-Toe Game Works ?",
    subtitle: "O(1) Matrix Counter Win Verification, Turn Management & Board Model",
    steps: [
      { step: 1, title: "Player Submits Move", desc: "Current player from turn queue submits row and col coordinates", icon: "🎯" },
      { step: 2, title: "Validate Move Legality", desc: "Ensures coordinates in bounds [0..N-1] and cell is currently empty", icon: "✅" },
      { step: 3, title: "Place Piece on Board", desc: "Writes Player's piece (X or O) to board[row][col]", icon: "✍️" },
      { step: 4, title: "O(1) Running Counters Mutation", desc: "Add +1 for Player 1 (X) or -1 for Player 2 (O) to row, col, diag arrays", icon: "🔢" }
    ],
    branches: {
      condition: "Evaluate Move Outcome",
      options: [
        {
          label: "Winning Move Detected",
          color: "green",
          steps: [
            { step: "5a", title: "Win Condition Triggered", desc: "Row, Column, or Diagonal counter hits +N or -N", icon: "🏆" },
            { step: "6a", title: "Declare Winner & End Game", desc: "Game state marks isGameOver = true and crowns victor", icon: "🎉" }
          ]
        },
        {
          label: "Move Accepted (No Win)",
          color: "amber",
          steps: [
            { step: "5b", title: "Check for Board Draw", desc: "If totalMoves == N * N, declare tie game", icon: "🤝" },
            { step: "6b", title: "Rotate Player Queue", desc: "Re-enqueue current player to back of queue; next player's turn", icon: "🔄" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 7, title: "Render Updated Board State", desc: "Outputs visual matrix to console or pushes state to client UI", icon: "🖥️" }
    ],
    advancedFeatures: [
      { title: "O(1) Move Validation", desc: "Eliminates O(N) scanning loops using integer counters", icon: "⚡" },
      { title: "N x N Scalability", desc: "Works seamlessly for 3x3, 4x4, or arbitrary N x N boards", icon: "📐" },
      { title: "Command Pattern Undo", desc: "Stack of moves supports seamless step-by-step undo/redo", icon: "↩️" }
    ]
  },

  "sd-lld-case-4": {
    title: "How Snake and Ladder Game Works ?",
    subtitle: "Polymorphic Jumper Abstraction, Modular Dice Strategy & Circular Turns",
    steps: [
      { step: 1, title: "Player's Turn from FIFO Queue", desc: "Game controller polls next active player from turn queue", icon: "👤" },
      { step: 2, title: "Roll Dice via DiceStrategy", desc: "Generates random integer (1-6) using configured dice strategy", icon: "🎲" },
      { step: 3, title: "Calculate Target Cell Position", desc: "Computes nextPos = currentPos + roll", icon: "➡️" }
    ],
    branches: {
      condition: "Target Cell Landed On",
      options: [
        {
          label: "Ladder Cell (Climb)",
          color: "green",
          steps: [
            { step: "4a", title: "Encounter Jumper (Ladder)", desc: "Start < End: Player climbs from bottom to top cell", icon: "🪜" }
          ]
        },
        {
          label: "Snake Cell (Slide)",
          color: "amber",
          steps: [
            { step: "4b", title: "Encounter Jumper (Snake)", desc: "Start > End: Player slides down from snake head to tail", icon: "🐍" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 5, title: "Check Winning Condition", desc: "If position == boardSize: Player wins game; Otherwise re-add to queue", icon: "🏁" }
    ],
    advancedFeatures: [
      { title: "Unified Jumper Abstraction", desc: "Single Jumper class models both snakes and ladders", icon: "🧩" },
      { title: "Modular Dice Strategy", desc: "Pluggable single-dice, double-dice, or crooked-dice algorithms", icon: "🎲" },
      { title: "Cycle Detection Graph Validator", desc: "Prevents infinite loops between snake and ladder pairings", icon: "🛡️" }
    ]
  },

  "sd-lld-case-5": {
    title: "How Splitwise Works ?",
    subtitle: "Expense Splitting Factory, Balance Ledger & Greedy Min-Cash-Flow Simplifier",
    steps: [
      { step: 1, title: "User Adds New Expense", desc: "Specifies payer, total amount, group ID, and participants", icon: "💵" },
      { step: 2, title: "Split Strategy Validation", desc: "Factory validates SplitType: EQUAL, EXACT amounts sum, or PERCENT == 100%", icon: "⚖️" },
      { step: 3, title: "Update Net Balance Sheet", desc: "Credits payer +amount; debits participants by their allocated split amount", icon: "📒" }
    ],
    branches: {
      condition: "User Requests 'Simplify Group Debts'",
      options: [
        {
          label: "Min-Cash-Flow Simplification",
          color: "green",
          steps: [
            { step: "4a", title: "Build Priority Queues", desc: "Sorts net creditors (>0) in MaxHeap; net debtors (<0) in MinHeap", icon: "📊" },
            { step: "5a", title: "Settle Max Debtor & Creditor", desc: "Greedily matches biggest debtor with biggest creditor", icon: "🤝" },
            { step: "6a", title: "Reduce to <= N-1 Transactions", desc: "Eliminates cyclic circular debts across group members", icon: "✨" }
          ]
        },
        {
          label: "Standard Unsimplified Ledger",
          color: "amber",
          steps: [
            { step: "4b", title: "Direct Peer-to-Peer Debts", desc: "Maintains full O(N^2) pairwise balance records between all pairs", icon: "📜" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 7, title: "Generate Settlement Transactions", desc: "Outputs clean transaction instructions: 'Alice pays Bob $20'", icon: "💸" }
    ],
    advancedFeatures: [
      { title: "Greedy Min-Cash-Flow", desc: "Reduces complex multi-party debts to minimal transfers", icon: "🧠" },
      { title: "Factory Pattern Splits", desc: "Extensible EqualSplit, ExactSplit, and PercentSplit models", icon: "🏭" },
      { title: "BigDecimal Precision", desc: "Guarantees zero lost rounding cents during 3-way divisions", icon: "💰" }
    ]
  },

  "sd-lld-case-6": {
    title: "How BookMyShow System Works ?",
    subtitle: "10-Minute Seat Locking TTL, Concurrency Collision Defense & Booking State",
    steps: [
      { step: 1, title: "Customer Selects Movie Show & Seats", desc: "User views auditorium layout and selects seat IDs (e.g. E12, E13)", icon: "🍿" },
      { step: 2, title: "SeatLockManager Atomic Pre-Check", desc: "Synchronized check verifies none of the seats are booked or currently locked", icon: "🔍" },
      { step: 3, title: "Acquire 10-Minute Seat Lock", desc: "Atomically marks seats TEMPORARILY_LOCKED with epoch expiry timestamp", icon: "🔒" },
      { step: 4, title: "Create Booking (Status: PENDING)", desc: "Generates booking ID and redirects user to payment gateway", icon: "📝" }
    ],
    branches: {
      condition: "Payment Gateway Outcome",
      options: [
        {
          label: "Payment Successful within 10m",
          color: "green",
          steps: [
            { step: "5a", title: "Seats Marked BOOKED", desc: "Seat status transitions permanently to BOOKED", icon: "🎟️" },
            { step: "6a", title: "Booking CONFIRMED", desc: "Issues digital ticket with QR code and sends confirmation SMS", icon: "✅" }
          ]
        },
        {
          label: "Payment Fails / 10m TTL Expires",
          color: "amber",
          steps: [
            { step: "5b", title: "Release Seat Lock", desc: "Lock expires; seats returned to AVAILABLE pool for other shoppers", icon: "🔓" },
            { step: "6b", title: "Booking EXPIRED", desc: "Releases reserved inventory and cancels pending order", icon: "❌" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 7, title: "Real-time Seat Map Broadcast", desc: "WebSocket updates auditorium seat colors on all active viewers' screens", icon: "📡" }
    ],
    advancedFeatures: [
      { title: "Two-Phase Seat Reservation", desc: "Prevents race conditions and double-booking collisions", icon: "🛡️" },
      { title: "Redis Lock TTL Expiration", desc: "Automatic background cleanup when customer abandons cart", icon: "⏳" },
      { title: "Deadlock-Free Batch Locking", desc: "Pre-sorts seat IDs before acquiring locks to avoid circular wait", icon: "🔒" }
    ]
  },

  "sd-lld-case-7": {
    title: "How Asynchronous Logging Framework Works ?",
    subtitle: "RingBuffer Ingestion, LogLevel Hierarchy & Appender Chain of Responsibility",
    steps: [
      { step: 1, title: "Application Thread Calls logger.info()", desc: "Code invokes logging statement from business service", icon: "✍️" },
      { step: 2, title: "LogLevel Threshold Filtering", desc: "Checks if message level >= configured logger level (DEBUG, INFO, WARN, ERROR)", icon: "🚦" },
      { step: 3, title: "Non-Blocking Enqueue into RingBuffer", desc: "Thread places formatted log record into memory queue in nanoseconds", icon: "⚡" },
      { step: 4, title: "Dedicated Daemon Worker Takes Event", desc: "Background thread continuously pulls log events without slowing app", icon: "🤖" }
    ],
    branches: {
      condition: "Configured Appender Sinks",
      options: [
        {
          label: "Console Appender",
          color: "green",
          steps: [
            { step: "5a", title: "Format & Write to StdOut", desc: "Streams colored text to terminal console output", icon: "🖥️" }
          ]
        },
        {
          label: "Rolling File Appender",
          color: "blue",
          steps: [
            { step: "5b", title: "Async Disk Flush & Rotation", desc: "Appends to disk file; triggers GZIP rotation on size threshold", icon: "💾" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 6, title: "Zero Application Latency Penalty", desc: "Worker threads never block on slow disk I/O or network sinks", icon: "🚀" }
    ],
    advancedFeatures: [
      { title: "Chain of Responsibility", desc: "Decouples log generation from pluggable destination appenders", icon: "🔗" },
      { title: "Producer-Consumer Decoupling", desc: "Offloads I/O bottlenecks to dedicated daemon threads", icon: "⚙️" },
      { title: "LMAX Disruptor RingBuffer", desc: "Lock-free circular buffer with cache-line padding", icon: "⚡" }
    ]
  },

  "sd-lld-case-8": {
    title: "How In-Memory LRU Cache Works ?",
    subtitle: "O(1) HashMap Lookup, Doubly Linked List Sentinel Nodes & ReadWriteLock",
    steps: [
      { step: 1, title: "Client Invokes cache.get(key) / put(key, val)", desc: "Application queries or inserts cached item", icon: "🔑" },
      { step: 2, title: "Acquire ReentrantReadWriteLock", desc: "Acquires write lock because node re-ordering mutates linked list pointers", icon: "🔒" },
      { step: 3, title: "O(1) HashMap Key Lookup", desc: "HashMap resolves key directly to DoublyLinkedList Node reference", icon: "🗺️" }
    ],
    branches: {
      condition: "Operation Type",
      options: [
        {
          label: "Cache Hit on get(key)",
          color: "green",
          steps: [
            { step: "4a", title: "Check TTL Expiration", desc: "If expired: evict node and return null", icon: "⏳" },
            { step: "5a", title: "Move Node to Head (MRU)", desc: "Unlinks node and splices at list head as Most Recently Used", icon: "🔝" },
            { step: "6a", title: "Return Cached Value", desc: "Returns value in O(1) time without database hit", icon: "⚡" }
          ]
        },
        {
          label: "Cache Full on put(key, val)",
          color: "amber",
          steps: [
            { step: "4b", title: "Evict LRU Node from Tail", desc: "Removes oldest node (tail.prev) and deletes key from HashMap", icon: "🧹" },
            { step: "5b", title: "Insert New Node at Head", desc: "Instantiates fresh node and splices directly behind dummy head", icon: "➕" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 7, title: "Release ReadWriteLock", desc: "Releases lock allowing subsequent concurrent operations", icon: "🔓" }
    ],
    advancedFeatures: [
      { title: "Dummy Sentinel Nodes", desc: "Head and Tail sentinels eliminate null pointer edge cases", icon: "🛡️" },
      { title: "Guaranteed O(1) Operations", desc: "Get, Put, and Evict all execute in deterministic O(1) time", icon: "⚡" },
      { title: "Active + Passive TTL Eviction", desc: "Combines on-access check with periodic daemon cleanup", icon: "🕒" }
    ]
  },

  "sd-lld-case-9": {
    title: "How Cricbuzz Scoreboard Works ?",
    subtitle: "Ball Event Sourcing, Strike Rotation Rules & Observer Pattern Broadcast",
    steps: [
      { step: 1, title: "Umpire / Scorer Records Ball Outcome", desc: "Captures runs (0,1,2,3,4,6), ball type (Normal, Wide, NoBall), and wicket", icon: "🏏" },
      { step: 2, title: "Mutate Match Score State", desc: "Increments total runs, adds extras, and updates bowler/batsman figures", icon: "📊" },
      { step: 3, title: "Evaluate Strike Rotation Logic", desc: "Odd runs (1, 3, 5) swap striker and non-striker player references", icon: "🔄" },
      { step: 4, title: "Over Completion Check", desc: "On 6 legal balls: swaps strike again, switches bowling end, and resets over", icon: "⚾" }
    ],
    branches: {
      condition: "Ball Event Outcome",
      options: [
        {
          label: "Wicket Falls",
          color: "amber",
          steps: [
            { step: "5a", title: "Increment Wicket Counter", desc: "Records dismissal type (Bowled, Caught, LBW, RunOut)", icon: "☝️" },
            { step: "6a", title: "Incoming Batsman Assigned", desc: "Next batsman from batting lineup steps onto pitch", icon: "🚶" }
          ]
        },
        {
          label: "Boundary Scored (4 or 6)",
          color: "green",
          steps: [
            { step: "5b", title: "Boundary Counter Increment", desc: "Updates batsman boundary count and team run rate", icon: "💥" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 7, title: "Observer Pattern Broadcast", desc: "ScoreCard mutates -> notifies WebSocket listeners, Push dispatchers, and stats engine", icon: "📡" }
    ],
    advancedFeatures: [
      { title: "Observer Pattern Decoupling", desc: "Separates scoring engine from UI, commentary, and push alerts", icon: "👥" },
      { title: "Event Sourcing Ball Ledger", desc: "Every ball stored as immutable event; supports replay and umpire review", icon: "📜" },
      { title: "DLS Strategy Pattern", desc: "Pluggable Duckworth-Lewis calculation for rain-curtailed matches", icon: "🌧️" }
    ]
  },

  "sd-lld-case-10": {
    title: "How ATM State Machine Works ?",
    subtitle: "State Pattern Lifecycle, Chain of Responsibility Cash Dispenser & Rollback",
    steps: [
      { step: 1, title: "Customer Inserts Card into ATM", desc: "Card reader detects magnetic chip -> Transitions ATM to HasCardState", icon: "💳" },
      { step: 2, title: "Customer Enters 4-Digit PIN", desc: "ATM verifies PIN hash against Bank Authentication Server", icon: "🔢" }
    ],
    branches: {
      condition: "PIN Validation Result",
      options: [
        {
          label: "PIN Validated (Success)",
          color: "green",
          steps: [
            { step: "3a", title: "Transition to PinVerifiedState", desc: "Enables transaction menu (Withdraw, Balance, Transfer)", icon: "✅" },
            { step: "4a", title: "Customer Requests Cash Withdrawal", desc: "Inputs withdrawal amount (e.g. $380)", icon: "💵" },
            { step: "5a", title: "Chain of Responsibility Dispenser", desc: "Dispenses optimal denominations: 3x $100 -> 1x $50 -> 1x $20 -> 1x $10", icon: "🏧" }
          ]
        },
        {
          label: "Invalid PIN (3 Attempts)",
          color: "amber",
          steps: [
            { step: "3b", title: "Security Threshold Breach", desc: "After 3 incorrect PIN attempts, retain card in internal lockbox", icon: "🔒" },
            { step: "4b", title: "Eject / Lock Card & Alert Bank", desc: "State resets to IdleState to prevent brute-force theft", icon: "🛑" }
          ]
        }
      ]
    },
    postBranchSteps: [
      { step: 6, title: "Cash Tray Optical Sensors Confirm Dispense", desc: "Hardware confirms physical bills collected by customer", icon: "🖐️" },
      { step: 7, title: "Print Receipt & Eject Card", desc: "Debits bank account, prints receipt, and transitions back to IdleState", icon: "🧾" }
    ],
    advancedFeatures: [
      { title: "State Pattern Controller", desc: "Eliminates illegal actions (cannot dispense cash before PIN verification)", icon: "⚙️" },
      { title: "Chain of Responsibility Dispenser", desc: "Automates hierarchical greedy bill denomination cascading", icon: "⛓️" },
      { title: "Saga Hardware Rollback", desc: "Initiates compensating credit if hardware bill dispenser jams", icon: "🔄" }
    ]
  }
};
