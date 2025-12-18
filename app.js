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
    console.log('开始初始化...');
    await this.loadMeetingData();
    console.log('数据加载完成，页面数:', this.totalPages);
    this.initBackgroundSystem();
    this.renderNavigation();
    this.showPage(0);
    this.updateTime();
    this.setupEventListeners();
    window.churchPlayer = this;
    console.log('初始化完成');
  }

  async loadMeetingData() {
    try {
      console.log('正在加载会议数据...');
      const response = await fetch('content/default-meeting.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log('原始数据:', data);
      
      // 处理pages数据
      if (data.pages && typeof data.pages === 'object') {
        // 将对象转换为数组，并确保顺序
        this.pagesData = Object.entries(data.pages)
          .sort(([keyA], [keyB]) => {
            // 按数字排序
            const numA = parseInt(keyA.replace('page', ''));
            const numB = parseInt(keyB.replace('page', ''));
            return numA - numB;
          })
          .map(([key, value]) => ({
            id: key,
            ...value
          }));
      } else {
        this.pagesData = data.pages || [];
      }
      
      this.totalPages = this.pagesData.length;
      console.log('处理后页面数据:', this.pagesData);
      
      // 更新UI
      const totalPagesEl = document.getElementById('total-pages');
      const totalPagesDisplayEl = document.getElementById('total-pages-display');
      
      if (totalPagesEl) totalPagesEl.textContent = this.totalPages;
      if (totalPagesDisplayEl) totalPagesDisplayEl.textContent = this.totalPages;
      
    } catch (error) {
      console.error('加载失败，使用默认数据:', error);
      this.pagesData = this.getDefaultPages();
      this.totalPages = this.pagesData.length;
    }
  }

  getDefaultPages() {
    return Array.from({ length: 30 }, (_, i) => ({
      id: `page${i + 1}`,
      title: `页面 ${i + 1}`,
      content: `这是第 ${i + 1} 页的默认内容...`,
      type: 'text'
    }));
  }

  // ... 其他方法保持不变（从之前正确的版本复制）
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

  // 增强的页面预览文本提取
  getPagePreviewText(page) {
    // 1. 如果有sections，提取第一个section的内容
    if (Array.isArray(page.sections) && page.sections.length > 0) {
      const firstSection = page.sections[0];
      
      // 从section中提取内容
      if (firstSection.content) return firstSection.content;
      if (firstSection.text) return firstSection.text;
      if (Array.isArray(firstSection.items)) return firstSection.items[0] || '无内容';
      if (Array.isArray(firstSection.groups)) return firstSection.groups[0]?.text || '无内容';
    }
    
    // 2. 回退到原逻辑
    if (page.content) return page.content;
    if (page.lyrics) return page.lyrics;
    if (Array.isArray(page.items)) return page.items.join(' | ');
    if (Array.isArray(page.groups)) return page.groups.join(' | ');
    if (page.text) return page.text;
    if (page.quote) return page.quote;
    
    return '无内容...';
  }

  renderNavigation() {
    const pagesList = document.getElementById('pages-list');
    if (!pagesList) {
      console.error('找不到 pages-list 元素');
      return;
    }
    
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
      
      pageItem.addEventListener('click', () => {
        console.log('点击页面:', index);
        this.showPage(index);
      });
      pagesList.appendChild(pageItem);
    });
    
    console.log('导航渲染完成，项目数:', this.pagesData.length);
  }

  showPage(pageIndex) {
  showPage(pageIndex) {
    console.log('显示页面:', pageIndex);
    
    if (pageIndex < 0 || pageIndex >= this.totalPages) {
      console.error('页面索引超出范围:', pageIndex);
      return;
    }
    
    this.currentPage = pageIndex;
    const page = this.pagesData[pageIndex];
    console.log('页面数据:', page);
    console.log('页面sections:', page.sections);
    
    // 更新页面标题
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
      pageTitleElement.textContent = page.title || `页面 ${pageIndex + 1}`;
    }
    
    // 更新页面内容
    const pageTextElement = document.getElementById('page-text');
    if (pageTextElement) {
      let html = '';
      
      //  修复：正确处理sections
      if (Array.isArray(page.sections) && page.sections.length > 0) {
        console.log('使用sections渲染');
        html = page.sections.map(section => {
          console.log('处理section:', section);
          
          // 获取内容
          let content = section.content || section.text || '';
          
          // 如果有items数组
          if (Array.isArray(section.items) && section.items.length > 0) {
            content = section.items.join('<br>');
          }
          
          // 如果有groups数组
          if (Array.isArray(section.groups) && section.groups.length > 0) {
            content = section.groups.map(group => {
              if (typeof group === 'string') return group;
              if (group.text) return group.text;
              return '';
            }).join('<br>');
          }
          
          // 应用样式
          let styleStr = '';
          if (section.style && typeof section.style === 'object') {
            styleStr = Object.entries(section.style)
              .map(([key, value]) => `${key}:${value}`)
              .join(';');
          }
          
          // 如果有特定类型处理
          if (section.type === 'title' || section.style?.fontSize > '24px') {
            return `<h2 style="${styleStr}">${content.replace(/\n/g, '<br>')}</h2>`;
          } else if (section.type === 'lyrics') {
            return `<div style="${styleStr}; font-style: italic; text-align: center;">${content.replace(/\n/g, '<br>')}</div>`;
          } else {
            return `<div style="${styleStr}">${content.replace(/\n/g, '<br>')}</div>`;
          }
        }).join('');
      } 
      //  如果没有sections，使用旧方式
      else {
        console.log('使用旧方式渲染');
        html = this.getPagePreviewText(page).replace(/\n/g, '<br>');
      }
      
      console.log('最终HTML:', html);
      pageTextElement.innerHTML = html;
    }
    
    // 更新当前页码显示
    const currentPageElement = document.getElementById('current-page');
    if (currentPageElement) {
      currentPageElement.textContent = pageIndex + 1;
    }
    
    // 更新导航高亮
    this.updateNavigationHighlight();
    
    // 如果有背景图片，设置背景
    if (page.background) {
      const bgElement = document.getElementById('background-layer');
      if (bgElement) {
        bgElement.style.backgroundImage = `url('assets/background/${page.background}')`;
      }
    }
  }
  }
    
    this.currentPage = pageIndex;
    const page = this.pagesData[pageIndex];
    console.log('页面数据:', page);
    
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
    console.log('打开编辑器');
    const editorModal = document.getElementById('editor-modal');
    if (editorModal) {
      editorModal.style.display = 'block';
      this.loadProfessionalEditor();
    }
  }

  closeEditor() {
    console.log('关闭编辑器');
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
    console.log('加载专业编辑器...');
    try {
      const loadingElement = document.getElementById('editor-loading');
      const editorComponent = document.getElementById('editor-component');
      
      if (loadingElement) loadingElement.style.display = 'flex';
      if (editorComponent) editorComponent.style.display = 'none';

      // 动态导入编辑器
      const module = await import('./components/page-editor.js');
      window.pageEditorModule = module;
      console.log('编辑器模块加载成功');

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
            <p>错误: ${error.message}</p>
            <p>请检查 components/page-editor.js 是否已上传</p>
            <button onclick="window.churchPlayer?.closeEditor()" style="padding:10px 20px; margin-top:20px;">
              关闭
            </button>
          </div>
        `;
      }
    }
  }

  renderEditor() {
    console.log('渲染编辑器');
    const container = document.getElementById('editor-component');
    if (!container) {
      console.error('找不到 editor-component');
      return;
    }
    
    const currentPage = this.pagesData[this.currentPage] || {};
    console.log('当前页面数据:', currentPage);
    container.innerHTML = '<div id="editor-container"></div>';
    
    if (window.pageEditorModule?.renderPageEditor) {
      window.pageEditorModule.renderPageEditor(currentPage, (updatedPage) => {
        console.log('页面更新:', updatedPage);
        this.pagesData[this.currentPage] = updatedPage;
        this.renderNavigation();
        this.showPage(this.currentPage);
      });
    } else {
      console.error('pageEditorModule.renderPageEditor 不存在');
      container.innerHTML = `
        <div style="padding:20px;">
          <h3>编辑器函数不存在</h3>
          <p>请检查 components/page-editor.js 是否正确导出了 renderPageEditor 函数</p>
        </div>
      `;
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
window.prevPage = () => {
  console.log('上一页按钮点击');
  window.churchPlayer?.prevPage();
};

window.nextPage = () => {
  console.log('下一页按钮点击');
  window.churchPlayer?.nextPage();
};

window.prevBackground = () => window.churchPlayer?.prevBackground();
window.nextBackground = () => window.churchPlayer?.nextBackground();
window.openEditor = () => window.churchPlayer?.openEditor();
window.closeEditor = () => window.churchPlayer?.closeEditor();

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM加载完成，开始初始化播放器');
  new ChurchPlayer();
});

// 调试：暴露到全局
window.debugChurchPlayer = () => {
  console.log('调试信息:');
  console.log('churchPlayer:', window.churchPlayer);
  console.log('pagesData:', window.churchPlayer?.pagesData);
  console.log('totalPages:', window.churchPlayer?.totalPages);
};
