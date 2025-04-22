const { initCDP } = require('./cdp.js');
const { startClient, isBrowserAlive } = require("./client");
const { getTargets, createNewTab } = require("./tabs");

async function autoFill(link, username, password) {
  // 启动浏览器前优先判断CDP是否可连接
  const alive = await isBrowserAlive();
  if (!alive) {
    await startClient({ useSingleUserDataDir: true });
  }
  // 打开新标签页
  const newTab = await createNewTab(link);
  // 等待页面加载（可根据实际情况优化等待方式）
  await new Promise(resolve => setTimeout(resolve, 1500));
  // 查找刚打开的标签页
  const targets = await getTargets();
  const target = targets.find(t => t.id === newTab.id);
  if (!target) {
    console.error('未找到目标页面');
    return;
  }

  // 注入自动填充脚本
  const { Runtime } = await initCDP(target.id, true);

  // 增强的自动填充逻辑
  const script = `
    (function() {
    // alert('开始自动填充');
      // 打开开发者工具控制台
      window.openDevTools();
      function getAllPasswordInputs() {
        let inputs = Array.from(document.querySelectorAll('input[type="password"]'));
        if (inputs.length > 0) return inputs;
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            const iframeInputs = Array.from(iframe.contentDocument.querySelectorAll('input[type="password"]'));
            inputs = inputs.concat(iframeInputs);
          } catch (e) { }
        });
        return inputs;
      }

      function doAutoFill(account) {
        const passwordInputs = getAllPasswordInputs();
        const passwordInput = passwordInputs.find(input => {
          const style = window.getComputedStyle(input);
          return style.display !== 'none' &&
                 style.visibility !== 'hidden' &&
                 style.opacity !== '0' &&
                 input.offsetWidth > 0 &&
                 input.offsetHeight > 0;
        });
        if (!passwordInput) return false;

        let usernameInput = null;
        let element = passwordInput;
        while (element && !usernameInput) {
          element = element.previousElementSibling || element.parentElement;
          if (element) {
            let input = null;
            if (
              element.tagName === 'INPUT' &&
              (
                element.type === 'text' ||
                element.type === 'email' ||
                !element.type ||
                element.getAttribute('name') === 'username' ||
                element.getAttribute('name') === 'account'
              )
            ) {
              input = element;
            } else {
              input = element.querySelector('input[type="text"], input[type="email"], input[name="username"], input[name="account"], input:not([type])');
            }
            if (input && input !== passwordInput.nextElementSibling) {
              const inputRect = input.getBoundingClientRect();
              const passwordRect = passwordInput.getBoundingClientRect();
              const inputStyle = window.getComputedStyle(input);
              const inputVisible =
                inputStyle.display !== 'none' &&
                inputStyle.visibility !== 'hidden' &&
                inputStyle.opacity !== '0' &&
                input.offsetWidth > 0 &&
                input.offsetHeight > 0;
              if (inputRect.top < passwordRect.top && inputVisible) {
                usernameInput = input;
                break;
              }
            }
          }
        }
        if (usernameInput) {
          usernameInput.value = account.usernameValue;
          usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (passwordInput) {
          passwordInput.value = account.passwordValue;
          passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return true;
      }

      const account = { usernameValue: ${JSON.stringify(username)}, passwordValue: ${JSON.stringify(password)} };
      doAutoFill(account);
    })();
  `;

  await Runtime.evaluate({ expression: script });
  process.exit(0);
}

// 示例调用
autoFill('https://mail.163.com/', 'your_username', 'your_password');