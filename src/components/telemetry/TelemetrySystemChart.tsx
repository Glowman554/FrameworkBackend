import { SolidApexCharts } from 'solid-apexcharts';
import type { TelemetrySystemInfoResult } from '../../actions/telemetry';
import Query from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import { Show } from 'solid-js';

function SystemOSPieChart(props: { osStats: TelemetrySystemInfoResult['osStats'] }) {
    const osNames = props.osStats.map((stat) => stat.osName);
    const osCounts = props.osStats.map((stat) => stat.count);

    const chartOptions = {
        chart: {
            type: 'pie' as const,
        },
        labels: osNames,
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

    return <SolidApexCharts options={chartOptions} series={osCounts} type="pie" width="100%" height="400" />;
}

function SystemOSVersionPieChart(props: { osVersionStats: TelemetrySystemInfoResult['osVersionStats'] }) {
    const osVersionLabels = props.osVersionStats.map((stat) => `${stat.osName} ${stat.osVersion}`);
    const osVersionCounts = props.osVersionStats.map((stat) => stat.count);

    const chartOptions = {
        chart: {
            type: 'pie' as const,
        },
        labels: osVersionLabels,
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

    return <SolidApexCharts options={chartOptions} series={osVersionCounts} type="pie" width="100%" height="400" />;
}

export default function TelemetrySystemChart() {
    return (
        <div class="m-4 rounded-lg bg-neutral-600 p-4">
            <Query f={() => actions.telemetry.processSystemInfo()}>
                {(data) => (
                    <Show when={data.data} fallback={<p>Failed to load data</p>}>
                        <div class="flex flex-wrap gap-4">
                            <div class="max-w-[600px] min-w-[300px] flex-1">
                                <h2 class="mb-2 text-xl font-bold">Operating Systems</h2>
                                <SystemOSPieChart osStats={data.data!.osStats} />
                            </div>
                            <div class="max-w-[600px] min-w-[300px] flex-1">
                                <h2 class="mb-2 text-xl font-bold">Operating System Versions</h2>
                                <SystemOSVersionPieChart osVersionStats={data.data!.osVersionStats} />
                            </div>
                        </div>
                    </Show>
                )}
            </Query>
        </div>
    );
}
