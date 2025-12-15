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
        
        console.log('教会聚会播放器已初始化');
    }

    async loadMeetingData() {
        try {
            const response = await fetch('content/default-meeting.json');
            const data = await response.json();
            this.pagesData = data.pages || [];
            this.totalPages = this.pagesData.length;
            
            // 更新页面计数显示
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

    renderNavigation() {
        const pagesList = document.getElementById('pages-list');
        pagesList.innerHTML = '';
        
        this.pagesData.forEach((page, index) => {
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            if (index === this.currentPage) {
                pageItem.classList.add('active');
            }
            
            const thumbnailContent = page.content ? 
                page.content.substring(0, 80).replace(/\n/g, ' ') + '...' : 
                '无内容';
            
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
        
        // 更新页面内容
        document.getElementById('page-title').textContent = page.title || `页面 ${pageIndex + 1}`;
        document.getElementById('page-text').innerHTML = (page.content || '').replace(/\n/g, '<br>');
        document.getElementById('current-page').textContent = pageIndex + 1;
        
        // 更新导航高亮
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
        } else {
            console.log('已经是最后一页');
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.showPage(this.currentPage - 1);
        } else {
            console.log('已经是第一页');
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
        editorModal.style.display = 'block';
        
        this.loadProfessionalEditor();
    }

    closeEditor() {
        const editorModal = document.getElementById('editor-modal');
        editorModal.style.display = 'none';
        
        // 清空编辑器内容
        const editorComponent = document.getElementById('editor-component');
        editorComponent.style.display = 'none';
        editorComponent.innerHTML = '';
        
        // 显示加载指示器
        document.getElementById('editor-loading').style.display = 'flex';
    }

    async loadProfessionalEditor() {
        try {
            // 显示加载指示器
            document.getElementById('editor-loading').style.display = 'flex';
            document.getElementById('editor-component').style.display = 'none';
            
            // 动态加载编辑器模块
            const module = await import('./components/page-editor.js');
            window.pageEditorModule = module;
            
            // 隐藏加载指示器
            document.getElementById('editor-loading').style.display = 'none';
            document.getElementById('editor-component').style.display = 'block';
            
            // 渲染编辑器
            this.renderEditor();
            
        } catch (error) {
            console.error('加载专业编辑器失败:', error);
            this.showEditorError();
        }
    }

    renderEditor() {
        const editorComponent = document.getElementById('editor-component');
        
        // 创建编辑器容器结构
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
                    <!-- 编辑器容器 -->
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
        
        // 调用专业编辑器
        if (window.pageEditorModule && window.pageEditorModule.renderPageEditor) {
            const currentPageData = this.getCurrentPageData();
            
            window.pageEditorModule.renderPageEditor(
                currentPageData,
                (updatedPage) => {
                    // 当页面被编辑时的回调函数
                    this.updatePageData(updatedPage);
                    this.renderNavigation();
                    this.showPage(this.currentPage);
                }
            );
        }
    }

    getCurrentPageData() {
        const pageIndex = this.currentPage;
        const page = this.pagesData[pageIndex] || {};
        
        return {
            id: page.id || `page-${pageIndex + 1}`,
            title: page.title || `页面 ${pageIndex + 1}`,
            content: page.content || '',
            type: page.type || 'text',
            style: page.style || {},
            slug: page.slug || `page-${pageIndex + 1}`,
            sections: page.sections || [],
            description: page.description || '',
            ...page
        };
    }

    updatePageData(updatedPage) {
        const pageIndex = this.currentPage;
        this.pagesData[pageIndex] = updatedPage;
        
        // 保存到本地存储
        this.saveToLocalStorage();
        
        console.log(`页面 ${pageIndex + 1} 已更新`);
    }

    saveToLocalStorage() {
        try {
            const meetingData = {
                pages: this.pagesData,
                lastModified: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem('church-meeting-data', JSON.stringify(meetingData));
        } catch (error) {
            console.error('保存到本地存储失败:', error);
        }
    }

    switchToPageManager() {
        // 创建页面管理器界面
        const editorComponent = document.getElementById('editor-component');
        
        editorComponent.innerHTML = `
            <div class="editor-wrapper">
                <div class="editor-header">
                    <h2><i class="fas fa-copy"></i> 页面管理器</h2>
                    <div class="editor-subtitle">
                        管理所有页面，点击页面进行编辑
                        <button class="btn-back-editor" onclick="window.churchPlayer.loadProfessionalEditor()">
                            <i class="fas fa-arrow-left"></i> 返回编辑器
                        </button>
                    </div>
                </div>
                
                <div class="editor-main">
                    <div class="pages-manager">
                        <div class="pages-list-header">
                            <button class="btn-add-page" onclick="window.churchPlayer.addNewPage()">
                                <i class="fas fa-plus"></i> 添加新页面
                            </button>
                            <div class="pages-stats">
                                共 ${this.totalPages} 个页面
                            </div>
                        </div>
                        
                        <div class="pages-list" id="pages-manager-list">
                            <!-- 页面列表将在这里动态生成 -->
                        </div>
                    </div>
                </div>
                
                <div class="editor-footer">
                    <button class="btn-save-exit" onclick="window.churchPlayer.saveAndExitEditor()">
                        <i class="fas fa-save"></i> 保存并退出
                    </button>
                    <button class="btn-cancel" onclick="closeEditor()">
                        <i class="fas fa-times"></i> 取消
                    </button>
                </div>
            </div>
        `;
        
        this.renderPagesManagerList();
    }

    renderPagesManagerList() {
        const pagesList = document.getElementById('pages-manager-list');
        if (!pagesList) return;
        
        pagesList.innerHTML = this.pagesData.map((page, index) => `
            <div class="page-manager-item ${index === this.currentPage ? 'active' : ''}" data-index="${index}">
                <div class="page-item-header">
                    <div class="page-number">${index + 1}</div>
                    <div class="page-title">${page.title || `页面 ${index + 1}`}</div>
                    <div class="page-actions">
                        <button class="btn-action btn-edit" data-index="${index}" title="编辑此页面">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" data-index="${index}" ${this.totalPages <= 1 ? 'disabled' : ''} title="删除此页面">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-action btn-move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''} title="上移">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="btn-action btn-move-down" data-index="${index}" ${index === this.totalPages - 1 ? 'disabled' : ''} title="下移">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                </div>
                <div class="page-item-preview">
                    ${page.content ? page.content.substring(0, 100).replace(/\n/g, ' ') + '...' : '<span class="empty-content">无内容</span>'}
                </div>
            </div>
        `).join('');
        
        // 绑定事件
        this.bindPagesManagerEvents();
    }

    bindPagesManagerEvents() {
        // 编辑页面
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('[data-index]').dataset.index);
                this.currentPage = index;
                this.loadProfessionalEditor();
            });
        });
        
        // 删除页面
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('[data-index]').dataset.index);
                if (this.totalPages <= 1) {
                    alert('至少需要保留一个页面！');
                    return;
                }
                
                if (confirm(`确定要删除第 ${index + 1} 页吗？`)) {
                    this.pagesData.splice(index, 1);
                    this.totalPages = this.pagesData.length;
                    
                    // 调整当前页面索引
                    if (this.currentPage >= index) {
                        this.currentPage = Math.max(0, this.currentPage - 1);
                    }
                    
                    this.renderPagesManagerList();
                    this.renderNavigation();
                    this.showPage(this.currentPage);
                }
            });
        });
        
        // 上移页面
        document.querySelectorAll('.btn-move-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('[data-index]').dataset.index);
                if (index > 0) {
                    this.movePage(index, index - 1);
                }
            });
        });
        
        // 下移页面
        document.querySelectorAll('.btn-move-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('[data-index]').dataset.index);
                if (index < this.totalPages - 1) {
                    this.movePage(index, index + 1);
                }
            });
        });
        
        // 点击页面项
        document.querySelectorAll('.page-manager-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-action')) {
                    const index = parseInt(item.dataset.index);
                    this.currentPage = index;
                    this.loadProfessionalEditor();
                }
            });
        });
    }

    movePage(fromIndex, toIndex) {
        const page = this.pagesData[fromIndex];
        this.pagesData.splice(fromIndex, 1);
        this.pagesData.splice(toIndex, 0, page);
        
        // 更新当前页面索引
        if (this.currentPage === fromIndex) {
            this.currentPage = toIndex;
        } else if (this.currentPage === toIndex) {
            this.currentPage = fromIndex;
        }
        
        this.renderPagesManagerList();
        this.renderNavigation();
    }

    addNewPage() {
        const newPage = {
            id: `page-${this.totalPages + 1}`,
            title: `新页面 ${this.totalPages + 1}`,
            content: '请编辑此页面内容...',
            type: 'text',
            style: {},
            sections: []
        };
        
        this.pagesData.push(newPage);
        this.totalPages = this.pagesData.length;
        this.currentPage = this.totalPages - 1;
        
        this.renderPagesManagerList();
        this.renderNavigation();
        this.loadProfessionalEditor();
    }

    saveAndExitEditor() {
        // 保存数据
        this.saveToLocalStorage();
        
        // 关闭编辑器
        this.closeEditor();
        
        // 显示保存成功提示
        this.showToast('页面数据已保存', 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 2000);
    }

    showEditorError() {
        document.getElementById('editor-loading').style.display = 'none';
        
        const editorComponent = document.getElementById('editor-component');
        editorComponent.style.display = 'block';
        editorComponent.innerHTML = `
            <div class="editor-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>编辑器加载失败</h3>
                <p>无法加载专业页面编辑器。请检查：</p>
                <ul>
                    <li><strong>components/page-editor.js</strong> 文件是否存在</li>
                    <li>文件路径是否正确</li>
                    <li>浏览器控制台是否有错误信息</li>
                </ul>
                <div class="error-actions">
                    <button onclick="window.churchPlayer.loadProfessionalEditor()" class="btn-retry">
                        <i class="fas fa-redo"></i> 重新加载
                    </button>
                    <button onclick="closeEditor()" class="btn-close">
                        关闭编辑器
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    this.nextPage();
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    this.prevPage();
                    e.preventDefault();
                    break;
                case 'Escape':
                    this.closeEditor();
                    break;
                case 'b':
                case 'B':
                    this.nextBackground();
                    break;
                case 'v':
                case 'V':
                    this.prevBackground();
                    break;
                case 'e':
                case 'E':
                    if (!e.ctrlKey) {
                        this.openEditor();
                    }
                    break;
            }
        });
        
        // 点击编辑器模态框背景关闭
        const editorModal = document.getElementById('editor-modal');
        editorModal.addEventListener('click', (e) => {
            if (e.target === editorModal) {
                this.closeEditor();
            }
        });
    }
}

// 全局函数供HTML按钮调用
function prevPage() {
    if (window.churchPlayer) window.churchPlayer.prevPage();
}

function nextPage() {
    if (window.churchPlayer) window.churchPlayer.nextPage();
}

function prevBackground() {
    if (window.churchPlayer) window.churchPlayer.prevBackground();
}

function nextBackground() {
    if (window.churchPlayer) window.churchPlayer.nextBackground();
}

function openEditor() {
    if (window.churchPlayer) window.churchPlayer.openEditor();
}

function closeEditor() {
    if (window.churchPlayer) window.churchPlayer.closeEditor();
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    window.churchPlayer = new ChurchPlayer();
});