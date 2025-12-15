// 颜色选择器预设
const COLOR_PRESETS = [
  '#4361ee', '#3a0ca3', '#f72585', '#4cc9f0',
  '#2d3748', '#4a5568', '#718096', '#a0aec0',
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169',
  '#319795', '#3182ce', '#805ad5', '#d53f8c'
];

// 字体预设
const FONT_PRESETS = [
  { name: '默认字体', value: 'inherit' },
  { name: '微软雅黑', value: 'Microsoft YaHei, sans-serif' },
  { name: '宋体', value: 'SimSun, serif' },
  { name: '黑体', value: 'SimHei, sans-serif' },
  { name: '楷体', value: 'KaiTi, serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' }
];

// 字号预设
const FONT_SIZE_PRESETS = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px'];

// 段落对齐预设
const ALIGN_PRESETS = [
  { name: '左对齐', value: 'left', icon: 'fas fa-align-left' },
  { name: '居中', value: 'center', icon: 'fas fa-align-center' },
  { name: '右对齐', value: 'right', icon: 'fas fa-align-right' },
  { name: '两端对齐', value: 'justify', icon: 'fas fa-align-justify' }
];

// 行高预设
const LINE_HEIGHT_PRESETS = ['1.0', '1.2', '1.4', '1.6', '1.8', '2.0'];

export function renderPageEditor(page, onChange) {
  const container = document.getElementById('editor-container');
  if (!container || !page) return;
  
  const safeTitle = page.title || page.id || '未命名页面';
  const safeSlug = page.slug || page.id || '';
  
  container.innerHTML = `
    <div class="editor-section">
      <h4><i class="fas fa-info-circle"></i> 页面基本信息</h4>
      <div class="form-group">
        <label for="title-input">
          <i class="fas fa-heading"></i> 页面标题
        </label>
        <input 
          type="text" 
          id="title-input" 
          class="form-control" 
          value="${escapeHtml(safeTitle)}"
          placeholder="请输入页面标题"
        >
      </div>
      <div class="form-group">
        <label for="slug-input">
          <i class="fas fa-link"></i> 页面标识符 (Slug)
        </label>
        <input 
          type="text" 
          id="slug-input" 
          class="form-control" 
          value="${escapeHtml(safeSlug)}"
          placeholder="page-identifier"
        >
        <small style="color: #666; font-size: 0.9rem;">用于URL，建议使用英文、数字和连字符</small>
      </div>
      <div class="form-group">
        <label for="page-description">
          <i class="fas fa-file-alt"></i> 页面描述
        </label>
        <textarea 
          id="page-description" 
          class="form-control" 
          placeholder="请输入页面描述（可选）"
          rows="2"
        >${escapeHtml(page.description || '')}</textarea>
      </div>
    </div>
    
    <div class="editor-section">
      <h4><i class="fas fa-palette"></i> 页面样式设置</h4>
      <div class="style-grid">
        <div class="form-group">
          <label><i class="fas fa-font"></i> 默认字体</label>
          <select id="page-font-family" class="form-control">
            ${FONT_PRESETS.map(font => `
              <option value="${escapeHtml(font.value)}" ${page.style?.fontFamily === font.value ? 'selected' : ''}>
                ${escapeHtml(font.name)}
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label><i class="fas fa-text-height"></i> 默认字号</label>
          <div class="select-with-preview">
            <select id="page-font-size" class="form-control">
              ${FONT_SIZE_PRESETS.map(size => `
                <option value="${size}" ${page.style?.fontSize === size ? 'selected' : ''}>
                  ${size}
                </option>
              `).join('')}
            </select>
            <span class="size-preview" id="font-size-preview">预览</span>
          </div>
        </div>
        <div class="form-group">
          <label><i class="fas fa-tint"></i> 文字颜色</label>
          <div class="color-picker-container">
            <input 
              type="color" 
              id="page-text-color" 
              value="${page.style?.color || '#2d3748'}"
              class="color-picker"
            >
            <div class="color-presets">
              ${COLOR_PRESETS.map(color => `
                <button 
                  class="color-preset" 
                  style="background: ${color}"
                  data-color="${color}"
                  title="${color}"
                ></button>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="form-group">
          <label><i class="fas fa-fill"></i> 背景颜色</label>
          <div class="color-picker-container">
            <input 
              type="color" 
              id="page-bg-color" 
              value="${page.style?.backgroundColor || '#ffffff'}"
              class="color-picker"
            >
            <div class="color-presets">
              ${['#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', ...COLOR_PRESETS].map(color => `
                <button 
                  class="color-preset" 
                  style="background: ${color}; border: 1px solid ${color === '#ffffff' ? '#ddd' : 'transparent'}"
                  data-color="${color}"
                  title="${color}"
                ></button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="editor-section">
      <h4><i class="fas fa-layer-group"></i> 内容区块管理</h4>
      <div id="sections-editor"></div>
      
      <div class="section-actions">
        <h5><i class="fas fa-plus-circle"></i> 添加新区块</h5>
        <div class="action-buttons">
          <button id="add-text-section" class="action-btn">
            <i class="fas fa-paragraph"></i>
            <span>文本</span>
          </button>
          <button id="add-image-section" class="action-btn">
            <i class="fas fa-image"></i>
            <span>图片</span>
          </button>
          <button id="add-audio-section" class="action-btn">
            <i class="fas fa-music"></i>
            <span>音频</span>
          </button>
          <button id="add-video-section" class="action-btn">
            <i class="fas fa-video"></i>
            <span>视频</span>
          </button>
          <button id="add-quote-section" class="action-btn">
            <i class="fas fa-quote-right"></i>
            <span>引用</span>
          </button>
        </div>
      </div>
      
      <div class="section-tools">
        <h5><i class="fas fa-sort"></i> 区块排序</h5>
        <button id="move-up" class="tool-btn" disabled>
          <i class="fas fa-arrow-up"></i> 上移
        </button>
        <button id="move-down" class="tool-btn" disabled>
          <i class="fas fa-arrow-down"></i> 下移
        </button>
        <button id="duplicate-section" class="tool-btn" disabled>
          <i class="fas fa-copy"></i> 复制
        </button>
        <button id="clear-all" class="tool-btn danger">
          <i class="fas fa-trash-alt"></i> 清空所有
        </button>
      </div>
    </div>
    
    <div class="editor-section">
      <h4><i class="fas fa-download"></i> 数据操作</h4>
      <div class="data-actions">
        <button id="download-json" class="data-btn primary">
          <i class="fas fa-file-export"></i> 导出JSON
        </button>
        <button id="copy-json" class="data-btn">
          <i class="fas fa-copy"></i> 复制JSON
        </button>
        <button id="save-template" class="data-btn">
          <i class="fas fa-save"></i> 保存为模板
        </button>
        <button id="load-template" class="data-btn">
          <i class="fas fa-folder-open"></i> 加载模板
        </button>
      </div>
      
      <div class="import-area">
        <label><i class="fas fa-file-import"></i> 导入JSON数据</label>
        <textarea 
          id="import-json" 
          class="form-control" 
          placeholder="粘贴JSON数据到这里..." 
          rows="4"
        ></textarea>
        <button id="import-btn" class="data-btn success">
          <i class="fas fa-upload"></i> 导入数据
        </button>
      </div>
      
      <div class="preview-area">
        <h5><i class="fas fa-eye"></i> 实时预览</h5>
        <div id="style-preview" class="preview-box">
          <p id="preview-text">这里是文本预览效果</p>
          <div class="preview-controls">
            <button id="update-preview" class="small-btn">
              <i class="fas fa-sync-alt"></i> 更新预览
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="editor-section tips">
      <h4><i class="fas fa-lightbulb"></i> 编辑提示</h4>
      <div class="tip-content">
        <div class="tip-item">
          <i class="fas fa-keyboard"></i>
          <div>
            <strong>快捷键</strong>
            <p>Ctrl+S: 保存 | Ctrl+Z: 撤销 | Ctrl+Shift+Z: 重做</p>
          </div>
        </div>
        <div class="tip-item">
          <i class="fas fa-paint-brush"></i>
          <div>
            <strong样式继承</strong>
            <p>页面样式会应用到所有文本区块，单个区块可自定义样式</p>
          </div>
        </div>
        <div class="tip-item">
          <i class="fas fa-images"></i>
          <div>
            <strong>图片优化</strong>
            <p>建议图片尺寸不超过2000px，格式为JPG/PNG/WEBP</p>
          </div>
        </div>
        <div class="tip-item">
          <i class="fas fa-history"></i>
          <div>
            <strong>自动保存</strong>
            <p>所有更改都会自动保存，无需手动保存按钮</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加样式
  addEditorStyles();
  
  // 初始化编辑器
  initializeEditor(page, onChange);
}

// 初始化编辑器
function initializeEditor(page, onChange) {
  // 设置页面基本信息
  setupPageInfo(page, onChange);
  
  // 设置页面样式
  setupPageStyles(page, onChange);
  
  // 渲染区块编辑器
  renderSectionsEditor(page, onChange);
  
  // 设置数据操作
  setupDataOperations(page, onChange);
  
  // 设置预览
  setupPreview(page);
  
  // 设置快捷键
  setupKeyboardShortcuts(page, onChange);
  
  // 初始化历史记录（撤销/重做）
  initHistory(page, onChange);
}

// 设置页面基本信息
function setupPageInfo(page, onChange) {
  // 页面标题
  document.getElementById('title-input')?.addEventListener('input', function() {
    page.title = this.value;
    onChange(page);
  });
  
  // 页面标识符
  document.getElementById('slug-input')?.addEventListener('input', function() {
    page.slug = this.value;
    onChange(page);
  });
  
  // 页面描述
  document.getElementById('page-description')?.addEventListener('input', function() {
    page.description = this.value;
    onChange(page);
  });
}

// 设置页面样式
function setupPageStyles(page, onChange) {
  // 确保样式对象存在
  if (!page.style) {
    page.style = {};
  }
  
  // 字体选择
  document.getElementById('page-font-family')?.addEventListener('change', function() {
    page.style.fontFamily = this.value;
    updatePreview();
    onChange(page);
  });
  
  // 字号选择
  const fontSizeSelect = document.getElementById('page-font-size');
  fontSizeSelect?.addEventListener('change', function() {
    page.style.fontSize = this.value;
    updatePreview();
    onChange(page);
  });
  
  // 实时预览字号
  fontSizeSelect?.addEventListener('input', function() {
    document.getElementById('font-size-preview').style.fontSize = this.value;
  });
  
  // 文字颜色
  const textColorPicker = document.getElementById('page-text-color');
  textColorPicker?.addEventListener('input', function() {
    page.style.color = this.value;
    updatePreview();
    onChange(page);
  });
  
  // 背景颜色
  const bgColorPicker = document.getElementById('page-bg-color');
  bgColorPicker?.addEventListener('input', function() {
    page.style.backgroundColor = this.value;
    updatePreview();
    onChange(page);
  });
  
  // 颜色预设点击事件
  document.querySelectorAll('.color-preset').forEach(preset => {
    preset.addEventListener('click', function() {
      const color = this.dataset.color;
      const isBgColor = this.closest('.color-picker-container').querySelector('input').id.includes('bg');
      
      if (isBgColor) {
        page.style.backgroundColor = color;
        bgColorPicker.value = color;
      } else {
        page.style.color = color;
        textColorPicker.value = color;
      }
      
      updatePreview();
      onChange(page);
    });
  });
}

// 渲染区块编辑器
function renderSectionsEditor(page, onChange, selectedIndex = null) {
  const secEditor = document.getElementById('sections-editor');
  
  // 确保sections数组存在
  if (!page.sections || !Array.isArray(page.sections)) {
    page.sections = [];
  }
  
  if (page.sections.length === 0) {
    secEditor.innerHTML = `
      <div class="empty-sections">
        <i class="fas fa-file-alt fa-3x"></i>
        <h3>暂无内容区块</h3>
        <p>点击下方的"添加区块"按钮开始创建内容</p>
        <div class="empty-actions">
          <button id="add-sample-content" class="btn-edit">
            <i class="fas fa-magic"></i> 添加示例内容
          </button>
        </div>
      </div>
    `;
    
    // 添加示例内容按钮
    document.getElementById('add-sample-content')?.addEventListener('click', function() {
      page.sections = [
        {
          type: 'text',
          content: '欢迎使用内容编辑器！\n\n这里是一个示例文本区块，您可以编辑或删除它。',
          style: {
            fontSize: '20px',
            lineHeight: '1.6',
            textAlign: 'center'
          }
        },
        {
          type: 'image',
          src: 'https://placehold.co/800x450/4361ee/ffffff?text=示例图片',
          alt: '这是一个示例图片',
          style: {
            maxWidth: '80%',
            borderRadius: '12px'
          }
        }
      ];
      renderSectionsEditor(page, onChange, 0);
      onChange(page);
    });
    
    return;
  }
  
  // 渲染所有区块
  secEditor.innerHTML = page.sections.map((section, index) => {
    const isSelected = index === selectedIndex;
    const sectionClass = isSelected ? 'section-editor selected' : 'section-editor';
    
    return `
      <div class="${sectionClass}" data-index="${index}" data-type="${section.type}">
        <div class="section-header">
          <div class="section-title">
            <span class="section-number">${index + 1}</span>
            <i class="${getSectionIcon(section.type)}"></i>
            <strong>${getSectionTypeName(section.type)}区块</strong>
            ${section.style?.fontSize ? `<span class="section-badge">${section.style.fontSize}</span>` : ''}
            ${section.style?.color ? `<span class="color-badge" style="background: ${section.style.color}"></span>` : ''}
          </div>
          <div class="section-actions">
            <button class="section-action-btn" data-action="collapse" title="${isSelected ? '展开' : '收起'}">
              <i class="fas fa-chevron-${isSelected ? 'up' : 'down'}"></i>
            </button>
            <button class="section-action-btn" data-action="select" title="选择">
              <i class="fas fa-check-circle"></i>
            </button>
            <button class="section-action-btn" data-action="duplicate" title="复制">
              <i class="fas fa-copy"></i>
            </button>
            <button class="section-action-btn danger" data-action="delete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="section-body" style="display: ${isSelected ? 'block' : 'none'}">
          ${renderSectionFields(section, index)}
          ${renderSectionStyles(section, index)}
        </div>
      </div>
    `;
  }).join('');
  
  // 绑定区块事件
  bindSectionEvents(page, onChange);
}

// 渲染区块字段
function renderSectionFields(section, index) {
  if (section.type === 'text') {
    return `
      <div class="form-group">
        <label>
          <i class="fas fa-align-left"></i> 文本内容
          <span class="char-count">字数: ${(section.content || '').length}</span>
        </label>
        <div class="text-editor-toolbar">
          <button class="toolbar-btn" data-action="bold" title="粗体 (Ctrl+B)">
            <i class="fas fa-bold"></i>
          </button>
          <button class="toolbar-btn" data-action="italic" title="斜体 (Ctrl+I)">
            <i class="fas fa-italic"></i>
          </button>
          <button class="toolbar-btn" data-action="underline" title="下划线 (Ctrl+U)">
            <i class="fas fa-underline"></i>
          </button>
          <div class="toolbar-separator"></div>
          <button class="toolbar-btn" data-action="link" title="添加链接">
            <i class="fas fa-link"></i>
          </button>
          <button class="toolbar-btn" data-action="list" title="列表">
            <i class="fas fa-list"></i>
          </button>
          <div class="toolbar-separator"></div>
          <button class="toolbar-btn" data-action="clear" title="清除格式">
            <i class="fas fa-eraser"></i>
          </button>
        </div>
        <textarea 
          class="form-control rich-text-editor" 
          data-index="${index}" 
          data-field="content" 
          rows="6"
          placeholder="请输入文本内容，支持HTML..."
        >${escapeHtml(section.content || '')}</textarea>
        <div class="editor-hints">
          <small>提示：使用 &lt;b&gt;粗体&lt;/b&gt;，&lt;i&gt;斜体&lt;/i&gt;，&lt;u&gt;下划线&lt;/u&gt; 标签</small>
        </div>
      </div>
    `;
  } else if (section.type === 'image') {
    return `
      <div class="form-group">
        <label><i class="fas fa-image"></i> 图片URL</label>
        <div class="input-with-actions">
          <input 
            type="text" 
            class="form-control" 
            data-index="${index}" 
            data-field="src" 
            value="${escapeHtml(section.src || '')}"
            placeholder="图片地址或URL"
          >
          <button class="input-action-btn" data-action="browse" title="浏览文件">
            <i class="fas fa-folder-open"></i>
          </button>
          <button class="input-action-btn" data-action="upload" title="上传图片">
            <i class="fas fa-upload"></i>
          </button>
        </div>
      </div>
      <div class="form-group">
        <label><i class="fas fa-comment-alt"></i> 图片描述 (Alt文本)</label>
        <input 
          type="text" 
          class="form-control" 
          data-index="${index}" 
          data-field="alt" 
          value="${escapeHtml(section.alt || '')}"
          placeholder="图片说明文字，用于SEO和无障碍访问"
        >
      </div>
      <div class="form-group">
        <label><i class="fas fa-expand-alt"></i> 图片尺寸</label>
        <div class="dimension-inputs">
          <input 
            type="number" 
            class="form-control" 
            data-index="${index}" 
            data-field="width" 
            value="${section.width || ''}"
            placeholder="宽度"
          >
          <span class="dimension-separator">×</span>
          <input 
            type="number" 
            class="form-control" 
            data-index="${index}" 
            data-field="height" 
            value="${section.height || ''}"
            placeholder="高度"
          >
          <select class="form-control" data-index="${index}" data-field="unit">
            <option value="px" ${(section.unit || 'px') === 'px' ? 'selected' : ''}>px</option>
            <option value="%" ${(section.unit || 'px') === '%' ? 'selected' : ''}>%</option>
            <option value="auto" ${(section.unit || 'px') === 'auto' ? 'selected' : ''}>自动</option>
          </select>
        </div>
      </div>
      ${section.src ? `
        <div class="image-preview">
          <label><i class="fas fa-eye"></i> 图片预览</label>
          <div class="preview-container">
            <img src="${escapeHtml(section.src)}" alt="预览" onerror="this.style.display='none'">
          </div>
        </div>
      ` : ''}
    `;
  } else if (section.type === 'audio') {
    return `
      <div class="form-group">
        <label><i class="fas fa-music"></i> 音频URL</label>
        <input 
          type="text" 
          class="form-control" 
          data-index="${index}" 
          data-field="src" 
          value="${escapeHtml(section.src || '')}"
          placeholder="音频文件地址"
        >
      </div>
      <div class="form-group">
        <label><i class="fas fa-headphones"></i> 音频标题</label>
        <input 
          type="text" 
          class="form-control" 
          data-index="${index}" 
          data-field="title" 
          value="${escapeHtml(section.title || '')}"
          placeholder="音频标题"
        >
      </div>
      <div class="form-group">
        <label><i class="fas fa-volume-up"></i> 音频控制</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              data-index="${index}" 
              data-field="controls" 
              ${section.controls !== false ? 'checked' : ''}
            >
            <span>显示控制面板</span>
          </label>
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              data-index="${index}" 
              data-field="autoplay" 
              ${section.autoplay ? 'checked' : ''}
            >
            <span>自动播放</span>
          </label>
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              data-index="${index}" 
              data-field="loop" 
              ${section.loop ? 'checked' : ''}
            >
            <span>循环播放</span>
          </label>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="form-group">
        <label>区块内容</label>
        <textarea 
          class="form-control" 
          data-index="${index}" 
          data-field="content" 
          rows="3"
          placeholder="请输入内容..."
        >${escapeHtml(section.content || '')}</textarea>
      </div>
    `;
  }
}

// 渲染区块样式设置
function renderSectionStyles(section, index) {
  // 确保样式对象存在
  if (!section.style) {
    section.style = {};
  }
  
  return `
    <div class="style-editor">
      <h5><i class="fas fa-paint-brush"></i> 自定义样式</h5>
      <div class="style-grid">
        <div class="form-group">
          <label>字体</label>
          <select class="form-control style-field" data-index="${index}" data-field="fontFamily">
            <option value="">继承页面字体</option>
            ${FONT_PRESETS.map(font => `
              <option value="${escapeHtml(font.value)}" ${section.style.fontFamily === font.value ? 'selected' : ''}>
                ${escapeHtml(font.name)}
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>字号</label>
          <select class="form-control style-field" data-index="${index}" data-field="fontSize">
            <option value="">继承页面字号</option>
            ${FONT_SIZE_PRESETS.map(size => `
              <option value="${size}" ${section.style.fontSize === size ? 'selected' : ''}>
                ${size}
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>文字颜色</label>
          <div class="color-picker-small">
            <input 
              type="color" 
              class="style-field" 
              data-index="${index}" 
              data-field="color" 
              value="${section.style.color || '#000000'}"
            >
            <button class="color-reset" data-field="color" title="重置颜色">
              <i class="fas fa-undo"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>背景颜色</label>
          <div class="color-picker-small">
            <input 
              type="color" 
              class="style-field" 
              data-index="${index}" 
              data-field="backgroundColor" 
              value="${section.style.backgroundColor || 'transparent'}"
            >
            <button class="color-reset" data-field="backgroundColor" title="重置背景">
              <i class="fas fa-undo"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>对齐方式</label>
          <div class="alignment-buttons">
            ${ALIGN_PRESETS.map(align => `
              <button 
                class="align-btn ${section.style.textAlign === align.value ? 'active' : ''}" 
                data-value="${align.value}"
                data-index="${index}"
                title="${align.name}"
              >
                <i class="${align.icon}"></i>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>行高</label>
          <select class="form-control style-field" data-index="${index}" data-field="lineHeight">
            <option value="">默认</option>
            ${LINE_HEIGHT_PRESETS.map(height => `
              <option value="${height}" ${section.style.lineHeight === height ? 'selected' : ''}>
                ${height}
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>字重</label>
          <select class="form-control style-field" data-index="${index}" data-field="fontWeight">
            <option value="">正常</option>
            <option value="300" ${section.style.fontWeight === '300' ? 'selected' : ''}>细体 (300)</option>
            <option value="400" ${section.style.fontWeight === '400' ? 'selected' : ''}>正常 (400)</option>
            <option value="500" ${section.style.fontWeight === '500' ? 'selected' : ''}>中等 (500)</option>
            <option value="600" ${section.style.fontWeight === '600' ? 'selected' : ''}>半粗 (600)</option>
            <option value="700" ${section.style.fontWeight === '700' ? 'selected' : ''}>粗体 (700)</option>
            <option value="800" ${section.style.fontWeight === '800' ? 'selected' : ''}>特粗 (800)</option>
            <option value="900" ${section.style.fontWeight === '900' ? 'selected' : ''}>黑体 (900)</option>
          </select>
        </div>
        <div class="form-group">
          <label>内边距</label>
          <input 
            type="text" 
            class="form-control style-field" 
            data-index="${index}" 
            data-field="padding" 
            value="${section.style.padding || ''}"
            placeholder="例如: 10px 20px"
          >
        </div>
        <div class="form-group">
          <label>外边距</label>
          <input 
            type="text" 
            class="form-control style-field" 
            data-index="${index}" 
            data-field="margin" 
            value="${section.style.margin || ''}"
            placeholder="例如: 20px auto"
          >
        </div>
        <div class="form-group">
          <label>边框</label>
          <input 
            type="text" 
            class="form-control style-field" 
            data-index="${index}" 
            data-field="border" 
            value="${section.style.border || ''}"
            placeholder="例如: 1px solid #ddd"
          >
        </div>
        <div class="form-group">
          <label>圆角</label>
          <input 
            type="text" 
            class="form-control style-field" 
            data-index="${index}" 
            data-field="borderRadius" 
            value="${section.style.borderRadius || ''}"
            placeholder="例如: 8px"
          >
        </div>
        <div class="form-group">
          <label>阴影</label>
          <input 
            type="text" 
            class="form-control style-field" 
            data-index="${index}" 
            data-field="boxShadow" 
            value="${section.style.boxShadow || ''}"
            placeholder="例如: 0 2px 8px rgba(0,0,0,0.1)"
          >
        </div>
        <div class="form-group full-width">
          <label>自定义CSS</label>
          <textarea 
            class="form-control style-field" 
            data-index="${index}" 
            data-field="customCSS" 
            rows="2"
            placeholder="输入自定义CSS样式..."
          >${escapeHtml(section.style.customCSS || '')}</textarea>
        </div>
      </div>
      <div class="style-actions">
        <button class="style-reset" data-index="${index}">
          <i class="fas fa-undo"></i> 重置所有样式
        </button>
        <button class="style-copy" data-index="${index}">
          <i class="fas fa-copy"></i> 复制样式
        </button>
        <button class="style-paste" data-index="${index}" disabled>
          <i class="fas fa-paste"></i> 粘贴样式
        </button>
      </div>
    </div>
  `;
}

// 绑定区块事件
function bindSectionEvents(page, onChange) {
  let selectedIndex = null;
  
  // 区块选择
  document.querySelectorAll('.section-editor [data-action="select"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const sectionEditor = this.closest('.section-editor');
      const index = parseInt(sectionEditor.dataset.index, 10);
      
      // 切换选择状态
      document.querySelectorAll('.section-editor').forEach(el => {
        el.classList.remove('selected');
        el.querySelector('.section-body').style.display = 'none';
      });
      
      sectionEditor.classList.add('selected');
      sectionEditor.querySelector('.section-body').style.display = 'block';
      selectedIndex = index;
      
      // 启用排序按钮
      updateSortButtons(selectedIndex, page.sections.length);
    });
  });
  
  // 区块折叠/展开
  document.querySelectorAll('.section-editor [data-action="collapse"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const sectionBody = this.closest('.section-editor').querySelector('.section-body');
      const isCollapsed = sectionBody.style.display === 'none';
      
      sectionBody.style.display = isCollapsed ? 'block' : 'none';
      this.innerHTML = isCollapsed ? 
        '<i class="fas fa-chevron-up"></i>' : 
        '<i class="fas fa-chevron-down"></i>';
    });
  });
  
  // 区块复制
  document.querySelectorAll('.section-editor [data-action="duplicate"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.closest('.section-editor').dataset.index, 10);
      if (page.sections[index]) {
        const duplicate = JSON.parse(JSON.stringify(page.sections[index]));
        page.sections.splice(index + 1, 0, duplicate);
        renderSectionsEditor(page, onChange, index + 1);
        onChange(page);
      }
    });
  });
  
  // 区块删除
  document.querySelectorAll('.section-editor [data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.closest('.section-editor').dataset.index, 10);
      if (confirm(`确定要删除区块 #${index + 1} 吗？`)) {
        page.sections.splice(index, 1);
        renderSectionsEditor(page, onChange);
        onChange(page);
      }
    });
  });
  
  // 文本编辑器工具栏
  document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.dataset.action;
      const textarea = this.closest('.form-group').querySelector('textarea');
      const index = parseInt(textarea.dataset.index, 10);
      
      applyTextFormatting(action, textarea);
      
      // 更新内容
      if (page.sections[index]) {
        page.sections[index].content = textarea.value;
        onChange(page);
      }
    });
  });
  
  // 文本内容输入
  document.querySelectorAll('.rich-text-editor').forEach(textarea => {
    textarea.addEventListener('input', function() {
      const index = parseInt(this.dataset.index, 10);
      const field = this.dataset.field;
      const charCount = this.closest('.form-group').querySelector('.char-count');
      
      if (charCount) {
        charCount.textContent = `字数: ${this.value.length}`;
      }
      
      if (page.sections[index]) {
        page.sections[index][field] = this.value;
        onChange(page);
      }
    });
  });
  
  // 普通字段输入
  document.querySelectorAll('.form-control:not(.rich-text-editor):not(.style-field)').forEach(input => {
    input.addEventListener('input', function() {
      const index = parseInt(this.dataset.index, 10);
      const field = this.dataset.field;
      
      if (page.sections[index]) {
        page.sections[index][field] = this.value;
        onChange(page);
      }
    });
  });
  
  // 复选框
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const index = parseInt(this.dataset.index, 10);
      const field = this.dataset.field;
      
      if (page.sections[index]) {
        page.sections[index][field] = this.checked;
        onChange(page);
      }
    });
  });
  
  // 样式字段
  document.querySelectorAll('.style-field').forEach(input => {
    input.addEventListener('input', function() {
      const index = parseInt(this.dataset.index, 10);
      const field = this.dataset.field;
      
      if (page.sections[index]) {
        if (!page.sections[index].style) {
          page.sections[index].style = {};
        }
        page.sections[index].style[field] = this.value;
        onChange(page);
      }
    });
  });
  
  // 颜色重置
  document.querySelectorAll('.color-reset').forEach(btn => {
    btn.addEventListener('click', function() {
      const field = this.dataset.field;
      const index = parseInt(this.closest('.color-picker-small').querySelector('input').dataset.index, 10);
      
      if (page.sections[index]?.style) {
        delete page.sections[index].style[field];
        onChange(page);
        renderSectionsEditor(page, onChange, index);
      }
    });
  });
  
  // 对齐按钮
  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const value = this.dataset.value;
      const index = parseInt(this.dataset.index, 10);
      
      // 更新按钮状态
      this.closest('.alignment-buttons').querySelectorAll('.align-btn').forEach(b => {
        b.classList.remove('active');
      });
      this.classList.add('active');
      
      // 更新样式
      if (page.sections[index]) {
        if (!page.sections[index].style) {
          page.sections[index].style = {};
        }
        page.sections[index].style.textAlign = value;
        onChange(page);
      }
    });
  });
  
  // 样式重置
  document.querySelectorAll('.style-reset').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index, 10);
      if (page.sections[index]) {
        page.sections[index].style = {};
        onChange(page);
        renderSectionsEditor(page, onChange, index);
      }
    });
  });
  
  // 添加区块按钮
  setupAddSectionButtons(page, onChange);
  
  // 区块排序按钮
  setupSortButtons(page, onChange, selectedIndex);
}

// 设置添加区块按钮
function setupAddSectionButtons(page, onChange) {
  // 添加文本区块
  document.getElementById('add-text-section')?.addEventListener('click', function() {
    const newSection = {
      type: 'text',
      content: '请输入文本内容...',
      style: {
        fontSize: '18px',
        lineHeight: '1.6',
        textAlign: 'left'
      }
    };
    page.sections.push(newSection);
    renderSectionsEditor(page, onChange, page.sections.length - 1);
    onChange(page);
  });
  
  // 添加图片区块
  document.getElementById('add-image-section')?.addEventListener('click', function() {
    const newSection = {
      type: 'image',
      src: '',
      alt: '',
      style: {
        maxWidth: '80%',
        margin: '20px auto',
        borderRadius: '8px'
      }
    };
    page.sections.push(newSection);
    renderSectionsEditor(page, onChange, page.sections.length - 1);
    onChange(page);
  });
  
  // 添加音频区块
  document.getElementById('add-audio-section')?.addEventListener('click', function() {
    const newSection = {
      type: 'audio',
      src: '',
      title: '',
      controls: true,
      autoplay: false,
      loop: false
    };
    page.sections.push(newSection);
    renderSectionsEditor(page, onChange, page.sections.length - 1);
    onChange(page);
  });
  
  // 添加视频区块
  document.getElementById('add-video-section')?.addEventListener('click', function() {
    const newSection = {
      type: 'video',
      src: '',
      title: '',
      width: '800',
      height: '450',
      controls: true,
      autoplay: false
    };
    page.sections.push(newSection);
    renderSectionsEditor(page, onChange, page.sections.length - 1);
    onChange(page);
  });
  
  // 添加引用区块
  document.getElementById('add-quote-section')?.addEventListener('click', function() {
    const newSection = {
      type: 'quote',
      content: '引用内容...',
      author: '',
      style: {
        fontStyle: 'italic',
        padding: '20px',
        borderLeft: '4px solid #4361ee',
        backgroundColor: '#f8f9fa'
      }
    };
    page.sections.push(newSection);
    renderSectionsEditor(page, onChange, page.sections.length - 1);
    onChange(page);
  });
}

// 设置排序按钮
function setupSortButtons(page, onChange, selectedIndex) {
  // 上移
  document.getElementById('move-up')?.addEventListener('click', function() {
    if (selectedIndex !== null && selectedIndex > 0) {
      const temp = page.sections[selectedIndex];
      page.sections[selectedIndex] = page.sections[selectedIndex - 1];
      page.sections[selectedIndex - 1] = temp;
      selectedIndex--;
      renderSectionsEditor(page, onChange, selectedIndex);
      onChange(page);
      updateSortButtons(selectedIndex, page.sections.length);
    }
  });
  
  // 下移
  document.getElementById('move-down')?.addEventListener('click', function() {
    if (selectedIndex !== null && selectedIndex < page.sections.length - 1) {
      const temp = page.sections[selectedIndex];
      page.sections[selectedIndex] = page.sections[selectedIndex + 1];
      page.sections[selectedIndex + 1] = temp;
      selectedIndex++;
      renderSectionsEditor(page, onChange, selectedIndex);
      onChange(page);
      updateSortButtons(selectedIndex, page.sections.length);
    }
  });
  
  // 复制区块
  document.getElementById('duplicate-section')?.addEventListener('click', function() {
    if (selectedIndex !== null && page.sections[selectedIndex]) {
      const duplicate = JSON.parse(JSON.stringify(page.sections[selectedIndex]));
      page.sections.splice(selectedIndex + 1, 0, duplicate);
      selectedIndex++;
      renderSectionsEditor(page, onChange, selectedIndex);
      onChange(page);
      updateSortButtons(selectedIndex, page.sections.length);
    }
  });
  
  // 清空所有
  document.getElementById('clear-all')?.addEventListener('click', function() {
    if (confirm('确定要清空所有区块吗？此操作不可撤销！')) {
      page.sections = [];
      renderSectionsEditor(page, onChange);
      onChange(page);
      selectedIndex = null;
      updateSortButtons(selectedIndex, 0);
    }
  });
}

// 更新排序按钮状态
function updateSortButtons(selectedIndex, totalSections) {
  const upBtn = document.getElementById('move-up');
  const downBtn = document.getElementById('move-down');
  const duplicateBtn = document.getElementById('duplicate-section');
  
  if (upBtn) upBtn.disabled = selectedIndex === null || selectedIndex === 0;
  if (downBtn) downBtn.disabled = selectedIndex === null || selectedIndex === totalSections - 1;
  if (duplicateBtn) duplicateBtn.disabled = selectedIndex === null;
}

// 设置数据操作
function setupDataOperations(page, onChange) {
  // 导出JSON
  document.getElementById('download-json')?.addEventListener('click', function() {
    const blob = new Blob([JSON.stringify(page, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.id || 'page'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('页面数据已导出为JSON文件', 'success');
  });
  
  // 复制JSON
  document.getElementById('copy-json')?.addEventListener('click', function() {
    const jsonStr = JSON.stringify(page, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      showToast('页面JSON已复制到剪贴板', 'success');
    }).catch(() => {
      alert('复制失败，请手动复制');
    });
  });
  
  // 保存模板
  document.getElementById('save-template')?.addEventListener('click', function() {
    const templateName = prompt('请输入模板名称:', `${page.title || '未命名'}模板`);
    if (templateName) {
      const templates = JSON.parse(localStorage.getItem('page-templates') || '{}');
      templates[templateName] = page;
      localStorage.setItem('page-templates', JSON.stringify(templates));
      showToast(`模板"${templateName}"已保存`, 'success');
    }
  });
  
  // 加载模板
  document.getElementById('load-template')?.addEventListener('click', function() {
    const templates = JSON.parse(localStorage.getItem('page-templates') || '{}');
    const templateNames = Object.keys(templates);
    
    if (templateNames.length === 0) {
      alert('暂无保存的模板');
      return;
    }
    
    const selectedTemplate = prompt(
      `选择模板:\n${templateNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}\n\n输入模板名称或编号:`
    );
    
    if (selectedTemplate) {
      let template;
      const index = parseInt(selectedTemplate) - 1;
      
      if (!isNaN(index) && index >= 0 && index < templateNames.length) {
        template = templates[templateNames[index]];
      } else {
        template = templates[selectedTemplate];
      }
      
      if (template) {
        if (confirm('加载模板将覆盖当前页面内容，是否继续？')) {
          // 保留页面ID和基本属性
          const { id, slug } = page;
          Object.assign(page, template);
          page.id = id;
          page.slug = slug || id;
          
          renderSectionsEditor(page, onChange, 0);
          onChange(page);
          showToast('模板加载成功', 'success');
        }
      } else {
        showToast('找不到指定的模板', 'error');
      }
    }
  });
  
  // 导入JSON
  document.getElementById('import-btn')?.addEventListener('click', function() {
    const jsonInput = document.getElementById('import-json').value;
    try {
      const importedData = JSON.parse(jsonInput);
      
      if (!importedData.sections || !Array.isArray(importedData.sections)) {
        throw new Error('导入的数据格式不正确');
      }
      
      if (confirm('导入数据将覆盖当前页面内容，是否继续？')) {
        // 保留页面ID和基本属性
        const { id, slug } = page;
        Object.assign(page, importedData);
        page.id = id;
        page.slug = slug || id;
        
        renderSectionsEditor(page, onChange, 0);
        onChange(page);
        document.getElementById('import-json').value = '';
        showToast('数据导入成功', 'success');
      }
    } catch (err) {
      showToast(`导入失败: ${err.message}`, 'error');
    }
  });
}

// 设置预览
function setupPreview(page) {
  const updatePreviewBtn = document.getElementById('update-preview');
  if (updatePreviewBtn) {
    updatePreviewBtn.addEventListener('click', updatePreview);
  }
  
  // 初始更新预览
  updatePreview();
}

function updatePreview() {
  const previewText = document.getElementById('preview-text');
  if (!previewText) return;
  
  // 获取页面样式
  const fontFamily = document.getElementById('page-font-family')?.value || 'inherit';
  const fontSize = document.getElementById('page-font-size')?.value || '16px';
  const color = document.getElementById('page-text-color')?.value || '#2d3748';
  const bgColor = document.getElementById('page-bg-color')?.value || '#ffffff';
  
  // 应用样式
  previewText.style.fontFamily = fontFamily;
  previewText.style.fontSize = fontSize;
  previewText.style.color = color;
  document.getElementById('style-preview').style.backgroundColor = bgColor;
  
  // 更新字号预览
  const fontSizePreview = document.getElementById('font-size-preview');
  if (fontSizePreview) {
    fontSizePreview.style.fontSize = fontSize;
  }
}

// 设置快捷键
function setupKeyboardShortcuts(page, onChange) {
  document.addEventListener('keydown', function(e) {
    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      showToast('页面已自动保存', 'info');
    }
    
    // Ctrl+B 粗体
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      const activeElement = document.activeElement;
      if (activeElement && activeElement.classList.contains('rich-text-editor')) {
        applyTextFormatting('bold', activeElement);
      }
    }
    
    // Ctrl+I 斜体
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      const activeElement = document.activeElement;
      if (activeElement && activeElement.classList.contains('rich-text-editor')) {
        applyTextFormatting('italic', activeElement);
      }
    }
    
    // Ctrl+U 下划线
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      const activeElement = document.activeElement;
      if (activeElement && activeElement.classList.contains('rich-text-editor')) {
        applyTextFormatting('underline', activeElement);
      }
    }
  });
}

// 初始化历史记录
function initHistory(page, onChange) {
  let history = [];
  let historyIndex = -1;
  
  // 保存状态到历史记录
  function saveState() {
    // 只保留最近50个状态
    if (history.length >= 50) {
      history.shift();
      if (historyIndex > 0) historyIndex--;
    }
    
    history = history.slice(0, historyIndex + 1);
    history.push(JSON.parse(JSON.stringify(page)));
    historyIndex++;
    
    console.log(`历史记录保存，当前索引: ${historyIndex}，总数: ${history.length}`);
  }
  
  // 撤销
  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      Object.assign(page, history[historyIndex]);
      onChange(page);
      renderSectionsEditor(page, onChange);
      showToast('已撤销上一步操作', 'info');
    }
  }
  
  // 重做
  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      Object.assign(page, history[historyIndex]);
      onChange(page);
      renderSectionsEditor(page, onChange);
      showToast('已重做上一步操作', 'info');
    }
  }
  
  // 初始保存
  saveState();
  
  // 监听变化，自动保存历史
  const originalOnChange = onChange;
  onChange = function(updatedPage) {
    originalOnChange(updatedPage);
    saveState();
  };
  
  // 添加撤销/重做快捷键
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    } else if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
      e.preventDefault();
      redo();
    }
  });
  
  return { undo, redo, onChange };
}

// 应用文本格式化
function applyTextFormatting(action, textarea) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  let formattedText = selectedText;
  
  switch (action) {
    case 'bold':
      formattedText = `<b>${selectedText}</b>`;
      break;
    case 'italic':
      formattedText = `<i>${selectedText}</i>`;
      break;
    case 'underline':
      formattedText = `<u>${selectedText}</u>`;
      break;
    case 'link':
      const url = prompt('请输入链接URL:', 'https://');
      if (url) {
        formattedText = `<a href="${url}" target="_blank">${selectedText || url}</a>`;
      } else {
        return; // 用户取消
      }
      break;
    case 'list':
      formattedText = `<ul>\n<li>${selectedText || '列表项'}</li>\n</ul>`;
      break;
    case 'clear':
      formattedText = selectedText
        .replace(/<[^>]*>/g, '') // 移除HTML标签
        .replace(/&[a-z]+;/g, ''); // 移除HTML实体
      break;
  }
  
  textarea.value = textarea.value.substring(0, start) + 
                   formattedText + 
                   textarea.value.substring(end);
  
  // 重新设置光标位置
  const newPosition = start + formattedText.length;
  textarea.setSelectionRange(newPosition, newPosition);
  textarea.focus();
}

// 辅助函数
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getSectionIcon(type) {
  const icons = {
    'text': 'fas fa-paragraph',
    'image': 'fas fa-image',
    'audio': 'fas fa-music',
    'video': 'fas fa-video',
    'quote': 'fas fa-quote-right',
    'code': 'fas fa-code'
  };
  return icons[type] || 'fas fa-cube';
}

function getSectionTypeName(type) {
  const names = {
    'text': '文本',
    'image': '图片',
    'audio': '音频',
    'video': '视频',
    'quote': '引用',
    'code': '代码'
  };
  return names[type] || type;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 
                       type === 'error' ? 'exclamation-circle' : 
                       type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// 添加编辑器样式
function addEditorStyles() {
  if (document.getElementById('advanced-editor-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'advanced-editor-styles';
  style.textContent = `
    /* 高级编辑器样式 */
    .style-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .color-picker-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .color-picker {
      width: 100%;
      height: 40px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .color-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .color-preset {
      width: 24px;
      height: 24px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .color-preset:hover {
      transform: scale(1.1);
    }
    
    .select-with-preview {
      position: relative;
    }
    
    .size-preview {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      color: #666;
    }
    
    .section-editor {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      margin-bottom: 16px;
      background: white;
      transition: border-color 0.3s;
    }
    
    .section-editor.selected {
      border-color: #4361ee;
      box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      cursor: pointer;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #4361ee;
      color: white;
      border-radius: 50%;
      font-size: 12px;
      font-weight: bold;
    }
    
    .section-badge {
      background: #e9ecef;
      color: #495057;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
    
    .color-badge {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .section-actions {
      display: flex;
      gap: 8px;
    }
    
    .section-action-btn {
      background: none;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #495057;
      transition: all 0.2s;
    }
    
    .section-action-btn:hover {
      background: #f8f9fa;
      border-color: #adb5bd;
    }
    
    .section-action-btn.danger {
      color: #dc3545;
      border-color: #f5c6cb;
    }
    
    .section-action-btn.danger:hover {
      background: #dc3545;
      color: white;
    }
    
    .section-body {
      padding: 20px;
    }
    
    .text-editor-toolbar {
      display: flex;
      gap: 4px;
      padding: 8px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-bottom: none;
      border-radius: 4px 4px 0 0;
    }
    
    .toolbar-btn {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #495057;
      transition: all 0.2s;
    }
    
    .toolbar-btn:hover {
      background: #4361ee;
      color: white;
      border-color: #4361ee;
    }
    
    .toolbar-separator {
      width: 1px;
      background: #dee2e6;
      margin: 0 4px;
    }
    
    .rich-text-editor {
      border-radius: 0 0 4px 4px !important;
    }
    
    .char-count {
      float: right;
      font-size: 12px;
      color: #6c757d;
    }
    
    .input-with-actions {
      display: flex;
      gap: 8px;
    }
    
    .input-with-actions .form-control {
      flex: 1;
    }
    
    .input-action-btn {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 0 12px;
      cursor: pointer;
      color: #495057;
      transition: all 0.2s;
    }
    
    .input-action-btn:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }
    
    .dimension-inputs {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .dimension-separator {
      color: #6c757d;
    }
    
    .image-preview {
      margin-top: 16px;
    }
    
    .preview-container {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 16px;
      background: #f8f9fa;
      text-align: center;
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .preview-container img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 4px;
    }
    
    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    
    .color-picker-small {
      display: flex;
      gap: 8px;
    }
    
    .color-picker-small input[type="color"] {
      flex: 1;
      height: 38px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .alignment-buttons {
      display: flex;
      gap: 4px;
    }
    
    .align-btn {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #495057;
      transition: all 0.2s;
    }
    
    .align-btn.active {
      background: #4361ee;
      color: white;
      border-color: #4361ee;
    }
    
    .align-btn:hover:not(.active) {
      background: #f8f9fa;
      border-color: #adb5bd;
    }
    
    .style-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }
    
    .style-reset, .style-copy, .style-paste {
      background: none;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      color: #495057;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    
    .style-reset:hover {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }
    
    .style-copy:hover {
      background: #17a2b8;
      color: white;
      border-color: #17a2b8;
    }
    
    .empty-sections {
      text-align: center;
      padding: 40px 20px;
      color: #6c757d;
    }
    
    .empty-sections i {
      margin-bottom: 16px;
      color: #adb5bd;
    }
    
    .empty-actions {
      margin-top: 24px;
    }
    
    .section-actions {
      margin: 24px 0;
    }
    
    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 12px;
    }
    
    .action-btn {
      flex: 1;
      min-width: 100px;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
    }
    
    .action-btn:hover {
      border-color: #4361ee;
      background: rgba(67, 97, 238, 0.05);
      transform: translateY(-2px);
    }
    
    .action-btn i {
      font-size: 24px;
      color: #4361ee;
    }
    
    .section-tools {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e9ecef;
    }
    
    .tool-btn {
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 16px;
      margin-right: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .tool-btn:hover:not(:disabled) {
      opacity: 0.9;
    }
    
    .tool-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .tool-btn.danger {
      background: #dc3545;
    }
    
    .data-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .data-btn {
      flex: 1;
      min-width: 120px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s;
    }
    
    .data-btn.primary {
      background: #4361ee;
    }
    
    .data-btn.success {
      background: #28a745;
    }
    
    .data-btn:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
    
    .import-area {
      margin: 24px 0;
    }
    
    .preview-box {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 24px;
      background: white;
      margin-top: 16px;
    }
    
    .preview-controls {
      margin-top: 16px;
      text-align: right;
    }
    
    .small-btn {
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .tips {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }
    
    .tips h4 {
      color: white;
    }
    
    .tip-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .tip-item {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    
    .tip-item i {
      font-size: 24px;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 4px;
    }
    
    .full-width {
      grid-column: 1 / -1;
    }
    
    .editor-hints {
      margin-top: 8px;
      color: #6c757d;
      font-size: 0.9rem;
    }
    
    /* Toast动画 */
    .toast {
      position: fixed;
      top: 30px;
      right: 30px;
      padding: 16px 24px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: toastIn 0.3s ease;
      max-width: 400px;
    }
    
    .toast-success {
      background: #28a745;
      color: white;
    }
    
    .toast-error {
      background: #dc3545;
      color: white;
    }
    
    .toast-warning {
      background: #ffc107;
      color: #212529;
    }
    
    .toast-info {
      background: #17a2b8;
      color: white;
    }
    
    @keyframes toastIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes toastOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    /* 响应式调整 */
    @media (max-width: 768px) {
      .style-grid {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .data-actions {
        flex-direction: column;
      }
      
      .tip-content {
        grid-template-columns: 1fr;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// 导出函数供外部使用
export { COLOR_PRESETS, FONT_PRESETS, FONT_SIZE_PRESETS };