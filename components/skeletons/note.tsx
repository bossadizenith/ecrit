import Container from "@/components/container";

const WIDTHS = [
  20, 40, 60, 30, 40, 40, 50, 400, 100, 80, 90, 10, 100, 20, 40, 60, 30, 40, 40,
  50, 400, 100, 80, 90, 10, 100, 20, 40, 60, 30, 40, 40, 50, 400, 100, 80, 90,
  10, 100,
];

export const NoteSkeleton = () => {
  return (
    <Container className="max-w-6xl md:p-10 p-4 gap-4 border-y">
      <div className="h-10 w-full bg-muted/50 animate-pulse" />
      <div className="flex flex-col gap-3 flex-1">
        {WIDTHS.map((val, idx) => (
          <div
            key={idx}
            className="bg-muted/50"
            style={{
              width: val > 100 ? `100%` : `${val}%`,
              height: val > 100 ? `${val}px` : 12,
            }}
          />
        ))}
      </div>
    </Container>
  );
};
