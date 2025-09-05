'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  companyUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  jobTitle: z.string().optional(),
});

type InputFormValues = z.infer<typeof formSchema>;

interface InputColumnProps {
  onSubmit: (data: InputFormValues) => void;
  isLoading: boolean;
}

export function InputColumn({ onSubmit, isLoading }: InputColumnProps) {
  const form = useForm<InputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyUrl: '',
      jobTitle: '',
    },
  });

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Input</CardTitle>
        <CardDescription>Provide the job details to start.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Website or Job Posting URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/careers/job" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Senior Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              {isLoading ? 'Generating...' : 'Generate Application'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
