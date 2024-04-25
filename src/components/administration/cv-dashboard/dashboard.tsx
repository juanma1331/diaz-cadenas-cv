import { trpcReact } from "@/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import { statusMap } from "@/utils/shared";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "var(--primary-foreground)", // Usar la variable CSS para el color del texto
      },
    },
  },
};

export default function CVDashboard({ date }: { date: string }) {
  const { data, isLoading, isError } = trpcReact.getDashboard.useQuery({
    date,
  });

  const positionData = {
    labels: data?.byPosition.keys || [],
    datasets: [
      {
        label: "Número de Currículums Recibidos",
        backgroundColor: "rgba(var(--primary-rgb), 0.5)",
        borderColor: "rgba(var(--primary-rgb), 1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(var(--primary-rgb), 0.75)",
        hoverBorderColor: "rgba(var(--primary-rgb), 1)",
        data: data?.byPosition.values || [],
      },
    ],
  };

  const placesData = {
    labels: data?.byPlace.keys || [],
    datasets: [
      {
        label: "Número de Currículums Recibidos",
        backgroundColor: "rgba(var(--secondary-rgb), 0.5)",
        borderColor: "rgba(var(--secondary-rgb), 1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(var(--secondary-rgb), 0.75)",
        hoverBorderColor: "rgba(var(--secondary-rgb), 1)",
        data: data?.byPlace.values || [],
      },
    ],
  };

  const statusData = {
    labels: data?.byStatus.keys.map((k) => statusMap(k)) || [],
    datasets: [
      {
        label: "Estado de los Currículums",
        backgroundColor: [
          "rgba(var(--accent-rgb), 0.5)",
          "rgba(var(--muted-rgb), 0.5)",
          "rgba(var(--destructive-rgb), 0.5)",
          "rgba(var(--primary-rgb), 0.5)",
        ],
        borderColor: [
          "rgba(var(--accent-rgb), 1)",
          "rgba(var(--muted-rgb), 1)",
          "rgba(var(--destructive-rgb), 1)",
          "rgba(var(--primary-rgb), 1)",
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          "rgba(var(--accent-rgb), 0.75)",
          "rgba(var(--muted-rgb), 0.75)",
          "rgba(var(--destructive-rgb), 0.75)",
          "rgba(var(--primary-rgb), 0.75)",
        ],
        hoverBorderColor: [
          "rgba(var(--accent-rgb), 1)",
          "rgba(var(--muted-rgb), 1)",
          "rgba(var(--destructive-rgb), 1)",
          "rgba(var(--primary-rgb), 1)",
        ],
        data: data?.byStatus.values || [],
      },
    ],
  };

  if (isError) {
    return <div>Error obteniendo los datos para el dashboard</div>;
  }

  return (
    <ScrollArea className="h-[800px] overflow-auto">
      <div className="space-y-6">
        <h1 className="text-foreground text-xl pt-4">Dashboard</h1>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="flex gap-12">
              <div className="space-y-2">
                <h2 className="text-muted-foreground">Recibidos</h2>

                <div className="flex gap-2">
                  <Card className="min-w-[200px]">
                    <CardHeader className="pb-2">
                      <CardDescription>Hoy</CardDescription>
                      <CardTitle className="text-4xl">
                        {data.totalToday}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="min-w-[200px]">
                    <CardHeader className="pb-2">
                      <CardDescription>Esta semana</CardDescription>
                      <CardTitle className="text-4xl">
                        {data.totalThisWeek}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="min-w-[200px]">
                    <CardHeader className="pb-2">
                      <CardDescription>Este mes</CardDescription>
                      <CardTitle className="text-4xl">
                        {data.totalThisMonth}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="min-w-[200px]">
                    <CardHeader className="pb-2">
                      <CardDescription>Total</CardDescription>
                      <CardTitle className="text-4xl">{data?.total}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-muted-foreground">Almacenamiento</h2>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Consumo</CardDescription>
                    <CardTitle className="text-4xl">
                      {data.storageInUse}
                      {"GB"}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-muted-foreground">Análisis</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Card className="w-[40%]">
                    <CardHeader className="pb-2">
                      <CardDescription>Por Posición</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <Bar options={options} data={positionData} />
                    </CardContent>
                  </Card>

                  <Card className="w-[40%]">
                    <CardHeader className="pb-2">
                      <CardDescription>Por Estado</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <Bar options={options} data={statusData} />
                    </CardContent>
                  </Card>
                </div>

                <Card className="w-[81%]">
                  <CardHeader className="pb-2">
                    <CardDescription>Por Ubicación</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Bar options={options} data={placesData} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
