const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt'); // Untuk hashing password
const jwt = require('jsonwebtoken'); // Untuk membuat token JWT

const app = express();

app.use(cors()); // Mengaktifkan Cross-Origin Resource Sharing (CORS) untuk menerima request dari domain lain
app.use(express.json()); // Middleware untuk parsing body request dalam format JSON

// Mendefinisikan path untuk folder data dan file JSON yang digunakan
const DATA_DIR = path.join(__dirname, '../public/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BUDGETS_FILE = path.join(DATA_DIR, 'budgets.json');
const EXPENSES_FILE = path.join(DATA_DIR, 'expenses.json');

// Helper function untuk membaca file JSON
const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file from ${filePath}: ${err}`);
        reject(`Failed to read file: ${err}`);
      } else {
        try {
          resolve(JSON.parse(data)); // Parse data dari file JSON
        } catch (parseErr) {
          console.error(`Error parsing JSON from ${filePath}: ${parseErr}`);
          reject(`Error parsing JSON from file: ${parseErr}`);
        }
      }
    });
  });
};

// Helper function untuk menulis ke file JSON
const writeFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => { // Mengonversi data ke format JSON
      if (err) {
        console.error(`Error writing to file ${filePath}: ${err}`);
        reject(`Failed to write file: ${err}`);
      } else {
        resolve();
      }
    });
  });
};

// Register a new user
app.post('/api/users/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required'); // Memastikan email dan password ada
  }

  try {
    const users = await readFile(USERS_FILE); // Membaca data pengguna dari file users.json
    // Memeriksa apakah pengguna sudah ada
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Hash password sebelum disimpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat pengguna baru
    const newUser = { email, password: hashedPassword, id: users.length + 1 };
    users.push(newUser); // Menambahkan pengguna baru ke array users
    await writeFile(USERS_FILE, users); // Menulis kembali data pengguna yang sudah diperbarui

    res.status(201).send('User registered successfully'); // Menyampaikan bahwa registrasi berhasil
  } catch (err) {
    res.status(500).send(`Error registering user: ${err}`); // Menangani error jika terjadi masalah
  }
});

// Login a user
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required'); // Memastikan email dan password ada
  }

  try {
    const users = await readFile(USERS_FILE); // Membaca data pengguna dari file users.json
    const user = users.find(user => user.email === email); // Mencari pengguna berdasarkan email

    if (!user) {
      return res.status(400).send('Invalid email or password'); // Jika pengguna tidak ditemukan
    }

    // Memeriksa apakah password yang dimasukkan benar
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).send('Invalid email or password'); // Jika password salah
    }

    // Menghasilkan token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });

    // Mengirimkan token dan data pengguna yang sudah login
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).send(`Error logging in: ${err}`); // Menangani error saat login
  }
});

// Get all budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await readFile(BUDGETS_FILE); // Membaca data anggaran dari file budgets.json
    res.json(budgets); // Mengirimkan data anggaran
  } catch (err) {
    res.status(500).send(`Error fetching budgets: ${err}`); // Menangani error jika terjadi masalah
  }
});

// Create a new budget
app.post('/api/budgets', async (req, res) => {
  try {
    const newBudget = { ...req.body, spent: 0 }; // Membuat anggaran baru dan menginisialisasi 'spent' ke 0
    const budgets = await readFile(BUDGETS_FILE);
    budgets.push(newBudget); // Menambahkan anggaran baru ke array budgets
    await writeFile(BUDGETS_FILE, budgets); // Menulis kembali data anggaran yang sudah diperbarui
    res.status(201).send('Budget created'); // Menyampaikan bahwa anggaran berhasil dibuat
  } catch (err) {
    res.status(500).send(`Error saving new budget: ${err}`); // Menangani error saat membuat anggaran
  }
});

// Update a budget and adjust related expenses
app.put('/api/budgets/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10); // Mengambil ID anggaran dari parameter URL
    const budgets = await readFile(BUDGETS_FILE);
    const expenses = await readFile(EXPENSES_FILE); // Membaca data pengeluaran
    const budgetIndex = budgets.findIndex(budget => budget.id === id); // Mencari anggaran berdasarkan ID

    if (budgetIndex === -1) {
      res.status(404).send('Budget not found'); // Jika anggaran tidak ditemukan
      return;
    }

    const oldBudgetName = budgets[budgetIndex].name;
    const newBudgetDetails = req.body;

    // Memperbarui detail anggaran
    budgets[budgetIndex] = { ...budgets[budgetIndex], ...newBudgetDetails, id: id };

    // Memperbarui nama anggaran yang terkait di pengeluaran jika nama anggaran berubah
    if (newBudgetDetails.name && oldBudgetName !== newBudgetDetails.name) {
      expenses.forEach(expense => {
        if (expense.budget === oldBudgetName) {
          expense.budget = newBudgetDetails.name;
        }
      });
      await writeFile(EXPENSES_FILE, expenses); // Menulis kembali data pengeluaran yang sudah diperbarui
    }

    await writeFile(BUDGETS_FILE, budgets); // Menulis kembali data anggaran yang sudah diperbarui
    res.status(200).send('Budget updated and expenses adjusted'); // Menyampaikan bahwa anggaran dan pengeluaran sudah diperbarui
  } catch (err) {
    res.status(500).send(`Error updating budget and adjusting expenses: ${err}`); // Menangani error saat memperbarui anggaran dan pengeluaran
  }
});

// Reset semua budget dan expenses
app.delete('/api/reset', async (req, res) => {
  try {
    await writeFile(BUDGETS_FILE, []); // Mengosongkan file budgets.json
    await writeFile(EXPENSES_FILE, []); // Mengosongkan file expenses.json
    
    // Menyampaikan bahwa data budget dan expenses sudah direset
    res.status(200).send('All budgets and expenses have been reset');
  } catch (err) {
    res.status(500).send(`Error resetting budgets and expenses: ${err}`); // Menangani error saat reset data
  }
});

// Delete a specific budget by ID and all related expenses
app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const budgets = await readFile(BUDGETS_FILE);
    const expenses = await readFile(EXPENSES_FILE);

    const budgetToDelete = budgets.find(budget => budget.id === id);
    if (!budgetToDelete) {
      return res.status(404).send('Budget not found'); // Jika anggaran tidak ditemukan
    }

    const updatedBudgets = budgets.filter(budget => budget.id !== id); // Menghapus anggaran berdasarkan ID
    const updatedExpenses = expenses.filter(expense => expense.budget !== budgetToDelete.name); // Menghapus pengeluaran terkait dengan anggaran yang dihapus

    await writeFile(BUDGETS_FILE, updatedBudgets);
    await writeFile(EXPENSES_FILE, updatedExpenses); // Menyimpan data anggaran dan pengeluaran yang sudah diperbarui
    res.status(200).send('Budget and related expenses deleted');
  } catch (err) {
    res.status(500).send(`Error deleting budget and related expenses: ${err}`);
  }
});

// Get all expenses or filter by budget
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await readFile(EXPENSES_FILE);
    const { budget } = req.query; // Mengambil parameter query budget dari request
    const filteredExpenses = budget ? expenses.filter(expense => expense.budget === budget) : expenses; // Jika ada filter berdasarkan budget

    res.json(filteredExpenses); // Mengirimkan data pengeluaran yang telah difilter
  } catch (err) {
    res.status(500).send(`Error fetching expenses: ${err}`); // Menangani error saat mengambil pengeluaran
  }
});

// Create a new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const newExpense = req.body; // Mengambil data pengeluaran dari request body
    const expenses = await readFile(EXPENSES_FILE);
    const budgets = await readFile(BUDGETS_FILE);
    expenses.push(newExpense); // Menambahkan pengeluaran baru
    await writeFile(EXPENSES_FILE, expenses); // Menyimpan data pengeluaran yang telah diperbarui

    // Mengupdate jumlah 'spent' pada budget terkait
    const budgetIndex = budgets.findIndex(budget => budget.name === newExpense.budget);
    if (budgetIndex !== -1) {
      budgets[budgetIndex].spent = (budgets[budgetIndex].spent || 0) + newExpense.amount;
      await writeFile(BUDGETS_FILE, budgets); // Menyimpan data anggaran yang sudah diperbarui
    }

    res.status(201).send('Expense created'); // Menyampaikan bahwa pengeluaran berhasil dibuat
  } catch (err) {
    res.status(500).send(`Error adding new expense: ${err}`); // Menangani error saat menambah pengeluaran
  }
});

// Delete a specific expense by ID
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10); // Mengambil ID pengeluaran dari parameter URL
    const expenses = await readFile(EXPENSES_FILE);
    const expenseToDelete = expenses.find(expense => expense.id === id); // Mencari pengeluaran berdasarkan ID
    if (!expenseToDelete) {
      return res.status(404).send('Expense not found'); // Jika pengeluaran tidak ditemukan
    }

    const updatedExpenses = expenses.filter(expense => expense.id !== id); // Menghapus pengeluaran berdasarkan ID
    await writeFile(EXPENSES_FILE, updatedExpenses); // Menyimpan data pengeluaran yang sudah diperbarui

    // Mengupdate jumlah 'spent' pada budget terkait
    const budgets = await readFile(BUDGETS_FILE);
    const budgetIndex = budgets.findIndex(budget => budget.name === expenseToDelete.budget);
    if (budgetIndex !== -1) {
      budgets[budgetIndex].spent -= expenseToDelete.amount;
      if (budgets[budgetIndex].spent < 0) budgets[budgetIndex].spent = 0; // Menghindari nilai negatif
      await writeFile(BUDGETS_FILE, budgets); // Menyimpan data anggaran yang sudah diperbarui
    }

    res.status(200).send('Expense deleted'); // Menyampaikan bahwa pengeluaran berhasil dihapus
  } catch (err) {
    res.status(500).send(`Error deleting expense: ${err}`);
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001'); // Server berjalan pada port 3001
});
