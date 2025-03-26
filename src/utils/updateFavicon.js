import { getFavicon } from "./getFavicon"
export const updateFavicon = async (value, doc, decryptAccountDic, onUpdate, requestId, isRequestValid) => {
    if (value) {
        const docId = doc._id
        try {
            const favicon = await getFavicon(value)
            
            // 检查请求是否仍然有效
            if (!isRequestValid()) {
                return
            }
            
            if (favicon && decryptAccountDic[docId]) {
                doc.favicon = favicon
                if (!decryptAccountDic[docId].account) {
                    decryptAccountDic[docId].account = {}
                }
                decryptAccountDic[docId].account.favicon = favicon
                onUpdate(doc)
            }
        } catch (e) {
            if (!isRequestValid()) {
                return
            }
            
            if (doc.favicon || (decryptAccountDic[docId]?.account?.favicon)) {
                delete doc.favicon
                if (decryptAccountDic[docId].account) {
                    delete decryptAccountDic[docId].account.favicon
                }
                onUpdate(doc)
            }
        }
    } else {
        delete doc.favicon
        delete decryptAccountDic[doc._id].account.favicon
        onUpdate(doc)
    }
}
