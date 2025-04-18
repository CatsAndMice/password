export const autoFill = (state) => {
    const { usernameValue, passwordValue, linkValue } = state
    if (!linkValue) return

    // window.D1API.trackEvent({ message: '使用自动填充功能' })

    const ubrowser = window.utools.ubrowser
    ubrowser
        .goto(linkValue)
        .wait(1000) // 额外等待一小段时间，确保动态内容加载完成
        .devTools()
        // // 先找到密码框
        .evaluate((account) => {
            // 获取所有密码输入框，包括 iframe 中的
            const getAllPasswordInputs = () => {
                let inputs = Array.from(document.querySelectorAll('input[type="password"]'));
                // 如果主文档中找到了密码框，就直接返回
                if (inputs.length > 0) {
                    return inputs;
                }
                // 检查所有 iframe
                const iframes = document.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    try {
                        const iframeInputs = Array.from(iframe.contentDocument.querySelectorAll('input[type="password"]'));
                        inputs = inputs.concat(iframeInputs);
                    } catch (e) {
                        // 跨域 iframe 会报错，忽略
                        console.log('iframe access error:', e);
                    }
                });

                return inputs;
            };

            const passwordInputs = getAllPasswordInputs();
            console.log('所有密码框：', passwordInputs);
            const passwordInput = passwordInputs.find(input => {
                const style = window.getComputedStyle(input);
                return style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    style.opacity !== '0' &&
                    input.offsetWidth > 0 &&
                    input.offsetHeight > 0
            });
    
            if (!passwordInput) return null;

            // 从密码框向上查找用户名输入框
            let usernameInput = null;
            let element = passwordInput;
            while (element && !usernameInput) {
                element = element.previousElementSibling || element.parentElement;
                if (element) {
                    const input = element.querySelector('input[type="text"], input[type="email"], input[name="username"], input[name="account"], input:not([type])')
                        || (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || !element.type));
                    if (input) {
                        usernameInput = input;
                        break; // 找到用户名输入框后立即结束循环
                    }
                }
            }
            // 填充密码和用户名
            if (usernameInput) {
                usernameInput.value = account.usernameValue;
            }

            if (passwordInput) {
                passwordInput.value = account.passwordValue;
            }
        }, {
            usernameValue,
            passwordValue
        })
        .run({ width: 1200, height: 800 })
}