import { useEffect, useState } from 'react';

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // જો already installed હોય તો બટન દેખાડશો નહિ
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // default prompt અટકાવો
      setDeferredPrompt(e);
      setShowButton(true); // બટન દેખાડો
    });

    window.addEventListener('appinstalled', () => {
      console.log('App installed!');
      setIsInstalled(true);
      setShowButton(false);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // auto prompt દેખાડો

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (isInstalled || !showButton) return null;

  return (
    <div style={{
        position: 'fixed',
        top: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000
      }}>
      <button onClick={handleInstallClick} style={{
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px'
      }}>
        Install App 
      </button>
    </div>
  );
}

export default InstallButton;
