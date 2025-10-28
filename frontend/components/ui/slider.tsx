"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full border border-white/40 bg-white/30 shadow-inner data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 dark:border-white/10 dark:bg-white/10"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute from-primary/80 via-primary/70 to-blue-400/80 bg-gradient-to-r data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="ring-ring/50 block size-6 shrink-0 rounded-full border border-white/60 bg-white/80 shadow-[0_12px_25px_-16px_rgba(31,38,135,0.5)] backdrop-blur transition-all hover:scale-105 hover:border-white/80 hover:shadow-[0_16px_30px_-18px_rgba(31,38,135,0.55)] focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-white/20 dark:bg-white/20"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
