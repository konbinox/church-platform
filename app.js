class ChurchPlayer {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 0;
        this.pagesData = [];
        this.currentBackgroundIndex = 1;
        this.totalBackgrounds = 23;
        
        this.init();
    }

    async init() {
        await this.loadMeetingData();
        this.initBackgroundSystem();
        this.renderNavigation();
        this.showPage(0);
        this.updateTime();
        this.setupEventListeners();
        
        // ✅ 确保全局可访问
        window.churchPlayer = this;
        
        console.log('教会聚会播放器已初始化');
    }

    async loadMeetingData() {
        try {
            const response = await fetch('content/default-meeting.json');
            const data = await response.json();
            
            // ✅ 核心修复：将 pages 对象转为数组
            this.pagesData = Object.values(data.pages || {});
            this.totalPages = this.pagesData.length;
            
            document.getElementById('total-pages').textContent = this.totalPages;
            document.getElementById('total-pages-display').textContent = this.totalPages;
            
            console.log(`加载了 ${this.totalPages} 个页面`);
        } catch (error) {
            console.error('加载聚会数据失败，使用默认数据:', error);
            this.pagesData = this.getDefaultPages();
            this.totalPages = this.pagesData.length;
        }
    }

    getDefaultPages() {
        const pages = [];
        for (let i = 1; i <= 30; i++) {
            pages.push({
                id: i,
                title: `页面 ${i}`,
                content: `这是第 ${i} 页的内容...\n可以在这里添加诗歌、经文或讲道内容。`,
                type: 'text',
                style: {}
            });
        }
        return pages;
    }

    initBackgroundSystem() {
        this.setBackgroundImage(1);
        this.updateBgInfo();
    }

    setBackgroundImage(index) {
        const bgIndex = ((index - 1) % this.totalBackgrounds) + 1;
        const bgLayer = document.getElementById('background-layer');
        
        bgLayer.style.backgroundImage = `url('assets/background/slide${bgIndex}.jpg')`;
        
        this.currentBackgroundIndex = bgIndex;
        this.updateBgInfo();
        
        console.log(`设置背景: slide${bgIndex}.jpg`);
    }

    updateBgInfo() {
        document.getElementById('bg-current').textContent = this.currentBackgroundIndex;
        document.getElementById('bg-total').textContent = this.totalBackgrounds;
    }

    nextBackground() {
        let nextIndex = this.currentBackgroundIndex + 1;
        if (nextIndex > this.totalBackgrounds) {
            nextIndex = 1;
        }
        this.setBackgroundImage(nextIndex);
    }

    prevBackground() {
        let prevIndex = this.currentBackgroundIndex - 1;
        if (prevIndex < 1) {
            prevIndex = this.totalBackgrounds;
        }
        this.setBackgroundImage(prevIndex);
    }

    // ✅ 安全提取页面预览文本（适配不同字段）
    getPagePreviewText(page) {
        if (page.content) return page.content;
        if (page.lyrics) return page.lyrics;
        if (Array.isArray(page.items)) return page.items.join(' | ');
        if (Array.isArray(page.groups)) return page.groups.join(' | ');
        if (page.text) return page.text;
        if (page.quote) return page.quote;
        if (page.content) return page.content;
        return '无内容';
    }

    renderNavigation() {
        const pagesList = document.getElementById('pages-list');
        if (!pagesList) return;

        pagesList.innerHTML = '';
        
        this.pagesData.forEach((page, index) => {
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            if (index === this.currentPage) {
                pageItem.classList.add('active');
            }
            
            const previewText = this.getPagePreviewText(page);
            const thumbnailContent = previewText 
                ? previewText.substring(0, 80).replace(/\n/g, ' ') + '...' 
                : '无内容';
            
            pageItem.innerHTML = `
                <div class="page-thumbnail">
                    <div class="thumbnail-content">${thumbnailContent}</div>
                </div>
                <div class="page-title-small" title="${page.title || '未命名'}">
                    ${page.title || `页面 ${index + 1}`}
                </div>
            `;
            
            pageItem.addEventListener('click', () => {
                this.showPage(index);
            });
            
            pagesList.appendChild(pageItem);
        });
    }

    showPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.totalPages) return;
        
        this.currentPage = pageIndex;
        const page = this.pagesData[pageIndex];
        
        // 更新页面内容（支持多种字段）
        const contentText = this.getPagePreviewText(page);
        document.getElementById('page-title').textContent = page.title || `页面 ${pageIndex + 1}`;
        document.getElementById('page-text').innerHTML = (contentText || '').replace(/\n/g, '<br>');
        document.getElementById('current-page').textContent = pageIndex + 1;
        
        this.updateNavigationHighlight();
        console.log(`显示第 ${pageIndex + 1} 页`);
    }

    updateNavigationHighlight() {
        const pageItems = document.querySelectorAll('.page-item');
        pageItems.forEach((item, index) => {
            if (index === this.currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.showPage(this.currentPage + 1);
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.showPage(this.currentPage - 1);
        }
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('current-time').textContent = timeString;
        setTimeout(() => this.updateTime(), 1000);
    }

    openEditor() {
        const editorModal = document.getElementById('editor-modal');
        if (editorModal) editorModal.style.display = 'block';
        this.loadProfessionalEditor();
    }

    closeEditor() {
        const editorModal = document.getElementById('editor-modal');
        if (editorModal) editorModal.style.display = 'none';
        
        const editorComponent = document.getElementById('editor-component');
        if (editorComponent) {
            editorComponent.style.display = 'none';
            editorComponent.innerHTML = '';
        }

        const loading = document.getElementById('editor-loading');
        if (loading) loading.style.display = 'flex';
    }

    async loadProfessionalEditor() {
        try {
            const loading = document.getElementById('editor-loading');
            const editorComponent = document.getElementById('editor-component');
            if (loading) loading.style.display = 'flex';
            if (editorComponent) editorComponent.style.display = 'none';
            
            const module = await import('./components/page-editor.js');
            window.pageEditorModule = module;
            
            if (loading) loading.style.display = 'none';
            if (editorComponent) editorComponent.style.display = 'block';
            
            this.renderEditor();
        } catch (error) {
            console.error('加载专业编辑器失败:', error);
            this.showEditorError();
        }
    }

    renderEditor() {
        const editorComponent = document.getElementById('editor-component');
        if (!editorComponent) return;

        const currentPageData = this.getCurrentPageData();
        editorComponent.innerHTML = `
            <div class="editor-wrapper">
                <div class="editor-header">
                    <h2><i class="fas fa-edit"></i> 专业页面编辑器</h2>
                    <div class="editor-subtitle">
                        正在编辑: 第 <span id="editing-page-number">${this.currentPage + 1}</span> 页
                        <button class="btn-switch-page" onclick="window.churchPlayer.switchToPageManager()">
                            <i class="fas fa-list"></i> 管理所有页面
                        </button>
                    </div>
                </div>
                <div class="editor-main">
                    <div id="editor-container"></div>
                </div>
                <div class="editor-footer">
                    <button class="btn-save-exit" onclick="window.churchPlayer.saveAndExitEditor()">
                        <i class="fas fa-save"></i> 保存并退出
                    </button>
                    <button class="btn-cancel" onclick="closeEditor()">
                        <i class="fas fa-times"></i> 取消
                    </button>
                    <div class="editor-hint">
                        <i class="fas fa-lightbulb"></i> 提示: 所有更改会自动保存
                    </div>
                </div>
            </div>
        `;

        if (window.pageEditorModule?.renderPageEditor) {
            window.pageEditorModule.renderPageEditor(
                currentPageData,
                (updatedPage) => {
                    this.updatePageData(updatedPage);
                    this.renderNavigation();
                    this.showPage(this.currentPage);
                }
            );
        }
    }

    getCurrentPageData() {
        const page = this.pagesData[this.currentPage] || {};
        return {
            ...page,
            id: page.id || `page-${this.currentPage + 1}`,
            title: page.title || `页面 ${this.currentPage + 1}`,
        };
    }

    updatePageData(updatedPage) {
        this.pagesData[this.currentPage] = updatedPage;
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('church-meeting-data', JSON.stringify({
                pages: this.pagesData,
                lastModified: new Date().toISOString(),
                version: '1.0'
            }));
        } catch (e) {
            console.warn('本地保存失败:', e);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> <span>${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '0', 2000);
        setTimeout(() => toast.remove(), 2300);
    }

    showEditorError() {
        const editorComponent = document.getElementById('editor-component');
        if (!editorComponent) return;
        editorComponent.style.display = 'block';
        editorComponent.innerHTML = `
            <div class="editor-error">
                <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h3>编辑器加载失败</h3>
                <p>请检查 <code>components/page-editor.js</code> 是否已上传到仓库。</p>
                <button onclick="window.churchPlayer.loadProfessionalEditor()" class="btn-retry">重新加载</button>
            </div>
        `;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowRight': case ' ': this.nextPage(); e.preventDefault(); break;
                case 'ArrowLeft': this.prevPage(); e.preventDefault(); break;
                case 'Escape': this.closeEditor(); break;
                case 'b': case 'B': this.nextBackground(); break;
                case 'v': case 'V': this.prevBackground(); break;
                case 'e': case 'E': if (!e.ctrlKey) this.openEditor(); break;
            }
        });

        const editorModal = document.getElementById('editor-modal');
        if (editorModal) {
            editorModal.addEventListener('click', (e) => {
                if (e.target === editorModal) this.closeEditor();
            });
        }
    }
}

// 全局函数（供 HTML onclick 调用）
function prevPage() { window.churchPlayer?.prevPage(); }
function nextPage() { window.churchPlayer?.nextPage(); }
function prevBackground() { window.churchPlayer?.prevBackground(); }
function nextBackground() { window.churchPlayer?.nextBackground(); }
function openEditor() { window.churchPlayer?.openEditor(); }
function closeEditor() { window.churchPlayer?.closeEditor(); }

window.addEventListener('DOMContentLoaded', () => {
    window.churchPlayer = new ChurchPlayer();
});
// 全局函数：供 HTML 内联 onclick 调用（兼容 type="module"）
window.prevPage = () => window.churchPlayer?.prevPage();
window.nextPage = () => window.churchPlayer?.nextPage();
window.prevBackground = () => window.churchPlayer?.prevBackground();
window.nextBackground = () => window.churchPlayer?.nextBackground();
window.openEditor = () => window.churchPlayer?.openEditor();
window.closeEditor = () => window.churchPlayer?.closeEditor();