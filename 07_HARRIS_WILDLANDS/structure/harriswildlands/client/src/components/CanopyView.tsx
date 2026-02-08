import { useState } from "react";
import { thinkopsNodes, getAllTags, type ThinkOpsNode } from "@shared/thinkopsNodes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Leaf, MessageCircle, Zap, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const FORMAT_CONFIG: Record<ThinkOpsNode["format"], { icon: typeof Leaf; color: string; label: string }> = {
  ThoughtNode: { icon: Leaf, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", label: "Thought" },
  ConversationalSwirl: { icon: MessageCircle, color: "text-violet-400 bg-violet-500/10 border-violet-500/30", label: "Conversation" },
  Strand: { icon: Zap, color: "text-amber-400 bg-amber-500/10 border-amber-500/30", label: "Strand" },
};

export function CanopyView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const allTags = getAllTags();

  const filteredNodes = selectedTags.length > 0
    ? thinkopsNodes.filter(node => node.tags.some(tag => selectedTags.includes(tag)))
    : thinkopsNodes;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => setSelectedTags([]);

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="bg-black/60 border border-violet-500/40 p-4 backdrop-blur-sm">
        <p className="font-mono text-violet-400 text-xs mb-1">C:\CANOPY\THINKOPS&gt;</p>
        <h3 className="font-mono font-normal text-xl tracking-tight text-violet-300 uppercase">
          THOUGHT_NODES<span className="animate-pulse">_</span>
        </h3>
        <p className="font-mono text-violet-400/80 text-xs mt-2 tracking-wide">
          &gt; {filteredNodes.length} nodes in canopy view
        </p>
      </div>

      {/* Tag Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-mono">FILTER:</span>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs"
              data-testid="button-clear-filters"
            >
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all",
                selectedTags.includes(tag) && "bg-violet-500/20 border-violet-500/50 text-violet-300"
              )}
              onClick={() => toggleTag(tag)}
              data-testid={`tag-filter-${tag.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Node Cards */}
      <div className="space-y-4">
        {filteredNodes.map(node => {
          const config = FORMAT_CONFIG[node.format];
          const Icon = config.icon;
          const isExpanded = expandedId === node.id;

          return (
            <Collapsible
              key={node.id}
              open={isExpanded}
              onOpenChange={() => setExpandedId(isExpanded ? null : node.id)}
            >
              <Card className="border-border/30 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover-elevate p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn("p-2 rounded-md border", config.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-medium leading-tight mb-1">
                            {node.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground italic line-clamp-2">
                            "{node.excerpt}"
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span className="font-mono">{format(new Date(node.date), "MMM d, yyyy")}</span>
                            <span className="opacity-50">|</span>
                            <span>{node.speaker}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform shrink-0",
                        isExpanded && "rotate-180"
                      )} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 px-4">
                    <div className="border-t border-border/30 pt-4 space-y-4">
                      {/* Full Transcription */}
                      <div className="bg-muted/30 rounded-md p-4 font-mono text-sm leading-relaxed">
                        {node.transcription}
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                        {node.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Related Node */}
                      <div className="text-xs text-muted-foreground font-mono">
                        <span className="opacity-60">Related:</span> {node.relatedNode}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}

        {filteredNodes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Leaf className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-mono text-sm">No nodes match the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
