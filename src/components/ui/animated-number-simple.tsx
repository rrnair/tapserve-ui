import React from "react"
import NumberFlow from "@number-flow/react"

interface AnimatedNumberSimpleProps {
  value: number
  prefix?: string
  className?: string
  format?: 'currency' | 'number'
}

export default function AnimatedNumberSimple({
  value,
  prefix = "",
  className = "text-2xl font-bold",
  format = 'number'
}: AnimatedNumberSimpleProps) {
  if (format === 'currency') {
    return (
      <div className={className}>
        {prefix}
        <NumberFlow
          value={value}
          format={{
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }}
          locales="en-IN"
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {prefix}
      <NumberFlow
        value={value}
        format={{
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }}
      />
    </div>
  )
}