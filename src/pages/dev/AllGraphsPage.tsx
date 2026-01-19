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
const generalAwarenessGraphModules = import.meta.glob('../general-awareness/graphs/*.tsx', {
  eager: true,
});
const digitalSustainabilityRoleGraphModules = import.meta.glob(
  '../role-of-digital-sustainability/graphs/*.tsx',
  { eager: true }
);
const sustainabilityTasksGraphModules = import.meta.glob(
  '../sustainability-in-job-and-tasks/graphs/*.tsx',
  { eager: true }
);
const exploreGraphModules = import.meta.glob('../explore-graphs/*.tsx', { eager: true });

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
  }>;
}

// Helper function to extract component from module (handles both default and named exports)
const extractComponents = (modules: Record<string, unknown>): GraphSection['graphs'] => {
  const graphs: GraphSection['graphs'] = [];

  Object.entries(modules).forEach(([path, module]) => {
    const graphModule = module as GraphModule;
    const fileName = path.split('/').pop()?.replace('.tsx', '') || 'Unknown';

    // Check for default export
    if (graphModule.default) {
      graphs.push({
        name: fileName,
        Component: graphModule.default,
        path,
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
          });
        }
      });
    }
  });

  return graphs.sort((a, b) => a.name.localeCompare(b.name));
};

const AllGraphsPage = () => {
  const [sections, setSections] = useState<GraphSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const graphSections: GraphSection[] = [
      {
        title: 'Demographics',
        graphs: extractComponents(demographicGraphModules),
      },
      {
        title: 'General Awareness',
        graphs: extractComponents(generalAwarenessGraphModules),
      },
      {
        title: 'Digital Sustainability Role',
        graphs: extractComponents(digitalSustainabilityRoleGraphModules),
      },
      {
        title: 'Sustainability in Job and Tasks',
        graphs: extractComponents(sustainabilityTasksGraphModules),
      },
      {
        title: 'Explore Graphs',
        graphs: extractComponents(exploreGraphModules),
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

  const totalGraphs = sections.reduce((sum, section) => sum + section.graphs.length, 0);

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
          Displaying all {totalGraphs} graphs from across the application
        </p>
        <button
          onClick={toggleAllSections}
          className="rounded-md bg-ireb-superlight-berry px-4 py-2 text-sm font-medium text-ireb-berry border-2 border-ireb-berry hover:bg-ireb-light-berry transition-colors"
        >
          {expandedSections.size === sections.length ? 'Collapse All' : 'Expand All'}
        </button>
      </header>

      <div className="space-y-8">
        {sections.map((section) => {
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
                        <h3 className="font-mori text-xl font-semibold text-ireb-berry">{name}</h3>
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
      </div>
    </div>
  );
};

export default AllGraphsPage;
