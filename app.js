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
      // ✅ 关键：将 pages 对象转为数组
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
      type: 'text',
      style: {}
    }));
  }

  initBackgroundSystem() {
    this.setBackgroundImage(1);
    this.updateBgInfo();
  }

  setBackgroundImage(index) {
    const bgIndex = ((index - 1) % this.totalBackgrounds) + 1;
    document.getElementById('background-layer').style.backgroundImage = 
      `url('assets/background/slide${bgIndex}.jpg')`;
    this.currentBackgroundIndex = bgIndex;
    this.updateBgInfo();
  }

  updateBgInfo() {
    document.getElementById('bg-current').textContent = this.currentBackgroundIndex;
    document.getElementById('bg-total').textContent = this.totalBackgrounds;
  }

  nextBackground() {
    this.setBackgroundImage(this.currentBackgroundIndex + 1);
  }

  prevBackground() {
    this.setBackgroundImage(this.currentBackgroundIndex - 1);
  }

  // 提取页面预览文本（适配你的 JSON 结构）
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
    document.getElementById('page-title').textContent = page.title || `页面 ${pageIndex + 1}`;
    document.getElementById('page-text').innerHTML = 
      (this.getPagePreviewText(page) || '').replace(/\n/g, '<br>');
    document.getElementById('current-page').textContent = pageIndex + 1;
    this.updateNavigationHighlight();
  }

  updateNavigationHighlight() {
    document.querySelectorAll('.page-item').forEach((item, i) => {
      item.classList.toggle('active', i === this.currentPage);
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) this.showPage(this.currentPage + 1);
  }

  prevPage() {
    if (this.currentPage > 0) this.showPage(this.currentPage - 1);
  }

  updateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = 
      now.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setTimeout(() => this.updateTime(), 1000);
  }

  openEditor() {
    document.getElementById('editor-modal').style.display = 'block';
    this.loadProfessionalEditor();
  }

  closeEditor() {
    document.getElementById('editor-modal').style.display = 'none';
    const comp = document.getElementById('editor-component');
    if (comp) comp.innerHTML = '';
  }

  async loadProfessionalEditor() {
    try {
      document.getElementById('editor-loading').style.display = 'flex';
      document.getElementById('editor-component').style.display = 'none';

      const module = await import('./components/page-editor.js');
      window.pageEditorModule = module;

      document.getElementById('editor-loading').style.display = 'none';
      document.getElementById('editor-component').style.display = 'block';
      this.renderEditor();
    } catch (error) {
      console.error('加载编辑器失败:', error);
      document.getElementById('editor-loading').style.display = 'none';
      document.getElementById('editor-component').innerHTML = `
        <div style="padding:40px; text-align:center; color:#e74c3c;">
          <i class="fas fa-exclamation-triangle fa-3x"></i>
          <h3>编辑器加载失败</h3>
          <p>请检查 components/page-editor.js 是否已上传到仓库</p>
        </div>
      `;
    }
  }

  renderEditor() {
    const container = document.getElementById('editor-component');
    const currentPage = this.pagesData[this.currentPage] || {};
    container.innerHTML = '<div id="editor-container"></div>';
    
    if (window.pageEditorModule?.renderPageEditor) {
      window.pageEditorModule.renderPageEditor(currentPage, (updated) => {
        this.pagesData[this.currentPage] = updated;
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

// ✅ 全局函数：供 HTML onclick 调用（兼容 type="module"）
window.prevPage = () => window.churchPlayer?.prevPage();
window.nextPage = () => window.churchPlayer?.nextPage();
window.prevBackground = () => window.churchPlayer?.prevBackground();
window.nextBackground = () => window.churchPlayer?.nextBackground();
window.openEditor = () => window.churchPlayer?.openEditor();
window.closeEditor = () => window.churchPlayer?.closeEditor();

// 初始化
window.addEventListener('DOMContentLoaded', () => {
  window.churchPlayer = new ChurchPlayer();
});