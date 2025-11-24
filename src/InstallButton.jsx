import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    // Detect already installed (PWA standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsStandalone(standalone);

    if (standalone) return;

    // Chrome/Android PWA prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    });
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("App Installed");
    }

    setDeferredPrompt(null);
    setVisible(false);
  };

  if (isStandalone) return null; // already installed

  // iOS - No automatic install prompt
  if (isIOS) {
    return (
      <div className="fixed bottom-5 right-5 bg-white border p-3 rounded-xl shadow-lg w-64">
        <p className="text-sm text-gray-700">
          👉 To install this app on iPhone:
        </p>
        <p className="text-sm mt-2">
          • Tap <strong>Share</strong>  
          • Then choose <strong>"Add to Home Screen"</strong>
        </p>
      </div>
    );
  }

  if (!visible) return null;

  return (
    <button
      onClick={installApp}
      className="fixed bottom-5 right-5 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
    >
      Install App
    </button>
  );
}
