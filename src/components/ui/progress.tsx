import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "../../lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-[#1E90FF] transition-all duration-300 ease-in-out"
      style={{
        transform: `translateX(-${Math.max(0, Math.min(100, 100 - Math.max(0, Math.min(100, value || 0))))}%)`,
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
