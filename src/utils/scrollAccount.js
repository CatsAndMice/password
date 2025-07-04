const ACCOUNT_ITEM_HEIGHT = 65 //每个帐号的高度
export const scrollAccount = (isNumber,index) => {
    setTimeout(() => {
        const listBody = document.querySelector('.account-list-body')
        if (listBody) {
            // 根据是否有索引值决定滚动位置
            if (isNumber) {
                listBody.scrollTop = ACCOUNT_ITEM_HEIGHT * index
            } else {
                listBody.scrollTop = listBody.scrollHeight
            }
        }
        const titleInput = document.querySelector('#accountFormTitle')
        if (titleInput) titleInput.focus()
    }, 50)
}