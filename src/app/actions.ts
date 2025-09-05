"use server";

import { coverLetterGenerator } from "@/ai/flows/cover-letter-generator-flow";
import { generateSubmissionEmail } from "@/ai/flows/generate-submission-email";

export async function generateCoverLetterAction(data: {
  companyUrl: string;
  jobTitle?: string;
}) {
  try {
    // The main flow now handles everything and returns all necessary data.
    const result = await coverLetterGenerator({
      companyUrl: data.companyUrl,
      jobTitle: data.jobTitle,
    });
    
    // Check if the company intelligence step returned an error and throw it to the client.
    if (result.companyIntelligence.companyName === 'Error') {
      throw new Error(result.companyIntelligence.companyMission);
    }

    return {
      coverLetter: result.coverLetter,
      companyIntelligence: result.companyIntelligence,
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
