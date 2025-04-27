import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Workspace from "@/pages/workspace";
import Project from "@/pages/project";
import Chat from "@/pages/chat";
import Search from "@/pages/search";
import { ThemeProvider } from "next-themes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/workspace/:id" component={Workspace} />
      <Route path="/project/:id" component={Project} />
      <Route path="/project/:projectId/chat/:chatId" component={Chat} />
      <Route path="/search" component={Search} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Layout>
            <Toaster />
            <Router />
          </Layout>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
