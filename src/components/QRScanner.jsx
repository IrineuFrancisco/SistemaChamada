import React, { useEffect, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const QRScanner = ({ onScan }) => {
  const [error, setError] = useState('');

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");

    const startScanner = async () => {
      try {
        // Pede permissão explícita
        await navigator.mediaDevices.getUserMedia({ video: true });

        const devices = await Html5Qrcode.getCameras();
        
        if (devices && devices.length) {
          const cameraId = devices[0].id;

          await html5QrCode.start(
            cameraId, 
            {
              fps: 15, // Aumentei para 15 para ler mais rápido
              // qrbox: { width: 250, height: 250 }, // REMOVI: Agora lê a tela toda
              aspectRatio: 1.333333, // Padrão 4:3 (mais comum em webcams)
              formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] // Otimiza para só procurar QR
            },
            (decodedText) => {
              // Sucesso!
              console.log("QR LIDO:", decodedText); // Mostra no console
              html5QrCode.stop().then(() => {
                onScan(decodedText);
              }).catch(console.error);
            },
            (errorMessage) => {
              // Erro de leitura de frame (normal, ignora)
            } 
          );
        } else {
          setError("Câmera não detectada.");
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao iniciar. Verifique se a câmera não está em uso por outro app.");
      }
    };

    startScanner();

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
      html5QrCode.clear();
    };
  }, []);

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      <div id="qr-reader" className="w-full overflow-hidden rounded-lg bg-black"></div>
      <p className="text-center text-xs text-gray-500 mt-2">
        Mantenha o código parado e afastado da câmera.
      </p>
    </div>
  );
};

export default QRScanner;