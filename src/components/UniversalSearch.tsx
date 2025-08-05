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
    <div className="sticky top-0 z-10 py-4 mb-6 bg-transparent backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search across all data..."
          className="w-full pl-12 pr-4 py-3 rounded-full border border-input bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </form>
    </div>
  );
};

export default UniversalSearch;