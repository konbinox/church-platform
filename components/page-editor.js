// 基础页面编辑器
export function renderPageEditor(pageData, onSave) {
  console.log('渲染页面编辑器，数据:', pageData);
  
  const container = document.getElementById('editor-container');
  if (!container) {
    console.error('找不到 editor-container');
    return;
  }
  
  // 创建编辑器界面
  container.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #333; margin-bottom: 20px;">页面编辑器</h2>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">页面标题</label>
        <input type="text" id="editor-title" value="${pageData.title || ''}" 
               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">页面内容</label>
        <textarea id="editor-content" rows="10" 
                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">${pageData.content || ''}</textarea>
      </div>
      
      <div style="display: flex; gap: 10px; margin-top: 30px;">
        <button id="editor-save" style="padding: 10px 30px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
          保存
        </button>
        <button id="editor-cancel" style="padding: 10px 30px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
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
      content: document.getElementById('editor-content').value,
      type: 'text'
    };
    
    console.log('保存页面:', updatedPage);
    if (typeof onSave === 'function') {
      onSave(updatedPage);
    }
  });
  
  document.getElementById('editor-cancel').addEventListener('click', () => {
    if (window.churchPlayer) {
      window.churchPlayer.closeEditor();
    }
  });
}

export default { renderPageEditor };
