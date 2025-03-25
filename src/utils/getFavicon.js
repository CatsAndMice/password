
// 添加超时控制的 fetch
const fetchWithTimeout = async (url, timeout = 3000) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
        const response = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)
        return response
    } catch (e) {
        clearTimeout(timeoutId)
        throw e
    }
}

// 从HTML中提取favicon链接
const extractFaviconFromHtml = async (url) => {
    try {
        const response = await fetchWithTimeout(url, 3000) // 使用 5 秒超时
        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        
        // 按优先级查找favicon
        const selectors = [
            'link[rel="icon"]',
            'link[rel="shortcut icon"]',
            'link[rel="apple-touch-icon"]',
            'link[rel="apple-touch-icon-precomposed"]'
        ]
        
        for (const selector of selectors) {
            const link = doc.querySelector(selector)
            if (link) {
                const href = link.getAttribute('href')
                if (href) {
                    // 处理相对路径
                    return new URL(href, url).href
                }
            }
        }
        return null
    } catch (e) {
        return null
    }
}

// 获取 favicon 的多个来源
const getFaviconSources = (urlObj) => [
    `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`,
    `${urlObj.protocol}//${urlObj.hostname}/favicon.png`,
]

export const getFavicon = async (url) => {
    try {
        const urlObj = new URL(url)
        
        // 首先尝试从HTML中获取
        const faviconFromHtml = await extractFaviconFromHtml(url)
        if (faviconFromHtml) {
            console.log(faviconFromHtml);
            
            return faviconFromHtml
        }
        
        // 如果HTML中没有找到，使用默认位置
        const sources = getFaviconSources(urlObj)
        return sources[0] // 直接返回第一个默认源
        
    } catch (e) {
        throw e
    }
}