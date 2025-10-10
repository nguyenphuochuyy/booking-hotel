// tạo component hiển thị thông báo
import React from 'react'
import { message } from 'antd'
const MessageNotification = (type, message) => {
    const [messageApi, contextHolder] = message.useMessage()
    messageApi.info({
        type,
        content: message
    })
    return (
        <>
            {contextHolder}
        </>
    )
}
export default MessageNotification