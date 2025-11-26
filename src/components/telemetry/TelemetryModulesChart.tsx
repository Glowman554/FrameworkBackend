import { SolidApexCharts } from 'solid-apexcharts';
import type { TelemetryActiveModulesResult } from '../../actions/telemetry';
import Query from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import { Show } from 'solid-js';

function ModulesPieChart(props: { modules: TelemetryActiveModulesResult }) {
    const moduleIds = props.modules.map((mod) => mod.id);
    const moduleCounts = props.modules.map((mod) => mod.count);

    const chartOptions = {
        chart: {
            type: 'pie' as const,
        },
        labels: moduleIds,
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

    return <SolidApexCharts options={chartOptions} series={moduleCounts} type="pie" width="100%" height="400" />;
}

export default function TelemetryModulesChart() {
    return (
        <div class="m-4 rounded-lg bg-neutral-600 p-4">
            <Query f={() => actions.telemetry.processActiveModules()}>
                {(data) => (
                    <Show when={data.data} fallback={<p>Failed to load data</p>}>
                        <h2 class="mb-2 text-xl font-bold">Active Modules</h2>
                        <ModulesPieChart modules={data.data!} />
                    </Show>
                )}
            </Query>
        </div>
    );
}
