// 绝对可靠的编辑器 - 无任何复杂语法
export function renderPageEditor(pageData, onSave) {
  try {
    console.log("开始渲染编辑器");
    
    const container = document.getElementById("editor-component");
    if (!container) {
      console.error("找不到编辑器容器");
      return;
    }
    
    // 构建HTML - 使用最安全的字符串拼接
    var html = "";
    html += '<div style="padding: 30px; color: white;">';
    html += '<h2 style="color: #3498db; margin-bottom: 25px; text-align: center;">编辑页面</h2>';
    
    html += '<div style="margin-bottom: 20px;">';
    html += '<div style="margin-bottom: 8px; font-weight: bold; color: #ddd;">页面标题</div>';
    html += '<input type="text" id="editTitle" value="' + (pageData.title || "") + '" ';
    html += 'style="width: 100%; padding: 12px; background: rgba(255,255,255,0.1); ';
    html += 'color: white; border: 1px solid #666; border-radius: 6px; font-size: 16px;">';
    html += '</div>';
    
    html += '<div style="margin-bottom: 25px;">';
    html += '<div style="margin-bottom: 8px; font-weight: bold; color: #ddd;">页面内容</div>';
    html += '<textarea id="editContent" rows="15" ';
    html += 'style="width: 100%; padding: 12px; background: rgba(255,255,255,0.1); ';
    html += 'color: white; border: 1px solid #666; border-radius: 6px; font-size: 16px; ';
    html += 'font-family: inherit; resize: vertical;">';
    html += (pageData.content || pageData.text || "") + '</textarea>';
    html += '</div>';
    
    html += '<div style="display: flex; gap: 15px; justify-content: center;">';
    html += '<button onclick="savePageEdit()" ';
    html += 'style="padding: 12px 35px; background: #27ae60; color: white; ';
    html += 'border: none; border-radius: 6px; cursor: pointer; font-size: 16px; ';
    html += 'font-weight: bold;">保存更改</button>';
    html += '<button onclick="cancelPageEdit()" ';
    html += 'style="padding: 12px 35px; background: #e74c3c; color: white; ';
    html += 'border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">取消</button>';
    html += '</div>';
    html += '</div>';
    
    container.innerHTML = html;
    
    // 设置全局函数供按钮调用
    window.savePageEdit = function() {
      var title = document.getElementById("editTitle").value;
      var content = document.getElementById("editContent").value;
      
      var updatedPage = {};
      for (var key in pageData) {
        updatedPage[key] = pageData[key];
      }
      updatedPage.title = title;
      updatedPage.content = content;
      
      console.log("保存页面:", updatedPage);
      
      if (typeof onSave === "function") {
        onSave(updatedPage);
      }
      
      if (window.churchPlayer) {
        window.churchPlayer.closeEditor();
      }
    };
    
    window.cancelPageEdit = function() {
      if (window.churchPlayer) {
        window.churchPlayer.closeEditor();
      }
    };
    
    console.log("编辑器渲染完成");
  } catch (error) {
    console.error("编辑器渲染错误:", error);
    var container = document.getElementById("editor-component");
    if (container) {
      container.innerHTML = '<div style="padding: 30px; text-align: center; color: white;">' +
                           '<h3 style="color: #e74c3c;">编辑器错误</h3>' +
                           '<p>' + error.message + '</p>' +
                           '<button onclick="window.churchPlayer.closeEditor()" ' +
                           'style="padding: 10px 20px; margin-top: 20px;">关闭</button></div>';
    }
  }
}

export default { renderPageEditor };
