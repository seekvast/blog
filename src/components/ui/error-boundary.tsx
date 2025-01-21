import React from 'react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>出错了</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || '发生了一个错误'}
          </AlertDescription>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2"
          >
            重试
          </Button>
        </Alert>
      )
    }

    return this.props.children
  }
}
