/* ================================================================
   BRUCE™ - Unified AI Operations Hub
   Combines: Weekly Review, Steward Chat, Teaching Assistant
   ================================================================ */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, MessageSquare, GraduationCap, Brain } from "lucide-react";
import { LaneBg } from "@/lib/coreImagery";

import WeeklyReviewContent from "./WeeklyReview";
import ChatContent from "./Chat";
import TeachingContent from "./TeachingAssistant";

export default function Bruce() {
  const [activeTab, setActiveTab] = useState("review");

  return (
    <div className="relative min-h-full">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ 
          backgroundImage: `url(${LaneBg.root})`,
          backgroundPosition: "center 30%"
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ 
              backgroundImage: `url(${LaneBg.root2})`,
              backgroundPosition: "center 25%"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        
          <div className="relative z-10 p-6 md:p-8">
            <div className="bg-black/70 border border-cyan-500/40 p-4 md:p-5 backdrop-blur-md inline-block">
              <p className="font-mono text-cyan-400/80 text-xs mb-1 tracking-wider">bruce@wildlands:~$</p>
              <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-cyan-300 uppercase flex items-center gap-3">
                <Brain className="w-7 h-7" />
                BRUCE<span className="text-cyan-500">™</span><span className="cursor-blink">_</span>
              </h2>
              <p className="font-mono text-cyan-400/70 text-xs mt-2 tracking-wide">
                &gt; your personal AI operations hub
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="review" data-testid="tab-review">
              <BarChart3 className="w-4 h-4 mr-2" /> Review
            </TabsTrigger>
            <TabsTrigger value="steward" data-testid="tab-steward">
              <MessageSquare className="w-4 h-4 mr-2" /> Steward
            </TabsTrigger>
            <TabsTrigger value="teaching" data-testid="tab-teaching">
              <GraduationCap className="w-4 h-4 mr-2" /> Teaching
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="review" className="mt-6">
            <WeeklyReviewContent embedded />
          </TabsContent>
          
          <TabsContent value="steward" className="mt-6">
            <ChatContent embedded />
          </TabsContent>
          
          <TabsContent value="teaching" className="mt-6">
            <TeachingContent embedded />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
