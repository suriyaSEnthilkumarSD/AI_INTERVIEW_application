from pydantic import BaseModel, Field
from typing import Any
from enum import Enum
from enum import Enum


class Topic(str, Enum):
    ARRAY = "Array"
    STRING = "String"
    HASH_TABLE = "Hash Table"
    TWO_POINTERS = "Two Pointers"
    SLIDING_WINDOW = "Sliding Window"
    STACK = "Stack"
    QUEUE = "Queue"
    LINKED_LIST = "Linked List"
    TREE = "Tree"
    BINARY_SEARCH_TREE = "Binary Search Tree"
    GRAPH = "Graph"
    BFS = "Breadth-First Search"
    DFS = "Depth-First Search"
    HEAP = "Heap"
    BACKTRACKING = "Backtracking"
    GREEDY = "Greedy"
    SORTING = "Sorting"
    INTERVALS = "Intervals"
    DYNAMIC_PROGRAMMING = "Dynamic Programming"
    BINARY_SEARCH = "Binary Search"
    BIT_MANIPULATION = "Bit Manipulation"
    UNION_FIND = "Union Find"
    DESIGN = "Design"
    DIVIDE_AND_CONQUER = "Divide and Conquer"
    MONOTONIC_STACK = "Monotonic Stack"


class Difficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class Hint(BaseModel):
    level: int
    text: str


class ProblemContent(BaseModel):
    description: str
    constraints: list[str]
    inputDescription: str
    outputDescription: str
    hints: list[Hint]


class StarterCode(BaseModel):
    python: str
    cpp: str
    java: str


class FunctionParameter(BaseModel):
    name: str
    type: str


class FunctionSignature(BaseModel):
    name: str
    parameters: list[FunctionParameter]
    returnType: str


class ProblemCode(BaseModel):
    supportedLanguages: list[str]
    starterCode: StarterCode
    functionSignature: FunctionSignature


class TestCase(BaseModel):
    id: str
    input: dict[str, Any]
    expectedOutput: Any
    visibility: str
    comparison: str


class ProblemEvaluation(BaseModel):
    testCases: list[TestCase]


class SolutionContext(BaseModel):
    optimalApproach: str
    approachExplanation: str
    expectedTimeComplexity: str
    expectedSpaceComplexity: str


class ProblemMetadata(BaseModel):
    source: str
    leetcodeId: int


class ProblemCreate(BaseModel):
    problem_id: int
    slug: str
    title: str
    difficulty: Difficulty
    topics: list[Topic]

    content: ProblemContent
    code: ProblemCode
    evaluation: ProblemEvaluation
    solutionContext: SolutionContext
    metadata: ProblemMetadata

class ProblemSummaryResponse(BaseModel):
    problem_id: int
    slug: str
    title: str
    difficulty: Difficulty
    topics: list[str]


class ProblemDetailResponse(BaseModel):
    problem_id: int
    slug: str
    title: str
    difficulty: Difficulty
    topics: list[str]

    content: ProblemContent
    code: ProblemCode
    evaluation: ProblemEvaluation
    solutionContext: SolutionContext
    metadata: ProblemMetadata


class ProblemListResponse(BaseModel):
    problems: list[ProblemSummaryResponse]
    page: int
    limit: int
    total: int
    total_pages: int


class ProblemUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    difficulty: Difficulty | None = None
    topics: list[Topic] | None = None

    content: ProblemContent | None = None
    code: ProblemCode | None = None
    evaluation: ProblemEvaluation | None = None
    solutionContext: SolutionContext | None = None
    metadata: ProblemMetadata | None = None