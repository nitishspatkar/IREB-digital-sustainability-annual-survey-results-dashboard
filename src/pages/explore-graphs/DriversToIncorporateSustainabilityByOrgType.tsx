import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const DRIVER_COLUMNS = [
  { key: 'driveOrganizationalPolicies', label: 'Org. policies' },
  { key: 'drivePersonalBeliefs', label: 'Personal beliefs' },
  { key: 'driveClientRequirements', label: 'Client reqs' },
  { key: 'driveUserRequirements', label: 'User reqs' },
  { key: 'driveLegalRequirements', label: 'Legal reqs' },
] as const;

export const DriversToIncorporateSustainabilityByOrgType = ({
  onBack,
  showBackButton = true,
}: {
  onBack?: () => void;
  showBackButton?: boolean;
}) => {
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      // Structure: Map<OrgType, { totalInGroup: number; drivers: Map<string, number> }>
      const orgStats = new Map<string, { totalInGroup: number; drivers: Map<string, number> }>();

      let totalResponses = 0;
      // We need to count the eligible base population to calculate a correct response rate relative to the parent chart logic
      // Parent chart base: PersonIncorporatesSustainability == 'Yes'
      let eligiblePopulation = 0;

      responses.forEach((r) => {
        // Precondition 1: Must incorporate sustainability (Same base as parent chart)
        const incorporates = normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase();

        if (incorporates === 'yes') {
          eligiblePopulation++;
        } else {
          return;
        }

        // Precondition 2: Must have a valid Org Type
        const rawOrgType = r.raw.organizationType ?? '';
        if (!rawOrgType || rawOrgType.toLowerCase() === 'n/a') return;

        // Precondition 3: Must have answered the driver question block (at least one Yes/No or Other)
        let hasAnswer = false;

        // Check standard columns
        for (const col of DRIVER_COLUMNS) {
          const val = normalize(r.raw[col.key as keyof typeof r.raw] ?? '').toLowerCase();
          if (val === 'yes' || val === 'no') {
            hasAnswer = true;
            break;
          }
        }
        // Check Other
        if (!hasAnswer) {
          const otherVal = normalize(r.raw.driveOther ?? '');
          if (otherVal.length > 0 && otherVal !== 'n/a') {
            hasAnswer = true;
          }
        }

        if (!hasAnswer) return;

        // Process Record
        const orgType = normalize(rawOrgType);

        if (!orgStats.has(orgType)) {
          orgStats.set(orgType, { totalInGroup: 0, drivers: new Map() });
          DRIVER_COLUMNS.forEach((d) => {
            orgStats.get(orgType)!.drivers.set(d.label, 0);
          });
        }

        const stats = orgStats.get(orgType)!;
        stats.totalInGroup++;
        totalResponses++;

        // Count each driver (Yes only)
        DRIVER_COLUMNS.forEach((d) => {
          if (normalize(r.raw[d.key as keyof typeof r.raw] ?? '').toLowerCase() === 'yes') {
            stats.drivers.set(d.label, (stats.drivers.get(d.label) ?? 0) + 1);
          }
        });
      });

      // Sort Org Types by total count (descending)
      const sortedOrgTypes = Array.from(orgStats.keys()).sort((a, b) => {
        return orgStats.get(a)!.totalInGroup - orgStats.get(b)!.totalInGroup;
      });

      // Build traces
      const traces: Data[] = DRIVER_COLUMNS.map((driver, index) => {
        const yValues = sortedOrgTypes;
        const xValues = sortedOrgTypes.map((orgType) => {
          return orgStats.get(orgType)!.drivers.get(driver.label) ?? 0;
        });

        const colors = [
          palette.berry,
          palette.spring,
          palette.mandarin,
          palette.transport,
          palette.night,
        ];

        return {
          y: yValues,
          x: xValues,
          name: driver.label,
          type: 'bar',
          orientation: 'h',
          marker: {
            color: colors[index % colors.length],
          },
          text: xValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 13,
            color: '#FFFFFF',
          },
          hovertemplate: '%{x} responses<extra></extra>',
        };
      });

      return {
        traces,
        stats: {
          numberOfResponses: totalResponses,
          totalEligible: eligiblePopulation, // Set the base population correctly
        },
      };
    },
    []
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      margin: { t: 100, r: 20, b: 60, l: 200 },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
        traceorder: 'normal',
      },
      xaxis: {
        title: {
          text: 'Number of Citations',
        },
      },
      yaxis: {
        automargin: true,
        ticksuffix: '  ',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="DriversToIncorporateSustainabilityByOrgType"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
