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
  }

  async loadMeetingData() {
    try {
      const response = await fetch('content/default-meeting.json');
      const data = await response.json();
      this.pagesData = Object.values(data.pages || {});
      this.totalPages = this.pagesData.length;
      document.getElementById('total-pages').textContent = this.totalPages;
      document.getElementById('total-pages-display').textContent = this.totalPages;
    } catch (error) {
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

  getPagePreviewText(page) {
    if (page.content) return page.content;
    if (page.lyrics) return page.lyrics;
    if (Array.isArray(page.items)) return page.items[0] || '无内容';
    if (Array.isArray(page.groups)) return page.groups[0] || '无内容';
    if (page.text) return page.text;
    return '无内容...';
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
    
    // 更新标题
    document.getElementById('page-title').textContent = page.title || `页面 ${pageIndex + 1}`;
    
    // 更新内容 - 简化处理
    const pageTextElement = document.getElementById('page-text');
    if (pageTextElement) {
      let content = '';
      
      // 尝试各种可能的内容字段
      if (page.content) content = page.content;
      else if (page.text) content = page.text;
      else if (Array.isArray(page.items)) content = page.items.join('<br>');
      else if (Array.isArray(page.groups)) content = page.groups.join('<br>');
      else if (page.lyrics) content = page.lyrics;
      
      // 如果有sections，使用第一个section
      if (!content && Array.isArray(page.sections) && page.sections.length > 0) {
        const section = page.sections[0];
        if (section.content) content = section.content;
        else if (section.text) content = section.text;
        else if (Array.isArray(section.items)) content = section.items.join('<br>');
      }
      
      pageTextElement.innerHTML = content ? content.replace(/\n/g, '<br>') : '无内容...';
    }
    
    // 更新页码
    document.getElementById('current-page').textContent = pageIndex + 1;
    
    // 更新导航高亮
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
  }

  async loadProfessionalEditor() {
    try {
      const module = await import('./components/page-editor.js');
      window.pageEditorModule = module;
      this.renderEditor();
    } catch (error) {
      console.error('加载编辑器失败:', error);
    }
  }

  renderEditor() {
    const container = document.getElementById('editor-component');
    if (!container) return;
    
    const currentPage = this.pagesData[this.currentPage] || {};
    container.innerHTML = '<div>编辑器加载中...</div>';
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

// 全局函数
window.prevPage = () => window.churchPlayer?.prevPage();
window.nextPage = () => window.churchPlayer?.nextPage();
window.prevBackground = () => window.churchPlayer?.prevBackground();
window.nextBackground = () => window.churchPlayer?.nextBackground();
window.openEditor = () => window.churchPlayer?.openEditor();
window.closeEditor = () => window.churchPlayer?.closeEditor();

// 初始化
window.addEventListener('DOMContentLoaded', () => {
  new ChurchPlayer();
});
