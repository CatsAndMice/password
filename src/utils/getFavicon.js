// 检查图片是否可访问
const checkImageAvailable = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' })
        return response.ok
    } catch (e) {
        return false
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
        const sources = getFaviconSources(urlObj)

        // 依次尝试不同来源
        for (const source of sources) {
            if (await checkImageAvailable(source)) {
                return source
            }
        }
        // URL 有效但没有找到 favicon
        throw new Error('No favicon found')
    } catch (e) {
        // URL 无效或没有找到 favicon
        throw e
    }
}