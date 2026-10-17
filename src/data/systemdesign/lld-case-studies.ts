import { Category } from "@/types";

export const lldCaseStudiesCategory: Category = {
  id: "sd-lld-case-studies",
  title: "Top 10 Low-Level Design (LLD) & Machine Coding Problems",
  subTopics: [
    {
      id: "sd-lld-core-cases",
      title: "Machine Coding Problem Blueprints",
      questions: [
        {
          id: "sd-lld-case-1",
          question: "Design a Parking Lot System",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design a multi-floor, multi-vehicle parking lot supporting automated spot assignment, dynamic ticket pricing, and concurrent entry/exit. How to attempt: Define domain models (Vehicle, ParkingSpot, Floor, Ticket), enforce polymorphism for spot-vehicle compatibility, apply Strategy Pattern for spot allocation and fee calculation, and ensure thread safety using concurrent collections or fine-grained locks.",
            mentalModel: "Think of an automated robotic warehouse: cars arrive at multiple gates simultaneously. The system locates the closest vacant spot fitting the vehicle size, locks it atomically, dispenses a ticket with timestamp, and calculates the fee upon exit based on duration and vehicle type.",
            whatItIs: "The most classic LLD machine coding problem used by Amazon, Uber, Swiggy, and Microsoft to evaluate OOP modeling, SOLID principles, and concurrency handling.",
            whyItExists: "Tests whether a candidate creates clean abstractions (e.g. separating Vehicle from ParkingSpot) or writes brittle procedural if-else code.",
            codeDemo: {
              language: "java",
              code: `// --- 1. ENUMS & CORE VALUE OBJECTS ---
public enum VehicleType { MOTORCYCLE, CAR, TRUCK, ELECTRIC }
public enum SpotType { SMALL, COMPACT, LARGE, EV }

public abstract class Vehicle {
    private final String licensePlate;
    private final VehicleType type;
    public Vehicle(String licensePlate, VehicleType type) {
        this.licensePlate = licensePlate;
        this.type = type;
    }
    public String getLicensePlate() { return licensePlate; }
    public VehicleType getType() { return type; }
}

public class Car extends Vehicle {
    public Car(String plate) { super(plate, VehicleType.CAR); }
}

// --- 2. PARKING SPOT & FLOOR ---
public class ParkingSpot {
    private final String spotId;
    private final SpotType spotType;
    private volatile boolean isOccupied = false;
    private Vehicle currentVehicle;

    public ParkingSpot(String spotId, SpotType spotType) {
        this.spotId = spotId;
        this.spotType = spotType;
    }

    public synchronized boolean park(Vehicle vehicle) {
        if (isOccupied || !canFitVehicle(vehicle)) return false;
        this.currentVehicle = vehicle;
        this.isOccupied = true;
        return true;
    }

    public synchronized Vehicle unpark() {
        if (!isOccupied) return null;
        Vehicle v = this.currentVehicle;
        this.currentVehicle = null;
        this.isOccupied = false;
        return v;
    }

    public boolean canFitVehicle(Vehicle vehicle) {
        if (vehicle.getType() == VehicleType.MOTORCYCLE) return true;
        if (vehicle.getType() == VehicleType.CAR) return spotType == SpotType.COMPACT || spotType == SpotType.LARGE;
        if (vehicle.getType() == VehicleType.TRUCK) return spotType == SpotType.LARGE;
        if (vehicle.getType() == VehicleType.ELECTRIC) return spotType == SpotType.EV;
        return false;
    }

    public boolean isOccupied() { return isOccupied; }
    public String getSpotId() { return spotId; }
}

// --- 3. PRICING STRATEGY (Strategy Pattern) ---
public interface PricingStrategy {
    double calculateFee(long durationMillis, VehicleType type);
}

public class HourlyPricingStrategy implements PricingStrategy {
    @Override
    public double calculateFee(long durationMillis, VehicleType type) {
        long hours = Math.max(1, (durationMillis + 3599999) / 3600000); // Ceiling hours
        double rate = switch (type) {
            case MOTORCYCLE -> 10.0;
            case CAR -> 20.0;
            case TRUCK -> 40.0;
            case ELECTRIC -> 25.0;
        };
        return hours * rate;
    }
}

// --- 4. TICKET & PARKING LOT SERVICE ---
public class Ticket {
    private final String ticketId = UUID.randomUUID().toString();
    private final String licensePlate;
    private final ParkingSpot spot;
    private final long entryTime = System.currentTimeMillis();

    public Ticket(String plate, ParkingSpot spot) {
        this.licensePlate = plate;
        this.spot = spot;
    }
    public ParkingSpot getSpot() { return spot; }
    public long getEntryTime() { return entryTime; }
    public String getTicketId() { return ticketId; }
}

public class ParkingLot {
    private static volatile ParkingLot INSTANCE;
    private final List<ParkingSpot> spots = new CopyOnWriteArrayList<>();
    private final Map<String, Ticket> activeTickets = new ConcurrentHashMap<>();
    private final PricingStrategy pricingStrategy;

    private ParkingLot(PricingStrategy pricingStrategy) {
        this.pricingStrategy = pricingStrategy;
    }

    public static ParkingLot getInstance(PricingStrategy pricing) {
        if (INSTANCE == null) {
            synchronized (ParkingLot.class) {
                if (INSTANCE == null) INSTANCE = new ParkingLot(pricing);
            }
        }
        return INSTANCE;
    }

    public void addSpot(ParkingSpot spot) { spots.add(spot); }

    public synchronized Ticket parkVehicle(Vehicle vehicle) {
        for (ParkingSpot spot : spots) {
            if (!spot.isOccupied() && spot.canFitVehicle(vehicle)) {
                if (spot.park(vehicle)) {
                    Ticket ticket = new Ticket(vehicle.getLicensePlate(), spot);
                    activeTickets.put(ticket.getTicketId(), ticket);
                    return ticket;
                }
            }
        }
        throw new IllegalStateException("Parking Full for vehicle type: " + vehicle.getType());
    }

    public synchronized double unparkVehicle(String ticketId) {
        Ticket ticket = activeTickets.remove(ticketId);
        if (ticket == null) throw new IllegalArgumentException("Invalid Ticket ID");
        
        ticket.getSpot().unpark();
        long duration = System.currentTimeMillis() - ticket.getEntryTime();
        return pricingStrategy.calculateFee(duration, ticket.getSpot().canFitVehicle(new Car("")) ? VehicleType.CAR : VehicleType.MOTORCYCLE);
    }
}`,
              explanation: "Demonstrates Strategy Pattern for pricing, Singleton for the lot coordinator, Polymorphism for vehicle-spot sizing, and synchronized atomic spot assignment."
            },
            tradeoffs: "Global synchronization on `parkVehicle` limits throughput under high concurrent entry gates. In production, use concurrent lock-free queues or `ConcurrentSkipListSet` per floor to partition locks.",
            followUpQuestions: [
              {
                question: "How would you optimize spot allocation to find the 'nearest spot to entrance'?",
                answer: "Maintain a `PriorityQueue<ParkingSpot>` per vehicle type sorted by distance to the entry gate; park operations poll in O(log N) and unpark offers back in O(log N)."
              },
              {
                question: "How do you handle multi-gate concurrent entry without lock contention?",
                answer: "Shard spots across parking floors or gate zones; each gate maintains its own local available-spot pool to eliminate a single global lock."
              }
            ],
            usedInProduction: "Standard parking garage management systems (TIBA, Skidata, Parkopedia).",
            relatedTopics: ["Strategy Pattern", "Singleton Pattern", "Object-Oriented Design", "Thread Safety"]
          }
        },
        {
          id: "sd-lld-case-2",
          question: "Design an Elevator / Lift Management System",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design a multi-elevator scheduling and dispatch system for a skyscraper. How to attempt: Model Elevator (current floor, direction, state, floor requests), Request (source floor, destination floor, direction), and ElevatorController (dispatcher algorithm). Implement the SCAN / LOOK elevator algorithm (handling all requests in the current direction before reversing) and State Pattern for elevator movement.",
            mentalModel: "Think of a subway train: It moves in one direction (Northbound) stopping at all requested stations on its route until it hits the terminal station or no more Northbound requests exist. Then it changes direction to Southbound and services requests on the way back.",
            whatItIs: "A classic concurrency and real-time scheduling problem testing state machines, priority queues, and dispatcher algorithms.",
            whyItExists: "Tests an engineer's ability to coordinate asynchronous worker threads, prevent starvation of distant floors, and optimize energy and wait times.",
            codeDemo: {
              language: "java",
              code: `public enum Direction { UP, DOWN, IDLE }
public enum ElevatorState { MOVING, STOPPED, DOOR_OPEN }

public class ElevatorRequest implements Comparable<ElevatorRequest> {
    private final int targetFloor;
    private final Direction direction;

    public ElevatorRequest(int targetFloor, Direction direction) {
        this.targetFloor = targetFloor;
        this.direction = direction;
    }
    public int getTargetFloor() { return targetFloor; }
    public Direction getDirection() { return direction; }

    @Override
    public int compareTo(ElevatorRequest o) {
        return Integer.compare(this.targetFloor, o.targetFloor);
    }
}

public class Elevator implements Runnable {
    private final int id;
    private int currentFloor = 1;
    private Direction currentDirection = Direction.IDLE;
    private ElevatorState state = ElevatorState.STOPPED;

    // Up requests sorted ascending; Down requests sorted descending
    private final TreeSet<Integer> upStops = new TreeSet<>();
    private final TreeSet<Integer> downStops = new TreeSet<>(Collections.reverseOrder());

    public Elevator(int id) { this.id = id; }

    public synchronized void addFloorRequest(int floor) {
        if (floor > currentFloor) {
            upStops.add(floor);
            if (currentDirection == Direction.IDLE) currentDirection = Direction.UP;
        } else if (floor < currentFloor) {
            downStops.add(floor);
            if (currentDirection == Direction.IDLE) currentDirection = Direction.DOWN;
        }
        notifyAll(); // Wake up elevator worker thread
    }

    @Override
    public void run() {
        while (!Thread.currentThread().isInterrupted()) {
            synchronized (this) {
                while (upStops.isEmpty() && downStops.isEmpty()) {
                    currentDirection = Direction.IDLE;
                    try { wait(); } catch (InterruptedException e) { return; }
                }

                if (currentDirection == Direction.UP) {
                    processUpRequests();
                } else if (currentDirection == Direction.DOWN) {
                    processDownRequests();
                }
            }
        }
    }

    private void processUpRequests() {
        while (!upStops.isEmpty()) {
            Integer nextFloor = upStops.pollFirst();
            moveToFloor(nextFloor);
        }
        currentDirection = downStops.isEmpty() ? Direction.IDLE : Direction.DOWN;
    }

    private void processDownRequests() {
        while (!downStops.isEmpty()) {
            Integer nextFloor = downStops.pollFirst();
            moveToFloor(nextFloor);
        }
        currentDirection = upStops.isEmpty() ? Direction.IDLE : Direction.UP;
    }

    private void moveToFloor(int target) {
        state = ElevatorState.MOVING;
        System.out.printf("Elevator %d moving from %d to %d (Direction: %s)%n", id, currentFloor, target, currentDirection);
        try { Thread.sleep(500); } catch (InterruptedException ignored) {} // Simulating transit
        currentFloor = target;
        state = ElevatorState.DOOR_OPEN;
        System.out.printf("Elevator %d ARRIVED at floor %d. Doors opening.%n", id, currentFloor);
        try { Thread.sleep(200); } catch (InterruptedException ignored) {} // Simulating boarding
        state = ElevatorState.STOPPED;
    }

    public int getCurrentFloor() { return currentFloor; }
    public Direction getCurrentDirection() { return currentDirection; }
}`,
              explanation: "Using `TreeSet` with ascending and descending order naturally implements the LOOK disk-scheduling algorithm, guaranteeing fair floor servicing without starvation."
            },
            tradeoffs: "The LOOK algorithm minimizes total travel distance but can make a passenger on floor 2 wait longer if an elevator is servicing a burst of upper-floor requests.",
            followUpQuestions: [
              {
                question: "How does the Elevator Dispatcher choose which elevator to send to a hall call?",
                answer: "Calculate a cost function per elevator: `Cost = Distance + (DirectionMismatchPenalty * 10) + CurrentLoad`. Dispatch the elevator with the minimum cost score."
              },
              {
                question: "How do you handle emergency fire alarm states?",
                answer: "Apply State Pattern: Transition to `EmergencyState`, cancel all pending requests, disregard hall buttons, descend directly to Floor 1, open doors, and lock out."
              }
            ],
            usedInProduction: "Otis Compass 360, Schindler PORT destination dispatch systems.",
            relatedTopics: ["LOOK / SCAN Algorithm", "State Pattern", "Producer-Consumer", "TreeSet Ordering"]
          }
        },
        {
          id: "sd-lld-case-3",
          question: "Design an N x N Tic-Tac-Toe Game with O(1) Move Validation",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design an extensible N x N Tic-Tac-Toe game supporting multiple players and pieces. How to attempt: Model Player, Piece (X, O), and Board. Optimize move validation from naive O(N) row/column scanning to O(1) time using row, column, and diagonal counter arrays (+1 for Player 1, -1 for Player 2).",
            mentalModel: "Think of an abacus counter for each row, column, and diagonal: Whenever Player X places a stone, add 1 to that row's bead counter. Whenever Player O places a stone, subtract 1. If any counter hits +N, Player X wins instantly without scanning the board!",
            whatItIs: "A top-frequency machine coding problem that tests clean modular object orientation combined with optimal algorithmic data structures.",
            whyItExists: "Junior candidates write nested loops scanning the board on every move (O(N) time); senior candidates implement O(1) state tracking with boundary validation.",
            codeDemo: {
              language: "java",
              code: `public enum PieceType { X, O }

public class Player {
    private final String name;
    private final PieceType pieceType;
    public Player(String name, PieceType piece) { this.name = name; this.pieceType = piece; }
    public String getName() { return name; }
    public PieceType getPieceType() { return pieceType; }
}

public class TicTacToeGame {
    private final int n;
    private final PieceType[][] board;
    private final int[] rowCounts;
    private final int[] colCounts;
    private int diagCount = 0;
    private int antiDiagCount = 0;
    private int totalMoves = 0;
    private final Deque<Player> players = new ArrayDeque<>();
    private boolean isGameOver = false;

    public TicTacToeGame(int n, Player p1, Player p2) {
        this.n = n;
        this.board = new PieceType[n][n];
        this.rowCounts = new int[n];
        this.colCounts = new int[n];
        this.players.add(p1);
        this.players.add(p2);
    }

    public synchronized String makeMove(int row, int col) {
        if (isGameOver) throw new IllegalStateException("Game is already finished!");
        if (row < 0 || row >= n || col < 0 || col >= n || board[row][col] != null) {
            throw new IllegalArgumentException("Invalid move coordinates!");
        }

        Player current = players.poll();
        board[row][col] = current.getPieceType();
        totalMoves++;

        // O(1) Win Check logic: +1 for X, -1 for O
        int val = (current.getPieceType() == PieceType.X) ? 1 : -1;
        rowCounts[row] += val;
        colCounts[col] += val;
        if (row == col) diagCount += val;
        if (row + col == n - 1) antiDiagCount += val;

        int target = (val == 1) ? n : -n;
        if (rowCounts[row] == target || colCounts[col] == target ||
            diagCount == target || antiDiagCount == target) {
            isGameOver = true;
            return "WINNER: " + current.getName();
        }

        if (totalMoves == n * n) {
            isGameOver = true;
            return "DRAW: Game tied!";
        }

        players.add(current); // Re-queue player for next turn
        return "SUCCESS: Move accepted. Next turn: " + players.peek().getName();
    }
}`,
              explanation: "Tracking running sums in rowCounts and colCounts reduces win detection from O(N) to O(1) time and O(N) space."
            },
            tradeoffs: "The +1/-1 counter approach works natively for 2 players. For K players (K > 2), replace integer sums with an array of maps `Map<PieceType, Integer>[]` per row/column.",
            followUpQuestions: [
              {
                question: "How do you implement an Undo Move feature?",
                answer: "Apply the Command Pattern: maintain a `Stack<MoveCommand>`. Undoing pops the last move, sets `board[row][col] = null`, decrements the counters, and puts the previous player back at the front of the queue."
              },
              {
                question: "How would you implement an unbeatable AI opponent?",
                answer: "Implement the Minimax algorithm with Alpha-Beta pruning for N=3, or Monte Carlo Tree Search (MCTS) for larger N x N boards."
              }
            ],
            usedInProduction: "Online multiplayer gaming engines (Chess.com, BoardGameGeek).",
            relatedTopics: ["O(1) Matrix Validation", "Command Pattern (Undo/Redo)", "Circular Queue"]
          }
        },
        {
          id: "sd-lld-case-4",
          question: "Design Snake and Ladder Board Game",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design an extensible Snake and Ladder game supporting customizable board dimensions, multiple players, and custom snakes/ladders. How to attempt: Model Board, Cell, Jumper (Snake/Ladder base abstraction), Dice, and Player. Encapsulate the game loop in a GameController, inject dice rolling strategy (Strategy Pattern), and use a FIFO Queue for turn management.",
            mentalModel: "Think of an airport conveyor belt with shortcut portals: players take turns rolling a die and stepping forward. Landing on a Ladder cell teleports them forward; landing on a Snake cell slides them backward. The first person to step on the exact final cell wins.",
            whatItIs: "A quintessential machine coding round problem testing inheritance, polymorphically unified jumpers, and clean game loop encapsulation.",
            whyItExists: "Tests if a candidate unifies Snakes and Ladders under a single abstraction (`Jumper` with `start` and `end`) rather than writing duplicated logic for each.",
            codeDemo: {
              language: "java",
              code: `// --- 1. JUMPER (Unifies Snake and Ladder) ---
public class Jumper {
    private final int start;
    private final int end;

    public Jumper(int start, int end) {
        if (start == end) throw new IllegalArgumentException("Start and End cannot be identical");
        this.start = start;
        this.end = end;
    }
    public int getStart() { return start; }
    public int getEnd() { return end; }
    public boolean isSnake() { return start > end; }
    public boolean isLadder() { return start < end; }
}

// --- 2. DICE STRATEGY ---
public interface DiceStrategy {
    int roll();
}

public class StandardDice implements DiceStrategy {
    private final int numberOfDice;
    public StandardDice(int numberOfDice) { this.numberOfDice = numberOfDice; }

    @Override
    public int roll() {
        int total = 0;
        for (int i = 0; i < numberOfDice; i++) {
            total += ThreadLocalRandom.current().nextInt(1, 7);
        }
        return total;
    }
}

// --- 3. BOARD & GAME CONTROLLER ---
public class SnakeAndLadderGame {
    private final int winningPosition;
    private final Map<Integer, Jumper> jumpers = new HashMap<>();
    private final Queue<Player> players = new LinkedList<>();
    private final Map<String, Integer> playerPositions = new HashMap<>();
    private final DiceStrategy dice;

    public SnakeAndLadderGame(int boardSize, List<Jumper> jumperList, List<Player> playerList, DiceStrategy dice) {
        this.winningPosition = boardSize;
        this.dice = dice;
        for (Jumper j : jumperList) jumpers.put(j.getStart(), j);
        for (Player p : playerList) {
            players.add(p);
            playerPositions.put(p.getId(), 0);
        }
    }

    public void play() {
        while (players.size() > 1) {
            Player current = players.poll();
            int currentPos = playerPositions.get(current.getId());
            int roll = dice.roll();
            int nextPos = currentPos + roll;

            if (nextPos <= winningPosition) {
                // Check for snake or ladder
                if (jumpers.containsKey(nextPos)) {
                    Jumper j = jumpers.get(nextPos);
                    System.out.printf("%s encountered a %s! %d -> %d%n",
                        current.getName(), j.isSnake() ? "SNAKE" : "LADDER", j.getStart(), j.getEnd());
                    nextPos = j.getEnd();
                }
                playerPositions.put(current.getId(), nextPos);
                System.out.printf("%s rolled a %d and moved to %d%n", current.getName(), roll, nextPos);

                if (nextPos == winningPosition) {
                    System.out.printf("🎉 %s HAS WON THE GAME!%n", current.getName());
                    continue; // Do not re-add winner to queue
                }
            } else {
                System.out.printf("%s rolled %d but needs exact roll to reach %d. Turn skipped.%n",
                    current.getName(), roll, winningPosition);
            }
            players.add(current); // Next turn
        }
    }
}`,
              explanation: "Treating Snakes and Ladders as instances of `Jumper` (where start > end is a snake and start < end is a ladder) eliminates redundant code and adheres to DRY."
            },
            tradeoffs: "Using a single `Queue<Player>` enforces sequential turns; in distributed gaming, game state must be persisted in Redis and protected with distributed locks.",
            followUpQuestions: [
              {
                question: "How do you detect infinite loops in board configuration (e.g., Snake at 14 drops to 7, Ladder at 7 climbs to 14)?",
                answer: "Model the board as a Directed Graph where jumpers are directed edges; run Cycle Detection (DFS with visited sets or Kahn's algorithm) during board initialization."
              },
              {
                question: "How would you handle the 'roll 6 gets another turn' rule?",
                answer: "Check `if (roll == 6)`: re-add player to the FRONT of the queue using `Deque.addFirst()` instead of the back, and track consecutive sixes (3 consecutive sixes cancels turn)."
              }
            ],
            usedInProduction: "Turn-based gaming microservices (Ludo King, Gameberry Labs).",
            relatedTopics: ["Strategy Pattern", "Directed Graph Cycle Detection", "Turn Management"]
          }
        },
        {
          id: "sd-lld-case-5",
          question: "Design Splitwise (Expense Sharing & Debt Simplification)",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design an expense sharing app supporting Equal, Exact, and Percentage splits, with an algorithm to simplify group debts (minimizing the total number of cash transactions). How to attempt: Model User, Expense, Split (EqualSplit, ExactSplit, PercentSplit), and Group. Apply Factory Pattern for expense creation, Strategy Pattern for split validation, and a Min-Cash-Flow Greedy Heap algorithm to simplify balances.",
            mentalModel: "Think of a group vacation tab: Alice paid $60 for dinner for Bob and Charlie ($20 each). Bob paid $30 for snacks for Alice and Charlie ($10 each). Rather than settling 6 tiny payments between everyone, calculate net balances (+Alice, -Bob, -Charlie) and settle directly between the biggest creditor and biggest debtor.",
            whatItIs: "The premier financial LLD problem testing complex business validation, inheritance, and algorithmic graph simplification.",
            whyItExists: "Tests an engineer's ability to combine clean domain-driven design with graph/greedy debt minimization algorithms.",
            codeDemo: {
              language: "java",
              code: `public enum SplitType { EQUAL, EXACT, PERCENT }

public abstract class Split {
    private final User user;
    protected double amount;
    public Split(User user) { this.user = user; }
    public User getUser() { return user; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}

public class EqualSplit extends Split { public EqualSplit(User u) { super(u); } }
public class ExactSplit extends Split {
    public ExactSplit(User u, double amt) { super(u); this.amount = amt; }
}

// --- DEBT SIMPLIFICATION ALGORITHM (Min-Cash-Flow) ---
public class DebtSimplifier {
    public static List<Transaction> simplifyDebts(Map<String, Double> netBalances) {
        // Separate creditors (net > 0) and debtors (net < 0)
        PriorityQueue<Map.Entry<String, Double>> creditors = 
            new PriorityQueue<>((a, b) -> Double.compare(b.getValue(), a.getValue()));
        PriorityQueue<Map.Entry<String, Double>> debtors = 
            new PriorityQueue<>(Comparator.comparingDouble(Map.Entry::getValue));

        for (Map.Entry<String, Double> entry : netBalances.entrySet()) {
            if (entry.getValue() > 0.01) creditors.add(entry);
            else if (entry.getValue() < -0.01) debtors.add(entry);
        }

        List<Transaction> transactions = new ArrayList<>();
        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            Map.Entry<String, Double> maxCredit = creditors.poll();
            Map.Entry<String, Double> maxDebit = debtors.poll();

            double settledAmount = Math.min(maxCredit.getValue(), -maxDebit.getValue());
            transactions.add(new Transaction(maxDebit.getKey(), maxCredit.getKey(), settledAmount));

            double remainingCredit = maxCredit.getValue() - settledAmount;
            double remainingDebit = maxDebit.getValue() + settledAmount;

            if (remainingCredit > 0.01) {
                maxCredit.setValue(remainingCredit);
                creditors.add(maxCredit);
            }
            if (remainingDebit < -0.01) {
                maxDebit.setValue(remainingDebit);
                debtors.add(maxDebit);
            }
        }
        return transactions;
    }
}`,
              explanation: "The Greedy Min-Cash-Flow algorithm uses two PriorityQueues (max-creditor and max-debtor) to reduce O(N^2) peer debts to at most N-1 total transactions."
            },
            tradeoffs: "The greedy approach guarantees at most N-1 transactions, which is near-optimal. Finding the absolute theoretical minimum is an NP-Hard problem reducible to Subset-Sum.",
            followUpQuestions: [
              {
                question: "How do you handle floating point rounding issues (e.g., $100 split equally among 3 people = $33.3333...)?",
                answer: "Always use `BigDecimal` or store values in integer cents (e.g. 10000 cents). The first person pays 3334 cents, and the remaining two pay 3333 cents."
              },
              {
                question: "How do you ensure thread-safe balance updates when multiple expenses are added concurrently?",
                answer: "Use optimistic locking on the User Balance record with a `@Version` field, or acquire a distributed lock on the `group_id`."
              }
            ],
            usedInProduction: "Splitwise, Venmo group tabs, Tricount.",
            relatedTopics: ["Min-Cash-Flow Algorithm", "Strategy Pattern", "BigDecimal Financial Math"]
          }
        },
        {
          id: "sd-lld-case-6",
          question: "Design BookMyShow / Movie Ticket Booking System",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design a concurrent movie ticket booking system with temporary seat locking. How to attempt: Model Cinema, Hall, Movie, Show, Seat, Booking, and Payment. Implement temporary seat reservation with a 10-minute TTL, ensure no two users can book the same seat simultaneously using Redis Distributed Locks or DB Optimistic Locking, and apply State Pattern for booking lifecycles.",
            mentalModel: "Think of a physical theater box office: You point to Seat E-12. The clerk places a plastic 'RESERVED' cone on that seat for 10 minutes while you take out your credit card. If you pay, the seat turns permanently red. If your card declines or you walk away, the clerk removes the cone and the seat turns green again.",
            whatItIs: "The premier concurrency and inventory reservation machine coding problem.",
            whyItExists: "Tests an engineer's ability to prevent race conditions during high-demand seat booking under high traffic.",
            codeDemo: {
              language: "java",
              code: `public enum SeatStatus { AVAILABLE, TEMPORARILY_LOCKED, BOOKED }
public enum BookingStatus { CREATED, CONFIRMED, EXPIRED, CANCELLED }

public class SeatLock {
    private final String seatId;
    private final String userId;
    private final long lockExpiryTime;

    public SeatLock(String seatId, String userId, long timeoutMillis) {
        this.seatId = seatId;
        this.userId = userId;
        this.lockExpiryTime = System.currentTimeMillis() + timeoutMillis;
    }
    public boolean isExpired() { return System.currentTimeMillis() > lockExpiryTime; }
    public String getUserId() { return userId; }
}

public class SeatLockManager {
    // ShowId -> (SeatId -> SeatLock)
    private final Map<String, Map<String, SeatLock>> locks = new ConcurrentHashMap<>();

    public synchronized boolean lockSeats(String showId, List<String> seatIds, String userId, long timeoutMillis) {
        Map<String, SeatLock> showLocks = locks.computeIfAbsent(showId, k -> new ConcurrentHashMap<>());

        // Step 1: Pre-check if any requested seat is currently locked or booked
        for (String seatId : seatIds) {
            SeatLock existing = showLocks.get(seatId);
            if (existing != null && !existing.isExpired()) {
                return false; // Collision! Another user has this seat locked
            }
        }

        // Step 2: Atomically lock all requested seats
        for (String seatId : seatIds) {
            showLocks.put(seatId, new SeatLock(seatId, userId, timeoutMillis));
        }
        return true;
    }

    public synchronized void releaseSeats(String showId, List<String> seatIds, String userId) {
        Map<String, SeatLock> showLocks = locks.get(showId);
        if (showLocks == null) return;
        for (String seatId : seatIds) {
            SeatLock lock = showLocks.get(seatId);
            if (lock != null && lock.getUserId().equals(userId)) {
                showLocks.remove(seatId);
            }
        }
    }
}`,
              explanation: "Atomically checking all seats before claiming any of them prevents deadlocks (where User A holds Seat 1 waiting for Seat 2, while User B holds Seat 2 waiting for Seat 1)."
            },
            tradeoffs: "In-memory locks do not survive server restarts. In production, use Redis distributed locks with key `seat_lock:{show_id}:{seat_id}` and `SETNX ... PX 600000`.",
            followUpQuestions: [
              {
                question: "What happens if a user closes the browser tab while seats are locked?",
                answer: "The lock naturally expires after 10 minutes; an asynchronous TTL poller or Redis key expiration returns the seats to the available pool."
              },
              {
                question: "How do you handle differential pricing for different seat tiers (Silver, Gold, VIP)?",
                answer: "Implement Strategy Pattern: `SeatPricingStrategy` calculates base price per tier + weekend/morning surge multiplier."
              }
            ],
            usedInProduction: "BookMyShow, Ticketmaster, Fandango.",
            relatedTopics: ["Two-Phase Reservation", "Optimistic Locking", "Deadlock Prevention", "Redis Distributed Locks"]
          }
        },
        {
          id: "sd-lld-case-7",
          question: "Design a Logging Framework (like Log4j / SLF4J)",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design an extensible, high-throughput asynchronous logging framework supporting multiple log levels and appender sinks. How to attempt: Model LogLevel, LogMessage, LogFilter, and LogAppender (ConsoleAppender, FileAppender). Apply Chain of Responsibility for log level hierarchy and RingBuffer / BlockingQueue for asynchronous non-blocking log ingestion.",
            mentalModel: "Think of an office suggestion box connected to a conveyor belt: Employees drop notes into the slot instantly without waiting. In the basement, a sorting machine reads each note's urgency stamp and distributes copies to the recycling bin, filing cabinet, or CEO desk without slowing down the office upstairs.",
            whatItIs: "A core systems LLD problem evaluating asynchronous thread decoupling, buffering, and extensible appender chains.",
            whyItExists: "Synchronous file logging blocks application worker threads on disk I/O; an asynchronous logger offloads writes to a background worker.",
            codeDemo: {
              language: "java",
              code: `public enum LogLevel { DEBUG(1), INFO(2), WARN(3), ERROR(4);
    private final int level;
    LogLevel(int level) { this.level = level; }
    public boolean isApplicable(LogLevel configured) { return this.level >= configured.level; }
}

public interface LogAppender {
    void append(String formattedMessage);
}

public class ConsoleAppender implements LogAppender {
    @Override
    public void append(String msg) { System.out.println("[CONSOLE] " + msg); }
}

public class FileAppender implements LogAppender {
    private final String filePath;
    public FileAppender(String filePath) { this.filePath = filePath; }
    @Override
    public void append(String msg) { /* Async disk write */ }
}

// Asynchronous Logger using Producer-Consumer Pattern
public class AsyncLogger {
    private LogLevel configuredLevel = LogLevel.INFO;
    private final List<LogAppender> appenders = new CopyOnWriteArrayList<>();
    private final BlockingQueue<String> logQueue = new LinkedBlockingQueue<>(50000);
    private final Thread workerThread;

    public AsyncLogger() {
        workerThread = new Thread(this::processQueue);
        workerThread.setDaemon(true);
        workerThread.start();
    }

    public void addAppender(LogAppender appender) { appenders.add(appender); }
    public void setLevel(LogLevel level) { this.configuredLevel = level; }

    public void log(LogLevel level, String message) {
        if (!level.isApplicable(configuredLevel)) return;
        String formatted = String.format("%s [%s] [Thread-%s] %s",
            Instant.now(), level, Thread.currentThread().getName(), message);
        logQueue.offer(formatted); // Non-blocking offer!
    }

    private void processQueue() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                String msg = logQueue.take(); // Blocking wait for background write
                for (LogAppender appender : appenders) {
                    appender.append(msg);
                }
            } catch (InterruptedException e) {
                break;
            }
        }
    }
}`,
              explanation: "Application threads call `logQueue.offer()` in nanoseconds; disk writes occur on a dedicated background daemon thread, eliminating application latency spikes."
            },
            tradeoffs: "If the log queue fills up during a sudden surge, you must choose between dropping logs (lossy) or blocking application threads (safe but degrades latency).",
            followUpQuestions: [
              {
                question: "How does LMAX Disruptor improve Log4j 2 performance over LinkedBlockingQueue?",
                answer: "Disruptor uses a pre-allocated lock-free Circular RingBuffer with memory cache-line padding, eliminating GC pauses and lock contention."
              },
              {
                question: "How do you handle log file rotation by size and date?",
                answer: "Maintain a byte counter in `RollingFileAppender`; when size exceeds limit (e.g. 50MB), close current file, rename with timestamp suffix, compress with GZIP asynchronously, and open a fresh file."
              }
            ],
            usedInProduction: "Log4j 2, Logback, SLF4J, Uber zap.",
            relatedTopics: ["Chain of Responsibility", "Producer-Consumer", "LMAX Disruptor", "Thread Safety"]
          }
        },
        {
          id: "sd-lld-case-8",
          question: "Design an In-Memory Key-Value Store / Cache with LRU Eviction",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design an in-memory cache supporting O(1) Get and Put operations with Least Recently Used (LRU) eviction and TTL expiration. How to attempt: Combine a HashMap (for O(1) key-to-node lookup) with a Doubly Linked List (for O(1) removal and re-insertion at the head). Synchronize with a ReadWriteLock to allow concurrent reads.",
            mentalModel: "Think of a pile of books on your desk: When you pick up a book to read, you place it back on top of the pile. When the pile gets too tall, you discard the book at the very bottom.",
            whatItIs: "The classic algorithmic and low-level system design problem asked by almost every tech company.",
            whyItExists: "Tests pointer manipulation, invariant maintenance, and thread-safety under concurrent access.",
            codeDemo: {
              language: "java",
              code: `public class LRUCache<K, V> {
    private static class Node<K, V> {
        K key;
        V value;
        long expiryTime;
        Node<K, V> prev, next;
        Node(K key, V value, long ttlMillis) {
            this.key = key;
            this.value = value;
            this.expiryTime = (ttlMillis > 0) ? System.currentTimeMillis() + ttlMillis : Long.MAX_VALUE;
        }
        boolean isExpired() { return System.currentTimeMillis() > expiryTime; }
    }

    private final int capacity;
    private final Map<K, Node<K, V>> map = new HashMap<>();
    private final Node<K, V> head = new Node<>(null, null, 0); // Dummy Head
    private final Node<K, V> tail = new Node<>(null, null, 0); // Dummy Tail
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public V get(K key) {
        rwLock.writeLock().lock(); // Write lock because LRU order mutates!
        try {
            Node<K, V> node = map.get(key);
            if (node == null) return null;
            if (node.isExpired()) {
                removeNode(node);
                map.remove(key);
                return null;
            }
            moveToHead(node);
            return node.value;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void put(K key, V value, long ttlMillis) {
        rwLock.writeLock().lock();
        try {
            Node<K, V> node = map.get(key);
            if (node != null) {
                node.value = value;
                node.expiryTime = (ttlMillis > 0) ? System.currentTimeMillis() + ttlMillis : Long.MAX_VALUE;
                moveToHead(node);
            } else {
                if (map.size() >= capacity) {
                    Node<K, V> lru = tail.prev;
                    removeNode(lru);
                    map.remove(lru.key);
                }
                Node<K, V> newNode = new Node<>(key, value, ttlMillis);
                map.put(key, newNode);
                addToHead(newNode);
            }
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    private void addToHead(Node<K, V> node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }

    private void removeNode(Node<K, V> node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void moveToHead(Node<K, V> node) {
        removeNode(node);
        addToHead(node);
    }
}`,
              explanation: "Using dummy head and tail sentinel nodes eliminates null-pointer edge cases when inserting into an empty list or deleting the last element."
            },
            tradeoffs: "Because `get()` mutates the linked list (moving the accessed node to head), it requires an exclusive write lock, bottlenecking concurrent read throughput.",
            followUpQuestions: [
              {
                question: "How do you allow concurrent read operations without locking the entire cache?",
                answer: "Use Segmented LRU (like Caffeine cache) or Striped Locks where keys are hashed across N independent sub-caches, each with its own lock."
              },
              {
                question: "How do you clean up expired TTL keys without checking every key continuously?",
                answer: "Combine Passive Expiration (evict on access in `get()`) with Active Periodic Cleanup (background daemon samples 20 random keys every 100ms and purges expired ones)."
              }
            ],
            usedInProduction: "Guava Cache, Caffeine, Redis LRU, Linux Page Cache.",
            relatedTopics: ["Doubly Linked List", "HashMap", "ReadWriteLock", "Caffeine Cache"]
          }
        },
        {
          id: "sd-lld-case-9",
          question: "Design Cricbuzz / Live Cricket Scoreboard System",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design a real-time cricket scoreboard processing live ball-by-ball updates and broadcasting score changes to millions of viewers. How to attempt: Model Match, Inning, Over, Ball, Player, Team, and ScoreCard. Apply the Command Pattern to encapsulate ball events, and the Observer Pattern to push live score and commentary updates to web/mobile clients via WebSockets.",
            mentalModel: "Think of an umpire signaling events to the control room: The third umpire records 'Boundary 4 runs'. This event is validated and recorded on the official ledger, triggering immediate visual score updates on stadium screens and phone notifications worldwide.",
            whatItIs: "The event-driven sports commentary and statistics architecture testing state mutation, observer notifications, and domain-driven design.",
            whyItExists: "Complex business rules (strike rotation, extra runs, wickets, over completion) require clean encapsulation to avoid spaghetti code.",
            codeDemo: {
              language: "java",
              code: `public enum BallType { NORMAL, WIDE, NO_BALL }
public enum WicketType { BOWLED, CAUGHT, RUN_OUT, LBW }

public class BallOutcome {
    private final int runsScored;
    private final BallType ballType;
    private final boolean isWicket;
    private final WicketType wicketType;

    public BallOutcome(int runs, BallType type, boolean isWicket, WicketType wType) {
        this.runsScored = runs;
        this.ballType = type;
        this.isWicket = isWicket;
        this.wicketType = wType;
    }
    public int getRunsScored() { return runsScored; }
    public boolean isLegalBall() { return ballType == BallType.NORMAL; }
    public boolean isWicket() { return isWicket; }
}

public interface ScoreObserver {
    void onScoreUpdated(MatchScore score, String commentary);
}

public class MatchScore {
    private int totalRuns = 0;
    private int wickets = 0;
    private int legalBalls = 0;
    private Player striker;
    private Player nonStriker;
    private final List<ScoreObserver> observers = new CopyOnWriteArrayList<>();

    public void registerObserver(ScoreObserver obs) { observers.add(obs); }

    public synchronized void recordBall(BallOutcome outcome, String commentary) {
        totalRuns += outcome.getRunsScored();
        if (outcome.isWicket()) wickets++;
        if (outcome.isLegalBall()) legalBalls++;

        // Strike rotation on odd runs
        if (outcome.getRunsScored() % 2 != 0) {
            rotateStrike();
        }

        // Over completion (6 legal balls) -> rotate strike again and reset bowler
        if (legalBalls % 6 == 0 && outcome.isLegalBall()) {
            rotateStrike();
        }

        notifyObservers(commentary);
    }

    private void rotateStrike() {
        Player temp = striker;
        striker = nonStriker;
        nonStriker = temp;
    }

    private void notifyObservers(String commentary) {
        for (ScoreObserver obs : observers) {
            obs.onScoreUpdated(this, commentary);
        }
    }
}`,
              explanation: "The Observer pattern completely decouples ball scoring rules from downstream consumer systems (WebSocket broadcast, push notification dispatchers, historical stats engines)."
            },
            tradeoffs: "Broadcasting synchronously to thousands of observers inside `recordBall` will block the scoring engine. In production, publish score update events to Kafka/Redis PubSub.",
            followUpQuestions: [
              {
                question: "How do you calculate Duckworth-Lewis-Stern (DLS) par scores during rain interruptions?",
                answer: "Apply Strategy Pattern: Inject a `TargetCalculationStrategy` (Standard vs DLS) that adjusts required run rate based on remaining overs and lost wickets."
              },
              {
                question: "How do you correct an incorrect umpire call retrospectively?",
                answer: "Use Event Sourcing: Store every ball as an immutable event. To correct a mistake, record a compensating reversal event and replay from that snapshot."
              }
            ],
            usedInProduction: "Cricbuzz, ESPNcricinfo, Dream11 live fantasy score engine.",
            relatedTopics: ["Observer Pattern", "Event Sourcing", "Domain-Driven Design", "Strike Rotation"]
          }
        },
        {
          id: "sd-lld-case-10",
          question: "Design an ATM (Automated Teller Machine) State Machine",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design an ATM controller handling card authentication, cash withdrawal, and hardware dispensing. How to attempt: Model ATMController, Card, Account, and CashDispenser. Apply the State Pattern to model ATM lifecycles (IdleState, HasCardState, PinEnteredState, DispensingState) and the Chain of Responsibility Pattern to dispense optimal bill denominations ($100, $50, $20, $10).",
            mentalModel: "Think of an arcade game with a coin slot: You can't press the 'Start Game' button until you insert a coin (Idle -> CoinInserted). Once playing, pressing the coin eject does nothing. The machine strictly enforces which buttons are valid in each state.",
            whatItIs: "The quintessential State Pattern and Chain of Responsibility machine coding problem.",
            whyItExists: "Tests an engineer's ability to eliminate spaghetti if-else flags and prevent illegal operations (e.g., dispensing cash before PIN verification).",
            codeDemo: {
              language: "java",
              code: `// --- 1. STATE PATTERN INTERFACE ---
public interface ATMState {
    void insertCard(ATMContext ctx, Card card);
    void enterPin(ATMContext ctx, int pin);
    void withdrawCash(ATMContext ctx, int amount);
    void ejectCard(ATMContext ctx);
}

// --- 2. CHAIN OF RESPONSIBILITY (Cash Dispenser) ---
public abstract class BillDispenser {
    protected BillDispenser next;
    protected final int denomination;
    protected int availableBills;

    public BillDispenser(int denomination, int bills) {
        this.denomination = denomination;
        this.availableBills = bills;
    }
    public void setNext(BillDispenser next) { this.next = next; }

    public void dispense(int remainingAmount) {
        int required = remainingAmount / denomination;
        int dispensed = Math.min(required, availableBills);
        if (dispensed > 0) {
            availableBills -= dispensed;
            System.out.printf("Dispensing %d x $%d bills%n", dispensed, denomination);
        }
        int remainder = remainingAmount - (dispensed * denomination);
        if (remainder > 0) {
            if (next != null) next.dispense(remainder);
            else throw new IllegalStateException("Cannot dispense exact amount with available bills!");
        }
    }
}

public class HundredDollarDispenser extends BillDispenser { public HundredDollarDispenser(int b) { super(100, b); } }
public class FiftyDollarDispenser extends BillDispenser { public FiftyDollarDispenser(int b) { super(50, b); } }
public class TwentyDollarDispenser extends BillDispenser { public TwentyDollarDispenser(int b) { super(20, b); } }

// --- 3. CONCRETE STATE IMPLEMENTATION ---
public class IdleState implements ATMState {
    @Override
    public void insertCard(ATMContext ctx, Card card) {
        ctx.setCurrentCard(card);
        ctx.setState(new HasCardState());
        System.out.println("Card inserted. Please enter your 4-digit PIN.");
    }
    @Override public void enterPin(ATMContext ctx, int pin) { System.out.println("No card inserted!"); }
    @Override public void withdrawCash(ATMContext ctx, int amt) { System.out.println("No card inserted!"); }
    @Override public void ejectCard(ATMContext ctx) { System.out.println("No card to eject."); }
}

public class HasCardState implements ATMState {
    @Override public void insertCard(ATMContext ctx, Card card) { System.out.println("Card already inserted!"); }
    @Override
    public void enterPin(ATMContext ctx, int pin) {
        if (ctx.getCurrentCard().validatePin(pin)) {
            ctx.setState(new PinVerifiedState());
            System.out.println("PIN validated. Select transaction.");
        } else {
            System.out.println("Invalid PIN! Ejecting card.");
            ctx.setState(new IdleState());
        }
    }
    @Override public void withdrawCash(ATMContext ctx, int amt) { System.out.println("Enter PIN first!"); }
    @Override
    public void ejectCard(ATMContext ctx) {
        ctx.setCurrentCard(null);
        ctx.setState(new IdleState());
        System.out.println("Card ejected.");
    }
}`,
              explanation: "Combining State Pattern (for flow enforcement) with Chain of Responsibility (for bill dispensing) produces clean, bulletproof, extensible code."
            },
            tradeoffs: "State pattern introduces multiple small state classes, but it eliminates bug-prone nested boolean flags.",
            followUpQuestions: [
              {
                question: "What happens if hardware jams halfway through dispensing cash?",
                answer: "The transaction must execute under a Saga or 2-Phase Commit (2PC): debit customer account only after hardware optical sensors confirm bills passed into the physical cash tray; otherwise initiate automated compensating refund."
              },
              {
                question: "How do you handle 3 consecutive wrong PIN attempts?",
                answer: "Maintain a counter on the Card object; after 3 failures, transition to `CardRetainedState`, physically seize the card into an internal retention box, and notify the card issuing bank."
              }
            ],
            usedInProduction: "Diebold Nixdorf, NCR Corporation ATM software architectures.",
            relatedTopics: ["State Pattern", "Chain of Responsibility", "Compensating Transactions"]
          }
        }
      ]
    }
  ]
};
