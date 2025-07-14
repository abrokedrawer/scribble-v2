
class ArtGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.drawingHistory = [];
        this.currentPath = [];
        
        this.networkStatusElement = document.getElementById('networkStatus');
        
        this.setupControls();
        
        this.setupObservers();
        
        this.setupNetworkMonitoring();
        
        this.setupWorker();
        
        this.setupCanvas();
        
        this.updateBrushSettings();
        this.updateNetworkStatus(navigator.onLine);
    }
    
    setupCanvas() {
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                offsetX: touch.pageX - this.canvas.offsetLeft,
                offsetY: touch.pageY - this.canvas.offsetTop
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                offsetX: touch.pageX - this.canvas.offsetLeft,
                offsetY: touch.pageY - this.canvas.offsetTop
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }
    
    setupControls() {
        document.getElementById('colorBlack').addEventListener('click', () => {
            this.currentColor = '#000000';
            this.updateBrushSettings();
        });
        
        document.getElementById('colorRed').addEventListener('click', () => {
            this.currentColor = '#ff0000';
            this.updateBrushSettings();
        });
        
        document.getElementById('colorBlue').addEventListener('click', () => {
            this.currentColor = '#0000ff';
            this.updateBrushSettings();
        });
        
        document.getElementById('colorPicker').addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.updateBrushSettings();
        });
        
        document.getElementById('brushSmall').addEventListener('click', () => {
            this.brushSize = 3;
            this.updateBrushSettings();
        });
        
        document.getElementById('brushMedium').addEventListener('click', () => {
            this.brushSize = 7;
            this.updateBrushSettings();
        });
        
        document.getElementById('brushLarge').addEventListener('click', () => {
            this.brushSize = 15;
            this.updateBrushSettings();
        });
        
        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        document.getElementById('undoButton').addEventListener('click', () => {
            this.undoLastAction();
        });
        
        document.getElementById('saveButton').addEventListener('click', () => {
            this.saveDrawing();
        });
    }
    
    updateBrushSettings() {
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
        this.currentPath = [];
        this.currentPath.push({ x: e.offsetX, y: e.offsetY });
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.stroke();
        
        this.currentPath.push({ x: e.offsetX, y: e.offsetY });
        
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.drawingHistory.push({
                path: this.currentPath,
                color: this.currentColor,
                size: this.brushSize
            });
            this.isDrawing = false;
        }
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawingHistory = [];
    }
    
    undoLastAction() {
        if (this.drawingHistory.length > 0) {
            this.drawingHistory.pop();
            this.redrawCanvas();
        }
    }
    
    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawingHistory.forEach(action => {
            this.ctx.strokeStyle = action.color;
            this.ctx.lineWidth = action.size;
            this.ctx.beginPath();
            
            for (let i = 0; i < action.path.length; i++) {
                const point = action.path[i];
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            
            this.ctx.stroke();
        });
        
        this.updateBrushSettings();
    }
    
    saveDrawing() {
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'drawing-' + new Date().toISOString().slice(0, 10) + '.png';
        link.href = dataURL;
        link.click();
    }
    
setupObservers() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const element = entry.target;
      console.log(`Element ${element.id || element.className} is ${entry.isIntersecting ? 'visible' : 'hidden'}`);
      
      if (entry.isIntersecting) {
        const src = element.dataset.src;
        if (src && element.tagName === 'IMG') {
          element.src = src;
          console.log(`Loaded asset: ${src}`);
        }
        
        element.style.animationPlayState = 'running';
      } else {
        element.style.animationPlayState = 'paused';
      }
    });
  }, {
    threshold: 0.1 
  });

  document.querySelectorAll('.lazy-load').forEach(el => {
    observer.observe(el);
    console.log(`Observing element for visibility:`, el);
  });
}
    
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.updateNetworkStatus(true);
            console.log('Connection restored - syncing game state');
            this.syncGameState();
        });
        
        window.addEventListener('offline', () => {
            this.updateNetworkStatus(false);
            console.log('Connection lost - switching to offline mode');
            this.enableOfflineMode();
        });
        
        this.updateNetworkStatus(navigator.onLine);
    }
    
    updateNetworkStatus(online) {
        if (online) {
            this.networkStatusElement.textContent = 'Online';
            this.networkStatusElement.className = 'network-status online';
        } else {
            this.networkStatusElement.textContent = 'Offline - Working locally';
            this.networkStatusElement.className = 'network-status offline';
        }
    }
    
    
    setupWorker() {
        if (window.Worker) {
            this.worker = new Worker('game-worker.js');
            
            this.worker.onmessage = (e) => {
                console.log('Message from worker:', e.data);
            };
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new ArtGame();
});