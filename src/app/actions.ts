"use server";

import { coverLetterGenerator } from "@/ai/flows/cover-letter-generator-flow";
import { getCompanyIntelligenceTool } from "@/ai/flows/get-company-intelligence-tool";
import { generateSubmissionEmail } from "@/ai/flows/generate-submission-email";

export async function generateCoverLetterAction(data: {
  companyUrl: string;
  jobTitle?: string;
}) {
  try {
    const result = await coverLetterGenerator({
      companyUrl: data.companyUrl,
      jobTitle: data.jobTitle,
    });

    // We still need to get company intelligence separately to display in the UI.
    // This call should be more resilient now.
    const companyIntelligence = await getCompanyIntelligenceTool({
      companyUrl: data.companyUrl,
    });

    return {
      coverLetter: result.coverLetter,
      companyIntelligence,
    };
  } catch (error: any) {
    console.error("Error generating cover letter:", error);
    // The error message from the tool will now be more specific.
    throw new Error(error.message);
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
  } catch (error: any) {
    console.error("Error generating submission email:", error);
    throw new Error("Failed to generate submission email.");
  }
}
