"use server";

import { coverLetterGenerator } from "@/ai/flows/cover-letter-generator-flow";
import { getCompanyIntelligenceTool } from "@/ai/flows/get-company-intelligence-tool";
import { generateSubmissionEmail } from "@/ai/flows/generate-submission-email";

export async function generateCoverLetterAction(data: {
  companyUrl: string;
  jobTitle?: string;
}) {
  try {
    // The coverLetterGenerator flow now implicitly uses the necessary tools.
    const result = await coverLetterGenerator({
      companyUrl: data.companyUrl,
      jobTitle: data.jobTitle,
    });
    
    // We still need to get company intelligence separately to display in the UI.
    // The LLM call inside the flow does not return this data to the action.
    const companyIntelligence = await getCompanyIntelligenceTool({
      companyUrl: data.companyUrl,
    });

    return {
      coverLetter: result.coverLetter,
      companyIntelligence,
    };
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter. Please check the URL and try again.");
  }
}

export async function generateEmailAction(data: {
  coverLetter: string;
  jobTitle: string;
  companyName: string;
}) {
  try {
    const email = await generateSubmissionEmail({
      coverLetter: data.coverLetter,
      jobTitle: data.jobTitle,
      companyName: data.companyName,
    });
    return email;
  } catch (error) {
    console.error("Error generating submission email:", error);
    throw new Error("Failed to generate submission email.");
  }
}
