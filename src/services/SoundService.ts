import { Howl, Howler } from 'howler';
import logger from '@/utils/logger';

// خدمة إدارة الأصوات في التطبيق
class SoundService {
  private static instance: SoundService;
  private sounds: Map<string, Howl>;
  private isInitialized: boolean = false;
  private lastPlayTime: Map<string, number> = new Map();
  private minPlayInterval: number = 1000; // الحد الأدنى للفاصل الزمني بين تشغيل الأصوات (بالمللي ثانية)
  private audioContext: AudioContext | null = null;

  private constructor() {
    this.sounds = new Map();
    this.setupAudioContext();
  }

  // إعداد سياق الصوت
  private setupAudioContext(): void {
    try {
      // إنشاء سياق صوت جديد للمساعدة في فتح الصوت في المتصفحات
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        logger.debug('AudioContext created successfully');
      }
    } catch (error) {
      logger.error('Error creating AudioContext:', error);
    }
  }

  // فتح سياق الصوت (يجب استدعاؤها بعد تفاعل المستخدم)
  private resumeAudioContext(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        logger.debug('AudioContext resumed successfully');
      }).catch(error => {
        logger.error('Error resuming AudioContext:', error);
      });
    }
  }

  // الحصول على نسخة واحدة من الخدمة (Singleton)
  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  // تهيئة الخدمة وتحميل الأصوات
  public initialize(): void {
    if (this.isInitialized) return;

    try {
      // تعيين علم التهيئة قبل تحميل الصوت
      this.isInitialized = true;

      // إعداد سياق الصوت
      this.setupAudioContext();

      // إضافة مستمعي أحداث للتفاعل مع المستخدم لفتح الصوت
      this.setupUserInteractionListeners();

      logger.debug('Sound service initialized successfully');

      // تحميل صوت الإشعارات بشكل غير متزامن بعد تأخير قصير
      setTimeout(() => {
        // استخدام Web Audio API مباشرة بدلاً من Howler.js
        this.createInlineBeepSound('notification');
      }, 1000); // تأخير 1 ثانية لإعطاء الأولوية لتحميل واجهة المستخدم
    } catch (error) {
      logger.error('Error initializing sound service:', error);
    }
  }

  // إعداد مستمعي أحداث للتفاعل مع المستخدم
  private setupUserInteractionListeners(): void {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.resumeAudioContext();

        // تشغيل صوت صامت باستخدام Web Audio API
        if (this.audioContext) {
          try {
            // إنشاء مذبذب بصوت منخفض جدًا
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime); // صوت منخفض جدًا

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1); // تشغيل لمدة 0.1 ثانية فقط

            logger.debug('Playing silent sound to unlock audio context');
          } catch (error) {
            logger.error('Error playing silent sound:', error);
          }
        }

        // إزالة مستمعي الأحداث بعد التفاعل الأول
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };

      document.addEventListener('click', unlockAudio, { once: true });
      document.addEventListener('touchstart', unlockAudio, { once: true });
      document.addEventListener('keydown', unlockAudio, { once: true });
    }
  }

  // تسجيل صوت جديد
  public registerSound(name: string, sources: string[]): void {
    try {
      logger.debug(`Attempting to register sound ${name} with sources:`, sources);

      // إذا كان الصوت موجودًا بالفعل، قم بإزالته أولاً
      if (this.sounds.has(name)) {
        const existingSound = this.sounds.get(name);
        if (existingSound) {
          existingSound.unload();
        }
        this.sounds.delete(name);
      }

      // إنشاء صوت افتراضي أولاً لضمان وجود صوت دائمًا
      this.createFallbackSound(name);

      // تحقق من وجود الملفات قبل تسجيل الصوت
      this.checkSoundFiles(sources).then(validSources => {
        if (validSources.length === 0) {
          logger.error(`No valid sound sources found for ${name}`);
          // الصوت الافتراضي تم إنشاؤه بالفعل
          return;
        }

        logger.debug(`Registering sound ${name} with valid sources:`, validSources);

        // إنشاء كائن صوت جديد
        try {
          const sound = new Howl({
            src: validSources,
            volume: 0.8,
            preload: true,
            html5: true, // استخدام HTML5 Audio للتوافق مع سفاري وأجهزة آبل
            format: ['mp3', 'wav'],
            pool: 5, // عدد نسخ الصوت المسموح بتشغيلها في وقت واحد
            onload: () => {
              logger.debug(`Sound ${name} loaded successfully`);
              // استبدال الصوت الافتراضي بالصوت الذي تم تحميله بنجاح
              this.sounds.set(name, sound);
            },
            onloaderror: (id, error) => {
              logger.error(`Error loading sound ${name}:`, error);
              // الصوت الافتراضي موجود بالفعل، لا داعي لإنشائه مرة أخرى
            },
            onplayerror: (id, error) => {
              logger.error(`Error playing sound ${name}:`, error);

              // محاولة إعادة تشغيل الصوت بعد تفاعل المستخدم
              const unlockAudio = () => {
                this.resumeAudioContext();
                if (sound.playing()) return;
                sound.play();
                document.removeEventListener('click', unlockAudio);
                document.removeEventListener('touchstart', unlockAudio);
              };

              document.addEventListener('click', unlockAudio, { once: true });
              document.addEventListener('touchstart', unlockAudio, { once: true });
            }
          });
        } catch (howlError) {
          logger.error(`Error creating Howl instance for ${name}:`, howlError);
          // الصوت الافتراضي موجود بالفعل، لا داعي لإنشائه مرة أخرى
        }
      });
    } catch (error) {
      logger.error(`Error registering sound ${name}:`, error);
      // استخدام صوت افتراضي في حالة حدوث خطأ
      this.createFallbackSound(name);
    }
  }

  // التحقق من وجود ملفات الصوت
  private async checkSoundFiles(sources: string[]): Promise<string[]> {
    const validSources: string[] = [];

    // استخدام Promise.all لتحسين الأداء
    const checkPromises = sources.map(src =>
      new Promise<string | null>(resolve => {
        fetch(src, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              resolve(src);
            } else {
              logger.warn(`Sound file not found: ${src}`);
              resolve(null);
            }
          })
          .catch(error => {
            logger.warn(`Error checking sound file ${src}:`, error);
            resolve(null);
          });
      })
    );

    try {
      // انتظار جميع الطلبات وتصفية النتائج الفارغة
      const results = await Promise.all(checkPromises);
      for (const src of results) {
        if (src) validSources.push(src);
      }
    } catch (error) {
      logger.error('Error checking sound files:', error);
    }

    // إذا لم يتم العثور على أي ملفات صالحة، استخدم المصادر الأصلية
    if (validSources.length === 0 && sources.length > 0) {
      logger.warn('No valid sources found, using original sources');
      return [sources[0]]; // استخدم المصدر الأول على الأقل
    }

    return validSources;
  }

  // إنشاء صوت مضمن في الكود
  private createInlineBeepSound(name: string): void {
    try {
      logger.debug(`Creating Web Audio beep sound for ${name}`);

      // استخدام Web Audio API مباشرة بدلاً من Howler.js
      // إنشاء وظيفة تشغيل الصوت
      const playBeep = () => {
        try {
          if (!this.audioContext) {
            this.setupAudioContext();
          }

          if (!this.audioContext) {
            logger.error('Cannot create beep sound: AudioContext not available');
            return;
          }

          // إنشاء مذبذب بسيط
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();

          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.01);
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.3);

          logger.debug(`Playing Web Audio beep sound for ${name}`);
          return 1; // معرف وهمي للصوت
        } catch (error) {
          logger.error(`Error playing Web Audio beep for ${name}:`, error);
          return 0;
        }
      };

      // إنشاء كائن صوت يستخدم Web Audio API
      const sound = {
        play: playBeep,
        stop: () => {},
        playing: () => false,
        volume: () => 0.5,
        unload: () => {},
        on: () => {},
        once: () => {},
        off: () => {},
        fade: () => {},
        state: () => 'loaded',
        duration: () => 0.3,
        seek: () => 0,
        pause: () => {},
        mute: () => {},
        rate: () => 1,
        stereo: () => {},
        pos: () => [0, 0, 0],
        orientation: () => [0, 0, 0],
        pannerAttr: () => ({}),
        loop: () => false
      } as unknown as Howl;

      // تسجيل الصوت
      this.sounds.set(name, sound);
      logger.debug(`Created Web Audio beep sound for ${name}`);

    } catch (error) {
      logger.error(`Error creating Web Audio beep sound for ${name}:`, error);
      this.createFallbackSound(name);
    }
  }

  // إنشاء صوت افتراضي باستخدام Web Audio API
  private createFallbackSound(name: string): void {
    try {
      if (!this.audioContext) {
        this.setupAudioContext();
      }

      if (!this.audioContext) {
        logger.error('Cannot create fallback sound: AudioContext not available');
        return;
      }

      // إنشاء مذبذب بسيط كصوت افتراضي
      const createBeepSound = () => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext!.currentTime);
        gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext!.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.3);

        return {
          play: () => {
            // الصوت يبدأ تلقائيًا عند إنشائه
            logger.debug('Playing fallback beep sound');
          },
          stop: () => {
            // لا شيء للإيقاف، الصوت يتوقف تلقائيًا
          },
          playing: () => false,
          unload: () => {
            // لا شيء للتفريغ
          }
        };
      };

      // تسجيل الصوت الافتراضي
      this.sounds.set(name, {
        play: () => {
          const beep = createBeepSound();
          return 1; // معرف وهمي للصوت
        },
        stop: () => {},
        playing: () => false,
        volume: () => 0.5,
        unload: () => {},
        on: () => {},
        once: () => {},
        off: () => {},
        fade: () => {},
        state: () => 'loaded',
        duration: () => 0.3,
        seek: () => 0,
        pause: () => {},
        mute: () => {},
        rate: () => 1,
        stereo: () => {},
        pos: () => [0, 0, 0],
        orientation: () => [0, 0, 0],
        pannerAttr: () => ({}),
        loop: () => false
      } as unknown as Howl);

      logger.debug(`Created fallback sound for ${name}`);
    } catch (error) {
      logger.error(`Error creating fallback sound for ${name}:`, error);
    }
  }

  // تشغيل صوت
  public playSound(name: string): void {
    try {
      if (!this.isInitialized) {
        this.initialize();
      }

      // التحقق من الفاصل الزمني بين تشغيل الأصوات
      const now = Date.now();
      const lastPlay = this.lastPlayTime.get(name) || 0;
      if (now - lastPlay < this.minPlayInterval) {
        logger.debug(`Skipping sound ${name} - played too recently`);
        return;
      }

      const sound = this.sounds.get(name);
      if (!sound) {
        logger.warn(`Sound ${name} not found, creating inline beep sound`);
        // استخدام الصوت المضمن بدلاً من الصوت الافتراضي
        this.createInlineBeepSound(name);
        // محاولة الحصول على الصوت المضمن بعد إنشائه
        const inlineSound = this.sounds.get(name);
        if (inlineSound) {
          inlineSound.play();
        } else {
          // إذا فشل الصوت المضمن، استخدم الصوت الافتراضي
          this.createFallbackSound(name);
          const fallbackSound = this.sounds.get(name);
          if (fallbackSound) {
            fallbackSound.play();
          } else {
            // إذا فشل كل شيء، استخدم Audio API العادية
            this.playFallbackSound();
          }
        }
        return;
      }

      // فتح سياق الصوت
      this.resumeAudioContext();

      // تحديث وقت آخر تشغيل
      this.lastPlayTime.set(name, now);

      // تشغيل الصوت
      try {
        const id = sound.play();
        sound.volume(0.8, id);
        logger.debug(`Playing sound: ${name} with id: ${id}`);
      } catch (playError) {
        logger.error(`Error playing sound ${name} with Howler:`, playError);

        // محاولة تشغيل الصوت باستخدام Audio API العادية كخطة بديلة
        this.playFallbackSound();

        // إعادة تسجيل الصوت في المرة القادمة باستخدام الصوت المضمن
        setTimeout(() => {
          logger.debug(`Re-registering sound ${name} after play error`);
          this.sounds.delete(name);
          this.createInlineBeepSound(name);
        }, 1000);
      }
    } catch (error) {
      logger.error(`Error in playSound for ${name}:`, error);

      // محاولة تشغيل الصوت باستخدام Audio API العادية كخطة بديلة
      this.playFallbackSound();
    }
  }

  // تشغيل صوت بديل باستخدام Web Audio API مباشرة
  private playFallbackSound(): void {
    try {
      // استخدام Web Audio API مباشرة بدلاً من Audio API
      this.playWebAudioBeep();
    } catch (fallbackError) {
      logger.error('Fallback sound failed:', fallbackError);
    }
  }

  // تشغيل صوت باستخدام Web Audio API مباشرة
  private playWebAudioBeep(): void {
    try {
      if (!this.audioContext) {
        this.setupAudioContext();
      }

      if (!this.audioContext) {
        logger.error('Cannot play Web Audio beep: AudioContext not available');
        return;
      }

      // إنشاء مذبذب بسيط
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.3);

      logger.debug('Playing Web Audio beep as last resort');
    } catch (error) {
      logger.error('Web Audio beep also failed:', error);
    }
  }
}

// تصدير نسخة واحدة من الخدمة
export const soundService = SoundService.getInstance();
