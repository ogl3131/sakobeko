// --- SAKOBEKO VS BARIŞ OYUN KODLARI ---

// Ses Sentezleyici Yardımcı Sınıfı (Web Audio API)
class SoundSynthesizer {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playShoot() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playHit(material) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        if (material === 'glass') {
            // Yüksek frekanslı cam çınlaması
            for (let i = 0; i < 3; i++) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2000 + i * 500, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.15);
            }
        } else if (material === 'stone') {
            // Düşük frekanslı taş darbesi
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.linearRampToValueAtTime(30, now + 0.2);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } else {
            // Tahta darbesi
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(60, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        }
    }

    playExplosion() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // Gürültü (Noise) üretimi ile patlama efekti
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + 0.4);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.4);

        // Derinlik katmak için sub-bass oscillator
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(90, now);
        subOsc.frequency.linearRampToValueAtTime(20, now + 0.35);
        subGain.gain.setValueAtTime(0.6, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.35);
    }

    playRageUp() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(500, now + 0.4);
        
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
    }
}

const sfx = new SoundSynthesizer();

// --- BARIŞ TOXIC SESLENDİRME SİSTEMİ (Web Speech API) ---
const ToxicSpeech = {
    voices: [],
    init() {
        if ('speechSynthesis' in window) {
            this.loadVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => this.loadVoices();
            }
        }
    },
    loadVoices() {
        this.voices = window.speechSynthesis.getVoices();
    },
    speak(text, pitch = 1.2, rate = 1.0) {
        if (!('speechSynthesis' in window)) return;
        
        // Önceki konuşmaları iptal et (üst üste binmesin)
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        
        // Türkçe ses bulmaya çalış
        const trVoice = this.voices.find(voice => voice.lang.includes('TR') || voice.lang.includes('tr'));
        if (trVoice) {
            utterance.voice = trVoice;
        }

        utterance.pitch = pitch; // Daha ince, gıcık veya kalın ses
        utterance.rate = rate; // Konuşma hızı
        
        window.speechSynthesis.speak(utterance);
    }
};

ToxicSpeech.init();

// --- OYUN AYARLARI VE DÜNYASI ---
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

// Seviyeler (JSON Tabanlı Kolay Eklenir Yapı)
const LEVELS = [
    // Seviye 1: Kolay Isınma
    {
        barisX: 980,
        barisY: 530,
        blocks: [
            // Alt destekler (Tahta)
            { x: 920, y: 550, w: 20, h: 100, type: 'wood' },
            { x: 1040, y: 550, w: 20, h: 100, type: 'wood' },
            // Üst kalas (Tahta)
            { x: 980, y: 490, w: 160, h: 20, type: 'wood' },
            // Koruyucu Camlar
            { x: 980, y: 440, w: 40, h: 80, type: 'glass' },
            { x: 920, y: 430, w: 20, h: 100, type: 'glass' },
            { x: 1040, y: 430, w: 20, h: 100, type: 'glass' }
        ]
    },
    // Seviye 2: Taş Kule
    {
        barisX: 1000,
        barisY: 480,
        blocks: [
            // Zemin Kat (Taş)
            { x: 920, y: 550, w: 30, h: 100, type: 'stone' },
            { x: 1080, y: 550, w: 30, h: 100, type: 'stone' },
            { x: 1000, y: 490, w: 200, h: 20, type: 'stone' },
            // 1. Kat (Tahta)
            { x: 940, y: 430, w: 20, h: 100, type: 'wood' },
            { x: 1060, y: 430, w: 20, h: 100, type: 'wood' },
            { x: 1000, y: 370, w: 160, h: 20, type: 'wood' },
            // En Üst (Camlar)
            { x: 970, y: 330, w: 30, h: 60, type: 'glass' },
            { x: 1030, y: 330, w: 30, h: 60, type: 'glass' },
            { x: 1000, y: 290, w: 100, h: 20, type: 'glass' }
        ]
    },
    // Seviye 3: Kaotik ve Güvenli Sığınak (Zor)
    {
        barisX: 1000,
        barisY: 340,
        blocks: [
            // Devasa Taş Bloklar
            { x: 900, y: 550, w: 40, h: 120, type: 'stone' },
            { x: 1100, y: 550, w: 40, h: 120, type: 'stone' },
            { x: 1000, y: 480, w: 240, h: 30, type: 'stone' },
            // Orta Kat
            { x: 930, y: 410, w: 30, h: 100, type: 'wood' },
            { x: 1070, y: 410, w: 30, h: 100, type: 'wood' },
            { x: 1000, y: 350, w: 180, h: 20, type: 'stone' },
            // Barış'ın Üstündeki Kalkanlar
            { x: 1000, y: 280, w: 80, h: 80, type: 'glass' },
            { x: 900, y: 300, w: 20, h: 120, type: 'wood' },
            { x: 1100, y: 300, w: 20, h: 120, type: 'wood' }
        ]
    }
];

class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Yükleme Metni Çizimi
        const progress = this.add.graphics();
        this.load.on('progress', (value) => {
            progress.clear();
            progress.fillStyle(0x39ff14, 0.8);
            progress.fillRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2, 300 * value, 20);
        });

        this.load.on('complete', () => {
            progress.destroy();
        });

        // Resimlerin Yüklenmesi (Kök dizin uyumlu)
        this.load.image('baris', 'baris.png');
        this.load.image('sakobeko', 'sakobeko.png');

        // Seslerin Yüklenmesi (Kök dizin uyumlu)
        this.load.audio('saksocuBeko', 'saksocubeko.ogg');
    }

    create() {
        // Dinamik olarak HTML5 Canvas kullanarak beyaz kare dokusu (whiteSquare) oluşturuyoruz
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 32, 32);
        this.textures.addCanvas('whiteSquare', canvas);

        // 1. SakoBeko Yuvarlak Emoji Maskeleme ve Çerçeve
        try {
            const sakoOrig = this.textures.get('sakobeko').getSourceImage();
            const sakoCanvas = this.textures.createCanvas('sakobekoRound', 128, 128);
            const sakoCtx = sakoCanvas.getContext();
            
            sakoCtx.save();
            sakoCtx.beginPath();
            sakoCtx.arc(64, 64, 60, 0, Math.PI * 2);
            sakoCtx.clip();
            sakoCtx.drawImage(sakoOrig, 0, 0, 128, 128);
            sakoCtx.restore();
            
            // Parlak neon pembe dairesel çerçeve (Cyberpunk emoji tarzı)
            sakoCtx.beginPath();
            sakoCtx.arc(64, 64, 60, 0, Math.PI * 2);
            sakoCtx.strokeStyle = '#ff007f';
            sakoCtx.lineWidth = 6;
            sakoCtx.stroke();
            sakoCanvas.refresh();
        } catch(e) {
            console.error("Error creating round sakobeko texture", e);
        }

        // 2. Barış Yuvarlak Emoji Maskeleme ve Çerçeve
        try {
            const barisOrig = this.textures.get('baris').getSourceImage();
            const barisCanvas = this.textures.createCanvas('barisRound', 128, 128);
            const barisCtx = barisCanvas.getContext();
            
            barisCtx.save();
            barisCtx.beginPath();
            barisCtx.arc(64, 64, 60, 0, Math.PI * 2);
            barisCtx.clip();
            barisCtx.drawImage(barisOrig, 0, 0, 128, 128);
            barisCtx.restore();
            
            // Parlak neon yeşil dairesel çerçeve (Cyberpunk emoji tarzı)
            barisCtx.beginPath();
            barisCtx.arc(64, 64, 60, 0, Math.PI * 2);
            barisCtx.strokeStyle = '#39ff14';
            barisCtx.lineWidth = 6;
            barisCtx.stroke();
            barisCanvas.refresh();
        } catch(e) {
            console.error("Error creating round baris texture", e);
        }

        this.scene.start('PlayScene');
    }
}

class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
    }

    init(data) {
        // Değişkenleri Sıfırla veya Aktar
        this.currentLevelIndex = (data && data.levelIndex !== undefined) ? data.levelIndex : 0;
        this.score = (data && data.score !== undefined) ? data.score : 0;
        this.remainingAttempts = 3;
        this.rageMeter = (data && data.rageMeter !== undefined) ? data.rageMeter : 0;
        this.isRageActive = (data && data.isRageActive !== undefined) ? data.isRageActive : false;
        
        // Sapan Durum Kontrolleri
        this.anchorX = 260;
        this.anchorY = 460;
        this.birdRadius = 24;
        this.isBirdFlying = false;
        this.isDragging = false;
        this.flightTime = 0;
        this.isLevelCompleted = false;
        
        this.slingshotBandGraphics = null;
        this.slingshotBackBandGraphics = null;
        this.trajectoryGraphics = null;
    }

    create() {
        // Ses Sentezleyicisini Başlat
        sfx.init();

        // UI DOM Buton Bağlantıları
        this.setupDOMBindings();

        // Gökyüzü Gradient Çizimi
        this.createSky();

        // Arka Plan Dağları ve Bulutlar
        this.createScenery();

        // Fizik Dünyası Sınırları (Matter.js)
        this.matter.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT - 60);

        // Zemin Çizimi ve Fiziksel Gövdesi
        this.createGround();

        // Sapan Direkleri Çizimi (Görsel)
        this.createSlingshotStructure();

        // Seviyeyi Yükle
        this.loadLevel(this.currentLevelIndex);

        // Çarpışma Dinleyicisi
        this.setupCollisionHandlers();

        // 10 Saniyede Bir Barış'ın Toxic Şaka Yapması
        this.startToxicTimer();

        // Mouse/Touch ile Sapan Çekme Mekaniği
        this.setupSlingshotInteraction();

        // Sahne kapandığında parçacık aurasını temizle
        this.events.on('shutdown', () => {
            if (this.rageEmitter) {
                this.rageEmitter.destroy();
                this.rageEmitter = null;
            }
        });
    }

    setupDOMBindings() {
        const startBtn = document.getElementById('btn-start');
        const testBtn = document.getElementById('btn-test-speech');
        const retryBtn = document.getElementById('btn-retry');
        const nextBtn = document.getElementById('btn-next-level');
        const restartBtn = document.getElementById('btn-restart');

        // Giriş butonuna basınca ses iznini alıp oyunu başlatıyoruz
        if (startBtn) {
            startBtn.onclick = () => {
                sfx.init();
                document.getElementById('start-screen').classList.remove('active');
                document.getElementById('game-ui').classList.add('active');
                
                // Gerçek ses kaydı varsa ilk olarak onu çal
                try {
                    this.sound.play('saksocuBeko');
                    this.showSpeechBubble("Saksocu Beko!");
                } catch(e) {
                    ToxicSpeech.speak("Beni asla vuramazsın saksocu Beko, hadi dene bakalım!", 1.3, 1.0);
                }
            };
        }

        if (testBtn) {
            testBtn.onclick = () => {
                sfx.init();
                sfx.playRageUp();
                
                // Butona basıldığında gerçek ses kaydını oynat
                try {
                    this.sound.play('saksocuBeko');
                    this.showSpeechBubble("Saksocu Beko!");
                } catch(e) {
                    const replies = [
                        "Hahaha! Saksocu Beko!",
                        "Naber lan Beko?",
                        "Hahaha olum bu ne?",
                        "Daha sapanı çekemiyorsun Beko!",
                        "Vuramadın ki Beko!"
                    ];
                    const randomText = replies[Math.floor(Math.random() * replies.length)];
                    ToxicSpeech.speak(randomText, 1.35, 1.15);
                }
            };
        }

        if (retryBtn) {
            retryBtn.onclick = () => {
                document.getElementById('gameover-screen').classList.remove('active');
                document.getElementById('game-ui').classList.add('active');
                this.restartLevel();
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                document.getElementById('win-screen').classList.remove('active');
                document.getElementById('game-ui').classList.add('active');
                this.currentLevelIndex = (this.currentLevelIndex + 1) % LEVELS.length;
                this.restartLevel();
            };
        }

        if (restartBtn) {
            restartBtn.onclick = () => {
                this.restartLevel();
            };
        }

        // Skor ve Hakları Ekranda Güncelle
        this.updateHUD();
    }

    createSky() {
        const sky = this.add.graphics();
        // Güzel bir gün batımı/neon mor gökyüzü gradyanı
        sky.fillGradientStyle(0x1a0f30, 0x1a0f30, 0x0f0c1b, 0x0f0c1b, 1);
        sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    createScenery() {
        // Yıldızlar
        const stars = this.add.graphics();
        stars.fillStyle(0xffffff, 0.4);
        for (let i = 0; i < 40; i++) {
            stars.fillCircle(Phaser.Math.Between(10, GAME_WIDTH - 10), Phaser.Math.Between(10, GAME_HEIGHT - 300), Phaser.Math.Between(1, 3));
        }

        // Arka Plan Tepeleri (Synthwave/Neon Dağlar)
        const hills = this.add.graphics();
        hills.fillStyle(0x0e081c);
        hills.lineStyle(2, 0x39ff14, 0.3); // Neon yeşili dağ çizgisi
        hills.beginPath();
        hills.moveTo(0, GAME_HEIGHT - 60);
        hills.lineTo(0, GAME_HEIGHT - 180);
        hills.lineTo(GAME_WIDTH * 0.25, GAME_HEIGHT - 260);
        hills.lineTo(GAME_WIDTH * 0.5, GAME_HEIGHT - 190);
        hills.lineTo(GAME_WIDTH * 0.75, GAME_HEIGHT - 250);
        hills.lineTo(GAME_WIDTH, GAME_HEIGHT - 160);
        hills.lineTo(GAME_WIDTH, GAME_HEIGHT - 60);
        hills.closePath();
        hills.fillPath();
        hills.strokePath();

        // Ay/Güneş (Neon Yeşili/Mor Vibe)
        const moon = this.add.graphics();
        moon.fillStyle(0x39ff14, 0.15);
        moon.fillCircle(1100, 150, 100);
        moon.fillStyle(0x39ff14, 0.65);
        moon.fillCircle(1100, 150, 80);
    }

    createGround() {
        const groundY = GAME_HEIGHT - 30;
        const groundHeight = 60;

        // Matter.js static zemin
        const groundBody = this.matter.add.rectangle(GAME_WIDTH / 2, groundY, GAME_WIDTH, groundHeight, {
            isStatic: true,
            friction: 0.9,
            label: 'ground'
        });

        // Çimenli neon görsel zemin
        const groundGfx = this.add.graphics();
        groundGfx.fillStyle(0x181a24);
        groundGfx.fillRect(0, groundY - groundHeight / 2, GAME_WIDTH, groundHeight);
        
        // Parlayan neon çimen çizgisi
        groundGfx.lineStyle(4, 0x39ff14, 0.8);
        groundGfx.lineBetween(0, groundY - groundHeight / 2, GAME_WIDTH, groundY - groundHeight / 2);
    }

    createSlingshotStructure() {
        // Sapan İki Parçadan Oluşur: Ön Direk ve Arka Direk
        // Doku üretme hatasından kaçınmak için direkleri doğrudan graphics objeleri olarak çiziyoruz.
        
        // Arka Direk (depth: 2)
        const postBack = this.add.graphics().setDepth(2);
        postBack.fillStyle(0x5c4033);
        postBack.fillRect(this.anchorX - 16, this.anchorY - 5, 12, 120);
        postBack.fillStyle(0x3e2723);
        postBack.fillRect(this.anchorX - 16, this.anchorY - 5, 3, 120);

        // Ön Direk (depth: 4)
        const postFront = this.add.graphics().setDepth(4);
        postFront.fillStyle(0x5c4033);
        postFront.fillRect(this.anchorX + 4, this.anchorY - 8, 12, 120);
        postFront.fillStyle(0x3e2723);
        postFront.fillRect(this.anchorX + 4, this.anchorY - 8, 3, 120);

        // İp Çizim Katmanları
        this.slingshotBackBandGraphics = this.add.graphics().setDepth(3);
        this.slingshotBandGraphics = this.add.graphics().setDepth(5);
        this.trajectoryGraphics = this.add.graphics().setDepth(1);
    }

    loadLevel(levelIndex) {
        // Temizleme İşlemleri
        if (this.rageEmitter) {
            this.rageEmitter.destroy();
            this.rageEmitter = null;
        }
        if (this.blocks) {
            this.blocks.forEach(b => { if (b && b.destroy) b.destroy(); });
        }
        if (this.baris) {
            this.baris.destroy();
        }
        if (this.bird) {
            this.bird.destroy();
        }

        this.blocks = [];
        const lvl = LEVELS[levelIndex];

        // 1. Barış'ı Oluştur (Düşman - Yuvarlak Doku)
        this.baris = this.matter.add.sprite(lvl.barisX, lvl.barisY, 'barisRound');
        this.baris.setDisplaySize(64, 64);
        
        // Yuvarlak Matter.js gövdesi
        this.baris.setCircle(32, {
            density: 0.005,
            friction: 0.4,
            restitution: 0.1,
            label: 'baris'
        });
        
        this.baris.setData('type', 'enemy');
        this.baris.setData('health', 50);

        // 2. Blokları Oluştur
        const materialColors = {
            glass: 0x87CEEB,
            wood: 0x8b4513,
            stone: 0x5a5d64
        };

        const materialStrengths = {
            glass: 30,
            wood: 120,
            stone: 350
        };

        lvl.blocks.forEach((bInfo, idx) => {
            // Dinamik olarak oluşturduğumuz 'whiteSquare' dokusunu kullanarak
            // scale edip tint ile renklendirerek blokları oluşturuyoruz.
            const block = this.matter.add.sprite(bInfo.x, bInfo.y, 'whiteSquare');
            block.setDisplaySize(bInfo.w, bInfo.h);
            block.setTint(materialColors[bInfo.type]);
            
            // Cam materyali için yarı şeffaflık
            if (bInfo.type === 'glass') {
                block.setAlpha(0.7);
            }

            block.setRectangle(bInfo.w, bInfo.h, {
                density: bInfo.type === 'stone' ? 0.012 : (bInfo.type === 'wood' ? 0.005 : 0.002),
                friction: bInfo.type === 'stone' ? 0.8 : 0.4,
                restitution: 0.05,
                label: 'block'
            });

            block.setData('type', bInfo.type);
            block.setData('health', materialStrengths[bInfo.type]);
            block.setData('maxHealth', materialStrengths[bInfo.type]);

            this.blocks.push(block);
        });

        // 3. SakoBeko'yu Sapanın Üzerine Koy
        this.spawnBird();
    }

    spawnBird() {
        if (this.rageEmitter) {
            this.rageEmitter.destroy();
            this.rageEmitter = null;
        }

        if (this.bird) {
            const oldBird = this.bird;
            this.time.delayedCall(0, () => {
                if (oldBird && oldBird.active) {
                    oldBird.destroy();
                }
            });
            this.bird = null;
        }

        this.isBirdFlying = false;
        this.isDragging = false;

        this.bird = this.matter.add.sprite(this.anchorX, this.anchorY, 'sakobekoRound');
        this.bird.setDisplaySize(48, 48);
        this.bird.setDepth(4);

        // Matter.js fizik özelliklerini ata (Dairesel)
        this.bird.setCircle(22, {
            density: this.isRageActive ? 0.03 : 0.006, // Rage modunda inanılmaz ağır ve güçlü fırlatma
            friction: 0.1,
            restitution: 0.45,
            label: 'bird'
        });

        // Kuşun fizik gövdesini sapan çekerken statik (sensor/kinematic gibi) yapıyoruz
        this.bird.setStatic(true);

        // Rage modunda kuşu kırmızıya boya ve parlat
        if (this.isRageActive) {
            this.bird.setTint(0xff3333);
            
            // Rage parçacık aurası oluştur (dinamik 'whiteSquare' dokusunu boyayarak)
            this.rageEmitter = this.add.particles(0, 0, 'whiteSquare', {
                speed: { min: 20, max: 60 },
                scale: { start: 0.2, end: 0 }, // Ufak kare parçacıklar
                blendMode: 'ADD',
                lifespan: 600,
                gravityY: -100,
                tint: 0xff0000,
                frequency: 40
            });
            this.rageEmitter.startFollow(this.bird);
            this.rageEmitter.setDepth(3);
        }
    }

    setupSlingshotInteraction() {
        this.input.on('pointerdown', (pointer) => {
            if (this.isBirdFlying) return;

            // Kuşa tıklanıp tıklanmadığını kontrol et
            const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.bird.x, this.bird.y);
            if (dist < 40) {
                this.isDragging = true;
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (!this.isDragging) return;

            // Çekim mesafesi sınırlaması (Max 140px)
            const angle = Phaser.Math.Angle.Between(this.anchorX, this.anchorY, pointer.x, pointer.y);
            let dist = Phaser.Math.Distance.Between(this.anchorX, this.anchorY, pointer.x, pointer.y);
            if (dist > 140) dist = 140;

            // Kuşu konumlandır
            const targetX = this.anchorX + Math.cos(angle) * dist;
            const targetY = this.anchorY + Math.sin(angle) * dist;

            this.bird.setPosition(targetX, targetY);

            // Sapan İplerini ve Yörünge Tahmin Çizgisini Çiz
            this.drawSlingshotBands(targetX, targetY);
            this.drawTrajectory(targetX, targetY, angle, dist);
        });

        this.input.on('pointerup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;

            // Sapan iplerini ve yörüngeyi temizle
            this.slingshotBandGraphics.clear();
            this.slingshotBackBandGraphics.clear();
            this.trajectoryGraphics.clear();

            // Sapanı yeterince çekmiş mi?
            const dist = Phaser.Math.Distance.Between(this.anchorX, this.anchorY, this.bird.x, this.bird.y);
            if (dist > 20) {
                // Kuşu fırlat
                this.isBirdFlying = true;
                this.bird.setStatic(false);

                // Ters yönde kuvvet uygula (Fırlatma gücü)
                const angle = Phaser.Math.Angle.Between(this.bird.x, this.bird.y, this.anchorX, this.anchorY);
                // Rage modunda ekstra hız/kuvvet çarpanı
                const forceMult = this.isRageActive ? 0.35 : 0.12; 
                
                this.bird.setVelocity(
                    Math.cos(angle) * dist * forceMult,
                    Math.sin(angle) * dist * forceMult
                );

                sfx.playShoot();

                // Reset flight duration tracker
                this.flightTime = 0;
            } else {
                // Yeterince çekmediyse geri yerine koy
                this.bird.setPosition(this.anchorX, this.anchorY);
            }
        });
    }

    drawSlingshotBands(bx, by) {
        // Ön ve Arka İpler
        const bandColor = 0xff3333; // Kırmızımsı elastik sapan lastiği
        
        // Arka sapan bandı (Kuşun arkasında kalır, depth: 3)
        this.slingshotBackBandGraphics.clear();
        this.slingshotBackBandGraphics.lineStyle(6, bandColor, 0.9);
        this.slingshotBackBandGraphics.lineBetween(this.anchorX - 12, this.anchorY - 2, bx, by);

        // Ön sapan bandı (Kuşun üstünde kalır, depth: 5)
        this.slingshotBandGraphics.clear();
        this.slingshotBandGraphics.lineStyle(6, bandColor, 0.9);
        this.slingshotBandGraphics.lineBetween(this.anchorX + 12, this.anchorY - 2, bx, by);
    }

    drawTrajectory(startX, startY, angle, dist) {
        this.trajectoryGraphics.clear();
        this.trajectoryGraphics.fillStyle(0x39ff14, 0.7); // Parlak neon yeşil noktalar

        // Fizik simülasyonunu tahmin et (Phaser + Matter yerçekimi altında parabolik yol)
        const vx = Math.cos(angle + Math.PI) * dist * (this.isRageActive ? 0.35 : 0.12);
        const vy = Math.sin(angle + Math.PI) * dist * (this.isRageActive ? 0.35 : 0.12);
        const gravity = this.matter.world.localWorld.gravity.y * 0.05; // Phaser-Matter gravity scaling factor

        let px = startX;
        let py = startY;
        let pvx = vx;
        let pvy = vy;

        for (let i = 0; i < 30; i++) {
            // Sürtünme ve yerçekimi uygulanan hareket
            px += pvx * 2;
            py += pvy * 2;
            pvy += gravity * 2;

            if (i % 2 === 0) {
                this.trajectoryGraphics.fillCircle(px, py, 4);
            }
        }
    }

    setupCollisionHandlers() {
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach((pair) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                const goA = bodyA.gameObject;
                const goB = bodyB.gameObject;

                if (!goA || !goB) return;

                // Kuş fırlatılmadıysa hiçbir şekilde hasar işleme (başlangıçtaki kule yerleşim sarsıntıları)
                if (!this.isBirdFlying) return;

                // Çarpışmaya kuşun dahil olup olmadığını gövde etiketinden kontrol et
                const isBirdInvolved = (bodyA.label === 'bird' || bodyB.label === 'bird');

                // Göreceli hız farkı
                const relVelX = bodyA.velocity.x - bodyB.velocity.x;
                const relVelY = bodyA.velocity.y - bodyB.velocity.y;
                const impactSpeed = Math.sqrt(relVelX * relVelX + relVelY * relVelY);

                // Hasar eşik değerleri (Kuş çarpması hassas [2.0], blokların kendi çarpışması [6.0] olmalı)
                const threshold = isBirdInvolved ? 2.0 : 6.0;

                if (impactSpeed > threshold) {
                    const baseDamage = (impactSpeed - threshold) * 20;

                    // Bloklara hasar uygulayalım
                    if (goA.getData && goA.getData('health')) this.applyDamage(goA, baseDamage, impactSpeed);
                    if (goB.getData && goB.getData('health')) this.applyDamage(goB, baseDamage, impactSpeed);

                    // Kuşun patlama/yıkım etkileri (Özellikle Rage modunda alan hasarı)
                    if (isBirdInvolved) {
                        if (this.isRageActive) {
                            // Patlama koordinatı olarak kuşun veya çarpılan nesnenin koordinatını al
                            const posX = bodyA.label === 'bird' ? goA.x : goB.x;
                            const posY = bodyA.label === 'bird' ? goA.y : goB.y;
                            this.triggerRageExplosion(posX, posY);
                        } else {
                            sfx.playHit('stone');
                        }
                    }
                }
            });
        });
    }

    applyDamage(gameObject, damage, impactSpeed) {
        const type = gameObject.getData('type');
        const currentHealth = gameObject.getData('health');
        
        let damageMultiplier = 1;
        if (type === 'glass') damageMultiplier = 2.5; // Cam çok kırılgan
        if (type === 'stone') damageMultiplier = 0.5;  // Taş çok sert

        const finalDamage = damage * damageMultiplier;
        const newHealth = currentHealth - finalDamage;

        gameObject.setData('health', newHealth);

        // Darbe sesi çal
        sfx.playHit(type);

        // Çatlama / Görsel kararma efekti
        const maxH = gameObject.getData('maxHealth');
        const pct = Math.max(0, newHealth / maxH);
        
        // Zayıfladıkça kırmızıyı arttır
        const tint = Phaser.Display.Color.GetColor(
            255,
            Math.floor(255 * pct),
            Math.floor(255 * pct)
        );
        gameObject.setTint(tint);

        // Kamera hafif sallansın
        if (impactSpeed > 6) {
            this.cameras.main.shake(120, 0.008);
        }

        // Kırılma durumu
        if (newHealth <= 0) {
            // Parçacık fırlatma
            this.createDebris(gameObject.x, gameObject.y, type);
            
            // Eğer yok olan Barış ise (Oyunu Kazanma)
            if (type === 'enemy') {
                this.score += 10000;
                this.handleWin();
            } else {
                this.score += 500;
            }

            // Fizik motorunun (Matter.js) çarpışma hesaplama döngüsünün ortasında 
            // çökmesini engellemek için objeyi bir sonraki frame'de yok ediyoruz
            this.time.delayedCall(0, () => {
                if (gameObject && gameObject.active) {
                    gameObject.destroy();
                }
            });
        }
    }

    createDebris(x, y, material) {
        const colors = { glass: 0x87CEEB, wood: 0x8B4513, stone: 0x808080 };
        
        // Blok patlama görsel efekti için dinamik 'whiteSquare' dokusunu boyuyoruz.
        const particles = this.add.particles(x, y, 'whiteSquare', {
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 }, // Blok büyüklüğüne göre ufak parçacık ölçeği
            lifespan: 800,
            gravityY: 400,
            quantity: 12,
            tint: colors[material] || 0xffffff
        });

        // 1 saniye sonra parçacık motorunu kapat
        this.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }

    triggerRageExplosion(x, y) {
        // Rage patlaması bir kerede olur
        this.isRageActive = false;
        document.body.classList.remove('rage-active');
        
        // Kuşun rage rengini sil
        if (this.bird && this.bird.clearTint) {
            this.bird.clearTint();
        }
        if (this.rageEmitter) {
            this.rageEmitter.destroy();
            this.rageEmitter = null;
        }

        // Patlama Sesi
        sfx.playExplosion();

        // Kamera Sarsıntısı (Şiddetli)
        this.cameras.main.shake(400, 0.035);
        this.cameras.main.flash(200, 255, 40, 40);

        // Patlama Görsel Halkası
        const boomCircle = this.add.graphics();
        boomCircle.lineStyle(6, 0xff0000, 0.8);
        boomCircle.strokeCircle(x, y, 10);
        
        this.tweens.add({
            targets: boomCircle,
            scale: 25, // Yaklaşık 250px yarıçaplı alan hasarı
            alpha: 0,
            duration: 500,
            onComplete: () => {
                boomCircle.destroy();
            }
        });

        // Çevredeki tüm bloklara devasa alan hasarı ve itme gücü uygula
        const explosionRadius = 240;
        this.blocks.forEach((block) => {
            if (!block.active) return;
            const dist = Phaser.Math.Distance.Between(x, y, block.x, block.y);
            if (dist < explosionRadius) {
                const force = (explosionRadius - dist) / explosionRadius;
                
                // Hasar ver
                this.applyDamage(block, 300 * force, 15);

                // Fiziksel itme kuvveti uygula
                if (block.body) {
                    const angle = Phaser.Math.Angle.Between(x, y, block.x, block.y);
                    this.matter.applyForce(block.body, {
                        x: Math.cos(angle) * force * 0.04,
                        y: Math.sin(angle) * force * 0.04
                    });
                }
            }
        });

        // Barış yakındaysa ona da hasar ver
        if (this.baris && this.baris.active) {
            const dist = Phaser.Math.Distance.Between(x, y, this.baris.x, this.baris.y);
            if (dist < explosionRadius) {
                const force = (explosionRadius - dist) / explosionRadius;
                this.applyDamage(this.baris, 200 * force, 15);
            }
        }
    }

    startToxicTimer() {
        if (this.toxicTimer) this.toxicTimer.destroy();

        // Her 10 saniyede bir Barış şaka yapar
        this.toxicTimer = this.time.addEvent({
            delay: 10000,
            callback: () => {
                if (!this.baris || !this.baris.active) return;

                // %45 ihtimalle Barış'ın kendi ses kaydını ("Saksocu Beko") çal, %55 ihtimalle sentez yap
                const playRealVoice = Math.random() < 0.45;

                // Barış'ın Suratını Titret ve Büyüt
                this.tweens.add({
                    targets: this.baris,
                    scale: 1.6,
                    angle: { from: -15, to: 15 },
                    yoyo: true,
                    duration: 300,
                    repeat: 2,
                    onComplete: () => {
                        this.baris.setScale(1);
                        this.baris.setAngle(0);
                    }
                });

                if (playRealVoice) {
                    this.showSpeechBubble("Saksocu Beko!");
                    try {
                        this.sound.play('saksocuBeko');
                    } catch(e) {
                        ToxicSpeech.speak("Saksocu Beko!", 1.35, 1.1);
                    }
                } else {
                    const dialogs = [
                        "Hahaha! Saksocu Beko, ne oldu sapanın mı paslandı?",
                        "Bu atışla sinek bile avlayamazsın Beko!",
                        "Naber lan Beko? Saksocucu musun nesin ahahaha!",
                        "Oooo saksocu Beko, hedefe çok uzaksın!",
                        "Barış baba seni ezdi geçti Beko!",
                        "Vuramadın ki! Boş atışlara doyamadın Beko!"
                    ];
                    const text = dialogs[Math.floor(Math.random() * dialogs.length)];
                    this.showSpeechBubble(text);
                    ToxicSpeech.speak(text, 1.35, 1.1);
                }

                // Rage Artışı
                this.increaseRage(15);
            },
            loop: true
        });
    }

    showSpeechBubble(text) {
        const bubble = document.getElementById('speech-bubble');
        const bubbleText = document.getElementById('speech-text');

        if (bubble && bubbleText) {
            bubbleText.innerHTML = text;
            bubble.classList.remove('hidden');

            // 4 Saniye sonra sakla
            this.time.delayedCall(4000, () => {
                bubble.classList.add('hidden');
            });
        }
    }

    increaseRage(amount) {
        this.rageMeter = Math.min(100, this.rageMeter + amount);
        this.updateHUD();

        sfx.playRageUp();

        if (this.rageMeter >= 100 && !this.isRageActive) {
            this.isRageActive = true;
            document.body.classList.add('rage-active');
            
            // Eğer sapan üstünde kuş varsa onu hemen kırmızıya boya ve parçacık ekle
            if (this.bird && !this.isBirdFlying) {
                this.spawnBird(); 
            }

            this.showSpeechBubble("SAKOBEKO RAGE AÇTI! BARIŞ BİTTİN OĞLUM SEN!");
            ToxicSpeech.speak("Beko delirdi lan kaçın!", 0.9, 1.25);
        }
    }

    checkAttemptResult() {
        if (!this.baris || !this.baris.active) return; // Zaten kazanıldıysa bir şey yapma

        this.remainingAttempts--;
        this.updateHUD();

        // Eğer ıskaladıysa Barış dalga geçer ve Rage dolar
        this.increaseRage(30);
        
        // %40 ihtimalle gerçek "Saksocu Beko" ses kaydıyla dalga geçsin
        if (Math.random() < 0.40) {
            this.showSpeechBubble("Saksocu Beko!");
            try {
                this.sound.play('saksocuBeko');
            } catch(e) {
                ToxicSpeech.speak("Saksocu Beko!", 1.3, 1.05);
            }
        } else {
            const missedReplies = [
                "Hahaha rezil! Sapan elinde patladı!",
                "Tüh be Beko! Saksocu Beko vuramadı!",
                "Olum hedefin yanından bile geçemedin!",
                "Saksocu Beko, sapanı düzgün tut bari!"
            ];
            const text = missedReplies[Math.floor(Math.random() * missedReplies.length)];
            this.showSpeechBubble(text);
            ToxicSpeech.speak(text, 1.3, 1.05);
        }

        // Haklar bitti mi?
        if (this.remainingAttempts <= 0) {
            this.time.delayedCall(1000, () => {
                this.handleLose();
            });
        } else {
            // Yeni atış hakkı için kuşu tekrar oluştur
            this.spawnBird();
        }
    }

    handleWin() {
        this.isLevelCompleted = true;
        this.isBirdFlying = false; // Uçuş takibini durdur
        if (this.toxicTimer) this.toxicTimer.destroy();

        // Devasa zafer sesi
        sfx.playExplosion();
        this.cameras.main.flash(300, 255, 255, 255);

        // Toxic konuşma (Kazanma)
        this.showSpeechBubble("Yandım anam! Kafama taş düştü! Beko kazandı...");
        ToxicSpeech.speak("Aaa yandım anam! Kafama taş geldi, saksocu Beko helal olsun yendin beni!", 1.0, 1.0);

        this.time.delayedCall(2000, () => {
            document.getElementById('game-ui').classList.remove('active');
            const winScreen = document.getElementById('win-screen');
            winScreen.classList.add('active');
            document.getElementById('final-score-win').innerText = this.score;
        });
    }

    handleLose() {
        this.isLevelCompleted = true;
        this.isBirdFlying = false; // Uçuş takibini durdur
        if (this.toxicTimer) this.toxicTimer.destroy();

        // Devasa kahkaha
        const endReply = "Hahahaha! Rezil Beko! Saksocu Beko seni! Sapanı bile kullanamadın hahahaha!";
        this.showSpeechBubble(endReply);
        ToxicSpeech.speak(endReply, 1.4, 0.9);

        this.time.delayedCall(2000, () => {
            document.getElementById('game-ui').classList.remove('active');
            const lostScreen = document.getElementById('gameover-screen');
            lostScreen.classList.add('active');
            document.getElementById('final-score-lost').innerText = this.score;
        });
    }

    restartLevel() {
        this.isRageActive = false;
        document.body.classList.remove('rage-active');
        
        if (this.rageEmitter) {
            this.rageEmitter.destroy();
            this.rageEmitter = null;
        }

        // Phaser'ın kendi sahne yeniden başlatma fonksiyonunu çağırıyoruz
        this.scene.restart({ 
            levelIndex: this.currentLevelIndex,
            score: this.score
        });
    }

    updateHUD() {
        // Skor güncelle
        const scoreVal = document.getElementById('score-val');
        if (scoreVal) scoreVal.innerText = String(this.score).padStart(6, '0');

        // Hak yumurtaları
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach((h, idx) => {
            if (idx >= this.remainingAttempts) {
                h.classList.add('lost');
            } else {
                h.classList.remove('lost');
            }
        });

        // Rage Barı
        const rageBar = document.getElementById('rage-bar-fill');
        const rageText = document.getElementById('rage-percent');
        if (rageBar) rageBar.style.width = `${this.rageMeter}%`;
        if (rageText) rageText.innerText = `${this.rageMeter}%`;
    }

    update(time, delta) {
        // Kuş uçuyor mu ve oyun henüz bitmedi mi?
        if (this.isBirdFlying && !this.isLevelCompleted && this.bird && this.bird.body) {
            this.flightTime += delta;

            const velocity = this.bird.body.velocity;
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

            // Uçuşu sonlandırma koşulları:
            // 1. Ekran dışına çıkma (Geniş sınırlar)
            const isOutOfBounds = (this.bird.x < -150 || this.bird.x > GAME_WIDTH + 150 || this.bird.y > GAME_HEIGHT + 100);

            // 2. Minimum hareket (En az 1.5 saniye uçtuktan sonra durma)
            const hasStopped = (this.flightTime > 1500 && speed < 0.15);

            // 3. Güvenlik zaman aşımı (7 saniye)
            const isTimeout = (this.flightTime > 7000);

            if (isOutOfBounds || hasStopped || isTimeout) {
                this.isBirdFlying = false;
                this.checkAttemptResult();
            }
        }
    }
}

// --- PHASER KONFİGÜRASYONU ---
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#0d0f12',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container'
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1.4 },
            debug: false // Blokların ve sınırların yeşil kutularını görmek için true yapabilirsiniz
        }
    },
    scene: [BootScene, PlayScene]
};

// Oyunu Başlat
window.addEventListener('load', () => {
    new Phaser.Game(config);
});
