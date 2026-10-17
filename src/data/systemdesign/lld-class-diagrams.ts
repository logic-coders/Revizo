import { LLDClassDiagram } from "@/types";

export const lldClassDiagrams: Record<string, LLDClassDiagram> = {
  "sd-lld-case-10": {
    title: "ATM Controller UML Class Architecture",
    subtitle: "State Machine Pattern (Lifecycle Transitions) & Chain of Responsibility (Cash Dispenser)",
    designPatterns: ["State Pattern", "Chain of Responsibility Pattern", "Singleton Pattern"],
    classes: [
      {
        name: "ATMController",
        stereotype: "class",
        patternTag: "Context (State Pattern)",
        description: "Central orchestrator maintaining current ATM state, inventory, and hardware components",
        attributes: [
          { visibility: "-", name: "currentState", type: "ATMState" },
          { visibility: "-", name: "cashDispenser", type: "CashDispenser" },
          { visibility: "-", name: "atmBalance", type: "double" },
          { visibility: "-", name: "insertedCard", type: "Card" }
        ],
        methods: [
          { visibility: "+", name: "changeState", parameters: "newState: ATMState", returnType: "void" },
          { visibility: "+", name: "insertCard", parameters: "card: Card", returnType: "void" },
          { visibility: "+", name: "authenticatePin", parameters: "pin: int", returnType: "boolean" },
          { visibility: "+", name: "withdrawCash", parameters: "amount: double", returnType: "void" },
          { visibility: "+", name: "ejectCard", parameters: "", returnType: "void" }
        ]
      },
      {
        name: "ATMState",
        stereotype: "interface",
        patternTag: "State Interface",
        description: "Defines contracts for all allowable user actions across lifecycle phases",
        attributes: [],
        methods: [
          { visibility: "+", name: "insertCard", parameters: "atm: ATMController, card: Card", returnType: "void" },
          { visibility: "+", name: "authenticatePin", parameters: "atm: ATMController, pin: int", returnType: "boolean" },
          { visibility: "+", name: "selectOperation", parameters: "atm: ATMController, op: TransactionType", returnType: "void" },
          { visibility: "+", name: "withdrawCash", parameters: "atm: ATMController, amount: double", returnType: "void" },
          { visibility: "+", name: "ejectCard", parameters: "atm: ATMController", returnType: "void" }
        ]
      },
      {
        name: "IdleState",
        stereotype: "class",
        patternTag: "Concrete State",
        description: "Default state waiting for card insertion; rejects cash withdrawal and PIN inputs",
        attributes: [],
        methods: [
          { visibility: "+", name: "insertCard", parameters: "atm: ATMController, card: Card", returnType: "void" },
          { visibility: "+", name: "authenticatePin", parameters: "atm: ATMController, pin: int", returnType: "boolean" }
        ]
      },
      {
        name: "HasCardState",
        stereotype: "class",
        patternTag: "Concrete State",
        description: "Card inserted; prompts user for PIN and verifies against Bank API",
        attributes: [
          { visibility: "-", name: "failedAttempts", type: "int" }
        ],
        methods: [
          { visibility: "+", name: "authenticatePin", parameters: "atm: ATMController, pin: int", returnType: "boolean" },
          { visibility: "+", name: "ejectCard", parameters: "atm: ATMController", returnType: "void" }
        ]
      },
      {
        name: "DispensingState",
        stereotype: "class",
        patternTag: "Concrete State",
        description: "Executes hardware cash dispensing and balance deduction via Chain of Responsibility",
        attributes: [],
        methods: [
          { visibility: "+", name: "withdrawCash", parameters: "atm: ATMController, amount: double", returnType: "void" }
        ]
      },
      {
        name: "CashDispenser",
        stereotype: "abstract",
        patternTag: "Handler (Chain of Responsibility)",
        description: "Abstract handler dispensing notes of specific denomination and passing remainder to next handler",
        attributes: [
          { visibility: "#", name: "nextDispenser", type: "CashDispenser" },
          { visibility: "#", name: "denominationValue", type: "int" }
        ],
        methods: [
          { visibility: "+", name: "setNextDispenser", parameters: "next: CashDispenser", returnType: "void" },
          { visibility: "+", name: "dispense", parameters: "amount: int", returnType: "void" }
        ]
      },
      {
        name: "HundredDollarDispenser",
        stereotype: "class",
        patternTag: "Concrete Handler ($100)",
        description: "Dispenses $100 notes first to minimize note count, then invokes FiftyDollarDispenser",
        attributes: [
          { visibility: "-", name: "availableNotes", type: "int" }
        ],
        methods: [
          { visibility: "+", name: "dispense", parameters: "amount: int", returnType: "void" }
        ]
      },
      {
        name: "Card",
        stereotype: "class",
        description: "Represents customer plastic payment card with chip and magnetic stripe",
        attributes: [
          { visibility: "-", name: "cardNumber", type: "String" },
          { visibility: "-", name: "customerName", type: "String" },
          { visibility: "-", name: "expiryDate", type: "Date" },
          { visibility: "-", name: "bankAccount", type: "BankAccount" }
        ],
        methods: [
          { visibility: "+", name: "getCardNumber", parameters: "", returnType: "String" },
          { visibility: "+", name: "validatePin", parameters: "pin: int", returnType: "boolean" }
        ]
      },
      {
        name: "BankAccount",
        stereotype: "class",
        description: "Authoritative bank account record managing balance and ledger",
        attributes: [
          { visibility: "-", name: "accountNumber", type: "String" },
          { visibility: "-", name: "currentBalance", type: "double" }
        ],
        methods: [
          { visibility: "+", name: "debitBalance", parameters: "amount: double", returnType: "boolean" },
          { visibility: "+", name: "creditBalance", parameters: "amount: double", returnType: "void" }
        ]
      }
    ],
    relationships: [
      { from: "ATMController", to: "ATMState", type: "composition", label: "maintains currentState", multiplicity: "1" },
      { from: "ATMController", to: "CashDispenser", type: "composition", label: "has dispenser chain", multiplicity: "1" },
      { from: "IdleState", to: "ATMState", type: "implements", label: "implements" },
      { from: "HasCardState", to: "ATMState", type: "implements", label: "implements" },
      { from: "DispensingState", to: "ATMState", type: "implements", label: "implements" },
      { from: "HundredDollarDispenser", to: "CashDispenser", type: "extends", label: "extends" },
      { from: "CashDispenser", to: "CashDispenser", type: "aggregation", label: "next in chain", multiplicity: "0..1" },
      { from: "ATMController", to: "Card", type: "aggregation", label: "holds currently inserted", multiplicity: "0..1" },
      { from: "Card", to: "BankAccount", type: "composition", label: "linked account", multiplicity: "1" }
    ]
  },

  "sd-lld-case-1": {
    title: "Parking Lot System UML Class Architecture",
    subtitle: "Factory Pattern (Spots & Vehicles) & Strategy Pattern (Optimal Spot Allocation & Fee Calculator)",
    designPatterns: ["Factory Pattern", "Strategy Pattern", "Observer Pattern"],
    classes: [
      {
        name: "ParkingLot",
        stereotype: "class",
        patternTag: "Singleton",
        description: "Manages multiple parking floors, entry/exit gates, and spot allocation",
        attributes: [
          { visibility: "-", name: "name", type: "String" },
          { visibility: "-", name: "floors", type: "List<ParkingFloor>" },
          { visibility: "-", name: "parkingStrategy", type: "ParkingStrategy" }
        ],
        methods: [
          { visibility: "+", name: "parkVehicle", parameters: "vehicle: Vehicle", returnType: "Ticket" },
          { visibility: "+", name: "unparkVehicle", parameters: "ticket: Ticket", returnType: "double" }
        ]
      },
      {
        name: "ParkingSpot",
        stereotype: "abstract",
        description: "Abstract parking space with status and distance weights",
        attributes: [
          { visibility: "#", name: "spotId", type: "String" },
          { visibility: "#", name: "isOccupied", type: "boolean" },
          { visibility: "#", name: "currentVehicle", type: "Vehicle" }
        ],
        methods: [
          { visibility: "+", name: "assignVehicle", parameters: "v: Vehicle", returnType: "boolean" },
          { visibility: "+", name: "vacateSpot", parameters: "", returnType: "void" }
        ]
      },
      {
        name: "Vehicle",
        stereotype: "abstract",
        description: "Abstract vehicle with license plate and required spot type",
        attributes: [
          { visibility: "#", name: "licensePlate", type: "String" },
          { visibility: "#", name: "type", type: "VehicleType" }
        ],
        methods: [
          { visibility: "+", name: "getType", parameters: "", returnType: "VehicleType" }
        ]
      },
      {
        name: "ParkingStrategy",
        stereotype: "interface",
        patternTag: "Strategy Pattern",
        description: "Strategy for choosing optimal spot (Nearest-to-Entrance, Best-Fit, Even-Distribution)",
        attributes: [],
        methods: [
          { visibility: "+", name: "findSpot", parameters: "floors: List<ParkingFloor>, v: Vehicle", returnType: "ParkingSpot" }
        ]
      },
      {
        name: "Ticket",
        stereotype: "class",
        description: "Issued at entry gate to track timestamp and allocated spot",
        attributes: [
          { visibility: "-", name: "ticketId", type: "String" },
          { visibility: "-", name: "entryTime", type: "long" },
          { visibility: "-", name: "allocatedSpot", type: "ParkingSpot" },
          { visibility: "-", name: "vehicle", type: "Vehicle" }
        ],
        methods: [
          { visibility: "+", name: "calculateDuration", parameters: "", returnType: "long" }
        ]
      }
    ],
    relationships: [
      { from: "ParkingLot", to: "ParkingSpot", type: "composition", label: "contains", multiplicity: "1..*" },
      { from: "ParkingLot", to: "ParkingStrategy", type: "composition", label: "uses strategy", multiplicity: "1" },
      { from: "ParkingSpot", to: "Vehicle", type: "aggregation", label: "holds currently parked", multiplicity: "0..1" },
      { from: "Ticket", to: "ParkingSpot", type: "aggregation", label: "records assigned spot", multiplicity: "1" }
    ]
  },

  "sd-lld-case-2": {
    title: "Snake & Ladder Game UML Class Architecture",
    subtitle: "Game Loop Architecture & Composite / Strategy Jump Mechanics",
    designPatterns: ["Game Loop Pattern", "Strategy Pattern"],
    classes: [
      {
        name: "Game",
        stereotype: "class",
        description: "Controls game loop, active player queue, and winning condition checks",
        attributes: [
          { visibility: "-", name: "board", type: "Board" },
          { visibility: "-", name: "players", type: "Queue<Player>" },
          { visibility: "-", name: "dice", type: "Dice" },
          { visibility: "-", name: "winner", type: "Player" }
        ],
        methods: [
          { visibility: "+", name: "playTurn", parameters: "", returnType: "void" },
          { visibility: "+", name: "startGame", parameters: "", returnType: "void" }
        ]
      },
      {
        name: "Board",
        stereotype: "class",
        description: "Grid of 100 cells with fixed snake and ladder jump entities",
        attributes: [
          { visibility: "-", name: "cells", type: "Cell[][]" },
          { visibility: "-", name: "size", type: "int" }
        ],
        methods: [
          { visibility: "+", name: "getCell", parameters: "position: int", returnType: "Cell" }
        ]
      },
      {
        name: "Cell",
        stereotype: "class",
        description: "Represents square on the board; may contain a Jump (Snake/Ladder)",
        attributes: [
          { visibility: "-", name: "position", type: "int" },
          { visibility: "-", name: "jump", type: "Jump" }
        ],
        methods: [
          { visibility: "+", name: "hasJump", parameters: "", returnType: "boolean" }
        ]
      },
      {
        name: "Jump",
        stereotype: "class",
        description: "Represents either a Snake (head > tail) or Ladder (start < end)",
        attributes: [
          { visibility: "-", name: "start", type: "int" },
          { visibility: "-", name: "end", type: "int" }
        ],
        methods: [
          { visibility: "+", name: "getDestination", parameters: "", returnType: "int" }
        ]
      },
      {
        name: "Dice",
        stereotype: "class",
        description: "Simulates rolling N-sided dice with uniform random distribution",
        attributes: [
          { visibility: "-", name: "diceCount", type: "int" }
        ],
        methods: [
          { visibility: "+", name: "roll", parameters: "", returnType: "int" }
        ]
      }
    ],
    relationships: [
      { from: "Game", to: "Board", type: "composition", label: "has board", multiplicity: "1" },
      { from: "Game", to: "Dice", type: "composition", label: "rolls dice", multiplicity: "1" },
      { from: "Board", to: "Cell", type: "composition", label: "composed of 100 cells", multiplicity: "100" },
      { from: "Cell", to: "Jump", type: "aggregation", label: "optional obstacle/shortcut", multiplicity: "0..1" }
    ]
  },

  "sd-lld-case-3": {
    title: "Elevator Management System UML Class Architecture",
    subtitle: "State Pattern (Car Lifecycle) & Strategy Pattern (LOOK/SCAN Dispatcher Algorithm)",
    designPatterns: ["State Pattern", "Strategy Pattern", "Observer Pattern"],
    classes: [
      {
        name: "ElevatorController",
        stereotype: "class",
        patternTag: "Controller / Mediator",
        description: "Central dispatcher coordinating multiple elevator cars to minimize wait times",
        attributes: [
          { visibility: "-", name: "elevatorCars", type: "List<ElevatorCar>" },
          { visibility: "-", name: "dispatcherStrategy", type: "DispatcherStrategy" }
        ],
        methods: [
          { visibility: "+", name: "submitExternalRequest", parameters: "floor: int, dir: Direction", returnType: "void" },
          { visibility: "+", name: "step", parameters: "", returnType: "void" }
        ]
      },
      {
        name: "ElevatorCar",
        stereotype: "class",
        description: "Individual elevator car maintaining floor position, doors, and internal pending queue",
        attributes: [
          { visibility: "-", name: "id", type: "int" },
          { visibility: "-", name: "currentFloor", type: "int" },
          { visibility: "-", name: "currentDirection", type: "Direction" },
          { visibility: "-", name: "state", type: "ElevatorState" },
          { visibility: "-", name: "upRequests", type: "TreeSet<Integer>" },
          { visibility: "-", name: "downRequests", type: "TreeSet<Integer>" }
        ],
        methods: [
          { visibility: "+", name: "moveNextFloor", parameters: "", returnType: "void" },
          { visibility: "+", name: "addInternalRequest", parameters: "floor: int", returnType: "void" }
        ]
      },
      {
        name: "DispatcherStrategy",
        stereotype: "interface",
        patternTag: "Strategy Pattern",
        description: "Selects best elevator car for inbound floor call (LOOK / SCAN / Proximity)",
        attributes: [],
        methods: [
          { visibility: "+", name: "selectCar", parameters: "cars: List<ElevatorCar>, req: Request", returnType: "ElevatorCar" }
        ]
      }
    ],
    relationships: [
      { from: "ElevatorController", to: "ElevatorCar", type: "composition", label: "manages multiple cars", multiplicity: "1..*" },
      { from: "ElevatorController", to: "DispatcherStrategy", type: "composition", label: "delegates dispatch", multiplicity: "1" }
    ]
  },

  "sd-lld-case-4": {
    title: "Splitwise Expense Sharing System UML Class Architecture",
    subtitle: "Strategy Pattern (Equal, Exact, Percentage Splits) & Graph Simplification (Debt Minimization)",
    designPatterns: ["Strategy Pattern", "Factory Pattern", "Observer Pattern"],
    classes: [
      {
        name: "ExpenseManager",
        stereotype: "class",
        patternTag: "Façade / Controller",
        description: "Top-level controller adding expenses and calculating pairwise balances",
        attributes: [
          { visibility: "-", name: "userMap", type: "Map<String, User>" },
          { visibility: "-", name: "balanceSheet", type: "Map<String, Map<String, Double>>" },
          { visibility: "-", name: "expenses", type: "List<Expense>" }
        ],
        methods: [
          { visibility: "+", name: "addExpense", parameters: "type: ExpenseType, amount: double, paidBy: String, splits: List<Split>", returnType: "void" },
          { visibility: "+", name: "showBalance", parameters: "userId: String", returnType: "void" },
          { visibility: "+", name: "simplifyDebts", parameters: "", returnType: "void" }
        ]
      },
      {
        name: "Expense",
        stereotype: "abstract",
        description: "Abstract representation of financial transaction among users",
        attributes: [
          { visibility: "#", name: "id", type: "String" },
          { visibility: "#", name: "amount", type: "double" },
          { visibility: "#", name: "paidBy", type: "User" },
          { visibility: "#", name: "splits", type: "List<Split>" }
        ],
        methods: [
          { visibility: "+", name: "validate", parameters: "", returnType: "boolean" }
        ]
      },
      {
        name: "EqualExpense",
        stereotype: "class",
        patternTag: "Concrete Expense",
        description: "Validates and divides amount equally among participants",
        attributes: [],
        methods: [
          { visibility: "+", name: "validate", parameters: "", returnType: "boolean" }
        ]
      },
      {
        name: "Split",
        stereotype: "class",
        description: "Individual user share of an expense",
        attributes: [
          { visibility: "-", name: "user", type: "User" },
          { visibility: "-", name: "amount", type: "double" }
        ],
        methods: [
          { visibility: "+", name: "getAmount", parameters: "", returnType: "double" }
        ]
      }
    ],
    relationships: [
      { from: "ExpenseManager", to: "Expense", type: "composition", label: "tracks all expenses", multiplicity: "*" },
      { from: "EqualExpense", to: "Expense", type: "extends", label: "extends" },
      { from: "Expense", to: "Split", type: "composition", label: "divided into splits", multiplicity: "1..*" }
    ]
  },

  "sd-lld-case-5": {
    title: "Tic-Tac-Toe Game UML Class Architecture",
    subtitle: "Command Pattern (Move History) & State / Strategy Checkers",
    designPatterns: ["Strategy Pattern", "Command Pattern"],
    classes: [
      {
        name: "TicTacToeGame",
        stereotype: "class",
        description: "Main game orchestrator managing board grid, player turns, and O(1) win verification",
        attributes: [
          { visibility: "-", name: "board", type: "Board" },
          { visibility: "-", name: "players", type: "Deque<Player>" }
        ],
        methods: [
          { visibility: "+", name: "makeMove", parameters: "row: int, col: int", returnType: "boolean" },
          { visibility: "+", name: "checkWinner", parameters: "row: int, col: int, piece: PieceType", returnType: "boolean" }
        ]
      },
      {
        name: "Board",
        stereotype: "class",
        description: "NxN grid storing playing pieces with row/col/diag counters",
        attributes: [
          { visibility: "-", name: "size", type: "int" },
          { visibility: "-", name: "grid", type: "PlayingPiece[][]" },
          { visibility: "-", name: "rowCount", type: "int[]" },
          { visibility: "-", name: "colCount", type: "int[]" }
        ],
        methods: [
          { visibility: "+", name: "placePiece", parameters: "row: int, col: int, piece: PlayingPiece", returnType: "boolean" }
        ]
      },
      {
        name: "PlayingPiece",
        stereotype: "abstract",
        description: "Abstract marker piece placed on board",
        attributes: [
          { visibility: "#", name: "pieceType", type: "PieceType" }
        ],
        methods: [
          { visibility: "+", name: "getPieceType", parameters: "", returnType: "PieceType" }
        ]
      }
    ],
    relationships: [
      { from: "TicTacToeGame", to: "Board", type: "composition", label: "maintains board", multiplicity: "1" },
      { from: "Board", to: "PlayingPiece", type: "aggregation", label: "contains pieces", multiplicity: "N*N" }
    ]
  },

  "sd-lld-case-6": {
    title: "Hotel Management System UML Class Architecture",
    subtitle: "Factory Pattern (Rooms) & State Pattern (Booking Lifecycle & Housekeeping)",
    designPatterns: ["Factory Pattern", "State Pattern", "Singleton Pattern"],
    classes: [
      {
        name: "Hotel",
        stereotype: "class",
        description: "Manages room inventory, bookings, guests, and payments",
        attributes: [
          { visibility: "-", name: "name", type: "String" },
          { visibility: "-", name: "rooms", type: "List<Room>" }
        ],
        methods: [
          { visibility: "+", name: "bookRoom", parameters: "type: RoomType, checkIn: Date, checkOut: Date", returnType: "Booking" }
        ]
      },
      {
        name: "Room",
        stereotype: "class",
        description: "Individual room with type (Deluxe, Suite, Standard) and status (Available, Occupied, Cleaning)",
        attributes: [
          { visibility: "-", name: "roomNumber", type: "int" },
          { visibility: "-", name: "type", type: "RoomType" },
          { visibility: "-", name: "status", type: "RoomStatus" }
        ],
        methods: [
          { visibility: "+", name: "markOccupied", parameters: "", returnType: "void" },
          { visibility: "+", name: "markCleaning", parameters: "", returnType: "void" }
        ]
      },
      {
        name: "Booking",
        stereotype: "class",
        description: "Tracks reservation dates, guest details, invoice, and booking confirmation status",
        attributes: [
          { visibility: "-", name: "bookingId", type: "String" },
          { visibility: "-", name: "room", type: "Room" },
          { visibility: "-", name: "guest", type: "Guest" },
          { visibility: "-", name: "status", type: "BookingStatus" }
        ],
        methods: [
          { visibility: "+", name: "cancelBooking", parameters: "", returnType: "boolean" }
        ]
      }
    ],
    relationships: [
      { from: "Hotel", to: "Room", type: "composition", label: "owns rooms", multiplicity: "1..*" },
      { from: "Booking", to: "Room", type: "aggregation", label: "reserves room", multiplicity: "1" }
    ]
  },

  "sd-lld-case-7": {
    title: "Cricbuzz Live Cricket Scoring UML Class Architecture",
    subtitle: "Observer Pattern (Ball-by-Ball Broadcast) & Strategy Pattern (Strike Rotation & Run Rate)",
    designPatterns: ["Observer Pattern", "Strategy Pattern"],
    classes: [
      {
        name: "Match",
        stereotype: "class",
        description: "Represents live match with innings, teams, and active scorecard",
        attributes: [
          { visibility: "-", name: "matchId", type: "String" },
          { visibility: "-", name: "teamA", type: "Team" },
          { visibility: "-", name: "teamB", type: "Team" },
          { visibility: "-", name: "innings", type: "List<Inning>" }
        ],
        methods: [
          { visibility: "+", name: "recordBall", parameters: "ball: Ball", returnType: "void" },
          { visibility: "+", name: "getCurrentScore", parameters: "", returnType: "ScoreCard" }
        ]
      },
      {
        name: "MatchSubject",
        stereotype: "interface",
        patternTag: "Subject (Observer Pattern)",
        description: "Allows commentary and scoreboard listeners to receive real-time ball updates",
        attributes: [],
        methods: [
          { visibility: "+", name: "registerObserver", parameters: "obs: MatchObserver", returnType: "void" },
          { visibility: "+", name: "notifyObservers", parameters: "event: BallEvent", returnType: "void" }
        ]
      },
      {
        name: "CommentaryService",
        stereotype: "class",
        patternTag: "Concrete Observer",
        description: "Receives ball events and generates localized textual commentary",
        attributes: [
          { visibility: "-", name: "commentaryLog", type: "List<String>" }
        ],
        methods: [
          { visibility: "+", name: "onBallEvent", parameters: "event: BallEvent", returnType: "void" }
        ]
      }
    ],
    relationships: [
      { from: "Match", to: "MatchSubject", type: "implements", label: "implements" },
      { from: "CommentaryService", to: "MatchSubject", type: "dependency", label: "subscribes to events" }
    ]
  },

  "sd-lld-case-8": {
    title: "Distributed Rate Limiter UML Class Architecture",
    subtitle: "Strategy Pattern (Algorithm Swapping) & Factory Pattern (Limiter Instantiation)",
    designPatterns: ["Strategy Pattern", "Factory Pattern"],
    classes: [
      {
        name: "RateLimiter",
        stereotype: "interface",
        patternTag: "Strategy Interface",
        description: "Defines contracts for token granting against client identifier",
        attributes: [],
        methods: [
          { visibility: "+", name: "allowRequest", parameters: "clientId: String, tokens: int", returnType: "boolean" }
        ]
      },
      {
        name: "TokenBucketRateLimiter",
        stereotype: "class",
        patternTag: "Concrete Strategy",
        description: "Replenishes fixed tokens per second with maximum bucket burst capacity",
        attributes: [
          { visibility: "-", name: "capacity", type: "long" },
          { visibility: "-", name: "refillRate", type: "long" },
          { visibility: "-", name: "currentTokens", type: "long" }
        ],
        methods: [
          { visibility: "+", name: "allowRequest", parameters: "clientId: String, tokens: int", returnType: "boolean" }
        ]
      },
      {
        name: "SlidingWindowRateLimiter",
        stereotype: "class",
        patternTag: "Concrete Strategy",
        description: "Computes weighted request rate across previous and current time slices",
        attributes: [
          { visibility: "-", name: "windowSizeMs", type: "long" }
        ],
        methods: [
          { visibility: "+", name: "allowRequest", parameters: "clientId: String, tokens: int", returnType: "boolean" }
        ]
      },
      {
        name: "RateLimiterFactory",
        stereotype: "class",
        patternTag: "Factory Pattern",
        description: "Factory instantiating optimal rate limiting algorithm based on client configuration",
        attributes: [],
        methods: [
          { visibility: "+", name: "createLimiter", parameters: "type: LimiterType, config: Config", returnType: "RateLimiter" }
        ]
      }
    ],
    relationships: [
      { from: "TokenBucketRateLimiter", to: "RateLimiter", type: "implements", label: "implements" },
      { from: "SlidingWindowRateLimiter", to: "RateLimiter", type: "implements", label: "implements" },
      { from: "RateLimiterFactory", to: "RateLimiter", type: "dependency", label: "creates" }
    ]
  },

  "sd-lld-case-9": {
    title: "Coffee Vending Machine UML Class Architecture",
    subtitle: "State Pattern (Machine Hardware Lifecycle) & Decorator / Strategy Pattern (Ingredient Customization)",
    designPatterns: ["State Pattern", "Decorator Pattern", "Strategy Pattern"],
    classes: [
      {
        name: "CoffeeMachine",
        stereotype: "class",
        patternTag: "Context (State Pattern)",
        description: "Orchestrates user coin insertion, recipe selection, and inventory dispensing",
        attributes: [
          { visibility: "-", name: "currentState", type: "MachineState" },
          { visibility: "-", name: "inventory", type: "Inventory" },
          { visibility: "-", name: "insertedCoins", type: "double" }
        ],
        methods: [
          { visibility: "+", name: "insertMoney", parameters: "amount: double", returnType: "void" },
          { visibility: "+", name: "selectBeverage", parameters: "beverage: Beverage", returnType: "void" },
          { visibility: "+", name: "dispense", parameters: "", returnType: "void" }
        ]
      },
      {
        name: "Beverage",
        stereotype: "abstract",
        description: "Abstract coffee drink with recipe and price calculation",
        attributes: [
          { visibility: "#", name: "name", type: "String" },
          { visibility: "#", name: "basePrice", type: "double" }
        ],
        methods: [
          { visibility: "+", name: "getCost", parameters: "", returnType: "double" },
          { visibility: "+", name: "getIngredients", parameters: "", returnType: "Map<Ingredient, Integer>" }
        ]
      },
      {
        name: "Espresso",
        stereotype: "class",
        patternTag: "Concrete Beverage",
        description: "Pure espresso shot: 20g ground coffee + 50ml hot water",
        attributes: [],
        methods: [
          { visibility: "+", name: "getCost", parameters: "", returnType: "double" }
        ]
      },
      {
        name: "Inventory",
        stereotype: "class",
        description: "Tracks physical volume of coffee beans, milk, sugar, and water with low-level alerts",
        attributes: [
          { visibility: "-", name: "ingredients", type: "Map<Ingredient, Integer>" }
        ],
        methods: [
          { visibility: "+", name: "hasSufficient", parameters: "req: Map<Ingredient, Integer>", returnType: "boolean" },
          { visibility: "+", name: "consume", parameters: "req: Map<Ingredient, Integer>", returnType: "void" }
        ]
      }
    ],
    relationships: [
      { from: "CoffeeMachine", to: "Inventory", type: "composition", label: "tracks inventory", multiplicity: "1" },
      { from: "Espresso", to: "Beverage", type: "extends", label: "extends" },
      { from: "CoffeeMachine", to: "Beverage", type: "dependency", label: "dispenses" }
    ]
  }
};
