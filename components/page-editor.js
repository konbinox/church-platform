// 极简页面编辑器
export function renderPageEditor(pageData, onSave) {
  const container = document.getElementById('editor-component');
  if (!container) return;
  
  container.innerHTML = \`
    <div style="padding: 20px;">
      <h3 style="color: #2c3e50; margin-bottom: 20px;">编辑页面</h3>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">标题</label>
        <input type="text" id="edit-title" value="\${pageData.title || ''}" 
               style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">内容</label>
        <textarea id="edit-content" rows="10"
                  style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">\${pageData.content || pageData.text || ''}</textarea>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="saveEdit()" style="padding: 8px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
          保存
        </button>
        <button onclick="window.closeEditor()" style="padding: 8px 20px; background: #ccc; color: #333; border: none; border-radius: 4px; cursor: pointer;">
          取消
        </button>
      </div>
    </div>
  \`;
  
  // 全局保存函数
  window.saveEdit = function() {
    const updatedPage = {
      ...pageData,
      title: document.getElementById('edit-title').value,
      content: document.getElementById('edit-content').value
    };
    
    if (typeof onSave === 'function') {
      onSave(updatedPage);
    }
    window.churchPlayer?.closeEditor();
  };
}

export default { renderPageEditor };
