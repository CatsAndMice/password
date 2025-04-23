
// 跳转到登录页并自动填充
function gotoAndAutoFillLoginPage(ubrowser, loginHref, usernameValue, passwordValue) {
    const idleUBrowsers = window.utools.getIdleUBrowsers();
    const browserConfig = ubrowser
        .goto(loginHref)
        // .devTools()
        .wait(1000)
        .evaluate((account) => {
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
            doAutoFill(account);
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

const utoolsAutoFill = (state) => {
    const { usernameValue, passwordValue, linkValue } = state
    if (!linkValue) return
    const idleUBrowsers = window.utools.getIdleUBrowsers();
    const ubrowser = window.utools.ubrowser
    const browserConfig = ubrowser
        .goto(linkValue)
        // .devTools()
        .wait(1000)
        .evaluate((account) => {
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

            if (!doAutoFill(account)) {
                const result = tryClickLoginEntry()
                if (result) {
                    if (result.type === 'multi') {
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
        }, {
            usernameValue,
            passwordValue
        })

    const runAndHandle = (runArg) => {
        browserConfig.run(runArg).then(res => {
            console.log(res);

            const query = res[0]
            if (query && query.needGoto && query.loginHref) {
                gotoAndAutoFillLoginPage(ubrowser, query.loginHref, usernameValue, passwordValue)
            }
        })
    }

    if (idleUBrowsers.length > 0) {
        runAndHandle(idleUBrowsers[0].id)
    } else {
        runAndHandle({ width: 1200, height: 800, show: true })
    }
}
export const autoFill = async (state) => {
    const { usernameValue, passwordValue, linkValue } = state
    if (!linkValue) return
    window.utools.hideMainWindow(false)
    //使用Promise链，确保错误处理
    window.services.browserAutoFill(linkValue, usernameValue, passwordValue)
        .then(res => {
            console.log('自动填充成功:', res)
        })
        .catch(err => {
            console.log('browserAutoFill出错:', err)
            // 出错时使用备用方案
            utoolsAutoFill(state)
        })
}


