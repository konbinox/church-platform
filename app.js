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
    window.churchPlayer = this;
    console.log('教会聚会播放器已初始化');
  }

  async loadMeetingData() {
    try {
      const response = await fetch('content/default-meeting.json');
      const data = await response.json();
      // 将 pages 对象转为数组
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
    return Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      title: `页面 ${i + 1}`,
      content: `这是第 ${i + 1} 页的内容...`,
      type: 'text'
    }));
  }

  initBackgroundSystem() {
    this.setBackgroundImage(1);
    this.updateBgInfo();
  }

  setBackgroundImage(index) {
    const bgIndex = ((index - 1) % this.totalBackgrounds) + 1;
    const bgElement = document.getElementById('background-layer');
    if (bgElement) {
      bgElement.style.backgroundImage = `url('assets/background/slide${bgIndex}.jpg')`;
    }
    this.currentBackgroundIndex = bgIndex;
    this.updateBgInfo();
  }

  updateBgInfo() {
    const bgCurrent = document.getElementById('bg-current');
    const bgTotal = document.getElementById('bg-total');
    if (bgCurrent) bgCurrent.textContent = this.currentBackgroundIndex;
    if (bgTotal) bgTotal.textContent = this.totalBackgrounds;
  }

  nextBackground() {
    this.setBackgroundImage(this.currentBackgroundIndex + 1);
  }

  prevBackground() {
    this.setBackgroundImage(this.currentBackgroundIndex - 1);
  }

  getPagePreviewText(page) {
    if (page.content) return page.content;
    if (page.lyrics) return page.lyrics;
    if (Array.isArray(page.items)) return page.items.join(' | ');
    if (Array.isArray(page.groups)) return page.groups.join(' | ');
    if (page.text) return page.text;
    if (page.quote) return page.quote;
    return '无内容';
  }

  renderNavigation() {
    const pagesList = document.getElementById('pages-list');
    if (!pagesList) return;
    
    pagesList.innerHTML = '';

    this.pagesData.forEach((page, index) => {
      const pageItem = document.createElement('div');
      pageItem.className = 'page-item';
      if (index === this.currentPage) pageItem.classList.add('active');

      const preview = this.getPagePreviewText(page);
      const thumbnailContent = preview.substring(0, 80).replace(/\n/g, ' ') + '...';

      pageItem.innerHTML = `
        <div class="page-thumbnail">
          <div class="thumbnail-content">${thumbnailContent}</div>
        </div>
        <div class="page-title-small" title="${page.title || '未命名'}">
          ${page.title || `页面 ${index + 1}`}
        </div>
      `;
      
      pageItem.addEventListener('click', () => this.showPage(index));
      pagesList.appendChild(pageItem);
    });
  }

  showPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= this.totalPages) return;
    
    this.currentPage = pageIndex;
    const page = this.pagesData[pageIndex];
    
    // 更新页面标题
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
      pageTitleElement.textContent = page.title || `页面 ${pageIndex + 1}`;
    }
    
    // 更新页面内容
    const pageTextElement = document.getElementById('page-text');
    if (pageTextElement) {
      let html = '';
      
      if (Array.isArray(page.sections)) {
        html = page.sections.map(section => {
          if (section.type === 'text' && section.content) {
            const styleStr = section.style ? Object.entries(section.style)
              .map(([key, value]) => `${key}:${value}`)
              .join(';') : '';
            return `<div style="${styleStr}">${section.content.replace(/\n/g, '<br>')}</div>`;
          }
          return `<div>${section.content || ''}</div>`;
        }).join('');
      } else {
        html = this.getPagePreviewText(page).replace(/\n/g, '<br>');
      }
      
      pageTextElement.innerHTML = html;
    }
    
    // 更新当前页码显示
    const currentPageElement = document.getElementById('current-page');
    if (currentPageElement) {
      currentPageElement.textContent = pageIndex + 1;
    }
    
    // 更新导航高亮
    this.updateNavigationHighlight();
  }

  updateNavigationHighlight() {
    const pageItems = document.querySelectorAll('.page-item');
    pageItems.forEach((item, index) => {
      item.classList.toggle('active', index === this.currentPage);
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
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
      timeElement.textContent = now.toLocaleTimeString('zh-CN', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    setTimeout(() => this.updateTime(), 1000);
  }

  openEditor() {
    const editorModal = document.getElementById('editor-modal');
    if (editorModal) {
      editorModal.style.display = 'block';
      this.loadProfessionalEditor();
    }
  }

  closeEditor() {
    const editorModal = document.getElementById('editor-modal');
    if (editorModal) {
      editorModal.style.display = 'none';
    }
    const editorComponent = document.getElementById('editor-component');
    if (editorComponent) {
      editorComponent.innerHTML = '';
    }
  }

  async loadProfessionalEditor() {
    try {
      const loadingElement = document.getElementById('editor-loading');
      const editorComponent = document.getElementById('editor-component');
      
      if (loadingElement) loadingElement.style.display = 'flex';
      if (editorComponent) editorComponent.style.display = 'none';

      const module = await import('./components/page-editor.js');
      window.pageEditorModule = module;

      if (loadingElement) loadingElement.style.display = 'none';
      if (editorComponent) {
        editorComponent.style.display = 'block';
        this.renderEditor();
      }
    } catch (error) {
      console.error('加载编辑器失败:', error);
      const editorComponent = document.getElementById('editor-component');
      if (editorComponent) {
        editorComponent.innerHTML = `
          <div style="padding:40px; text-align:center; color:#e74c3c;">
            <h3>编辑器加载失败</h3>
            <p>请检查 components/page-editor.js 是否已上传到仓库</p>
          </div>
        `;
      }
    }
  }

  renderEditor() {
    const container = document.getElementById('editor-component');
    if (!container) return;
    
    const currentPage = this.pagesData[this.currentPage] || {};
    container.innerHTML = '<div id="editor-container"></div>';
    
    if (window.pageEditorModule?.renderPageEditor) {
      window.pageEditorModule.renderPageEditor(currentPage, (updatedPage) => {
        this.pagesData[this.currentPage] = updatedPage;
        this.renderNavigation();
        this.showPage(this.currentPage);
      });
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') this.nextPage();
      if (e.key === 'ArrowLeft') this.prevPage();
      if (e.key === 'Escape') this.closeEditor();
      if (e.key === 'b' || e.key === 'B') this.nextBackground();
      if (e.key === 'v' || e.key === 'V') this.prevBackground();
    });
  }
}

// 全局函数供 HTML 调用
window.prevPage = () => window.churchPlayer?.prevPage();
window.nextPage = () => window.churchPlayer?.nextPage();
window.prevBackground = () => window.churchPlayer?.prevBackground();
window.nextBackground = () => window.churchPlayer?.nextBackground();
window.openEditor = () => window.churchPlayer?.openEditor();
window.closeEditor = () => window.churchPlayer?.closeEditor();

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  new ChurchPlayer();
});
