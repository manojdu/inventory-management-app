'use client'

import { useState, useEffect } from 'react'
import {
  Box, Grid, Typography, Button, Modal, TextField, Select, MenuItem, Card, CardContent, CardActions, InputLabel, FormControl, Tooltip, Snackbar, Alert
} from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, limit, startAfter
} from 'firebase/firestore'
import AuthModal from './AuthModal'
import Dashboard from './Dashboard'
import jsPDF from 'jspdf'
import { Analytics } from '@vercel/analytics/react';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: '#ffffff',
  borderRadius: '15px',
  boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.3)',
  p: 5,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
}

const titleStyle = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState('')
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [categories, setCategories] = useState(['Electronics', 'Furniture', 'Clothing'])
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorOpen, setErrorOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [lastVisible, setLastVisible] = useState(null)

  const updateInventory = async (page = 1) => {
    try {
      let snapshot
      if (page === 1) {
        snapshot = query(collection(firestore, 'inventory'), limit(itemsPerPage))
      } else {
        snapshot = query(collection(firestore, 'inventory'), startAfter(lastVisible), limit(itemsPerPage))
      }
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
      setLastVisible(docs.docs[docs.docs.length - 1])
    } catch (error) {
      setErrorMessage('Failed to update inventory')
      setErrorOpen(true)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setAuthOpen(false)
    } else {
      setAuthOpen(true)
    }
    updateInventory()
  }, [])

  const addItem = async (item, quantityToAdd, category) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        await setDoc(docRef, { quantity: quantity + quantityToAdd, category })
      } else {
        await setDoc(docRef, { quantity: quantityToAdd, category })
      }
      await updateInventory(currentPage)
    } catch (error) {
      setErrorMessage('Failed to add item')
      setErrorOpen(true)
    }
  }

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        if (quantity === 1) {
          await deleteDoc(docRef)
        } else {
          await setDoc(docRef, { quantity: quantity - 1 })
        }
      }
      await updateInventory(currentPage)
    } catch (error) {
      setErrorMessage('Failed to remove item')
      setErrorOpen(true)
    }
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleAuthOpen = () => setAuthOpen(true)
  const handleAuthClose = (user) => {
    setAuthOpen(false)
    if (user) {
      const userToStore = {
        name: user.displayName,
        email: user.email,
      }
      setUser(userToStore)
      localStorage.setItem('user', JSON.stringify(userToStore))
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    setAuthOpen(true)
    setIsDashboardOpen(false)
  }

  const addNewCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
      setNewCategory('')
    }
  }

  const handleOpenDashboard = () => {
    setIsDashboardOpen(true)
  }

  const handleCloseDashboard = () => {
    setIsDashboardOpen(false)
  }

  const handleEditOpen = (item) => {
    setEditItem(item)
    setEditOpen(true)
  }

  const handleEditClose = () => {
    setEditOpen(false)
    setEditItem(null)
  }

  const handleEditSave = async () => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), editItem.name)
      await setDoc(docRef, { quantity: editItem.quantity, category: editItem.category })
      await updateInventory(currentPage)
      handleEditClose()
    } catch (error) {
      setErrorMessage('Failed to save item')
      setErrorOpen(true)
    }
  }

  const filteredInventory = inventory.filter(item => {
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterCategory === '' || item.category === filterCategory)
    )
  })

  const handleErrorClose = () => {
    setErrorOpen(false)
    setErrorMessage('')
  }

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1)
    updateInventory(currentPage + 1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      updateInventory(currentPage - 1)
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Inventory Data', 10, 10)
    let y = 20
    inventory.forEach(({ name, quantity, category }) => {
      doc.text(`Name: ${name}`, 10, y)
      doc.text(`Quantity: ${quantity}`, 10, y + 10)
      doc.text(`Category: ${category}`, 10, y + 20)
      y += 30
    })
    doc.save('inventory.pdf')
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      padding={4}
      bgcolor={'#f5f5f5'}
    >
      {isDashboardOpen && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="300px"
          height="100vh"
          bgcolor="#ffffff"
          boxShadow="2px 0 5px rgba(0,0,0,0.1)"
          zIndex={1000}
          padding={2}
        >
          <Dashboard user={user} handleLogout={handleLogout} />
          <Button variant="contained" color="primary" onClick={handleCloseDashboard} style={{ marginTop: '20px' }}>
            Close Dashboard
          </Button>
        </Box>
      )}
      {user && (
        <Tooltip title="Open Dashboard">
          <Button variant="contained" color="primary" onClick={handleOpenDashboard} style={{ position: 'absolute', top: '20px', left: '20px' }}>
            Open Dashboard
          </Button>
        </Tooltip>
      )}
      {user && (
        <Box position="absolute" top="20px" right="20px">
          <Typography variant="h6" color="primary">
            Welcome, {user.name}
          </Typography>
        </Box>
      )}
      {!user ? (
        <Button variant="contained" onClick={handleAuthOpen}>
          Login / Sign Up
        </Button>
      ) : (
        <>
          <Tooltip title="Add a new item">
            <Button variant="contained" color="primary" onClick={handleOpen} style={{ marginTop: '20px' }}>
              Add Item
            </Button>
          </Tooltip>
          <Tooltip title="Export Inventory">
            <Button variant="contained" color="secondary" onClick={exportToPDF} style={{ marginTop: '20px' }}>
              Export to PDF
            </Button>
          </Tooltip>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={modalStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Add Item
              </Typography>
              <Grid container spacing={2} width="100%">
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="outlined-basic"
                    label="Item"
                    variant="outlined"
                    fullWidth
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="outlined-quantity"
                    label="Quantity"
                    variant="outlined"
                    type="number"
                    fullWidth
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="category-label" style={{ color: '#1976d2' }}>Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ color: '#1976d2' }}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      addItem(itemName, quantity, category)
                      setItemName('')
                      setQuantity(1)
                      setCategory('')
                      handleClose()
                    }}
                  >
                    Add
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="new-category"
                    label="New Category"
                    variant="outlined"
                    fullWidth
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    InputLabelProps={{
                      style: { color: '#1976d2' },
                    }}
                    InputProps={{
                      style: { color: '#1976d2' },
                    }}
                  />
                  <Button variant="contained" onClick={addNewCategory} style={{ marginTop: '10px' }}>
                    Add Category
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Modal>
          <Box border={'1px solid #333'} width="100%" maxWidth="800px" padding={2} bgcolor={'#ffffff'} borderRadius={2} boxShadow={3}>
            <Box
              width="100%"
              height="100px"
              bgcolor={'#ADD8E6'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Typography variant={'h6'} color={'#333'} textAlign={'center'}>
                Inventory
              </Typography>
            </Box>
            <Box display={'flex'} flexWrap={'wrap'} gap={2} marginTop={2}>
              <Grid container spacing={2} marginBottom={2} width="100%">
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="search-query"
                    label="Search"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="filter-category-label">Filter by Category</InputLabel>
                    <Select
                      labelId="filter-category-label"
                      id="filter-category"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                {filteredInventory.map(({ name, quantity, category }) => (
                  <Grid item xs={12} sm={6} md={4} key={name}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant={'h6'} color={'#333'} textAlign={'center'}>
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Typography>
                        <Typography variant={'body1'} color={'#333'} textAlign={'center'}>
                          Quantity: {quantity}
                        </Typography>
                        <Typography variant={'body1'} color={'#333'} textAlign={'center'}>
                          Category: {category}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Tooltip title="Remove item">
                          <Button variant="contained" color="secondary" onClick={() => removeItem(name)}>
                            Remove
                          </Button>
                        </Tooltip>
                        <Tooltip title="Edit item">
                          <Button variant="contained" color="primary" onClick={() => handleEditOpen({ name, quantity, category })}>
                            Edit
                          </Button>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Box display="flex" justifyContent="space-between" marginTop={2}>
              <Button variant="contained" onClick={handlePreviousPage} disabled={currentPage === 1}>
                Previous
              </Button>
              <Typography variant="body1">Page {currentPage}</Typography>
              <Button variant="contained" onClick={handleNextPage}>
                Next
              </Button>
            </Box>
          </Box>
        </>
      )}
      <AuthModal open={authOpen} onClose={handleAuthClose} setUser={setUser} />
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="edit-modal-title" variant="h6" component="h2">
            Edit Item
          </Typography>
          {editItem && (
            <Grid container spacing={2} width="100%">
              <Grid item xs={12} sm={6}>
                <TextField
                  id="edit-item-name"
                  label="Item"
                  variant="outlined"
                  fullWidth
                  value={editItem.name}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="edit-item-quantity"
                  label="Quantity"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={editItem.quantity}
                  onChange={(e) => setEditItem({ ...editItem, quantity: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="edit-category-label" style={{ color: '#1976d2' }}>Category</InputLabel>
                  <Select
                    labelId="edit-category-label"
                    id="edit-category"
                    value={editItem.category}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                    style={{ color: '#1976d2' }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={handleEditSave}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </Modal>
      <Snackbar open={errorOpen} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Analytics />
    </Box>
  )
}