import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

/**
 * 导入账号预览表格组件
 * 展示待导入账号的序号、标题、用户名、密码、链接、说明
 */
const ImportPreviewTable = ({ accounts }) => (
  <TableContainer component={Paper}>
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 16px' }}>序号</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 16px' }}>标题</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 16px' }}>用户名</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 16px' }}>密码</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 16px' }}>链接</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 16px' }}>说明</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {accounts.map((account, index) => (
          <TableRow key={index}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{account.title}</TableCell>
            <TableCell>{account.username}</TableCell>
            <TableCell>{account.password}</TableCell>
            <TableCell>{account.link}</TableCell>
            <TableCell>{account.remark}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

export default ImportPreviewTable