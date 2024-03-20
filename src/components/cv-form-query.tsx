import { QueryClient, QueryClientProvider } from "react-query";
import CVForm from "./cv-form";

const queryClient = new QueryClient();

export default function CVFormQuery() {
  return (
    <QueryClientProvider client={queryClient}>
      <CVForm />
    </QueryClientProvider>
  );
}
