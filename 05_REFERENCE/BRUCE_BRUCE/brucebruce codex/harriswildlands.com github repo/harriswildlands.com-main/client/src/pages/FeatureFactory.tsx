import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Hammer, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type FeatureRequest = {
    id: number;
    title: string;
    spec: string;
    generatedSchema?: string;
    generatedApi?: string;
    generatedUi?: string;
    status: "draft" | "generating" | "completed" | "error";
    createdAt: string;
};

export default function FeatureFactory() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [spec, setSpec] = useState("");

    const { data: requests, isLoading } = useQuery<FeatureRequest[]>({
        queryKey: ["/api/features"],
    });

    const generateMutation = useMutation({
        mutationFn: async (data: { title: string; spec: string }) => {
            const res = await apiRequest("POST", "/api/features/generate", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/features"] });
            toast({
                title: "Feature Generation Started",
                description: "The Ouroboros is weaving your code. This may take a minute...",
            });
            setTitle("");
            setSpec("");
        },
        onError: (error) => {
            toast({
                title: "Generation Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !spec) return;
        generateMutation.mutate({ title, spec });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: `${label} code copied to clipboard.`,
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                    <Hammer className="w-8 h-8" />
                    Feature Factory
                </h1>
                <p className="text-muted-foreground">
                    The Content-to-Code Ouroboros. Describe a feature, and I will generate the Schema, API, and UI code for you.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Input Form */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>New Feature Request</CardTitle>
                        <CardDescription>
                            Be specific about data types and UI requirements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Feature Title</label>
                                <Input
                                    placeholder="e.g., Simple Habit Tracker"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={generateMutation.isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Specification</label>
                                <Textarea
                                    placeholder="Describe the feature: 'I need a table to track daily water intake with a goal of 8 cups...'"
                                    className="min-h-[200px]"
                                    value={spec}
                                    onChange={(e) => setSpec(e.target.value)}
                                    disabled={generateMutation.isPending}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={generateMutation.isPending || !title || !spec}
                            >
                                {generateMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Weaving Code...
                                    </>
                                ) : (
                                    "Generate Code"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Requests List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Requests</h2>
                    {isLoading ? (
                        <div className="text-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : requests?.length === 0 ? (
                        <div className="text-center p-8 border rounded-lg border-dashed text-muted-foreground">
                            No features generated yet. Start the machine.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests?.map((req) => (
                                <FeatureCard key={req.id} req={req} onCopy={copyToClipboard} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ req, onCopy }: { req: FeatureRequest; onCopy: (text: string, label: string) => void }) {
    return (
        <Card className={`overflow-hidden transition-all ${req.status === 'completed' ? 'border-primary/20' : ''}`}>
            <CardHeader className="bg-muted/30 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{req.title}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${req.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                            req.status === 'generating' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10'
                        }`}>
                        {req.status}
                    </span>
                </div>
                <CardDescription className="line-clamp-2 text-xs">{req.spec}</CardDescription>
            </CardHeader>

            {req.status === 'completed' && (
                <CardContent className="p-0">
                    <Tabs defaultValue="schema" className="w-full">
                        <TabsList className="w-full rounded-none border-b bg-transparent p-0 h-auto">
                            <TabsTrigger value="schema" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-2 text-xs">Schema</TabsTrigger>
                            <TabsTrigger value="api" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-2 text-xs">API</TabsTrigger>
                            <TabsTrigger value="ui" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-2 text-xs">React UI</TabsTrigger>
                        </TabsList>

                        <div className="relative group">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm"
                                onClick={() => {
                                    // Copy currently active tab content - simplified for this demo to just copy what's visible
                                    // In a real app we'd track active tab state here or pass pure strings
                                }}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>

                            <TabsContent value="schema" className="m-0">
                                <CodeBlock code={req.generatedSchema} label="Schema" onCopy={onCopy} />
                            </TabsContent>
                            <TabsContent value="api" className="m-0">
                                <CodeBlock code={req.generatedApi} label="API" onCopy={onCopy} />
                            </TabsContent>
                            <TabsContent value="ui" className="m-0">
                                <CodeBlock code={req.generatedUi} label="UI" onCopy={onCopy} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            )}
        </Card>
    );
}

function CodeBlock({ code, label, onCopy }: { code?: string; label: string; onCopy: (t: string, l: string) => void }) {
    if (!code) return <div className="p-4 text-xs text-muted-foreground italic">No code generated</div>;

    return (
        <div className="relative">
            <ScrollArea className="h-[200px] w-full bg-slate-950 dark:bg-black p-4">
                <pre className="text-[10px] font-mono leading-relaxed text-slate-50">
                    {code}
                </pre>
            </ScrollArea>
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-xs h-6 bg-white/10 hover:bg-white/20 text-white"
                onClick={() => onCopy(code, label)}
            >
                <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
        </div>
    );
}
