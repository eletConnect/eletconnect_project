import React, { useState, useEffect, useCallback } from 'react';

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleBeforeInstallPrompt = useCallback((e) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowInstallButton(true);
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [handleBeforeInstallPrompt]);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      setIsButtonDisabled(true);  // Desativa o botão temporariamente
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou a instalação');
        } else {
          console.log('Usuário rejeitou a instalação');
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
        setIsButtonDisabled(false); // Reativa o botão após a escolha
      });
    }
  };

  return (
    <>
      {showInstallButton && (
        <button className='btn' onClick={handleInstallClick} disabled={isButtonDisabled}>
          <i className="bi bi-download"></i> Instalar Aplicativo
        </button>
      )}
    </>
  );
}

export default InstallButton;
