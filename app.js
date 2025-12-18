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
    console.log('开始加载编辑器...');
    const editorComponent = document.getElementById('editor-component');
    const loadingElement = document.getElementById('editor-loading');
    
    if (loadingElement) {
      loadingElement.style.display = 'flex';
      loadingElement.innerHTML = '<div style="font-size: 18px; color: #666;">加载编辑器中...</div>';
    }
    
    if (editorComponent) {
      editorComponent.style.display = 'none';
    }
    
    try {
      // 等待一小段时间确保UI更新
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const module = await import('./components/page-editor.js');
      window.pageEditorModule = module;
      console.log('编辑器模块加载成功');
      
      if (loadingElement) loadingElement.style.display = 'none';
      if (editorComponent) {
        editorComponent.style.display = 'block';
        this.renderEditor();
      }
    } catch (error) {
      console.error('编辑器加载失败:', error);
      
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
      
      if (editorComponent) {
        editorComponent.style.display = 'block';
        editorComponent.innerHTML = \`
          <div style="padding: 40px; text-align: center; color: #333;">
            <h3 style="color: #4CAF50;">简易编辑器</h3>
            <p>专业编辑器加载失败，使用简易版本</p>
            
            <div style="margin-top: 30px; text-align: left; background: #f9f9f9; padding: 20px; border-radius: 8px;">
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">页面标题</label>
                <input type="text" id="simple-editor-title" 
                       value="\${this.pagesData[this.currentPage]?.title || ''}"
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">页面内容</label>
                <textarea id="simple-editor-content" rows="10"
                          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
\${this.pagesData[this.currentPage]?.content || this.pagesData[this.currentPage]?.text || ''}</textarea>
              </div>
              
              <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="window.churchPlayer?.saveSimpleEditor()" 
                        style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  保存
                </button>
                <button onclick="window.churchPlayer?.closeEditor()"
                        style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  取消
                </button>
              </div>
            </div>
          </div>
        \`;
      }
    }
  }

  saveSimpleEditor() {
    const titleInput = document.getElementById('simple-editor-title');
    const contentInput = document.getElementById('simple-editor-content');
    
    if (titleInput && contentInput) {
      this.pagesData[this.currentPage] = {
        ...this.pagesData[this.currentPage],
        title: titleInput.value,
        content: contentInput.value
      };
      
      this.renderNavigation();
      this.showPage(this.currentPage);
      this.closeEditor();
    }
  }
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
