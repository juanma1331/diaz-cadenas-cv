import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

export default function CVDashboard() {
  const positionData = {
    labels: [
      "Carnicería",
      "Charcutería",
      "Pescadería",
      "Frutería",
      "Panadería",
      "Pastelería",
      "Cajero",
      "Reponedor",
      "Limpieza",
    ],
    datasets: [
      {
        label: "Número de Currículums Recibidos",
        backgroundColor: "rgba(var(--primary-rgb), 0.5)",
        borderColor: "rgba(var(--primary-rgb), 1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(var(--primary-rgb), 0.75)",
        hoverBorderColor: "rgba(var(--primary-rgb), 1)",
        data: [12, 19, 3, 5, 2, 3, 21, 15, 8],
      },
    ],
  };

  const placesData = {
    labels: [
      "Andújar",
      "Brenes",
      "Bollullos Par del Condado",
      "Cádiz",
      "Coria del Rio",
      "Estepa",
      "Gilena",
      "Hytasa",
      "La Carolina",
      "Lantejuela",
      "Moguer",
      "Osuna",
      "Sanlúcar de Barrameda",
      "Sevilla",
      "Utrera",
    ],
    datasets: [
      {
        label: "Número de Currículums Recibidos",
        backgroundColor: "rgba(var(--secondary-rgb), 0.5)",
        borderColor: "rgba(var(--secondary-rgb), 1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(var(--secondary-rgb), 0.75)",
        hoverBorderColor: "rgba(var(--secondary-rgb), 1)",
        data: [8, 5, 3, 20, 10, 4, 2, 15, 9, 1, 6, 7, 14, 30, 12],
      },
    ],
  };

  const statusData = {
    labels: ["Pendiente", "Revisado", "Rechazado", "Seleccionado"],
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
        data: [150, 120, 30, 50],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-foreground text-xl py-4">Dashboard</h1>

      <div className="flex gap-12">
        <div className="space-y-2">
          <h2 className="text-muted-foreground">Actividad Reciente</h2>

          <div className="flex gap-2">
            <Card className="min-w-[200px]">
              <CardHeader className="pb-2">
                <CardDescription>Hoy</CardDescription>
                <CardTitle className="text-4xl">14</CardTitle>
              </CardHeader>
            </Card>

            <Card className="min-w-[200px]">
              <CardHeader className="pb-2">
                <CardDescription>Esta semana</CardDescription>
                <CardTitle className="text-4xl">47</CardTitle>
              </CardHeader>
            </Card>

            <Card className="min-w-[200px]">
              <CardHeader className="pb-2">
                <CardDescription>Este mes</CardDescription>
                <CardTitle className="text-4xl">290</CardTitle>
              </CardHeader>
            </Card>
            <Card className="min-w-[200px]">
              <CardHeader className="pb-2">
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-4xl">1890</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-muted-foreground">Almacenamiento</h2>

          <Card x-chunk="dashboard-05-chunk-1">
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-4xl">425GB</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div className="flex flex-row justify-between items-end">
        <div className="flex-1 min-w-0">
          <h2 className="text-muted-foreground">Por Posición</h2>
          <div className="w-full h-full">
            <Bar options={options} data={positionData} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-muted-foreground">Por Ubicación</h2>
          <div className="w-full h-full">
            <Bar options={options} data={placesData} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-muted-foreground">Por Estado</h2>
          <div className="w-full h-full">
            <Bar options={options} data={statusData} />
          </div>
        </div>
      </div>
    </div>
  );
}
