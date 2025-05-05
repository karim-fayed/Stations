import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { soundService } from '@/services/SoundService';
import { Howler } from 'howler';

const SoundTest: React.FC = () => {
  const [playCount, setPlayCount] = useState(0);
  const [lastPlayTime, setLastPlayTime] = useState<string | null>(null);

  // تهيئة خدمة الصوت عند تحميل المكون
  useEffect(() => {
    soundService.initialize();

    // إضافة مستمع حدث للنقر لفتح الصوت في المتصفحات
    const unlockAudio = () => {
      // تشغيل صوت صامت لفتح الصوت في المتصفحات
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        // إنشاء مذبذب صامت
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.001; // شبه صامت
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(0);
        oscillator.stop(0.001);
      } catch (error) {
        console.error('Error unlocking audio:', error);
      }
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // تشغيل صوت الإشعار باستخدام خدمة الصوت
  const playSound = () => {
    console.log('Testing notification sound with SoundService');
    soundService.playSound('notification');
    setPlayCount(prev => prev + 1);
    setLastPlayTime(new Date().toLocaleTimeString());
  };

  // تشغيل صوت باستخدام Audio API العادية
  const playWithAudioAPI = () => {
    try {
      console.log('Testing with standard Audio API');
      const audio = new Audio('/notification-sound-new.mp3');
      audio.volume = 0.8;

      // إضافة العنصر إلى DOM لضمان التشغيل في بعض المتصفحات
      document.body.appendChild(audio);

      // إضافة معالج أحداث لإزالة العنصر بعد التشغيل
      audio.onended = () => {
        if (audio.parentNode) {
          audio.parentNode.removeChild(audio);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error('Audio API failed:', e);
          if (audio.parentNode) {
            audio.parentNode.removeChild(audio);
          }
        });
      }

      setPlayCount(prev => prev + 1);
      setLastPlayTime(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error playing with Audio API:', error);
    }
  };

  // إعادة تعيين Howler
  const resetHowler = () => {
    try {
      console.log('Resetting Howler');
      Howler.unload(); // إلغاء تحميل جميع الأصوات
      soundService.initialize(); // إعادة تهيئة خدمة الصوت
      setPlayCount(0);
      setLastPlayTime(null);
    } catch (error) {
      console.error('Error resetting Howler:', error);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-4">اختبار تشغيل الصوت</h2>
      <p className="mb-4">انقر على الأزرار أدناه لاختبار تشغيل صوت الإشعارات</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={playSound} className="bg-purple-600 hover:bg-purple-700">
          تشغيل باستخدام Howler
        </Button>
        <Button onClick={playWithAudioAPI} variant="outline">
          تشغيل باستخدام Audio API
        </Button>
        <Button onClick={resetHowler} variant="destructive">
          إعادة تعيين
        </Button>
      </div>

      {playCount > 0 && (
        <div className="mt-4 text-sm">
          <p>عدد مرات التشغيل: <span className="font-bold">{playCount}</span></p>
          <p>آخر تشغيل: <span className="font-bold">{lastPlayTime}</span></p>
        </div>
      )}
    </div>
  );
};

export default SoundTest;
