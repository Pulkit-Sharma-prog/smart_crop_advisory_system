declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "pill" | "rectangular" | "square" | "circle";
              width?: number;
              logo_alignment?: "left" | "center";
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google script")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
}

interface InitGoogleButtonOptions {
  clientId: string;
  mountNode: HTMLElement;
  onCredential: (credential: string) => void;
}

export async function initGoogleButton(options: InitGoogleButtonOptions): Promise<void> {
  await loadGoogleScript();

  const googleApi = window.google?.accounts?.id;
  if (!googleApi) {
    throw new Error("Google Identity Services is unavailable");
  }

  googleApi.initialize({
    client_id: options.clientId,
    callback: ({ credential }) => {
      if (!credential) {
        return;
      }
      options.onCredential(credential);
    },
    ux_mode: "popup",
  });

  options.mountNode.innerHTML = "";
  const width = Math.max(280, Math.min(400, options.mountNode.clientWidth || 320));

  googleApi.renderButton(options.mountNode, {
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "pill",
    width,
    logo_alignment: "left",
  });
}
