// 教会聚会播放器 - 简化稳定版
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
    console.log("初始化教会播放器...");
    await this.loadMeetingData();
    this.initBackgroundSystem();
    this.renderNavigation();
    this.showPage(0);
    this.updateTime();
    this.setupEventListeners();
    window.churchPlayer = this;
    console.log("播放器初始化完成");
  }

  async loadMeetingData() {
    try {
      const response = await fetch('content/default-meeting.json');
      const data = await response.json();
      this.pagesData = Object.values(data.pages || {});
      this.totalPages = this.pagesData.length;
      
      const totalPagesEl = document.getElementById('total-pages');
      const totalPagesDisplayEl = document.getElementById('total-pages-display');
      const totalPagesDisplay2El = document.getElementById('total-pages-display2');
      
      if (totalPagesEl) totalPagesEl.textContent = this.totalPages;
      if (totalPagesDisplayEl) totalPagesDisplayEl.textContent = this.totalPages;
      if (totalPagesDisplay2El) totalPagesDisplay2El.textContent = this.totalPages;
      
      console.log("加载了 " + this.totalPages + " 个页面");
    } catch (error) {
      console.error("加载数据失败:", error);
      this.pagesData = this.getDefaultPages();
      this.totalPages = this.pagesData.length;
    }
  }

  getDefaultPages() {
    const pages = [];
    for (let i = 0; i < 30; i++) {
      pages.push({
        id: i + 1,
        title: '页面 ' + (i + 1),
        content: '这是第 ' + (i + 1) + ' 页的默认内容...',
        type: 'text'
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
    const bgElement = document.getElementById('background-layer');
    if (bgElement) {
      bgElement.style.backgroundImage = 'url("assets/background/slide' + bgIndex + '.jpg")';
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
    if (Array.isArray(page.items)) return page.items[0] || '无内容';
    if (Array.isArray(page.groups)) return page.groups[0] || '无内容';
    if (page.text) return page.text;
    return '无内容...';
  }

  renderNavigation() {
    const pagesList = document.getElementById('pages-list');
    if (!pagesList) {
      console.error("找不到导航容器");
      return;
    }
    
    pagesList.innerHTML = '';

    for (let i = 0; i < this.pagesData.length; i++) {
      const page = this.pagesData[i];
      const pageItem = document.createElement('div');
      pageItem.className = 'page-item';
      if (i === this.currentPage) {
        pageItem.classList.add('active');
      }

      const preview = this.getPagePreviewText(page);
      const thumbnailContent = preview.substring(0, 80).replace(/\n/g, ' ') + '...';

      pageItem.innerHTML = '<div class="page-thumbnail"><div class="thumbnail-content">' + 
                          thumbnailContent + '</div></div><div class="page-title-small" title="' + 
                          (page.title || '未命名') + '">' + (page.title || '页面 ' + (i + 1)) + '</div>';
      
      pageItem.addEventListener('click', () => {
        this.showPage(i);
      });
      
      pagesList.appendChild(pageItem);
    }
    
    console.log("导航渲染完成，共 " + this.pagesData.length + " 个项目");
  }

  showPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= this.totalPages) {
      return;
    }
    
    this.currentPage = pageIndex;
    const page = this.pagesData[pageIndex];
    
    // 更新标题
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
      pageTitleElement.textContent = page.title || '页面 ' + (pageIndex + 1);
    }
    
    // 更新内容
    const pageTextElement = document.getElementById('page-text');
    if (pageTextElement) {
      let content = '';
      
      // 尝试各种内容字段
      if (page.content) content = page.content;
      else if (page.text) content = page.text;
      else if (Array.isArray(page.items)) content = page.items.join('<br>');
      else if (Array.isArray(page.groups)) content = page.groups.join('<br>');
      else if (page.lyrics) content = page.lyrics;
      
      // 如果有sections
      if (!content && Array.isArray(page.sections) && page.sections.length > 0) {
        const section = page.sections[0];
        if (section.content) content = section.content;
        else if (section.text) content = section.text;
        else if (Array.isArray(section.items)) content = section.items.join('<br>');
      }
      
      // 处理换行
      if (content) {
        content = content.replace(/\n/g, '<br>');
      } else {
        content = '无内容...';
      }
      
      pageTextElement.innerHTML = content;
    }
    
    // 更新页码显示
    const currentPageElement = document.getElementById('current-page');
    const currentPageDisplayElement = document.getElementById('current-page-display');
    
    if (currentPageElement) {
      currentPageElement.textContent = pageIndex + 1;
    }
    if (currentPageDisplayElement) {
      currentPageDisplayElement.textContent = pageIndex + 1;
    }
    
    // 更新导航高亮
    this.updateNavigationHighlight();
    
    console.log("显示页面: " + pageIndex);
  }

  updateNavigationHighlight() {
    const pageItems = document.querySelectorAll('.page-item');
    for (let i = 0; i < pageItems.length; i++) {
      if (i === this.currentPage) {
        pageItems[i].classList.add('active');
      } else {
        pageItems[i].classList.remove('active');
      }
    }
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
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      timeElement.textContent = hours + ':' + minutes;
    }
    
    setTimeout(() => {
      this.updateTime();
    }, 1000);
  }

  openEditor() {
    console.log("打开编辑器");
    const editorModal = document.getElementById('editor-modal');
    if (editorModal) {
      editorModal.style.display = 'block';
      this.loadProfessionalEditor();
    }
  }

  closeEditor() {
    console.log("关闭编辑器");
    const editorModal = document.getElementById('editor-modal');
    if (editorModal) {
      editorModal.style.display = 'none';
    }
  }


  async loadProfessionalEditor() {
    console.log("加载编辑器");
    
    var loadingElement = document.getElementById("editor-loading");
    var editorComponent = document.getElementById("editor-component");
    
    if (loadingElement) {
      loadingElement.style.display = "flex";
      loadingElement.innerHTML = "<div>加载编辑器中...</div>";
    }
    
    if (editorComponent) {
      editorComponent.style.display = "none";
      editorComponent.innerHTML = ""; // 清空
    }
    
    try {
      // 简单延迟
      await new Promise(function(resolve) {
        setTimeout(resolve, 100);
      });
      
      // 尝试导入编辑器
      var module = await import("./components/page-editor.js");
      console.log("编辑器模块加载成功");
      
      if (loadingElement) {
        loadingElement.style.display = "none";
      }
      
      if (editorComponent) {
        editorComponent.style.display = "block";
        
        if (module && module.renderPageEditor) {
          var currentPage = this.pagesData[this.currentPage] || {};
          module.renderPageEditor(currentPage, function(updatedPage) {
            // 保存修改
            this.pagesData[this.currentPage] = updatedPage;
            this.renderNavigation();
            this.showPage(this.currentPage);
            console.log("页面已更新");
          }.bind(this));
        } else {
          console.error("编辑器函数不存在");
          this.showSimpleEditor();
        }
      }
    } catch (error) {
      console.error("编辑器加载失败:", error);
      
      if (loadingElement) {
        loadingElement.style.display = "none";
      }
      
      if (editorComponent) {
        editorComponent.style.display = "block";
        this.showSimpleEditor();
      }
    }
  }

  showSimpleEditor() {
    console.log("显示简单编辑器");
    var editorComponent = document.getElementById("editor-component");
    if (!editorComponent) return;
    
    var currentPage = this.pagesData[this.currentPage] || {};
    
    var html = "";
    html += '<div style="padding: 30px; color: white; text-align: center;">';
    html += '<h3 style="color: #3498db; margin-bottom: 25px;">简易编辑器</h3>';
    
    html += '<div style="margin-bottom: 20px;">';
    html += '<input type="text" id="simpleTitle" value="' + (currentPage.title || "") + '" ';
    html += 'placeholder="页面标题" ';
    html += 'style="width: 80%; max-width: 500px; padding: 12px; margin-bottom: 15px; ';
    html += 'background: rgba(255,255,255,0.1); color: white; border: 1px solid #666; ';
    html += 'border-radius: 6px; font-size: 16px; text-align: center;">';
    html += '</div>';
    
    html += '<div style="margin-bottom: 25px;">';
    html += '<textarea id="simpleContent" rows="12" placeholder="页面内容" ';
    html += 'style="width: 80%; max-width: 500px; padding: 12px; ';
    html += 'background: rgba(255,255,255,0.1); color: white; border: 1px solid #666; ';
    html += 'border-radius: 6px; font-size: 16px; text-align: center;">';
    html += (currentPage.content || currentPage.text || "") + '</textarea>';
    html += '</div>';
    
    html += '<div style="display: flex; gap: 15px; justify-content: center;">';
    html += '<button onclick="window.churchPlayer.saveSimpleEdit()" ';
    html += 'style="padding: 12px 30px; background: #27ae60; color: white; ';
    html += 'border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">保存</button>';
    html += '<button onclick="window.churchPlayer.closeEditor()" ';
    html += 'style="padding: 12px 30px; background: #e74c3c; color: white; ';
    html += 'border: none; border-radius: 6px; cursor: pointer;">取消</button>';
    html += '</div>';
    html += '</div>';
    
    editorComponent.innerHTML = html;
  }

  saveSimpleEdit() {
    var titleInput = document.getElementById("simpleTitle");
    var contentInput = document.getElementById("simpleContent");
    
    if (titleInput && contentInput) {
      this.pagesData[this.currentPage] = {
        title: titleInput.value,
        content: contentInput.value
      };
      
      this.renderNavigation();
      this.showPage(this.currentPage);
      this.closeEditor();
    }
  }
    if (editorComponent) {
      editorComponent.style.display = 'none';
      editorComponent.innerHTML = '<div style="padding:20px;">编辑器准备中...</div>';
    }
    
    try {
      // 动态导入编辑器
      const module = await import('./components/page-editor.js');
      console.log("编辑器模块加载成功");
      
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
      if (editorComponent) {
        editorComponent.style.display = 'block';
        
        // 调用编辑器的渲染函数
        if (module.renderPageEditor) {
          const currentPage = this.pagesData[this.currentPage] || {};
          module.renderPageEditor(currentPage, (updatedPage) => {
            // 保存修改
            this.pagesData[this.currentPage] = updatedPage;
            this.renderNavigation();
            this.showPage(this.currentPage);
          });
        } else {
          editorComponent.innerHTML = '<div style="padding:20px;color:red;">编辑器函数未找到</div>';
        }
      }
    } catch (error) {
      console.error("编辑器加载失败:", error);
      
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
      if (editorComponent) {
        editorComponent.style.display = 'block';
        editorComponent.innerHTML = '<div style="padding:20px;text-align:center;"><h3>编辑器加载失败</h3><p>请检查组件文件</p></div>';
      }
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        this.nextPage();
      }
      if (e.key === 'ArrowLeft') {
        this.prevPage();
      }
      if (e.key === 'Escape') {
        this.closeEditor();
      }
      if (e.key === 'b' || e.key === 'B') {
        this.nextBackground();
      }
      if (e.key === 'v' || e.key === 'V') {
        this.prevBackground();
      }
    });
  }
}

// 全局函数（确保在HTML加载时就存在）
window.prevPage = function() {
  if (window.churchPlayer) {
    window.churchPlayer.prevPage();
  }
};

window.nextPage = function() {
  if (window.churchPlayer) {
    window.churchPlayer.nextPage();
  }
};

window.prevBackground = function() {
  if (window.churchPlayer) {
    window.churchPlayer.prevBackground();
  }
};

window.nextBackground = function() {
  if (window.churchPlayer) {
    window.churchPlayer.nextBackground();
  }
};

window.openEditor = function() {
  if (window.churchPlayer) {
    window.churchPlayer.openEditor();
  } else {
    console.log("播放器尚未初始化");
  }
};

window.closeEditor = function() {
  if (window.churchPlayer) {
    window.churchPlayer.closeEditor();
  }
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  console.log("DOM加载完成，开始初始化播放器");
  new ChurchPlayer();
});
