# Shortcuts Registry System

A decoupled, registry-based keyboard shortcuts system for React applications. This system allows components to register actions with specific key combinations without being tightly coupled to other components.

## Features

- **Registry-based**: Components can register/unregister shortcuts dynamically
- **Decoupled**: No dependencies on other contexts or systems
- **Categorized**: Shortcuts can be organized into categories
- **Automatic handling**: Global keyboard event handling
- **Type-safe**: Full TypeScript support
- **Flexible**: Support for complex key combinations

## Quick Start

### 1. Wrap your app with ShortcutsManager

```tsx
import { ShortcutsManager } from './ShortCuts';

function App() {
  return (
    <ShortcutsManager>
      <YourMainComponent />
    </ShortcutsManager>
  );
}
```

### 2. Register shortcuts in any component

```tsx
import { useEffect } from 'react';
import { registerShortcut, unregisterShortcut, DEFAULT_SHORTCUT_CATEGORIES } from './ShortCuts';

function MyComponent() {
  useEffect(() => {
    // Register a shortcut
    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION,
      'my-action',
      'Ctrl+M',
      () => console.log('My action triggered!'),
      'My custom action'
    );

    // Cleanup
    return () => {
      unregisterShortcut(DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION, 'my-action');
    };
  }, []);

  return <div>My Component</div>;
}
```

## API Reference

### Registry Functions

#### `registerShortcut(category, name, keyCombo, action, description, enabled?, order?)`

Register a new keyboard shortcut.

- `category`: Shortcut category (string)
- `name`: Unique name for the shortcut within its category
- `keyCombo`: Key combination (e.g., "Ctrl+F", "Shift+M", "Delete")
- `action`: Function to execute when triggered
- `description`: Human-readable description
- `enabled`: Whether the shortcut is enabled (default: true)
- `order`: Display order (lower numbers appear first)

#### `unregisterShortcut(category, name)`

Remove a registered shortcut.

#### `getAllShortcuts()`

Get all registered shortcuts across all categories.

### Key Combination Format

The system supports various key combination formats:

- `"Ctrl+F"` - Control + F
- `"Shift+Delete"` - Shift + Delete
- `"Alt+Tab"` - Alt + Tab
- `"Ctrl+Shift+Z"` - Control + Shift + Z
- `"F11"` - Function key F11
- `"Esc"` - Escape key

### Default Categories

```tsx
DEFAULT_SHORTCUT_CATEGORIES = {
  NAVIGATION: "navigation",
  VIEW_SETTINGS: "viewSettings", 
  TOOLS: "tools",
  EDITING: "editing",
  CUSTOM: "custom",
}
```

### Hooks

#### `useShortcutsRegistry()`

Access the shortcuts registry state:

```tsx
const { shortcuts, getShortcuts, getAllShortcuts } = useShortcutsRegistry();
```

#### `useShortcuts()`

Access shortcuts display state (requires ShortcutsProvider):

```tsx
const { showShortcuts, toggleShortcuts } = useShortcuts();
```

#### `useKeyboardShortcutHandler()`

Enable automatic keyboard event handling (used internally by ShortcutsManager).

## Components

### `ShortcutsManager`

Main component that provides the complete shortcuts system:

```tsx
<ShortcutsManager initialShow={false}>
  <YourApp />
</ShortcutsManager>
```

### `ShortcutsDisplay`

Component that displays registered shortcuts:

```tsx
<ShortcutsDisplay 
  showCategories={true}
  maxShortcuts={20}
/>
```

### `ShortcutsToggleButton`

Button to toggle shortcuts display (automatically registered as a control):

```tsx
<ShortcutsToggleButton />
```

## Integration with Controls Registry

The shortcuts system automatically integrates with the existing controls registry, registering a shortcuts toggle button in the navigation controls.

## Migration from Old System

The old shortcuts system was tightly coupled with the Controls context. The new system is completely decoupled:

### Old way:
```tsx
// Tightly coupled to useControls hook
const { toggleShortcuts } = useControls();
```

### New way:
```tsx
// Decoupled - register actions with the registry
registerShortcut('navigation', 'toggle-shortcuts', 'K', toggleShortcuts, 'Toggle shortcuts');
```

## Examples

See `examples/ExampleShortcutsRegistration.tsx` for a complete example of how to register various types of shortcuts.

## Best Practices

1. **Always clean up**: Use the return function in useEffect to unregister shortcuts
2. **Use meaningful names**: Give shortcuts descriptive names and descriptions
3. **Organize by category**: Use appropriate categories for different types of actions
4. **Check for conflicts**: Be aware that multiple shortcuts with the same key combination may conflict
5. **Consider order**: Use the order parameter to control display order in the shortcuts panel