# The Logic of the Strategic Application Engine

The cover letter generator is not a simple template-filler. It's a sophisticated AI agent designed to act as a world-class career strategist. It works by performing a "corporate soul" analysis of a potential employer and then masterfully weaving that intelligence together with a deep understanding of your professional narrative.

Here is the step-by-step breakdown of the logic:

1.  **Dual-Source Profile Ingestion:** The process begins without you having to input anything about yourself. The AI agent automatically reads and synthesizes your professional identity from two key files in your project:
    *   `docs/CV/CV.md`: For your detailed work history, skills, and project experience.
    *   `docs/CV/Research.md`: For your higher-level strategic narrative, unique methodologies, and thought leadership.
    This gives the AI a rich, multi-layered understanding of who you are and the unique value you bring.

2.  **Multi-Pronged Company Intelligence Gathering:** When you provide a job URL, the AI initiates a deep intelligence-gathering operation using a dedicated software tool (`getCompanyIntelligenceTool`). This tool:
    *   Identifies the company's homepage, "About Us" page, and, crucially, any pages related to "sustainability," "impact," or "regenerative design."
    *   It scrapes the content from these key pages.
    *   It then uses another AI prompt to perform a targeted extraction, pulling out only the most important facts: the official company name, its core mission, and a list of specific, named projects or initiatives. This avoids "polluting" the final prompt with irrelevant text.

3.  **Strategic Synthesis & Narrative Weaving:** The AI now has all the raw materials. The main `letterWritingPrompt` is activated with a specific persona: "You are an expert career coach acting as a 'Regenerative Strategist'." It is given your complete profile, the validated company intelligence, and the job description. Its core task is to **find the golden thread** connecting your specific experiences (e.g., your work on the "RDI Platform") to the company's specific projects and mission. It then writes a complete, ready-to-send cover letter that tells a compelling story about this unique alignment.

4.  **Automated Contact Discovery:** After the letter is generated, the system automatically uses the company's domain to query the Hunter.io API, presenting a list of potential contacts at the company to whom you could address your application.

5.  **Final Email Generation:** As a final step, it can take the generated cover letter and the list of potential contacts and draft a concise, professional submission email, ready for you to send.

This entire workflow is designed to automate the work of a highly skilled researcher and strategist, allowing you to produce a world-class, deeply personalized application in minutes.