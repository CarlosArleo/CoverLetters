export type CompanyIntelligence = {
  companyName: string;
  companyMission: string;
  keyProjects: string;
};

export type Contact = {
  value: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
};

export type SubmissionEmail = {
  subject: string;
  body: string;
};
