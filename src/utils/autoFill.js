export const autoFill = (state) => {
    const { usernameValue, passwordValue, linkValue } = state
    if (!linkValue) return

    // window.D1API.trackEvent({ message: '使用自动填充功能' })
    // 获取空闲浏览器实例
    const idleUBrowsers = window.utools.getIdleUBrowsers();
    const ubrowser = window.utools.ubrowser
    const browserConfig = ubrowser
        .goto(linkValue)
        .wait(1000) // 额外等待一小段时间，确保动态内容加载完成
        // // 先找到密码框
        .evaluate((account) => {
            // 尝试点击登录入口
            function tryClickLoginEntry() {
                const selectors = [
                    'a[href*="login"]', 'button', 'a', '[onclick*="login"]', '[class*="login"]', '[id*="login"]'
                ];
                // 增加常见登录按钮文本
                const loginTexts = ['登录', 'login', 'sign in', 'sign-in', 'signin', 'log in', 'log-in', 'logon', 'log on'];
                for (const selector of selectors) {
                    const elements = Array.from(document.querySelectorAll(selector));
                    for (const el of elements) {
                        const text = (el.innerText || el.value || '').toLowerCase().replace(/\s+/g, '');
                        if (loginTexts.some(keyword => text.includes(keyword.replace(/\s+/g, '')))) {
                            // 判断是否为多页面跳转
                            if (el.tagName === 'A' && el.href && el.href !== window.location.href) {
                                // 多页面跳转，返回跳转链接
                                return { type: 'multi', href: el.href };
                            } else {
                                // 单页面，直接点击
                                el.click();
                                return { type: 'single' };
                            }
                        }
                    }
                }
                return null;
            }

            // 检查是否有密码输入框
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

            // 自动填充逻辑
            function doAutoFill() {
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
                        const input = element.querySelector('input[type="text"], input[type="email"], input[name="username"], input[name="account"], input:not([type])')
                            || (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || !element.type));
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
                if (usernameInput) usernameInput.value = account.usernameValue;
                if (passwordInput) passwordInput.value = account.passwordValue;
                return true;
            }
            // 兼容单页面和多页面应用
            if (!doAutoFill()) {
                const result = tryClickLoginEntry()
                if (result) {
                    if (result.type === 'multi') {
                        return {
                            needGoto: true,
                            loginHref: result.href
                        }
                    }
                    // 同时监听 DOM 变化（单页面跳转）
                    const observer = new MutationObserver(() => {
                        if (doAutoFill()) {
                            observer.disconnect();
                            clearInterval(checkUrlChange);
                        }
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                }
            }
        }, {
            usernameValue,
            passwordValue
        })



    // 根据是否有空闲实例决定运行方式
    if (idleUBrowsers.length > 0) {
        browserConfig.run(idleUBrowsers[0].id, { show: true }).then(res => {
            const query = res[0]
            if (query && query.needGoto && query.loginHref) {
                // 再次 goto 登录页并 evaluate 自动填充
                gotoAndAutoFillLoginPage(ubrowser, query.loginHref, usernameValue, passwordValue)
            }
        })
    } else {
        browserConfig.run({ width: 1200, height: 800, }, { show: true }).then(res => {
            const query = res[0]
            if (query && query.needGoto && query.loginHref) {
                // 再次 goto 登录页并 evaluate 自动填充
                gotoAndAutoFillLoginPage(ubrowser, query.loginHref, usernameValue, passwordValue)
            }
        })
    }
}

// 跳转到登录页并自动填充
function gotoAndAutoFillLoginPage(ubrowser, loginHref, usernameValue, passwordValue) {
    const idleUBrowsers = window.utools.getIdleUBrowsers();
    const browserConfig = ubrowser
        .goto(loginHref)
        .devTools()
        .wait(1000)
        .evaluate((account) => {
            // 这里可以复用 doAutoFill 逻辑
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
            function doAutoFill() {
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
                        let input = null
                        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || !element.type ||
                            element.getAttribute('name') === 'username' ||
                            element.getAttribute('name') === 'account')) {
                            input = element
                        } else {
                            input = element.querySelector('input[type="text"], input[type="email"], input[name="username"], input[name="account"], input:not([type])')
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
                if (usernameInput) usernameInput.value = account.usernameValue;
                if (passwordInput) passwordInput.value = account.passwordValue;
                return true;
            }
            doAutoFill();
        }, {
            usernameValue,
            passwordValue
        })

    if (idleUBrowsers.length > 0) {
        browserConfig.run(idleUBrowsers[0].id)
    } else {
        browserConfig.run({ width: 1200, height: 800, show: true })
    }
}