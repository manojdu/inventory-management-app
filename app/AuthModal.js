'use client'

import { useState } from 'react'
import { Box, Typography, Button, Modal, TextField, Stack, Snackbar, Alert } from '@mui/material'
import { styled } from '@mui/system'
import { signUp, signIn, signInWithGoogle } from './auth'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#f5f5f5',
  borderRadius: '10px',
  boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)',
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 3,
}

const titleStyle = {
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  color: '#3f51b5',
  marginBottom: '1rem',
}

const CustomButton = styled(Button)({
  backgroundColor: '#3f51b5',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#303f9f',
  },
})

export default function AuthModal({ open, onClose, setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('warning') // added severity state

  const handleSignUp = async () => {
    if (!email) {
      setSnackbarMessage('Please enter an email address')
      setSnackbarOpen(true)
      return
    }

    try {
      const user = await signUp(email, password)
      setUser(user)
      onClose()
    } catch (error) {
      console.error('Sign-up error:', error)
      setSnackbarMessage('Sign-up failed: ' + error.message)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleSignIn = async () => {
    if (!email) {
      setSnackbarMessage('Please enter an email address')
      setSnackbarOpen(true)
      return
    }

    try {
      const user = await signIn(email, password)
      setUser(user)
      onClose()
    } catch (error) {
      console.error('Sign-in error:', error)
      if (error.code === 'auth/invalid-credential') {
        setSnackbarMessage('Invalid credentials. Please try again.')
      } else {
        setSnackbarMessage('Sign-in failed: ' + error.message)
      }
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleSignInWithGoogle = async () => {
    try {
      const user = await signInWithGoogle()
      setUser(user)
      onClose()
    } catch (error) {
      console.error('Google sign-in error:', error)
      setSnackbarMessage('Google sign-in failed: ' + error.message)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description"
      >
        <Box sx={style}>
          {/* Replace with your image or logo component */}
          <Box
            component="img"
            src="/pantrylogo.jpeg"
            alt="pantry logo"
            sx={{ width: '100px', marginBottom: '1rem' }}
          />
          <Typography id="auth-modal-title" variant="h5" sx={titleStyle}>
            Welcome! Please Sign In
          </Typography>
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="password"
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Stack direction={'row'} spacing={2} width="100%">
            <CustomButton
              variant="contained"
              fullWidth
              onClick={handleSignUp}
            >
              Sign Up
            </CustomButton>
            <CustomButton
              variant="contained"
              fullWidth
              onClick={handleSignIn}
            >
              Sign In
            </CustomButton>
          </Stack>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleSignInWithGoogle}
            sx={{
              borderColor: '#3f51b5',
              color: '#3f51b5',
              marginTop: '1rem',
            }}
          >
            Sign In with Google
          </Button>
        </Box>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
