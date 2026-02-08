import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";

import Dashboard from "@/pages/Dashboard";
import LifeOps from "@/pages/LifeOps";
import Goals from "@/pages/Goals";
import ThinkOps from "@/pages/ThinkOps";
import Bruce from "@/pages/Bruce";
import Lab from "@/pages/Lab";
import HarrisWildlands from "@/pages/HarrisWildlands";
import FeatureFactory from "@/pages/FeatureFactory";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/life" component={LifeOps} />
        <Route path="/goals" component={Goals} />
        <Route path="/think" component={ThinkOps} />
        <Route path="/bruce" component={Bruce} />
        <Route path="/lab" component={Lab} />
        <Route path="/harris" component={HarrisWildlands} />
        <Route path="/features" component={FeatureFactory} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
