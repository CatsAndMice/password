import React from 'react'
import AccountForm from '../AccountForm'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Typography from '@mui/material/Typography'

const FavoriteAccounts = ({
  keyIV,
  decryptAccountDic,
  data,
  onUpdate
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const handleSelect = (index) => {
    if (index === selectedIndex) return
    setSelectedIndex(index)
  }

  return (
    <div className="search-body">
      {data?.length > 0 ? (
        <>
          <div className="search-list !p-0">
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                height: 'calc(100vh - 48px)',
                '& .MuiTableCell-stickyHeader': {
                  top: '0 !important'
                },
                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '3px',
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.3)'
                  }
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent'
                }
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        width: '35%',
                        backgroundColor: '#fff !important',
                        borderBottom: '1px solid rgba(224, 224, 224, 1) !important'
                      }}
                    >标题</TableCell>
                    <TableCell
                      sx={{
                        width: '35%',
                        backgroundColor: '#fff !important',
                        borderBottom: '1px solid rgba(224, 224, 224, 1) !important'
                      }}
                    >用户名</TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        width: '20%',
                        backgroundColor: '#fff !important',
                        borderBottom: '1px solid rgba(224, 224, 224, 1) !important'
                      }}
                    >使用次数</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.map((item, index) => (
                    <TableRow
                      key={item._id}
                      hover
                      onClick={() => handleSelect(index)}
                      selected={selectedIndex === index}
                      className={`search-table-row ${selectedIndex === index ? 'search-selected' : ''}`}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell id={`${item._id}_title`}>{decryptAccountDic[item._id]?.title}</TableCell>
                      <TableCell id={`${item._id}_username`}>{decryptAccountDic[item._id]?.username}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {item.clickCount >= 1000
                          ? `${(item.clickCount / 1000).toFixed(1)}k`
                          : item.clickCount || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box
                sx={{
                  padding: '8px 0',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(0, 0, 0, 0.45)',
                    fontSize: '12px',
                    userSelect: 'none'
                  }}
                >
                  仅展示使用频率最高的 20 个账号
                </Typography>
              </Box>
            </TableContainer>
          </div>
          <div className="search-form">
            <AccountForm
              keyIV={keyIV}
              data={data[selectedIndex]}
              onUpdate={onUpdate}
              decryptAccountDic={decryptAccountDic}
            />
          </div>
        </>
      ) : (
        <Box
          className="flex-grow"
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0, 0, 0, 0.38)',
            backgroundColor: '#fff'
          }}
        >
          <StarBorderIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="body1" sx={{ opacity: 0.75 }}>
            暂无常用账号
          </Typography>
        </Box>
      )}
    </div>
  )
}

export default FavoriteAccounts