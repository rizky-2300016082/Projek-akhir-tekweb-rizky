const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, '../public/data');
const BUDGETS_FILE = path.join(DATA_DIR, 'budgets.json');
const EXPENSES_FILE = path.join(DATA_DIR, 'expenses.json');

// Helper function to read a JSON file
const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file from ${filePath}: ${err}`);
        reject(`Failed to read file: ${err}`);
      } else {
        try {
          resolve(JSON.parse(data));
        } catch (parseErr) {
          console.error(`Error parsing JSON from ${filePath}: ${parseErr}`);
          reject(`Error parsing JSON from file: ${parseErr}`);
        }
      }
    });
  });
};

// Helper function to write to a JSON file
const writeFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error(`Error writing to file ${filePath}: ${err}`);
        reject(`Failed to write file: ${err}`);
      } else {
        resolve();
      }
    });
  });
};

// Get all budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await readFile(BUDGETS_FILE);
    res.json(budgets);
  } catch (err) {
    res.status(500).send(`Error fetching budgets: ${err}`);
  }
});

// Create a new budget
app.post('/api/budgets', async (req, res) => {
  try {
    const newBudget = { ...req.body, spent: 0 }; // Initialize 'spent' to 0
    const budgets = await readFile(BUDGETS_FILE);
    budgets.push(newBudget);
    await writeFile(BUDGETS_FILE, budgets);
    res.status(201).send('Budget created');
  } catch (err) {
    res.status(500).send(`Error saving new budget: ${err}`);
  }
});

// Update a budget and adjust related expenses
app.put('/api/budgets/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const budgets = await readFile(BUDGETS_FILE);
    const expenses = await readFile(EXPENSES_FILE);
    const budgetIndex = budgets.findIndex(budget => budget.id === id);

    if (budgetIndex === -1) {
      res.status(404).send('Budget not found');
      return;
    }

    const oldBudgetName = budgets[budgetIndex].name;
    const newBudgetDetails = req.body;

    // Update budget details
    budgets[budgetIndex] = { ...budgets[budgetIndex], ...newBudgetDetails, id: id }; // Ensure the id is not changed

    // Update related expenses if budget name has changed
    if (newBudgetDetails.name && oldBudgetName !== newBudgetDetails.name) {
      expenses.forEach(expense => {
        if (expense.budget === oldBudgetName) {
          expense.budget = newBudgetDetails.name;
        }
      });
      await writeFile(EXPENSES_FILE, expenses);
    }

    await writeFile(BUDGETS_FILE, budgets);
    res.status(200).send('Budget updated and expenses adjusted');
  } catch (err) {
    res.status(500).send(`Error updating budget and adjusting expenses: ${err}`);
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
      return res.status(404).send('Budget not found');
    }

    const updatedBudgets = budgets.filter(budget => budget.id !== id);
    const updatedExpenses = expenses.filter(expense => expense.budget !== budgetToDelete.name);

    await writeFile(BUDGETS_FILE, updatedBudgets);
    await writeFile(EXPENSES_FILE, updatedExpenses);
    res.status(200).send('Budget and related expenses deleted');
  } catch (err) {
    res.status(500).send(`Error deleting budget and related expenses: ${err}`);
  }
});

// Get all expenses or filter by budget
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await readFile(EXPENSES_FILE);
    const { budget } = req.query;
    const filteredExpenses = budget ? expenses.filter(expense => expense.budget === budget) : expenses;
    res.json(filteredExpenses);
  } catch (err) {
    res.status(500).send(`Error fetching expenses: ${err}`);
  }
});

// Create a new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const newExpense = req.body;
    const expenses = await readFile(EXPENSES_FILE);
    const budgets = await readFile(BUDGETS_FILE);
    expenses.push(newExpense);
    await writeFile(EXPENSES_FILE, expenses);

    // Update the spent amount for the relevant budget
    const budgetIndex = budgets.findIndex(budget => budget.name === newExpense.budget);
    if (budgetIndex !== -1) {
      budgets[budgetIndex].spent = (budgets[budgetIndex].spent || 0) + newExpense.amount;
      await writeFile(BUDGETS_FILE, budgets);
    }

    res.status(201).send('Expense created');
  } catch (err) {
    res.status(500).send(`Error adding new expense: ${err}`);
  }
});

// Delete a specific expense by ID
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const expenses = await readFile(EXPENSES_FILE);
    const expenseToDelete = expenses.find(expense => expense.id === id);
    if (!expenseToDelete) {
      return res.status(404).send('Expense not found');
    }

    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    await writeFile(EXPENSES_FILE, updatedExpenses);

    // Update the spent amount for the relevant budget
    const budgets = await readFile(BUDGETS_FILE);
    const budgetIndex = budgets.findIndex(budget => budget.name === expenseToDelete.budget);
    if (budgetIndex !== -1) {
      budgets[budgetIndex].spent -= expenseToDelete.amount;
      if (budgets[budgetIndex].spent < 0) budgets[budgetIndex].spent = 0;
      await writeFile(BUDGETS_FILE, budgets);
    }

    res.status(200).send('Expense deleted');
  } catch (err) {
    res.status(500).send(`Error deleting expense: ${err}`);
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
