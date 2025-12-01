import { usePWAInstall } from "./hooks/usePWAInstall";

export default function InstallButton() {
  const { isInstalled, deferredPrompt, showInstallPrompt } = usePWAInstall();

  // Hide button if app already installed or prompt not ready
  if (isInstalled || !deferredPrompt) return null;

  return (
    <button
      onClick={showInstallPrompt}
      className="fixed bottom-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce z-50"
    >
      Install App
    </button>
  );
}
