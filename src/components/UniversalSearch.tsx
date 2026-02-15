import { useState } from 'react';
import { Search } from 'lucide-react';

interface UniversalSearchProps {
  onSearch: (query: string) => void;
}

const UniversalSearch = ({ onSearch }: UniversalSearchProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="sticky top-0 z-30 py-4 mb-8">
      <form onSubmit={handleSubmit} className="relative group max-w-4xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Command Search: Fleet, Crew, Audits or Compliance..."
          className="w-full pl-14 pr-6 py-4 rounded-[2rem] border border-border bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-500 shadow-soft group-hover:shadow-lg font-medium"
        />
        <div className="absolute left-5 top-1/2 transform -translate-y-1/2 p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
          <Search className="h-5 w-5" />
        </div>
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
          <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </form>
    </div>
  );
};

export default UniversalSearch;