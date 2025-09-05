"use server";

import { coverLetterGenerator } from "@/ai/flows/cover-letter-generator-flow";
import { getCompanyIntelligenceTool } from "@/ai/flows/get-company-intelligence-tool";
import { generateSubmissionEmail } from "@/ai/flows/generate-submission-email";

export async function generateCoverLetterAction(data: {
  companyUrl: string;
  jobTitle?: string;
}) {
  try {
    const [coverLetterResult, companyIntelligence] = await Promise.all([
      coverLetterGenerator({
        companyUrl: data.companyUrl,
        jobTitle: data.jobTitle,
      }),
      getCompanyIntelligenceTool.run({
        companyUrl: data.companyUrl,
      }),
    ]);
    
    return {
      coverLetter: coverLetterResult.coverLetter,
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
