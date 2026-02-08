/* ================================================================
   TEACHING ASSISTANT - Work Lane
   Curriculum, lesson plans, assessments
   Visual: Knowledge tree constellation
   ================================================================ */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeachingRequestSchema } from "@shared/schema";
import { useCreateTeachingRequest, useTeachingRequests } from "@/hooks/use-bruce-ops";
import { z } from "zod";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, GraduationCap, FileText, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import { LaneBg } from "@/lib/coreImagery";

type TeachingFormValues = z.infer<typeof insertTeachingRequestSchema>;

interface TeachingProps {
  embedded?: boolean;
}

export default function TeachingAssistant({ embedded = false }: TeachingProps) {
  const { data: requests, isLoading } = useTeachingRequests();
  const { mutate: createRequest, isPending } = useCreateTeachingRequest();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const form = useForm<TeachingFormValues>({
    resolver: zodResolver(insertTeachingRequestSchema),
    defaultValues: {
      format: "Lesson Plan",
      assessmentType: "Quiz"
    }
  });

  const onSubmit = (data: TeachingFormValues) => {
    createRequest(data, {
      onSuccess: () => form.reset()
    });
  };

  const renderContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4">
        <Card className="overflow-hidden border-border/30 bg-card/80 backdrop-blur-sm">
          <CardHeader className="border-b border-border/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Recent Requests
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-3">
              {isLoading && <Loader2 className="animate-spin mx-auto" />}
              {!requests?.length && !isLoading && (
                <p className="text-sm text-muted-foreground text-center py-8">No requests yet</p>
              )}
              {requests?.map((req) => (
                <div 
                  key={req.id} 
                  onClick={() => setSelectedRequest(req)}
                  className="p-3 rounded-lg border border-border/30 hover:border-amber-500/30 hover:bg-amber-500/5 cursor-pointer transition-colors group"
                  data-testid={`card-request-${req.id}`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="font-medium truncate">{req.topic}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {req.createdAt ? format(new Date(req.createdAt), "MMM d") : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">{req.grade}</span>
                    <span>{req.standard}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      <div className="lg:col-span-8 space-y-6">
        {selectedRequest ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all" onClick={() => setSelectedRequest(null)} data-testid="button-back">
              <ChevronRight className="rotate-180 w-4 h-4 mr-2" /> Back to Form
            </Button>
            
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
              <CardHeader className="border-b border-border/20 bg-secondary/10">
                <div className="flex justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="font-display text-2xl">{selectedRequest.topic}</CardTitle>
                    <CardDescription>
                      {selectedRequest.grade} - {selectedRequest.standard} - {selectedRequest.timeBlock}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.print()} data-testid="button-export">
                    <FileText className="w-4 h-4 mr-2" /> Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-secondary/20 p-4 rounded-lg">
                  {selectedRequest.output 
                    ? JSON.stringify(selectedRequest.output, null, 2) 
                    : "Generating..."}
                </pre>
              </CardContent>
            </Card>
          </div>
        ) : (
          <CardWithBotanical>
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  New Material Request
                </CardTitle>
                <CardDescription>Bruce will analyze standards and create aligned content.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Grade Level</Label>
                      <Input {...form.register("grade")} placeholder="e.g. 5th Grade" data-testid="input-grade" />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject / Standard</Label>
                      <Input {...form.register("standard")} placeholder="e.g. NGSS-5-PS1-1" data-testid="input-standard" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Topic</Label>
                    <Input {...form.register("topic")} placeholder="e.g. Properties of Matter" data-testid="input-topic" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Time Block</Label>
                      <Input {...form.register("timeBlock")} placeholder="e.g. 45 mins" data-testid="input-time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select onValueChange={(v) => form.setValue("format", v)} defaultValue="Lesson Plan">
                        <SelectTrigger data-testid="select-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lesson Plan">Lesson Plan</SelectItem>
                          <SelectItem value="Worksheet">Worksheet</SelectItem>
                          <SelectItem value="Quiz">Quiz</SelectItem>
                          <SelectItem value="Project">Project Guide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Student Profile / Accommodations</Label>
                    <Textarea {...form.register("studentProfile")} placeholder="Any specific needs?" data-testid="textarea-profile" />
                  </div>

                  <div className="space-y-2">
                    <Label>Materials Available</Label>
                    <Input {...form.register("materials")} placeholder="e.g. Paper, scissors, basic lab kit" data-testid="input-materials" />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isPending} data-testid="button-generate">
                    {isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Materials...</>
                    ) : (
                      <><GraduationCap className="mr-2 h-5 w-5" /> Generate with Bruce</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </CardWithBotanical>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Teaching Assistant</h3>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ backgroundImage: `url(${LaneBg.trunk2})`, backgroundPosition: "center 30%" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${LaneBg.trunk})`, backgroundPosition: "center 40%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        
          <div className="relative z-10 p-6 md:p-8">
            <div className="bg-black/70 border border-teal-500/40 p-4 md:p-5 backdrop-blur-md inline-block">
              <p className="font-mono text-teal-400/80 text-xs mb-1 tracking-wider">lab@trunk:~$</p>
              <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-teal-300 uppercase">
                TEACHING_ASSISTANT<span className="cursor-blink">_</span>
              </h2>
              <p className="font-mono text-teal-400/70 text-xs mt-2 tracking-wide">
                &gt; work channel // curriculum &amp; lesson plans
              </p>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
