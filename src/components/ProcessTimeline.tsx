import React, { useEffect } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface ProcessTimelineProps {
  steps: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  className?: string;
}

const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  steps,
  className,
}) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const lineVariants: Variants = {
    hidden: { height: 0 },
    visible: {
      height: "100%",
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    },
  };

  const itemVariants = (isLeft: boolean): Variants => ({
    hidden: { opacity: 0, x: isLeft ? -100 : 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        type: "spring",
        stiffness: 100,
      },
    },
  });

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      {/* The Central Vertical Line */}
      <motion.div
        className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-blue-500 to-transparent"
        initial="hidden"
        animate={controls}
        variants={lineVariants}
        style={{ transform: "translateX(-50%)" }}
      />

      {/* Timeline Items */}
      <div className="space-y-12">
        {steps.map((step, index) => {
          const isLeft = index % 2 === 0;
          return (
            <motion.div
              key={index}
              className="relative w-full"
              variants={itemVariants(isLeft)}
              initial="hidden"
              animate={controls}
              transition={{ delay: 0.5 + index * 0.4 }}
            >
              <div
                className={cn(
                  "flex items-center",
                  isLeft ? "justify-start" : "justify-end",
                )}
              >
                {/* Connector Dot on the timeline */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-blue-600 ring-4 ring-gray-50"></div>
                </div>

                {/* Content Card */}
                <div
                  className={cn(
                    "w-full md:w-5/12 p-4 rounded-lg shadow-md border bg-white",
                    isLeft ? "md:mr-auto" : "md:ml-auto",
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessTimeline;
