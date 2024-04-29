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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CVDashboard({ date }: { date: string }) {
  const { data, isLoading, isError } = trpcReact.getDashboard.useQuery({
    date,
  });

  if (isError) {
    return <div>Error obteniendo los datos para el dashboard</div>;
  }

  return (
    <ScrollArea className="h-[820px] overflow-auto">
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

                    <CardContent className="h-96 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={500}
                          height={300}
                          data={data.byPosition}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="position"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload, label }) => (
                              <CustomTooltip
                                active={active}
                                payload={payload}
                                label={label}
                              />
                            )}
                          />

                          <Bar dataKey="count" fill="#020817" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="w-[40%]">
                    <CardHeader className="pb-2">
                      <CardDescription>Por Estado</CardDescription>
                    </CardHeader>

                    <CardContent className="h-96 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart width={500} height={300} data={data.byStatus}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload, label }) => (
                              <CustomTooltip
                                active={active}
                                payload={payload}
                                label={label}
                              />
                            )}
                          />

                          <Bar dataKey="count" fill="#020817" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card className="w-[81%]">
                  <CardHeader className="pb-2">
                    <CardDescription>Por Ubicación</CardDescription>
                  </CardHeader>

                  <CardContent className="h-[46rem] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart width={500} height={300} data={data.byPlace}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="place"
                          angle={-45}
                          textAnchor="end"
                          height={140}
                        />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload, label }) => (
                            <CustomTooltip
                              active={active}
                              payload={payload}
                              label={label}
                            />
                          )}
                        />

                        <Bar dataKey="count" fill="#020817" />
                      </BarChart>
                    </ResponsiveContainer>
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

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active: boolean | undefined;
  payload: any;
  label: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-50 p-1 rounded-md flex flex-col items-center ">
        <p className="text-center text-sm font-semibold">{label}</p>
        <p className="text-xs">{payload[0].value}</p>
      </div>
    );
  }

  return null;
};
