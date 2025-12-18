// 简单页面编辑器
export function renderPageEditor(pageData, onSave) {
  console.log('渲染编辑器，页面数据:', pageData);
  
  const container = document.getElementById('editor-component');
  if (!container) {
    console.error('找不到编辑器容器');
    return;
  }
  
  // 创建编辑器界面
  container.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #2c3e50; margin-bottom: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        页面编辑器
      </h2>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">
          页面标题
        </label>
        <input type="text" id="editor-title" value="${pageData.title || ''}" 
               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">
          页面内容
        </label>
        <textarea id="editor-content" rows="12"
                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: inherit;">${pageData.content || pageData.text || ''}</textarea>
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
  `;
  
  // 添加事件监听
  document.getElementById('editor-save').addEventListener('click', () => {
    const updatedPage = {
      ...pageData,
      title: document.getElementById('editor-title').value,
      content: document.getElementById('editor-content').value
    };
    
    console.log('保存页面:', updatedPage);
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
