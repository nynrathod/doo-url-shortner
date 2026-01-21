import { cva } from "class-variance-authority";

export const cardVariants = cva("rounded-xl border transition-all duration-200", {
    variants: {
        variant: {
            default: "border-border bg-card text-card-foreground",
            elevated:
                "border-border bg-card text-card-foreground shadow-lg hover:shadow-xl",
            outline: "border-2 border-border bg-transparent",
            glass: "glass",
            gradient: "gradient-primary text-white border-0",
        },
        padding: {
            none: "p-0",
            sm: "p-4",
            default: "p-6",
            lg: "p-8",
        },
    },
    defaultVariants: {
        variant: "default",
        padding: "default",
    },
});
