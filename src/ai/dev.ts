import { config } from 'dotenv';
config();

// Ensure you have the required imports for your tools and flows.
// The coverLetterGeneratorFlow now implicitly uses getCompanyIntelligenceTool and the new getJobDescriptionTool.
import '@/ai/flows/cover-letter-generator-flow.ts';
import '@/ai/flows/generate-submission-email.ts';
