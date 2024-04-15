export default function VideoContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 w-[32rem] rounded-md mx-auto p-2 border border-border">
      {children}
    </div>
  );
}
