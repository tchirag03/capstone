"""
Text Structuring Service.

Parses raw OCR text into structured question-answer format using
regex + heuristic rules.  No ML model required.

Design principles:
  • Modular — independent service, can upgrade to ML-based parser later
  • Stateless — takes raw text in, returns structured dict out
"""
import re
from typing import Optional


# Common CS / programming keywords for keyword extraction
_CS_KEYWORDS = {
    "algorithm", "array", "binary", "boolean", "class", "complexity",
    "data structure", "database", "function", "graph", "hash", "heap",
    "inheritance", "iteration", "linked list", "loop", "matrix",
    "object", "pointer", "polymorphism", "queue", "recursion",
    "search", "sort", "stack", "string", "tree", "variable",
    "if", "else", "while", "for", "return", "print", "input",
    "def", "int", "float", "list", "dict", "set", "tuple",
    "try", "except", "import", "from", "break", "continue",
    "switch", "case", "struct", "void", "null", "true", "false",
    "O(1)", "O(n)", "O(n^2)", "O(log n)", "O(n log n)",
}

# Patterns that indicate code rather than prose
_CODE_INDICATORS = re.compile(
    r"(=\s*\d|[{}\[\];]|\b(def|class|if|else|elif|while|for|return|print|"
    r"int\s+\w|void\s+\w|public|private|#include)\b)",
    re.IGNORECASE,
)

# Question start patterns  — Q1 / Q.1 / 1. / 1) / Question 1 …
_QUESTION_SPLIT = re.compile(
    r"(?:^|\n)"                       # start of line
    r"(?:"
    r"Q\.?\s*(\d+)"                   # Q1, Q.1, Q 1
    r"|Question\s+(\d+)"             # Question 1
    r"|(\d+)\s*[.)]\s"               # 1. or 1)
    r")",
    re.IGNORECASE,
)

# Sub-step patterns — Step 1, a), b), i., ii.
_STEP_SPLIT = re.compile(
    r"(?:^|\n)\s*(?:Step\s+(\d+)|([a-z])\)|([ivx]+)\.)\s",
    re.IGNORECASE,
)

# Complexity patterns
_COMPLEXITY_RE = re.compile(r"O\([^)]+\)", re.IGNORECASE)


class StructuringService:
    """Parse raw OCR text into structured Q&A data."""

    def structure_text(self, raw_text: str) -> dict:
        """Main entry point.

        Args:
            raw_text: Plain text from OCR extraction.

        Returns:
            dict matching the StructuredText schema.
        """
        if not raw_text or not raw_text.strip():
            return {
                "questions": [],
                "metadata": {
                    "total_questions": 0,
                    "total_steps": 0,
                    "average_complexity": "N/A",
                },
            }

        question_blocks = self._split_questions(raw_text)

        questions = []
        total_steps = 0

        for q_num, q_block in question_blocks:
            structured_q = self._parse_question(q_num, q_block)
            questions.append(structured_q)
            total_steps += len(structured_q["answer"]["structured_steps"])

        return {
            "questions": questions,
            "metadata": {
                "total_questions": len(questions),
                "total_steps": total_steps,
                "average_complexity": self._average_complexity(questions),
            },
        }

    # ------------------------------------------------------------------
    # Question splitting
    # ------------------------------------------------------------------
    def _split_questions(self, text: str) -> list[tuple[int, str]]:
        """Split text into (question_number, block_text) pairs."""
        matches = list(_QUESTION_SPLIT.finditer(text))

        if not matches:
            # No question markers found → treat entire text as one question
            return [(1, text.strip())]

        blocks: list[tuple[int, str]] = []
        for i, m in enumerate(matches):
            q_num = int(m.group(1) or m.group(2) or m.group(3))
            start = m.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            block = text[start:end].strip()
            if block:
                blocks.append((q_num, block))

        return blocks if blocks else [(1, text.strip())]

    # ------------------------------------------------------------------
    # Single question parsing
    # ------------------------------------------------------------------
    def _parse_question(self, q_num: int, block: str) -> dict:
        """Parse a single question block into structured form."""
        lines = block.split("\n")

        # First line is usually the question text; rest is the answer
        question_text = lines[0].strip() if lines else ""
        answer_text = "\n".join(lines[1:]).strip() if len(lines) > 1 else block.strip()

        # If the first line looks like code or is very short, treat all as answer
        if len(question_text) < 5 or _CODE_INDICATORS.search(question_text):
            question_text = f"Question {q_num}"
            answer_text = block.strip()

        steps = self._extract_steps(answer_text)
        code_blocks = self._extract_code_blocks(answer_text)
        keywords = self._extract_keywords(answer_text)
        complexity = self._detect_complexity(answer_text)

        return {
            "question_number": q_num,
            "question_text": question_text,
            "answer": {
                "raw_text": answer_text,
                "structured_steps": steps,
                "identified_algorithm": None,
                "complexity": complexity,
                "keywords": keywords,
                "code_blocks": code_blocks,
            },
        }

    # ------------------------------------------------------------------
    # Step extraction
    # ------------------------------------------------------------------
    def _extract_steps(self, text: str) -> list[dict]:
        """Detect answer steps (Step 1, a), i., numbered sub-items)."""
        matches = list(_STEP_SPLIT.finditer(text))

        if not matches:
            # No sub-steps → single step from the whole text
            step_type = "code" if _CODE_INDICATORS.search(text) else "explanation"
            return [
                {
                    "step_number": 1,
                    "description": "Answer",
                    "type": step_type,
                    "content": text.strip(),
                }
            ]

        steps: list[dict] = []
        for i, m in enumerate(matches):
            start = m.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            content = text[start:end].strip()
            step_type = "code" if _CODE_INDICATORS.search(content) else "explanation"

            steps.append(
                {
                    "step_number": i + 1,
                    "description": content[:60].rstrip() + ("…" if len(content) > 60 else ""),
                    "type": step_type,
                    "content": content,
                }
            )

        return steps

    # ------------------------------------------------------------------
    # Code block detection
    # ------------------------------------------------------------------
    def _extract_code_blocks(self, text: str) -> list[dict]:
        """Identify code-like regions in the answer text."""
        blocks: list[dict] = []
        lines = text.split("\n")
        code_lines: list[str] = []
        code_start = -1

        for idx, line in enumerate(lines):
            if _CODE_INDICATORS.search(line):
                if not code_lines:
                    code_start = idx + 1
                code_lines.append(line)
            else:
                if code_lines:
                    blocks.append(
                        {
                            "language": "python",  # default assumption
                            "code": "\n".join(code_lines),
                            "line_numbers": {
                                "start": code_start,
                                "end": code_start + len(code_lines) - 1,
                            },
                        }
                    )
                    code_lines = []

        # Flush remaining
        if code_lines:
            blocks.append(
                {
                    "language": "python",
                    "code": "\n".join(code_lines),
                    "line_numbers": {
                        "start": code_start,
                        "end": code_start + len(code_lines) - 1,
                    },
                }
            )

        return blocks

    # ------------------------------------------------------------------
    # Keyword extraction
    # ------------------------------------------------------------------
    def _extract_keywords(self, text: str) -> list[str]:
        """Find CS-related keywords in the text."""
        text_lower = text.lower()
        found = [kw for kw in _CS_KEYWORDS if kw in text_lower]
        return sorted(set(found))

    # ------------------------------------------------------------------
    # Complexity detection
    # ------------------------------------------------------------------
    def _detect_complexity(self, text: str) -> Optional[str]:
        """Look for Big-O notation in the text."""
        m = _COMPLEXITY_RE.search(text)
        return m.group(0) if m else None

    def _average_complexity(self, questions: list[dict]) -> str:
        """Aggregate complexity across questions."""
        complexities = [
            q["answer"]["complexity"]
            for q in questions
            if q["answer"]["complexity"]
        ]
        if not complexities:
            return "N/A"
        return ", ".join(sorted(set(complexities)))


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------
_instance: StructuringService | None = None


def get_structuring_service() -> StructuringService:
    if _instance is None:
        raise RuntimeError("StructuringService not initialised.")
    return _instance


def init_structuring_service() -> StructuringService:
    global _instance
    if _instance is None:
        _instance = StructuringService()
        print("[Structuring] Service ready.")
    return _instance
