import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F6FF] px-6 text-center">
          <div className="text-5xl mb-4">😵</div>
          <h2 className="font-bold text-gray-800 text-lg mb-2">页面出了点小问题</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {this.state.message || '请刷新页面重试'}
          </p>
          <button
            className="btn-primary"
            onClick={() => { this.setState({ hasError: false, message: '' }); window.location.href = '/' }}
          >
            返回首页
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
