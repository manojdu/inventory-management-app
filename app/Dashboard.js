import React, { useState } from 'react'
import { Box, Typography, TextField, Button, Stack, Avatar, Divider } from '@mui/material'
import { deepPurple } from '@mui/material/colors'

const Dashboard = ({ user, handleLogout }) => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleChangePassword = () => {
    if (newPassword === confirmPassword) {
      // Implement password logic here
      console.log('Password changed successfully')
    } else {
      console.log('Passwords do not match')
    }
  }

  if (!user) {
    return null // or a loading spinner, or a message indicating the user is not logged in
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '600px',
        padding: 4,
        bgcolor: '#ffffff',
        borderRadius: 2,
        boxShadow: 3,
        marginBottom: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Avatar
        sx={{
          bgcolor: deepPurple[500],
          width: 80,
          height: 80,
          marginBottom: 2,
        }}
      >
        {user.name.charAt(0)}
      </Avatar>
      <Typography
        variant="h4"
        sx={{
          color: '#333',
          textAlign: 'center',
          marginBottom: 2,
        }}
      >
        User Profile
      </Typography>
      <Divider sx={{ width: '100%', marginBottom: 2 }} />
      <Stack spacing={2} width="100%">
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          value={user.name}
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={user.email}
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          label="New Password"
          variant="outlined"
          fullWidth
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          label="Confirm Password"
          variant="outlined"
          fullWidth
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          onClick={handleChangePassword}
        >
          Change Password
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{ marginTop: 2 }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Stack>
    </Box>
  )
}

export default Dashboard