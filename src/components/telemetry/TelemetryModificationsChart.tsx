import { SolidApexCharts } from 'solid-apexcharts';
import type { TelemetryActiveModificationsResult } from '../../actions/telemetry';
import Query from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import { Show } from 'solid-js';

function ModificationsPieChart(props: { modifications: TelemetryActiveModificationsResult }) {
    const modificationNames = props.modifications.map((mod) => mod.name);
    const modificationCounts = props.modifications.map((mod) => mod.count);

    const chartOptions = {
        chart: {
            type: 'pie' as const,
        },
        labels: modificationNames,
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200,
                    },
                    legend: {
                        position: 'bottom' as const,
                    },
                },
            },
        ],
    };

    return <SolidApexCharts options={chartOptions} series={modificationCounts} type="pie" width="100%" height="400" />;
}

export default function TelemetryModificationsChart() {
    return (
        <div class="m-4 rounded-lg bg-neutral-600 p-4">
            <Query f={() => actions.telemetry.processActiveModifications()}>
                {(data) => (
                    <Show when={data.data} fallback={<p>Failed to load data</p>}>
                        <h2 class="mb-2 text-xl font-bold">Active Modifications</h2>
                        <ModificationsPieChart modifications={data.data!} />
                    </Show>
                )}
            </Query>
        </div>
    );
}
