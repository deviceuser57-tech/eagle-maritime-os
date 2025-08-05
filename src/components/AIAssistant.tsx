import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! How can I help you with your fleet compliance data today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getAIResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('vessel') || lowerQuery.includes('ship')) {
      return 'I can help you with vessel information. You currently have 22 vessels in your fleet. Would you like me to show compliance status, upcoming inspections, or specific vessel details?';
    }
    
    if (lowerQuery.includes('compliance') || lowerQuery.includes('certificate')) {
      return 'Your fleet has a 93% compliance rate. I can provide details on expiring certificates, compliance gaps, or help you plan upcoming renewals. What specific compliance information do you need?';
    }
    
    if (lowerQuery.includes('audit') || lowerQuery.includes('finding')) {
      return 'You have 8 active audits and 14 open findings (7 critical, 7 minor). I can break down findings by vessel, track corrective actions, or help prioritize responses. What would you like to focus on?';
    }
    
    if (lowerQuery.includes('crew') || lowerQuery.includes('training')) {
      return 'I can provide crew certification status, training schedules, and medical fitness reports. Would you like me to check for expiring certifications or upcoming training requirements?';
    }
    
    return 'I can help you with vessel management, compliance tracking, audit findings, crew certifications, and generating reports. Please ask me about any specific area you\'d like to explore.';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">✨ AI Assistant</h2>
        <p className="text-muted-foreground">
          Your intelligent partner for navigating complex compliance data and generating actionable insights.
        </p>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Fleet Compliance Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Chat Window */}
          <div className="h-96 overflow-y-auto p-4 bg-muted/50 rounded-lg mb-4 border space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg rounded-lg px-4 py-2 flex items-start space-x-2 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  {message.type === 'bot' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                  <span className="text-sm">{message.content}</span>
                  {message.type === 'user' && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-lg px-4 py-2 flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about vessels, projects, or certifications..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setInput('Show me vessels with expiring certificates')}
        >
          <div className="text-2xl">📋</div>
          <span className="text-sm">Certificate Status</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setInput('What audits are due this month?')}
        >
          <div className="text-2xl">🗓️</div>
          <span className="text-sm">Audit Schedule</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setInput('Show compliance summary report')}
        >
          <div className="text-2xl">📊</div>
          <span className="text-sm">Compliance Report</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setInput('List critical findings that need attention')}
        >
          <div className="text-2xl">⚠️</div>
          <span className="text-sm">Critical Issues</span>
        </Button>
      </div>
    </div>
  );
};

export default AIAssistant;