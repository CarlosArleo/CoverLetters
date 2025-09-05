'use client';

import type { CompanyIntelligence, Contact, SubmissionEmail } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AtSign, Copy, Info, Loader2, Mail, Users } from 'lucide-react';
import { Separator } from '../ui/separator';

interface OutreachColumnProps {
  companyIntelligence: CompanyIntelligence | null;
  contacts: Contact[];
  submissionEmail: SubmissionEmail | null;
  isContactsLoading: boolean;
  isEmailLoading: boolean;
  isActionable: boolean;
  onGenerateEmail: () => void;
  copyToClipboard: (text: string, subject: string) => void;
}

export function OutreachColumn({
  companyIntelligence,
  contacts,
  submissionEmail,
  isContactsLoading,
  isEmailLoading,
  isActionable,
  onGenerateEmail,
  copyToClipboard,
}: OutreachColumnProps) {
  const isLoading = isContactsLoading || isEmailLoading;
  return (
    <div className="space-y-8 sticky top-8">
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Info /> Company Intelligence
          </CardTitle>
          <CardDescription>Key details about the target company.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !companyIntelligence ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : companyIntelligence ? (
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">Company Name</h4>
                <p className="text-muted-foreground">{companyIntelligence.companyName}</p>
              </div>
              <div>
                <h4 className="font-semibold">Mission</h4>
                <p className="text-muted-foreground">{companyIntelligence.companyMission}</p>
              </div>
              <div>
                <h4 className="font-semibold">Key Projects</h4>
                <p className="text-muted-foreground">{companyIntelligence.keyProjects}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground py-4">
              Company details will appear here.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Users /> Potential Contacts
          </CardTitle>
          <CardDescription>Key contacts discovered at the company.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isContactsLoading ? (
              <>
                <ContactSkeleton />
                <ContactSkeleton />
                <ContactSkeleton />
              </>
            ) : contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-muted rounded-full p-2">
                     <AtSign className="text-muted-foreground"/>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {contact.first_name && contact.last_name
                        ? `${contact.first_name} ${contact.last_name}`
                        : contact.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{contact.position || 'No position specified'}</p>
                    {contact.first_name && <p className="text-xs text-muted-foreground">{contact.value}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground py-4">
                {isActionable ? 'No contacts found.' : 'Contacts will be shown here after generation.'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Mail /> Submission Email
          </CardTitle>
          <CardDescription>A draft email to send with your application.</CardDescription>
        </CardHeader>
        <CardContent>
          {isEmailLoading ? (
            <div className="space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <br/>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
          ) : submissionEmail ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-semibold">Subject</h4>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(submissionEmail.subject, 'Email subject')}>
                        <Copy className="mr-2"/> Copy
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{submissionEmail.subject}</p>
              </div>
              <Separator/>
              <div>
                <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-semibold">Body</h4>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(submissionEmail.body, 'Email body')}>
                        <Copy className="mr-2"/> Copy
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md whitespace-pre-wrap">{submissionEmail.body}</p>
              </div>
            </div>
          ) : (
             <Button onClick={onGenerateEmail} disabled={!isActionable || isEmailLoading} className="w-full">
                {isEmailLoading && <Loader2 className="animate-spin" />}
                {isEmailLoading ? 'Generating...' : 'Generate Submission Email'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const ContactSkeleton = () => (
    <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
        </div>
    </div>
);
