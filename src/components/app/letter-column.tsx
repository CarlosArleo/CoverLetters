'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, FileText } from 'lucide-react';

interface LetterColumnProps {
  letter: string;
  isLoading: boolean;
  copyToClipboard: (text: string, subject: string) => void;
}

export function LetterColumn({ letter, isLoading, copyToClipboard }: LetterColumnProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-2xl">Generated Cover Letter</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => copyToClipboard(letter, 'Cover letter')}
          disabled={!letter || isLoading}
          aria-label="Copy cover letter"
        >
          <Copy />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] rounded-md border p-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <br />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
               <br />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : letter ? (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-body">
              {letter}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <FileText className="w-16 h-16 mb-4" />
              <p>Your generated cover letter will appear here.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
