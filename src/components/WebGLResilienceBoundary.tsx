import React from "react";
import { Canvas, type CanvasProps, type RootState } from "@react-three/fiber";

type WebGLResilienceBoundaryProps = CanvasProps & {
  label: string;
};

type WebGLErrorBoundaryProps = {
  children: React.ReactNode;
};

type WebGLErrorBoundaryState = {
  didFail: boolean;
};

class WebGLErrorBoundary extends React.Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  state: WebGLErrorBoundaryState = { didFail: false };

  static getDerivedStateFromError() {
    return { didFail: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("WebGL canvas failed and was hidden.", error);
  }

  render() {
    if (this.state.didFail) {
      return null;
    }

    return this.props.children;
  }
}

export function WebGLResilienceBoundary({
  label,
  onCreated,
  fallback = null,
  ...canvasProps
}: WebGLResilienceBoundaryProps) {
  const [isUnavailable, setIsUnavailable] = React.useState(false);
  const cleanupRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const handleCreated = React.useCallback(
    (state: RootState) => {
      cleanupRef.current?.();

      const canvas = state.gl.domElement;
      let restoreTimer: number | undefined;

      const handleContextLost = (event: Event) => {
        event.preventDefault();
        setIsUnavailable(false);

        const extension = state.gl
          .getContext()
          .getExtension("WEBGL_lose_context");

        try {
          extension?.restoreContext();
        } catch (error) {
          console.warn(`${label} WebGL context restore failed.`, error);
        }

        restoreTimer = window.setTimeout(() => {
          setIsUnavailable(true);
        }, 1500);
      };

      const handleContextRestored = () => {
        if (restoreTimer !== undefined) {
          window.clearTimeout(restoreTimer);
        }
        setIsUnavailable(false);
      };

      canvas.addEventListener("webglcontextlost", handleContextLost);
      canvas.addEventListener("webglcontextrestored", handleContextRestored);

      cleanupRef.current = () => {
        if (restoreTimer !== undefined) {
          window.clearTimeout(restoreTimer);
        }
        canvas.removeEventListener("webglcontextlost", handleContextLost);
        canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      };

      onCreated?.(state);
    },
    [label, onCreated],
  );

  if (isUnavailable) {
    return null;
  }

  return (
    <WebGLErrorBoundary>
      <Canvas fallback={fallback} onCreated={handleCreated} {...canvasProps} />
    </WebGLErrorBoundary>
  );
}
