import { cn } from "@/lib/utils";

export type ParticipationStep = {
  title: string;
  description: string;
};

type ParticipationStepperProps = {
  steps: ParticipationStep[];
  className?: string;
};

export function ParticipationStepper({
  steps,
  className,
}: ParticipationStepperProps) {
  return (
    <ol
      className={cn(
        "grid w-full grid-cols-1 gap-10 sm:gap-8 md:grid-cols-3 md:gap-6 lg:gap-10",
        className,
      )}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.title} className="min-w-0">
            {/* Step indicator and connecting line */}
            <div className="mb-5 flex items-center">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                {stepNumber}
              </div>

              {!isLast && (
                <div
                  aria-hidden
                  className="mx-4 h-px flex-1 bg-border md:mr-2"
                />
              )}
            </div>
            <h3 className="mb-2 text-xl font-semibold leading-7 text-foreground">
              {step.title}
            </h3>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              {step.description}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export default ParticipationStepper;
