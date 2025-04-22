const { initCDP } = require('./cdp.js');
const { startClient, isBrowserAlive } = require("./client");
const { getTargets, createNewTab } = require("./tabs");

const gotoAndAutoFillLoginPage = async (target, loginHref, username, password) => {
    // 注入自动填充脚本
    const { Runtime, Page } = await initCDP(target.id);
    await Page.navigate({ url: loginHref });
    await new Promise(resolve => setTimeout(resolve, 1500))
    const script = `
        (function() {
         function getAllPasswordInputs() {
                    let inputs = Array.from(document.querySelectorAll('input[type="password"]'));
                    console.log(inputs)
                     console.log(document)
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
                            input.offsetHeight > 0
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
                        //触发input事件
                        usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if (passwordInput) {
                        passwordInput.value = account.passwordValue;
                        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    return true;
                }
                  const account = {
                    usernameValue: '${username}',
                    passwordValue: '${password}'
                }
                doAutoFill(account);  
        })()`
    Runtime.evaluate({ expression: script });
    // process.exit(0);
}

async function autoFill(link, username, password) {
    // 启动浏览器前优先判断CDP是否可连接
    const alive = await isBrowserAlive();
    if (!alive) {
        await startClient({ useSingleUserDataDir: true, isOpenDevtools: false });
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
    const { Runtime } = await initCDP(target.id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // 增强的自动填充逻辑
    const script = `
    (function() {
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
                        input.offsetHeight > 0
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
                    //触发input事件
                    usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (passwordInput) {
                    passwordInput.value = account.passwordValue;
                    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                return true;
            }
            function tryClickLoginEntry() {
                const selectors = [
                    'a[href*="login"]', 'button', 'a', '[onclick*="login"]', '[class*="login"]', '[id*="login"]'
                ];
                const loginTexts = ['登录', 'login', 'sign in', 'sign-in', 'signin', 'log in', 'log-in', 'logon', 'log on'];
                for (const selector of selectors) {
                    const elements = Array.from(document.querySelectorAll(selector));
                    for (const el of elements) {
                        const text = (el.innerText || el.value || '').toLowerCase().replace(/\s+/g, '');
                        if (loginTexts.some(keyword => text.includes(keyword.replace(/\s+/g, '')))) {
                            if (el.tagName === 'A' && el.href && el.href !== window.location.href) {
                                return { type: 'multi', href: el.href };
                            } else {
                                el.click();
                                return { type: 'single' };
                            }
                        }
                    }
                }
                return null;
            }
            const account = {
                usernameValue: '${username}',
                passwordValue: '${password}'
            }
            if (!doAutoFill(account)) {
                const result = tryClickLoginEntry()
                if (result) {
                    if (result.type === 'multi') {
                    console.log(result.href)
                        return {
                            needGoto: true,
                            loginHref: result.href
                        }
                    }
                    const observer = new MutationObserver(() => {
                        if (doAutoFill(account)) {
                            observer.disconnect();
                        }
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                }
            }
    })();
  `;

    const evaluateResult = await Runtime.evaluate({ expression: script, returnByValue: true });
    if (evaluateResult && evaluateResult.result && evaluateResult.result.value) {
        const query = evaluateResult.result.value
        if (query && query.needGoto && query.loginHref) {
           
            gotoAndAutoFillLoginPage(target, query.loginHref, username, password)
        }
        return
    }
}

module.exports = {
    autoFill
}
