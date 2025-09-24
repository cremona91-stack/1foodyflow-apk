import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstallediOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInstallediOS) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      console.log('PWA: beforeinstallprompt event received');
      
      // Show banner after a delay to not be intrusive
      setTimeout(() => {
        setShowBanner(true);
        console.log('PWA: Banner should be visible now');
      }, 2000); // Show after 2 seconds for testing
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For testing: show banner even without beforeinstallprompt in development
    if (import.meta.env.DEV) {
      setTimeout(() => {
        if (!deferredPrompt) {
          console.log('PWA: Showing test banner (no beforeinstallprompt event)');
          setShowBanner(true);
        }
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // No native install prompt, show manual instructions
      alert(`Per installare FoodyFlow:\n\n📱 Android/Chrome:\n• Menu > Installa app\n\n🍎 iPhone/Safari:\n• Condividi > Aggiungi alla schermata home\n\n💻 Desktop:\n• Icona installa nella barra indirizzi`);
      setShowBanner(false);
      return;
    }

    // Show install prompt
    deferredPrompt.prompt();
    
    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA: User accepted installation');
    } else {
      console.log('PWA: User dismissed installation');
    }
    
    // Clean up
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember user dismissed for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if installed, dismissed, or no prompt available
  if (isInstalled || !showBanner || !deferredPrompt) {
    return null;
  }

  // Check if user already dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 z-50 shadow-lg border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
            <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-green-800 dark:text-green-200 text-sm">
              Installa FoodyFlow
            </h3>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Installa l'app per accesso rapido e funzionalità offline
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-auto"
                data-testid="button-install-pwa"
              >
                <Download className="h-3 w-3 mr-1" />
                Installa
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-green-700 dark:text-green-300 text-xs px-2 py-1 h-auto"
                data-testid="button-dismiss-pwa"
              >
                Non ora
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-green-600 dark:text-green-400 p-1 h-auto"
            data-testid="button-close-pwa"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}