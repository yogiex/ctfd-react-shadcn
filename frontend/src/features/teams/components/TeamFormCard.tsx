import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface TeamFormCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function TeamFormCard({ title, description, children }: TeamFormCardProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && (
          <CardDescription className="text-base">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
