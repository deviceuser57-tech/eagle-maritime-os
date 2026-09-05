import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PublicVerify from "./pages/PublicVerify";
import OAuthConsent from "./pages/OAuthConsent";
import NotFound from "./pages/NotFound";
import McpApi from "./pages/McpApi";
import McpTools from "./pages/McpTools";
import Connect from "./pages/Connect";
import Join from "./pages/Join";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/verify" element={<PublicVerify />} />
          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
          <Route path="/mcp-api" element={<McpApi />} />
          <Route path="/mcp-tools" element={<McpTools />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/join" element={<Join />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
