import type { JSX } from "react";
import { useEffect, useRef } from "react";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize(options: {
        callback: (response: GoogleCredentialResponse) => void;
        client_id: string;
      }): void;
      renderButton(
        parent: HTMLElement,
        options: {
          shape: "rectangular";
          size: "large";
          text: "continue_with";
          theme: "outline";
          width: number;
        },
      ): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error()), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error());
    document.head.append(script);
  });
  return googleScriptPromise;
}

export function GoogleSignInButton({
  onCredential,
}: {
  onCredential: (credential: string) => void;
}): JSX.Element | null {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId || !container.current) return;
    const target = container.current;
    void loadGoogleScript()
      .then(() => {
        if (!window.google || !target.isConnected) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });
        target.replaceChildren();
        window.google.accounts.id.renderButton(target, {
          shape: "rectangular",
          size: "large",
          text: "continue_with",
          theme: "outline",
          width: Math.min(target.clientWidth || 320, 400),
        });
      })
      .catch(() => undefined);
  }, [clientId, onCredential]);

  return clientId ? <div ref={container} className="min-h-11 w-full" /> : null;
}
