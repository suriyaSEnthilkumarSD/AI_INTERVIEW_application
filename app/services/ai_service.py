from fastapi import HTTPException, status

from google import genai
from google.genai import types, errors

from app.core.config import settings
from app.schemas.ai import (
    AIAnalysisMode,
    AIAnalysisResponse,
)


# Create Gemini client
client = genai.Client(
    api_key=settings.gemini_api_key
)


def build_prompt(
    submission: dict,
    problem: dict,
    mode: AIAnalysisMode,
) -> str:

    # Different instructions based on what
    # the user is asking the AI to do
    mode_instruction = {
        AIAnalysisMode.HINT: """
Give a helpful hint without revealing the complete solution
or writing the final code.

Guide the user toward the correct approach step by step.
Do not directly reveal the optimal algorithm.
""",

        AIAnalysisMode.ANALYSIS: """
Analyze the user's submitted code and explain the main
reason for its current submission result.

Focus on:
- Logic mistakes
- Incorrect assumptions
- Runtime problems
- Edge cases
- Efficiency issues
""",

        AIAnalysisMode.OPTIMIZATION: """
Analyze the efficiency of the user's solution.

Explain:
- The current time and space complexity
- Why the current approach may be inefficient
- The direction of a better approach

Do not write the complete optimized solution.
""",

        AIAnalysisMode.EXPLAIN: """
Explain how the user's submitted code works.

Focus on:
- The approach used
- Important logic
- How the code processes the input
- The time and space complexity

Do not replace the user's code with a new solution.
""",
    }[mode]

    constraints = "\n".join(
        problem["content"]["constraints"]
    )

    topics = ", ".join(
        problem["topics"]
    )

    return f"""
You are an AI coding mentor helping a student solve a
programming problem.

Your goal is to help the student understand their solution,
not simply give them the complete answer.

{mode_instruction}

====================
PROBLEM INFORMATION
====================

Title:
{problem["title"]}

Difficulty:
{problem["difficulty"]}

Topics:
{topics}

Description:
{problem["content"]["description"]}

Constraints:
{constraints}

Expected Time Complexity:
{problem["solutionContext"]["expectedTimeComplexity"]}

Expected Space Complexity:
{problem["solutionContext"]["expectedSpaceComplexity"]}


====================
SUBMISSION RESULT
====================

Language:
{submission["language"]}

Status:
{submission["status"]}

Test Cases Passed:
{submission["test_cases_passed"]} /
{submission["total_test_cases"]}

Execution Time:
{submission["execution_time"]}

Memory Used:
{submission["memory_used"]}


====================
USER CODE
====================

Language:
{submission["language"]}

Source Code:
{submission["source_code"]}


====================
IMPORTANT RULES
====================

- Do not provide the complete final solution.
- Do not rewrite the entire correct code.
- Give educational and constructive feedback.
- Base your analysis on the actual submission result.
- If the submission has a failure status, explain the likely
  reason based on the code and submission information.
- If the submission is accepted, analyze correctness,
  readability, and possible optimization.
- Keep hints progressive.
- Avoid revealing too much in hint mode.
- Return only data matching the requested response schema.
"""


def analyze_submission(
    submission: dict,
    problem: dict,
    mode: AIAnalysisMode,
) -> AIAnalysisResponse:

    prompt = build_prompt(
        submission=submission,
        problem=problem,
        mode=mode,
    )

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AIAnalysisResponse,
            ),
        )

        return AIAnalysisResponse.model_validate_json(
            response.text
        )

    except errors.ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI analysis service is temporarily unavailable. "
                "Please try again later."
            ),
        ) from e

    except errors.ServerError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI service is temporarily unavailable. "
                "Please try again later."
            ),
        ) from e

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "An unexpected error occurred while "
                "analyzing the submission."
            ),
        ) from e