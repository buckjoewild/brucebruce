import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Settings as SettingsIcon, Key, Copy, Trash2, Plus, AlertTriangle } from "lucide-react";
import { isDemoMode } from "@/hooks/use-auth";
import { demoSettings, demoLogs, demoIdeas, demoGoals, demoCheckins, demoTeachingRequests, demoContent } from "@/hooks/use-demo";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ApiTokenInfo {
  id: number;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  preview: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [tokenName, setTokenName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  
  const tokensQuery = useQuery<ApiTokenInfo[]>({
    queryKey: ['/api/settings/tokens'],
    enabled: !isDemoMode()
  });
  
  const createTokenMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('/api/settings/tokens', 'POST', { name });
      return response;
    },
    onSuccess: (data: any) => {
      setNewToken(data.token);
      setTokenName("");
      queryClient.invalidateQueries({ queryKey: ['/api/settings/tokens'] });
      toast({ title: "Token Created", description: "Copy it now - you won't see it again!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create token", variant: "destructive" });
    }
  });
  
  const revokeTokenMutation = useMutation({
    mutationFn: async (tokenId: number) => {
      await apiRequest(`/api/settings/tokens/${tokenId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/tokens'] });
      toast({ title: "Token Revoked", description: "The token has been permanently revoked." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to revoke token", variant: "destructive" });
    }
  });
  
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Token copied to clipboard" });
  };
  
  const handleExportData = async () => {
    try {
      if (isDemoMode()) {
        const exportData = {
          exportDate: new Date().toISOString(),
          version: "1.0.0",
          data: {
            logs: demoLogs,
            ideas: demoIdeas,
            goals: demoGoals,
            checkins: demoCheckins,
            teachingRequests: demoTeachingRequests,
            harrisContent: demoContent,
            settings: demoSettings
          }
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bruceops-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Demo Export", description: "Demo data exported successfully." });
        return;
      }
      
      const response = await fetch('/api/export/data');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bruceops-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Export Complete", description: "Your data has been downloaded." });
    } catch (error) {
      toast({ title: "Export Failed", description: "Could not export data.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold">Settings</h2>
          <p className="text-muted-foreground">Configure BruceOps behavior.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Model Configuration</CardTitle>
          <CardDescription>Adjust how Bruce responds to your requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preferred Model</Label>
            <Select defaultValue="gpt-4o-mini">
              <SelectTrigger data-testid="select-model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o (Balanced)</SelectItem>
                <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet (Creative)</SelectItem>
                <SelectItem value="o1-preview">o1 Preview (Reasoning)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bruce's Tone</Label>
            <Select defaultValue="direct">
              <SelectTrigger data-testid="select-tone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct & Professional</SelectItem>
                <SelectItem value="socratic">Socratic & Questioning</SelectItem>
                <SelectItem value="empathetic">Empathetic & Supportive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button data-testid="button-save-settings">Save Preferences</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Export or manage your personal data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download all your BruceOps data including logs, ideas, goals, check-ins, teaching requests, and generated content.
          </p>
          <Button 
            variant="outline" 
            onClick={handleExportData}
            data-testid="button-export-data"
          >
            <Download className="w-4 h-4 mr-2" />
            Download My Data (JSON)
          </Button>
        </CardContent>
      </Card>

      {!isDemoMode() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Tokens
            </CardTitle>
            <CardDescription>
              Generate tokens to access BruceOps from Claude Desktop or other tools via the MCP server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {newToken && (
              <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Copy this token now - you won't see it again!</span>
                </div>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-background rounded text-xs break-all font-mono">
                    {newToken}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(newToken)}
                    data-testid="button-copy-token"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setNewToken(null)}
                  data-testid="button-dismiss-token"
                >
                  I've saved it
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                placeholder="Token name (e.g., Claude Desktop)"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                data-testid="input-token-name"
              />
              <Button
                onClick={() => createTokenMutation.mutate(tokenName || "Unnamed Token")}
                disabled={createTokenMutation.isPending}
                data-testid="button-create-token"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Token
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Active Tokens</Label>
              {tokensQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading tokens...</p>
              ) : tokensQuery.data?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tokens yet. Create one to use with Claude Desktop.</p>
              ) : (
                <div className="space-y-2">
                  {tokensQuery.data?.map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-3 rounded-md border bg-muted/30"
                      data-testid={`token-row-${token.id}`}
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{token.name}</div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-mono">{token.preview}</span>
                          {" | "}
                          Created: {new Date(token.createdAt).toLocaleDateString()}
                          {token.lastUsed && (
                            <> | Last used: {new Date(token.lastUsed).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => revokeTokenMutation.mutate(token.id)}
                        disabled={revokeTokenMutation.isPending}
                        data-testid={`button-revoke-token-${token.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About BruceOps</CardTitle>
          <CardDescription>System information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Mode:</strong> {isDemoMode() ? 'Demo Mode (data not persisted)' : 'Full Mode'}</p>
          <p><strong>Theme:</strong> Botanical Sci-Fi (Field/Lab/Sanctuary)</p>
        </CardContent>
      </Card>
    </div>
  );
}
