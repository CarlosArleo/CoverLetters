'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateCoverLetterAction, generateEmailAction } from '@/app/actions';
import type { CompanyIntelligence, Contact, SubmissionEmail } from '@/lib/types';
import { InputColumn } from './input-column';
import { LetterColumn } from './letter-column';
import { OutreachColumn } from './outreach-column';

export function CoverCraftApp() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isContactsLoading, setIsContactsLoading] = useState(false);

  const [companyUrl, setCompanyUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [companyIntelligence, setCompanyIntelligence] = useState<CompanyIntelligence | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [submissionEmail, setSubmissionEmail] = useState<SubmissionEmail | null>(null);

  const handleGenerateApplication = async (data: { companyUrl: string; jobTitle?: string }) => {
    setIsLoading(true);
    setIsContactsLoading(true);
    setCoverLetter('');
    setContacts([]);
    setSubmissionEmail(null);
    setCompanyIntelligence(null);
    setCompanyUrl(data.companyUrl);
    setJobTitle(data.jobTitle || '');

    try {
      const result = await generateCoverLetterAction(data);
      setCoverLetter(result.coverLetter);
      setCompanyIntelligence(result.companyIntelligence);
      toast({ title: "Success", description: "Cover letter generated." });

      // Fetch contacts after getting company intelligence
      try {
        const url = new URL(data.companyUrl);
        const domain = url.hostname.replace(/^www\./, '');
        const response = await fetch(`/api/hunter/find-emails?domain=${domain}`);
        if (!response.ok) throw new Error('Failed to fetch contacts');
        const contactsData = await response.json();
        setContacts(contactsData.data.emails);
      } catch (e) {
        console.error("Could not fetch contacts:", e);
        toast({
          variant: 'destructive',
          title: 'Contact Discovery Failed',
          description: 'Could not fetch contacts for the provided domain.',
        });
      }

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      setIsContactsLoading(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!coverLetter || !companyIntelligence?.companyName) return;

    setIsEmailLoading(true);
    try {
      const result = await generateEmailAction({
        coverLetter,
        jobTitle,
        companyName: companyIntelligence.companyName,
      });
      setSubmissionEmail(result);
      toast({ title: "Success", description: "Submission email generated." });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Email Generation Failed',
        description: error.message,
      });
    } finally {
      setIsEmailLoading(false);
    }
  };
  
  const copyToClipboard = (text: string, subject: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to Clipboard',
        description: `${subject} has been copied.`,
      });
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">
      <div className="lg:col-span-3">
        <InputColumn onSubmit={handleGenerateApplication} isLoading={isLoading} />
      </div>
      <div className="lg:col-span-5">
        <LetterColumn 
          letter={coverLetter} 
          isLoading={isLoading} 
          copyToClipboard={copyToClipboard}
        />
      </div>
      <div className="lg:col-span-4">
        <OutreachColumn
          companyIntelligence={companyIntelligence}
          contacts={contacts}
          submissionEmail={submissionEmail}
          isContactsLoading={isContactsLoading}
          isEmailLoading={isEmailLoading}
          onGenerateEmail={handleGenerateEmail}
          copyToClipboard={copyToClipboard}
          isActionable={!!coverLetter}
        />
      </div>
    </div>
  );
}
