// 简单页面编辑器
export function renderPageEditor(pageData, onSave) {
  const container = document.getElementById('editor-container');
  if (!container) {
    console.error('找不到编辑器容器');
    return;
  }
  
  container.innerHTML = \`
    <div style="padding: 20px; background: white; border-radius: 8px; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
        页面编辑器 - \${pageData.title || '未命名页面'}
      </h2>
      
      <div style="margin: 20px 0;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">
          页面标题
        </label>
        <input type="text" id="editor-title" 
               value="\${pageData.title || ''}"
               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
      </div>
      
      <div style="margin: 20px 0;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">
          页面内容
        </label>
        <textarea id="editor-content" rows="12"
                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: inherit;">
\${pageData.content || pageData.text || ''}</textarea>
      </div>
      
      <div style="display: flex; gap: 10px; margin-top: 30px; justify-content: flex-end;">
        <button id="editor-save" 
                style="padding: 10px 30px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
          保存更改
        </button>
        <button id="editor-cancel"
                style="padding: 10px 30px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
          取消
        </button>
      </div>
    </div>
  \`;
  
  // 添加事件监听
  document.getElementById('editor-save').addEventListener('click', () => {
    const updatedPage = {
      ...pageData,
      title: document.getElementById('editor-title').value,
      content: document.getElementById('editor-content').value
    };
    
    if (typeof onSave === 'function') {
      onSave(updatedPage);
    }
    
    // 关闭编辑器
    if (window.churchPlayer) {
      window.churchPlayer.closeEditor();
    }
  });
  
  document.getElementById('editor-cancel').addEventListener('click', () => {
    if (window.churchPlayer) {
      window.churchPlayer.closeEditor();
    }
  });
}

export default { renderPageEditor };
