class ePlayer {
    constructor(options) {
        this.element = options.element;
        this.music = options.music;
        this.isLooping = false; // 默认不循环
        this.audio = new Audio(this.music.url);
        this.audio.loop = this.isLooping;
        this.lrc = null;
        this.defaultCover = 's/111.png'; // 默认封面图片
        this.coverUrl = this.music.cover || this.defaultCover; // 设置封面图片URL
        this.initUI();
        this.addEventListeners();
    }

    initUI() {
        this.element.innerHTML = `
            <div class="cover-container">
                <img id="cover" src="${this.coverUrl}" alt="封面图片">
            </div>
            <div class="song-info">
                <div id="title">${this.music.title}</div>
                <div id="author">${this.music.author}</div>
            </div>
            <div class="controls">
                <div class="top-controls">
                    <button id="play-pause" class="control-btn">
                        <i class="fas fa-play"></i> <!-- 默认为播放 -->
                    </button>
                    <input type="range" id="progress" value="0">
                    <span id="time-display">0:00 / 0:00</span>
                </div>
                <div class="bottom-controls">
                    <button id="volume-mute" class="control-btn">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <input type="range" id="volume" min="0" max="100" value="100">
                    <button id="loop" class="control-btn">
                        <i class="fas fa-repeat"></i> <!-- 默认图标为“不循环” -->
                    </button>
                </div>
            </div>
            <div class="lrc-container" id="lrc-container">
                <button id="toggle-lrc" class="control-btn">
                    <i class="fas fa-caret-down"></i>
                </button>
                <div id="lrc-content"></div>
            </div>
        `;
        
        this.playButton = this.element.querySelector('#play-pause');
        this.progressBar = this.element.querySelector('#progress');
        this.timeDisplay = this.element.querySelector('#time-display');
        this.volumeMuteButton = this.element.querySelector('#volume-mute');
        this.volumeSlider = this.element.querySelector('#volume');
        this.loopButton = this.element.querySelector('#loop');
        this.lrcToggleButton = this.element.querySelector('#toggle-lrc');
        this.lrcContent = this.element.querySelector('#lrc-content');
        this.loadLRC(this.music.lrc);
    }

    addEventListeners() {
        this.playButton.addEventListener('click', () => this.togglePlayPause());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleAudioEnded());
        this.progressBar.addEventListener('input', (e) => this.setAudioProgress(e));
        this.volumeMuteButton.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e));
        this.loopButton.addEventListener('click', () => this.toggleLoop());
        this.lrcToggleButton.addEventListener('click', () => this.toggleLRC());
    }

    togglePlayPause() {
        if (this.audio.paused) {
            this.audio.play();
            this.playButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            this.audio.pause();
            this.playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    updateProgress() {
        const { currentTime, duration } = this.audio;
        const percent = (currentTime / duration) * 100;
        this.progressBar.value = percent;
        this.timeDisplay.textContent = `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
        this.updateLRC(currentTime);
    }

    setAudioProgress(e) {
        const newTime = (e.target.value / 100) * this.audio.duration;
        this.audio.currentTime = newTime;
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.volumeMuteButton.innerHTML = this.audio.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    }

    setVolume(e) {
        const volume = e.target.value / 100;
        this.audio.volume = volume;
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.audio.loop = this.isLooping;

        if (this.isLooping) {
           this.loopButton.innerHTML = '<i class="fas fa-repeat"></i>'; // 不循环图标
        } else {
            
            this.loopButton.innerHTML = '<i class="fas fa-repeat-1"></i>'; // 循环图标
        }
    }

    handleAudioEnded() {
        if (!this.isLooping) {
            this.audio.currentTime = 0;
            this.progressBar.value = 0;
            this.timeDisplay.textContent = `0:00 / ${this.formatTime(this.audio.duration)}`;
            this.playButton.innerHTML = '<i class="fas fa-play"></i>'; // 播放结束，按钮变为播放
        }
    }

    loadLRC(lrcFile) {
        if (lrcFile) {
            fetch(lrcFile)
                .then(response => response.text())
                .then(data => {
                    this.lrc = this.parseLRC(data);
                    this.displayLRC();
                });
        }
    }

    parseLRC(lrcData) {
        const lines = lrcData.split('\n');
        return lines.map(line => {
            const match = line.match(/\[(\d+):(\d+)\.(\d+)\](.+)/);
            if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const milliseconds = parseInt(match[3], 10);
                const time = (minutes * 60) + seconds + (milliseconds / 1000);
                return { time, text: match[4] };
            }
            return null;
        }).filter(item => item !== null);
    }

    displayLRC() {
        if (this.lrc) {
            this.lrcContent.innerHTML = '';
            this.lrc.forEach(line => {
                const p = document.createElement('p');
                p.textContent = line.text;
                this.lrcContent.appendChild(p);
            });
        }
    }



    displayLRC() {
        if (this.lrc) {
            this.lrcContent.innerHTML = '';
            this.lrc.forEach(line => {
                const p = document.createElement('p');
                p.textContent = line.text;
                this.lrcContent.appendChild(p);
            });
        }
    }
    
    loadLRC(lrcFile) {
        if (lrcFile) {
            fetch(lrcFile)
                .then(response => {
                    if (!response.ok) throw new Error('网络响应失败');
                    return response.text();
                })
                .then(data => {
                    this.lrc = this.parseLRC(data);
                    this.displayLRC();
                })
                .catch(error => {
                    console.error('LRC 文件加载失败或解析错误:', error);
                });
        }
    }
        

    toggleLRC() {
        const isVisible = this.lrcContent.style.display === 'block';
        if (isVisible) {
            this.lrcContent.style.display = 'none';
            document.querySelectorAll('.eplayer-container').forEach(player => player.classList.remove('expanded'));
        } else {
            document.querySelectorAll('.eplayer-container').forEach(player => player.classList.add('expanded'));
            this.lrcContent.style.display = 'block';
        }
    }
loadLRC(lrcData) {
    if (lrcData) {
        // 当 lrcData 是歌词文本而不是文件路径
        this.lrc = this.parseLRC(lrcData);
        this.displayLRC();
    }
}
updateLRC(currentTime) {
    if (this.lrc) {
        const lrcParagraphs = this.lrcContent.querySelectorAll('p');
        let activeLine = null;

        // 查找当前时间对应的歌词行
        for (let i = 0; i < this.lrc.length; i++) {
            const line = this.lrc[i];
            if (line.time <= currentTime && (!this.lrc[i + 1] || this.lrc[i + 1].time > currentTime)) {
                activeLine = line;
                break;
            }
        }

        if (activeLine) {
            lrcParagraphs.forEach(p => p.classList.remove('active'));
            const p = Array.from(lrcParagraphs).find(p => p.textContent === activeLine.text);
            if (p) {
                p.classList.add('active');

                // 确保当前高亮的歌词在视口中可见
                p.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center' // 居中显示
                });
            }
        }
    }
}

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
}
