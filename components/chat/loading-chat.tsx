export function LoadingChat() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    </div>
  )
}
