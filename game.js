class HeartCatcherGame {
    constructor() {
        // Инициализация DOM элементов
        this.canvas = document.getElementById('game-canvas');
        this.ctx = null;
        
        // Фоновое изображение
        this.backgroundImage = new Image();
        this.backgroundLoaded = false;
        
        // Инициализация переменных
        this.initializeVariables();
        
        // Инициализация игры после загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            setTimeout(() => this.init(), 100);
        }
    }
    
    initializeVariables() {
        // Настройки игры
        this.score = 0;
        this.targetScore = 500;
        this.gameActive = false;
        this.paused = false;
        
        // Игровые объекты
        this.objects = [];
        this.baseSpeed = 1.2;
        this.speedIncrease = 0.001;
        this.currentSpeed = this.baseSpeed;
        
        // Статистика
        this.gameTime = 0;
        this.objectsClicked = 0;
        this.objectsMissed = 0;
        
        // Интервалы
        this.spawnInterval = null;
        this.gameLoop = null;
        
        // Частоты появления
        this.spawnRates = {
            heart: 0.7,
            bomb: 0.3
        };
        
        // Изображения
        this.images = {
            heart: null,
            bomb: null
        };
        
        // Эффекты
        this.particles = [];
        this.confetti = [];
    }
    
    init() {
        console.log('Инициализация игры...');
        
        // Проверяем, что canvas существует
        if (!this.canvas) {
            console.error('Canvas не найден!');
            return;
        }
        
        // Инициализация контекста канваса
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Не удалось получить контекст canvas!');
            return;
        }
        
        // Устанавливаем размеры канваса
        this.setCanvasSize();
        
        // Загружаем изображения
        this.loadImages();
        this.loadBackgroundImage();
        
        // Настройка обработчиков событий
        this.setupEventListeners();
        
        console.log('Игра инициализирована успешно!');
    }
    
    loadBackgroundImage() {
        // Укажите путь к вашему фоновому изображению
        this.backgroundImage.src = 'game-background.jpg';
        
        this.backgroundImage.onload = () => {
            console.log('Фоновое изображение загружено');
            this.backgroundLoaded = true;
        };
        
        this.backgroundImage.onerror = () => {
            console.warn('Не удалось загрузить фоновое изображение, использую простой фон');
            this.backgroundLoaded = false;
        };
    }
    
    setCanvasSize() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight - 60;
        } else {
            this.canvas.width = 400;
            this.canvas.height = 500;
        }
    }
    
    loadImages() {
        this.images.heart = this.createHeartImage();
        this.images.bomb = this.createBombImage();
    }
    
    createHeartImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        
        // Классическое красное сердечко ❤️
        ctx.fillStyle = '#ff4757';
        ctx.shadowColor = 'rgba(255, 71, 87, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        
        const size = 18;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Рисуем идеальное сердечко ❤️
        ctx.beginPath();
        
        // Левая верхняя окружность
        ctx.arc(centerX - size/2, centerY - size/4, size/2, Math.PI, 0, false);
        
        // Правая верхняя окружность
        ctx.arc(centerX + size/2, centerY - size/4, size/2, Math.PI, 0, false);
        
        // Острая нижняя часть
        ctx.lineTo(centerX, centerY + size);
        ctx.lineTo(centerX - size, centerY - size/4);
        
        ctx.closePath();
        ctx.fill();
        
        // Блик
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(centerX - 4, centerY - 6, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Обводка для четкости
        ctx.strokeStyle = '#ff2e4d';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        
        return canvas;
    }
    
    createBombImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        
        ctx.fillStyle = '#2d3436';
        ctx.shadowColor = 'rgba(45, 52, 54, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        
        ctx.beginPath();
        ctx.arc(25, 25, 18, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#e17055';
        ctx.fillRect(23, 5, 4, 15);
        
        ctx.fillStyle = '#ff9f43';
        ctx.beginPath();
        ctx.arc(25, 5, 6, Math.PI, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#636e72';
        ctx.beginPath();
        ctx.arc(25, 25, 5, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('menu-btn').addEventListener('click', () => this.showMenu());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        window.addEventListener('resize', () => {
            this.setCanvasSize();
            this.draw();
        });
    }
    
    startGame() {
        this.score = 0;
        this.objects = [];
        this.gameActive = true;
        this.paused = false;
        this.currentSpeed = this.baseSpeed;
        this.gameTime = 0;
        this.objectsClicked = 0;
        this.objectsMissed = 0;
        this.particles = [];
        
        document.getElementById('main-menu').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
        if (this.spawnInterval) clearInterval(this.spawnInterval);
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        this.spawnInterval = setInterval(() => this.spawnObject(), 1000);
        this.gameLoop = setInterval(() => this.update(), 1000/60);
        
        this.draw();
    }
    
    spawnObject() {
        if (this.paused || !this.gameActive) return;
        
        const type = Math.random() < this.spawnRates.heart ? 'heart' : 'bomb';
        const size = 50 + Math.random() * 10;
        
        this.objects.push({
            x: Math.random() * (this.canvas.width - size),
            y: -size,
            width: size,
            height: size,
            type: type,
            speed: this.currentSpeed + (Math.random() * 0.3),
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            scale: 1,
            pulse: 0,
            pulseSpeed: 0.02,
            id: Date.now() + Math.random()
        });
    }
    
    update() {
        if (!this.gameActive || this.paused) return;
        
        this.currentSpeed += this.speedIncrease;
        this.gameTime++;
        
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            
            obj.y += obj.speed;
            obj.rotation += obj.rotationSpeed;
            
            if (obj.type === 'heart') {
                obj.pulse += obj.pulseSpeed;
                obj.scale = 1 + Math.sin(obj.pulse) * 0.08;
            }
            
            if (obj.y > this.canvas.height) {
                this.objects.splice(i, 1);
                if (obj.type === 'heart') {
                    this.objectsMissed++;
                }
            }
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        this.draw();
    }
    
    draw() {
        if (!this.ctx) return;
        
        // 1. Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 2. Рисуем фоновое изображение (только во время игры)
        if (this.gameActive && this.backgroundLoaded) {
            // Растягиваем изображение на весь canvas
            this.ctx.drawImage(
                this.backgroundImage,
                0, 0,
                this.canvas.width, this.canvas.height
            );
            
            // Полупрозрачный слой для лучшей видимости объектов
            this.ctx.fillStyle = 'rgba(248, 248, 248, 0.15)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Простой фон если изображения нет или мы не в игре
            this.ctx.fillStyle = '#f8f8f8';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 3. Отрисовываем игровые объекты
        this.objects.forEach(obj => {
            this.ctx.save();
            this.ctx.translate(obj.x + obj.width/2, obj.y + obj.height/2);
            this.ctx.rotate(obj.rotation);
            
            if (obj.type === 'heart') {
                this.ctx.scale(obj.scale, obj.scale);
            }
            
            const image = obj.type === 'heart' ? this.images.heart : this.images.bomb;
            if (image) {
                this.ctx.drawImage(image, -obj.width/2, -obj.height/2, obj.width, obj.height);
            }
            
            this.ctx.restore();
        });
        
        // 4. Отрисовываем частицы
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // 5. Отрисовываем интерфейс с полупрозрачным фоном
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        this.ctx.fillRect(10, 10, 150, 110);
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 26px Arial';
        this.ctx.fillText(`Очки: ${this.score}`, 15, 40);
        
        this.ctx.fillStyle = '#666';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Сердечек: ${this.objectsClicked}`, 15, 70);
        this.ctx.fillText(`Пропущено: ${this.objectsMissed}`, 15, 95);
        
        // Прогресс-бар
        const progress = Math.min(this.score / this.targetScore, 1);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        this.ctx.fillRect(15, this.canvas.height - 25, this.canvas.width - 30, 12);
        this.ctx.fillStyle = this.score >= this.targetScore ? '#00b894' : 
                           this.score < 0 ? '#d63031' : '#ff4757';
        this.ctx.fillRect(15, this.canvas.height - 25, (this.canvas.width - 30) * progress, 12);
    }
    
    handleClick(e) {
        if (!this.gameActive || this.paused || !this.ctx) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            const centerX = obj.x + obj.width/2;
            const centerY = obj.y + obj.height/2;
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            
            if (distance < obj.width/2) {
                if (obj.type === 'heart') {
                    this.score += 10;
                    this.createParticles(centerX, centerY, '#ff4757');
                } else {
                    this.score -= 20;
                    this.createParticles(centerX, centerY, '#2d3436');
                }
                
                this.objectsClicked++;
                this.objects.splice(i, 1);
                
                // Эффект клика
                this.canvas.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.canvas.style.transform = 'scale(1)';
                }, 100);
                
                if (this.score >= this.targetScore) {
                    setTimeout(() => this.winGame(), 300);
                }
                
                if (this.score <= -100) {
                    setTimeout(() => this.gameOver(), 300);
                }
                
                break;
            }
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 3 + 1,
                color: color,
                life: 25
            });
        }
    }
    
    winGame() {
        console.log('Победа! Набрано очков:', this.score);
        this.gameActive = false;
        
        // Останавливаем игровые интервалы
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // Переход на экран победы
        setTimeout(() => {
            console.log('Переход на экран победы');
            
            const gameScreen = document.getElementById('game-screen');
            const winScreen = document.getElementById('win-screen');
            
            if (gameScreen) gameScreen.classList.remove('active');
            if (winScreen) winScreen.classList.add('active');
        }, 1500);
    }
    
    createConfetti() {
        this.confetti = [];
        const colors = ['#ff4757', '#6c5ce7', '#00b894', '#fd79a8', '#fdcb6e'];
        
        for (let i = 0; i < 40; i++) {
            this.confetti.push({
                x: Math.random() * this.canvas.width,
                y: -30,
                vx: (Math.random() - 0.5) * 5,
                vy: Math.random() * 2 + 1,
                size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.08
            });
        }
        
        const animate = () => {
            if (!this.ctx) return;
            
            const bg = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            this.confetti.forEach(c => {
                c.x += c.vx;
                c.y += c.vy;
                c.rotation += c.rotationSpeed;
                c.vy += 0.08;
                
                this.ctx.save();
                this.ctx.translate(c.x, c.y);
                this.ctx.rotate(c.rotation);
                this.ctx.fillStyle = c.color;
                
                if (Math.random() > 0.5) {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, c.size, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    this.ctx.fillRect(-c.size, -c.size, c.size * 2, c.size * 2);
                }
                
                this.ctx.restore();
            });
            
            if (this.confetti.some(c => c.y < this.canvas.height)) {
                requestAnimationFrame(animate);
            } else {
                this.ctx.putImageData(bg, 0, 0);
            }
        };
        
        animate();
    }
    
    gameOver() {
        console.log('Игра окончена');
        this.gameActive = false;
        
        if (this.spawnInterval) clearInterval(this.spawnInterval);
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        alert('Игра окончена! Вы набрали слишком мало очков.');
        this.showMenu();
    }
    
    togglePause() {
        this.paused = !this.paused;
        const btn = document.getElementById('pause-btn');
        if (btn) {
            btn.textContent = this.paused ? '▶️ Продолжить' : '⏸️ Пауза';
            btn.style.backgroundColor = this.paused ? '#00b894' : '#6c5ce7';
        }
    }
    
    showMenu() {
        console.log('Возврат в меню');
        this.gameActive = false;
        
        if (this.spawnInterval) clearInterval(this.spawnInterval);
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        document.getElementById('game-screen')?.classList.remove('active');
        document.getElementById('win-screen')?.classList.remove('active');
        document.getElementById('main-menu')?.classList.add('active');
    }
    
    restartGame() {
        console.log('Перезапуск игры');
        document.getElementById('win-screen')?.classList.remove('active');
        document.getElementById('main-menu')?.classList.add('active');
    }
}

// Инициализация игры
window.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new HeartCatcherGame();
        
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
    } catch (error) {
        console.error('Ошибка при создании игры:', error);
    }
});