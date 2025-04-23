const { initCDP } = require('./cdp.js');
const { startClient, isBrowserAlive } = require("./client");
const { getTargets, createNewTab } = require("./tabs");

const gotoAndAutoFillLoginPage = async (target, loginHref, username, password) => {
    if (!target || !loginHref) {
        console.error('无效的目标页面或登录链接');
        return;
    }

    try {
        // 注入自动填充脚本
        const { Runtime, Page } = await initCDP(target.id);

        // 添加导航
        const navigatePromise = Page.navigate({ url: loginHref });
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('页面导航超时')), 15000)
        );

        try {
            await Promise.race([navigatePromise, timeoutPromise]);
        } catch (error) {
            console.error('导航到登录页面失败:', error);
            return;
        }

        // 等待页面加载完成
        await Page.loadEventFired().catch(err => console.error('等待页面加载事件失败:', err));

        // 添加额外等待时间，确保页面元素已加载
        await new Promise(resolve => setTimeout(resolve, 1500));

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
                      const account = {
                        usernameValue: '${username}',
                        passwordValue: '${password}'
                    }
                    doAutoFill(account);  
            })()`;
        await Runtime.evaluate({ expression: script }).catch(err => {
            console.error('执行自动填充脚本失败:', err);
        });
    } catch (error) {
        console.error('自动填充登录页面失败:', error);
    }
};

async function autoFill(link, username, password) {
    if (!link) {
        console.error('未提供有效的链接');
        return;
    }

    try {
        // 启动浏览器前优先判断CDP是否可连接
        const alive = await isBrowserAlive();
        if (!alive) {
            try {
                await startClient({
                    useSingleUserDataDir: true,
                    isOpenDevtools: false,
                    startTimeout: 30000 // 增加启动超时时间
                });
            } catch (startError) {
                console.error('浏览器启动失败:', startError);
                return Promise.reject(startError); // 确保启动失败时抛出错误
            }
        }

        // 打开新标签页
        const newTab = await createNewTab(link);
        if (!newTab || !newTab.id) {
            throw new Error('创建新标签页失败');
        }

        // 等待页面加载（使用更可靠的等待方式）
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 查找刚打开的标签页
        const targets = await getTargets();
        const target = targets.find(t => t.id === newTab.id);
        if (!target) {
            throw new Error('未找到目标页面');
        }

        // 注入自动填充脚本
        const { Runtime } = await initCDP(target.id);

        // 确保页面已完全加载
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

        // 添加超时控制
        const evaluatePromise = Runtime.evaluate({ expression: script, returnByValue: true });
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('执行脚本超时')), 10000)
        );

        const evaluateResult = await Promise.race([evaluatePromise, timeoutPromise]);

        if (evaluateResult && evaluateResult.result && evaluateResult.result.value) {
            const query = evaluateResult.result.value;
            if (query && query.needGoto && query.loginHref) {
                await gotoAndAutoFillLoginPage(target, query.loginHref, username, password);
            }
        }

        return true;
    } catch (error) {
        console.error('自动填充失败:', error);
        return false;
    }
}

module.exports = {
    autoFill
}
