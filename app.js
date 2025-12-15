// app.js - 极简单文件应用
class ChurchMeetingApp {
    constructor() {
        this.meetingData = null;
        this.pages = [];
        this.currentPageIndex = 0;
    }

    async init() {
        console.log('🎵 生命河聚会播放器启动');
        await this.loadMeetingData();
        this.initEventListeners();
        this.checkDataSync();
        this.renderCurrentPage();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    async loadMeetingData() {
        try {
            // 尝试从content目录加载第一个json文件
            const response = await fetch('./content/default-meeting.json');
            this.meetingData = await response.json();
            this.pages = Object.values(this.meetingData.pages || {});
            document.title = this.meetingData.meta?.title || '生命河聚会';
            return true;
        } catch (error) {
            this.showError('无法加载聚会数据，请检查content目录下的JSON文件');
            return false;
        }
    }

    renderCurrentPage() {
        const page = this.pages[this.currentPageIndex];
        const container = document.getElementById('page-content');
        if (!page || !container) return;
        
        container.innerHTML = '';
        
        if (page.title) {
            const h1 = document.createElement('h1');
            h1.textContent = page.title;
            h1.style.cssText = 'text-align: center; color: #2c3e50; margin-bottom: 30px;';
            container.appendChild(h1);
        }
        
        // 简单渲染所有页面类型
        this.renderGeneric(page, container);
    }

    renderGeneric(page, container) {
        const div = document.createElement('div');
        
        // 显示副标题/主持人
        if (page.subtitle || page.host || page.leader) {
            const meta = document.createElement('div');
            meta.textContent = page.subtitle || page.host || page.leader;
            meta.style.cssText = 'color: #666; font-style: italic; margin-bottom: 15px;';
            div.appendChild(meta);
        }
        
        // 显示内容
        if (page.lyrics || page.text || page.content) {
            const content = page.lyrics || page.text || page.content;
            if (typeof content === 'string') {
                const lines = content.split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        const p = document.createElement('p');
                        p.textContent = line;
                        p.style.cssText = 'margin: 12px 0; line-height: 1.6;';
                        div.appendChild(p);
                    }
                });
            }
        }
        
        // 显示列表
        if (page.items && Array.isArray(page.items)) {
            const ul = document.createElement('ul');
            ul.style.cssText = 'text-align: left; display: inline-block;';
            page.items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `• ${item}`;
                li.style.cssText = 'margin-bottom: 10px;';
                ul.appendChild(li);
            });
            div.appendChild(ul);
        }
        
        container.appendChild(div);
    }

    nextPage() {
        if (this.currentPageIndex < this.pages.length - 1) {
            this.currentPageIndex++;
            this.renderCurrentPage();
        }
    }

    prevPage() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.renderCurrentPage();
        }
    }

    checkDataSync() {
        const lastSync = localStorage.getItem('lastDataSync');
        if (!lastSync || (Date.now() - lastSync) > 24 * 60 * 60 * 1000) {
            const message = '请下载最新的聚会数据文件。';
            if (confirm(message)) {
                this.downloadData();
            }
            localStorage.setItem('lastDataSync', Date.now());
        }
    }

    downloadData() {
        if (!this.meetingData) return;
        const dataStr = JSON.stringify(this.meetingData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `聚会数据_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                this.nextPage();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevPage();
            }
        });
    }

    updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const timeElement = document.getElementById('current-time');
        if (timeElement) timeElement.textContent = timeStr;
    }

    showError(message) {
        const container = document.getElementById('page-content');
        container.innerHTML = `<div style="color: #e74c3c; text-align: center; padding: 40px;">
            <h2>❌ 错误</h2>
            <p>${message}</p>
            <button onclick="location.reload()">重新加载</button>
        </div>`;
    }
}

export function createApp() {
    return new ChurchMeetingApp();
}