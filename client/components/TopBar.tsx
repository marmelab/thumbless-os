import { ChevronLeft, ChevronRight } from "react-feather";

export const TopBar = ({
  state,
  goBack,
  goToNextPage,
}: {
  state: "asking" | "processing" | "answering";
  goBack: () => void;
  goToNextPage: () => void;
}) => {
  return (
    <div className="h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm gap-2">
      <button
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 cursor-pointer size-9"
        type="button"
        disabled={!goBack}
        onClick={goBack}
      >
        <ChevronLeft />
      </button>

      <button
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 cursor-pointer size-9"
        type="button"
        disabled={!goToNextPage}
        onClick={goToNextPage}
      >
        <ChevronRight />
      </button>

      <div className="flex-1 grow" />

      {state === "processing" && (
        <div className="flex items-center gap-2">
          <img
            src="/assets/loading.svg"
            className="size-9"
            alt="AI Processing"
          />
        </div>
      )}
    </div>
  );
};
