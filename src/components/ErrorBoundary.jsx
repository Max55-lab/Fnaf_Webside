import { Component } from "react";

/**
 * Catches render errors so one bad page can't blank the whole wiki.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep the details available for debugging without a crash screen.
    console.error("Wiki crashed:", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page" style={{ textAlign: "center", paddingTop: "5rem" }}>
          <div className="error-code">ERROR</div>
          <h1 className="page-title" style={{ color: "var(--danger)" }}>
            System Malfunction
          </h1>
          <p className="page-subtitle">
            Something in this room broke. The animatronics have been notified — which
            is probably not good news for you.
          </p>
          <div className="error-detail">{String(this.state.error?.message || this.state.error)}</div>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
            <button className="btn" onClick={() => this.setState({ error: null })}>
              Try Again
            </button>
            <a className="btn btn-danger" href="#/" onClick={() => this.setState({ error: null })}>
              Return to Office
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
