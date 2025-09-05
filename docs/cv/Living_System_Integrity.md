# The Living System: A Guide to Project Integrity

## I. Core Philosophy: The Agentic, Regenerative Workflow

This document serves as the architectural constitution for the Strategic Application Engine. Its purpose is to record the core principles that ensure the application's stability, resilience, and strategic intelligence. The system is not merely a set of scripts; it is a "living system," an agentic workflow designed to emulate the process of a human career strategist.

The fundamental principle is **resilience over fragility**. The system is designed to gracefully handle unpredictable real-world conditions (like inaccessible URLs or unexpected website layouts) without crashing. It must always attempt to produce a useful output, even if it has incomplete information. This resilience is the key to its "living" nature.

## II. The Chain of Command: Flow & Tool Architecture

The system's logic is executed in a precise, hierarchical chain of command. Understanding this sequence is critical to maintaining its integrity.

1.  **The Action Handler (`src/app/actions.ts`)**: This is the user-facing entry point. Its **only** job is to call the primary flow (`coverLetterGenerator`) and handle the final success or failure state. It **must not** contain complex logic or call individual tools directly, as this was the source of previous instability.

2.  **The Primary Orchestrator (`coverLetterGeneratorFlow`)**: This is the "brain" of the operation. It is responsible for orchestrating the entire sequence of events:
    *   **Ingestion:** It first reads the user's core identity from the `cv.md` and `research.md` files.
    *   **Tool Execution:** It then calls the necessary tools (`getCompanyIntelligenceTool`, `getJobDescriptionTool`) to gather external information.
    *   **Synthesis:** Finally, it passes all the gathered information—the user's profile and the results from the tools (including any potential error messages)—to the final `letterWritingPrompt`.

3.  **The Specialist Tools (`getCompanyIntelligenceTool`, `getJobDescriptionTool`)**: These are the "hands" of the operation. Their sole responsibility is to interact with the outside world (i.e., scrape websites).
    *   **Robust Error Handling:** A critical part of their design is their internal `try/catch` blocks. They are designed **never to crash**. If they fail to fetch or parse data, they must not throw an error. Instead, they must return a structured JSON object with a clear, human-readable error message in their fields (e.g., `companyName: "Error: URL Not Found"`). This is the cornerstone of the system's resilience.

4.  **The Final Reasoner (`letterWritingPrompt`)**: This is the expert writer. Its prompt is engineered to be "intelligent" about the data it receives.
    *   **Conditional Logic:** The prompt explicitly instructs the AI to first check if the data from the tools contains error messages.
    *   **Graceful Degradation:** If errors are found, the AI is instructed to acknowledge the missing information and write the best possible cover letter using the data it *does* have (the user's profile). This ensures that a failure in a secondary system (like web scraping) does not cause a failure in the primary mission (writing a cover letter).

## III. The Constitution: Principles for Maintaining Integrity

To ensure this project remains stable and functional, any future modifications must adhere to the following principles:

1.  **Maintain the Chain of Command:** Do not add complex logic or direct tool calls to the `actions.ts` file. All orchestration must happen within the primary flow.
2.  **Tools Must Be Resilient:** Any new tool that interacts with external services **must** have robust internal error handling and return structured error messages instead of throwing errors.
3.  **Prompts Must Be Error-Aware:** Any prompt that consumes data from a fallible tool must be explicitly instructed on how to handle the error states of that tool.
4.  **The User Interface Displays, It Does Not Decide:** The UI should react to the final state provided by the `actions.ts` file. It should not contain complex decision-making logic.

By adhering to this architectural blueprint, the Strategic Application Engine will remain a robust, reliable, and intelligent "living system."