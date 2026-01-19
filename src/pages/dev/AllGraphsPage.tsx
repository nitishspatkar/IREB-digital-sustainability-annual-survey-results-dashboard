import { useEffect, useState, Component, type ReactNode, type ErrorInfo } from 'react';

// Error Boundary Component
class GraphErrorBoundary extends Component<
  { children: ReactNode; graphName: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; graphName: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in graph "${this.props.graphName}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
          <p className="text-red-800 font-semibold">⚠️ Failed to render graph</p>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <p className="text-red-500 text-xs mt-2">
            This graph may require specific props or data processing that isn't available in this
            overview context.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dynamically import all graph components from different folders
const demographicGraphModules = import.meta.glob('../demographic/graphs/*.tsx', { eager: true });
const demographicGraphModulesRaw = import.meta.glob('../demographic/graphs/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const generalAwarenessGraphModules = import.meta.glob('../general-awareness/graphs/*.tsx', {
  eager: true,
});
const generalAwarenessGraphModulesRaw = import.meta.glob('../general-awareness/graphs/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const digitalSustainabilityRoleGraphModules = import.meta.glob(
  '../role-of-digital-sustainability/graphs/*.tsx',
  { eager: true }
);
const digitalSustainabilityRoleGraphModulesRaw = import.meta.glob(
  '../role-of-digital-sustainability/graphs/*.tsx',
  { eager: true, query: '?raw', import: 'default' }
);

const sustainabilityTasksGraphModules = import.meta.glob(
  '../sustainability-in-job-and-tasks/graphs/*.tsx',
  { eager: true }
);
const sustainabilityTasksGraphModulesRaw = import.meta.glob(
  '../sustainability-in-job-and-tasks/graphs/*.tsx',
  { eager: true, query: '?raw', import: 'default' }
);

const exploreGraphModules = import.meta.glob('../explore-graphs/*.tsx', { eager: true });
const exploreGraphModulesRaw = import.meta.glob('../explore-graphs/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

interface GraphModule {
  default?: React.ComponentType<any>;
  [key: string]: any;
}

interface GraphSection {
  title: string;
  graphs: Array<{
    name: string;
    Component: React.ComponentType<any>;
    path: string;
    hasComparison: boolean;
  }>;
}

// Helper function to extract component from module (handles both default and named exports)
const extractComponents = (
  modules: Record<string, unknown>,
  rawModules: Record<string, string>
): GraphSection['graphs'] => {
  const graphs: GraphSection['graphs'] = [];

  Object.entries(modules).forEach(([path, module]) => {
    const graphModule = module as GraphModule;
    const fileName = path.split('/').pop()?.replace('.tsx', '') || 'Unknown';

    const rawContent = rawModules[path] || '';
    const hasComparison = rawContent.includes('comparisonStrategy');

    // Check for default export
    if (graphModule.default) {
      graphs.push({
        name: fileName,
        Component: graphModule.default,
        path,
        hasComparison,
      });
    } else {
      // Check for named exports (try to find a component export)
      Object.entries(graphModule).forEach(([exportName, exportValue]) => {
        if (
          exportName !== 'default' &&
          typeof exportValue === 'function' &&
          exportName[0] === exportName[0].toUpperCase()
        ) {
          graphs.push({
            name: exportName,
            Component: exportValue as React.ComponentType<any>,
            path,
            hasComparison,
          });
        }
      });
    }
  });

  return graphs.sort((a, b) => a.name.localeCompare(b.name));
};

type FilterMode = 'all' | 'with-comparison' | 'without-comparison';

const AllGraphsPage = () => {
  const [sections, setSections] = useState<GraphSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  useEffect(() => {
    const graphSections: GraphSection[] = [
      {
        title: 'Demographics',
        graphs: extractComponents(
          demographicGraphModules,
          demographicGraphModulesRaw as Record<string, string>
        ),
      },
      {
        title: 'General Awareness',
        graphs: extractComponents(
          generalAwarenessGraphModules,
          generalAwarenessGraphModulesRaw as Record<string, string>
        ),
      },
      {
        title: 'Digital Sustainability Role',
        graphs: extractComponents(
          digitalSustainabilityRoleGraphModules,
          digitalSustainabilityRoleGraphModulesRaw as Record<string, string>
        ),
      },
      {
        title: 'Sustainability in Job and Tasks',
        graphs: extractComponents(
          sustainabilityTasksGraphModules,
          sustainabilityTasksGraphModulesRaw as Record<string, string>
        ),
      },
      {
        title: 'Explore Graphs',
        graphs: extractComponents(
          exploreGraphModules,
          exploreGraphModulesRaw as Record<string, string>
        ),
      },
    ];

    setSections(graphSections);

    // Expand all sections by default
    setExpandedSections(new Set(graphSections.map((s) => s.title)));
  }, []);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const toggleAllSections = () => {
    if (expandedSections.size === sections.length) {
      // Collapse all
      setExpandedSections(new Set());
    } else {
      // Expand all
      setExpandedSections(new Set(sections.map((s) => s.title)));
    }
  };

  const getFilteredGraphs = (graphs: GraphSection['graphs']) => {
    if (filterMode === 'all') return graphs;
    if (filterMode === 'with-comparison') {
      return graphs.filter((g) => g.hasComparison);
    }
    return graphs.filter((g) => !g.hasComparison);
  };

  const filteredSections = sections
    .map((section) => ({
      ...section,
      graphs: getFilteredGraphs(section.graphs),
    }))
    .filter((section) => section.graphs.length > 0);

  const totalGraphs = filteredSections.reduce((sum, section) => sum + section.graphs.length, 0);

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-pressura text-3xl md:text-5xl tracking-tight text-ireb-berry font-bold">
            All Graphs Overview
          </h1>
          <span className="rounded-md bg-ireb-berry px-3 py-1 text-sm font-medium text-white">
            DEV MODE
          </span>
        </div>
        <p className="text-lg text-ink-700">
          Displaying {totalGraphs} graphs from across the application
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-ireb-berry focus:z-10 focus:ring-2 focus:ring-ireb-berry focus:text-ireb-berry ${
                filterMode === 'all'
                  ? 'bg-ireb-berry text-white hover:bg-ireb-berry hover:text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('with-comparison')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-200 hover:bg-gray-100 hover:text-ireb-berry focus:z-10 focus:ring-2 focus:ring-ireb-berry focus:text-ireb-berry ${
                filterMode === 'with-comparison'
                  ? 'bg-ireb-berry text-white hover:bg-ireb-berry hover:text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              Comparison Ready
            </button>
            <button
              onClick={() => setFilterMode('without-comparison')}
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-ireb-berry focus:z-10 focus:ring-2 focus:ring-ireb-berry focus:text-ireb-berry ${
                filterMode === 'without-comparison'
                  ? 'bg-ireb-berry text-white hover:bg-ireb-berry hover:text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              Missing Comparison
            </button>
          </div>

          <button
            onClick={toggleAllSections}
            className="rounded-md bg-ireb-superlight-berry px-4 py-2 text-sm font-medium text-ireb-berry border-2 border-ireb-berry hover:bg-ireb-light-berry transition-colors ml-auto"
          >
            {expandedSections.size === sections.length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </header>

      <div className="space-y-8">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections.has(section.title);

          return (
            <div key={section.title} className="border-2 border-ireb-light-berry rounded-lg">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-6 py-4 bg-ireb-superlight-berry hover:bg-ireb-light-berry transition-colors text-left"
              >
                <h2 className="font-pressura text-2xl md:text-3xl tracking-tight text-ireb-berry font-bold">
                  {section.title}
                  <span className="ml-3 text-lg font-normal text-ink-600">
                    ({section.graphs.length} graphs)
                  </span>
                </h2>
                <svg
                  className={`h-6 w-6 text-ireb-berry transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isExpanded && (
                <div className="p-6 space-y-8">
                  {section.graphs.map(({ name, Component, path }) => (
                    <div key={path} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-mori text-xl font-semibold text-ireb-berry flex items-center gap-2">
                          {name}
                        </h3>
                        <span className="text-xs text-ink-500 font-mono">{path}</span>
                      </div>
                      <GraphErrorBoundary graphName={name}>
                        <div className="border-2 border-ireb-light-berry rounded-lg p-4 bg-white">
                          <Component onBack={() => {}} />
                        </div>
                      </GraphErrorBoundary>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="text-center py-12 text-ink-500 text-lg">
            No graphs match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default AllGraphsPage;
