# Module Management System

This is a comprehensive module management system for React applications that provides centralized module state management, caching, and reactive updates.

## Architecture Overview

The module system consists of:
- **ModuleService**: Core service for API calls and cookie management
- **ModuleContext**: React Context for state management 
- **Custom Hooks**: Specialized hooks for different use cases
- **Components**: Updated components that use the module system

## Files Structure

```
resources/js/core/
├── services/
│   └── ModuleService.jsx          # Core module service
├── hooks/
│   ├── moduleContext.jsx         # React Context Provider
│   └── useModule.jsx              # Custom hooks
└── components/
    ├── ModuleSelector.jsx         # Updated selector component
    └── ModuleExample.jsx          # Usage examples
```

## Quick Start

### 1. Wrap your app with ModuleProvider

```jsx
// In MainLayout.jsx or your root component
import { ModuleProvider } from '../core/hooks/moduleContext';

function App() {
    return (
        <AuthProvider>
            <ModuleProvider>
                {/* Your app components */}
            </ModuleProvider>
        </AuthProvider>
    );
}
```

### 2. Use the module system in components

```jsx
import { useModule } from '../core/hooks/moduleContext';

function MyComponent() {
    const { 
        selectedModule, 
        modules, 
        loading, 
        setSelectedModule,
        fetchModules 
    } = useModule();

    // Your component logic
}
```

## Available Hooks

### useModule()
Main hook for module state management:

```jsx
const {
    // State
    selectedModule,    // Currently selected module
    modules,          // All available modules  
    loading,          // Loading state
    error,            // Error state
    isInitialized,    // Initialization status

    // Actions
    setSelectedModule,      // Set selected module
    clearSelectedModule,    // Clear selection
    fetchModules,          // Fetch from API
    getModuleById,         // Get specific module
    searchModules,         // Search functionality
    refreshSelectedModule, // Refresh current module
    isModuleSelected,      // Check if module is selected
    getModulesByStatus     // Get modules by status
} = useModule();
```

### useModuleSelector()
Hook for dropdown/modal selector functionality:

```jsx
const {
    // State
    selectedModule,
    modules,
    isOpen,
    searchQuery,

    // Actions  
    openSelector,
    closeSelector,
    toggleSelector,
    handleModuleSelect,
    handleSearch,
    refreshModules
} = useModuleSelector();
```

### useModuleStats()
Hook for module analytics and statistics:

```jsx
const {
    stats,              // Module statistics
    activeModules,      // Active modules
    inactiveModules,    // Inactive modules
    getModulesByCategory,
    getMostUsedModules
} = useModuleStats();
```

### useModuleNavigation()
Hook for module navigation:

```jsx
const {
    navigateToModule,
    getNextModule,
    getPreviousModule,
    navigateToNext,
    navigateToPrevious,
    hasNext,
    hasPrevious
} = useModuleNavigation();
```

## Service Methods

### ModuleService
Direct service usage for advanced scenarios:

```jsx
import moduleService from '../core/services/ModuleService';

// Fetch modules with caching
const result = await moduleService.fetchModules(forceRefresh);

// Module selection with automatic cookie persistence
moduleService.setSelectedModule(moduleData);

// Subscribe to module changes
const unsubscribe = moduleService.subscribe((event) => {
    console.log('Module changed:', event);
});

// Search modules
const searchResults = moduleService.searchModules('banking');

// Get module statistics
const stats = moduleService.getModuleStats();
```

## Features

### 🔄 Automatic Persistence
- Selected module is automatically saved to cookies
- Survives browser refresh and sessions
- 30-day expiration by default

### ⚡ Smart Caching
- API responses cached for 5 minutes
- Reduces unnecessary API calls
- Force refresh option available

### 🔍 Search & Filter
- Real-time module search
- Search by name and description
- Filter by status, category, etc.

### 📡 Reactive Updates
- All components automatically update when module changes
- Event-driven architecture
- Subscribe to module changes anywhere in the app

### 🎯 TypeScript Ready
- Full TypeScript support (when converted)
- Type-safe module operations
- IntelliSense support

## Usage Examples

### Basic Module Selection
```jsx
function ModuleDropdown() {
    const { selectedModule, modules, setSelectedModule } = useModule();

    return (
        <select 
            value={selectedModule?.id || ''} 
            onChange={(e) => {
                const module = modules.find(m => m.id === e.target.value);
                setSelectedModule(module);
            }}
        >
            <option value="">Select Module</option>
            {modules.map(module => (
                <option key={module.id} value={module.id}>
                    {module.name}
                </option>
            ))}
        </select>
    );
}
```

### Module Selector with Search
```jsx
function ModuleSelectorComponent() {
    const {
        isOpen,
        toggleSelector,
        handleModuleSelect,
        searchQuery,
        handleSearch,
        modules
    } = useModuleSelector();

    return (
        <div className="module-selector">
            <button onClick={toggleSelector}>
                Select Module
            </button>
            
            {isOpen && (
                <div className="dropdown">
                    <input
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search modules..."
                    />
                    
                    {modules.map(module => (
                        <div 
                            key={module.id}
                            onClick={() => handleModuleSelect(module)}
                        >
                            {module.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

### Listen to Module Changes
```jsx
function ModuleListener() {
    const { selectedModule } = useModule();

    useEffect(() => {
        if (selectedModule) {
            console.log('Module changed to:', selectedModule.name);
            // Update navigation, load module-specific data, etc.
        }
    }, [selectedModule]);

    return null;
}
```

### Module-Specific Component
```jsx
function BankingDashboard() {
    const { selectedModule, isModuleSelected } = useModule();

    if (!isModuleSelected('banking')) {
        return <div>Please select Banking module</div>;
    }

    return (
        <div>
            <h1>Banking Dashboard</h1>
            <p>Current module: {selectedModule.name}</p>
        </div>
    );
}
```

## Migration Guide

### From Props to Context

**Before:**
```jsx
// MainLayout.jsx
const [selectedModule, setSelectedModule] = useState(null);

<Topbar selectedModule={selectedModule} setSelectedModule={setSelectedModule} />
<Header selectedModule={selectedModule} setSelectedModule={setSelectedModule} />
```

**After:**
```jsx
// MainLayout.jsx  
<ModuleProvider>
    <Topbar />
    <Header />
</ModuleProvider>

// Components use hooks instead of props
const { selectedModule, setSelectedModule } = useModule();
```

### From Manual Cookie Management to Service

**Before:**
```jsx
// Manual cookie handling in components
const setCookie = (name, value) => { /* implementation */ };
const getCookie = (name) => { /* implementation */ };
```

**After:**
```jsx
// Automatic cookie management via service
const { setSelectedModule } = useModule(); // Automatically saves to cookie
```

## Performance Considerations

1. **Caching**: API responses are cached for 5 minutes
2. **Selective Updates**: Only subscribing components re-render
3. **Lazy Loading**: Modules fetched only when needed
4. **Debouncing**: Search is optimized for performance

## Error Handling

The system includes comprehensive error handling:

```jsx
const { error, loading } = useModule();

if (error) {
    return <div>Error: {error}</div>;
}

if (loading) {
    return <div>Loading modules...</div>;
}
```

## Best Practices

1. **Always use hooks**: Prefer hooks over direct service usage
2. **Handle loading states**: Always show loading indicators  
3. **Error boundaries**: Wrap module components in error boundaries
4. **Cleanup subscriptions**: Use proper cleanup in useEffect
5. **Optimize re-renders**: Use proper dependency arrays

## API Integration

The system expects these API endpoints:

- `GET /api/main-modules` - Fetch all modules
- `GET /api/main-modules/{id}` - Fetch specific module
- `POST /api/menu-structure/` - Fetch module menu structure

## Troubleshooting

### Common Issues

1. **Module not persisting**: Check cookie settings and domain
2. **Components not updating**: Ensure component is wrapped in ModuleProvider
3. **API errors**: Check network and endpoint availability
4. **Performance issues**: Check if unnecessary re-renders are occurring

### Debug Mode

Enable debug logging:

```jsx
// In ModuleService.jsx
console.log('Module service event:', event);
```

## Future Enhancements

- [ ] TypeScript conversion
- [ ] Module permissions/access control  
- [ ] Module usage analytics
- [ ] Offline support
- [ ] Module favorites/bookmarks
- [ ] Bulk operations
- [ ] Module categories/groups
- [ ] Advanced search filters

## Contributing

When contributing to the module system:

1. Follow existing patterns and conventions
2. Add proper error handling
3. Include loading states
4. Update this documentation
5. Add tests for new functionality

## Support

For issues or questions about the module system, please:

1. Check this documentation first
2. Look at the example components
3. Check browser console for errors
4. Review network requests in dev tools
