import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

interface SearchEmptyStateProps {
  searchQuery: string;
  suggestions?: string[];
}

const SearchEmptyState = ({ searchQuery, suggestions = [] }: SearchEmptyStateProps) => {
  const defaultSuggestions = ['broccoli', 'tomatoes', 'milk', 'eggs'];
  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <Card className="p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">
        No results for "{searchQuery}"
      </h3>
      
      <p className="text-muted-foreground mb-6">
        We couldn't find '{searchQuery}' near you.
      </p>

      <div className="space-y-3">
        <p className="text-sm font-medium">Try searching for:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {displaySuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => {
                // Handle suggestion click
                window.location.href = `/search?q=${suggestion}`;
              }}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default SearchEmptyState;
