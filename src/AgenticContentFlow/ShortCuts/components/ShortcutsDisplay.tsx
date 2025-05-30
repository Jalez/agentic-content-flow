/** @format */
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useShortcutsRegistry } from "../registry/shortcutsRegistry";

interface ShortcutsDisplayProps {
  className?: string;
  showCategories?: boolean;
  maxShortcuts?: number;
}

/**
 * Component that displays registered keyboard shortcuts
 * Uses the shortcuts registry to automatically show all registered shortcuts
 */
const ShortcutsDisplay: React.FC<ShortcutsDisplayProps> = ({
  className,
  showCategories = true,
  maxShortcuts = 20,
}) => {
  const { getAllShortcuts, getShortcutCategories } = useShortcutsRegistry();
  const [showAll, setShowAll] = useState(false);

  const allShortcuts = getAllShortcuts();
  const categories = getShortcutCategories();

  // Filter enabled shortcuts
  const enabledShortcuts = allShortcuts.filter(shortcut => shortcut.enabled !== false);
  
  // Limit shortcuts displayed
  const displayedShortcuts = showAll 
    ? enabledShortcuts 
    : enabledShortcuts.slice(0, maxShortcuts);

  if (enabledShortcuts.length === 0) {
    return (
      <div className={cn(
        "absolute bottom-5 left-5 bg-background p-3 rounded-md text-sm",
        "max-w-[250px] shadow-md z-10 border border-border",
        className
      )}>
        <h2 className="text-lg font-semibold mb-2">Keyboard Shortcuts</h2>
        <p className="text-muted-foreground text-sm">No shortcuts registered</p>
      </div>
    );
  }

  const formatKeyCombo = (keyCombo: string) => {
    return keyCombo
      .split('+')
      .map(key => key.trim())
      .map(key => {
        // Replace common key names with symbols or better formatting
        switch (key.toLowerCase()) {
          case 'ctrl':
          case 'control':
            return '⌃';
          case 'cmd':
          case 'meta':
            return '⌘';
          case 'shift':
            return '⇧';
          case 'alt':
            return '⌥';
          case 'space':
            return 'Space';
          case 'esc':
          case 'escape':
            return 'Esc';
          default:
            return key.toUpperCase();
        }
      })
      .join(' + ');
  };

  const renderShortcutsByCategory = () => {
    return categories.map(category => {
      const categoryShortcuts = displayedShortcuts.filter(s => s.category === category);
      if (categoryShortcuts.length === 0) return null;

      return (
        <div key={category} className="mb-3 last:mb-0">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {category}
          </h3>
          <ul className="space-y-1">
            {categoryShortcuts.map((shortcut) => (
              <li key={`${shortcut.category}-${shortcut.name}`} className="text-sm">
                <span className="font-medium text-primary">
                  {formatKeyCombo(shortcut.keyCombo)}
                </span>
                <span className="text-muted-foreground">: {shortcut.description}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    });
  };

  const renderShortcutsFlat = () => {
    return (
      <ul className="space-y-1">
        {displayedShortcuts.map((shortcut) => (
          <li key={`${shortcut.category}-${shortcut.name}`} className="text-sm">
            <span className="font-medium text-primary">
              {formatKeyCombo(shortcut.keyCombo)}
            </span>
            <span className="text-muted-foreground">: {shortcut.description}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={cn(
      "absolute bottom-5 left-5 bg-background p-3 rounded-md text-sm",
      "max-w-[300px] shadow-md z-10 border border-border",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
        {enabledShortcuts.length > maxShortcuts && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAll ? 'Show Less' : `Show All (${enabledShortcuts.length})`}
          </button>
        )}
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {showCategories ? renderShortcutsByCategory() : renderShortcutsFlat()}
      </div>
      
      {!showAll && enabledShortcuts.length > maxShortcuts && (
        <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
          Showing {displayedShortcuts.length} of {enabledShortcuts.length} shortcuts
        </div>
      )}
    </div>
  );
};

export default ShortcutsDisplay;