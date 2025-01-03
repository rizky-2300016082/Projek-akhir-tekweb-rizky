import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BudgetPage() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [formState, setFormState] = useState({
    budgetName: '',
    budgetAmount: '',
    expenseName: '',
    expenseAmount: '',
    selectedBudget: ''
  });
  const [selectedBudgetExpenses, setSelectedBudgetExpenses] = useState([]);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.username) {
      setUsername(storedUser.username);
    }

    fetch('http://localhost:3001/api/budgets')
      .then(response => response.json())
      .then(data => setBudgets(data))
      .catch(err => console.error('Error fetching budgets:', err));

    fetch('http://localhost:3001/api/expenses')
      .then(response => response.json())
      .then(data => setExpenses(data))
      .catch(err => console.error('Error fetching expenses:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const resetData = () => {
    Promise.all([
      fetch('http://localhost:3001/api/budgets', { method: 'DELETE' }),
      fetch('http://localhost:3001/api/expenses', { method: 'DELETE' })
    ])
      .then(responses => {
        if (responses.every(response => response.ok)) {
          setBudgets([]);
          setExpenses([]);
          setFormState({
            budgetName: '',
            budgetAmount: '',
            expenseName: '',
            expenseAmount: '',
            selectedBudget: ''
          });
          setSelectedBudgetExpenses([]);
          setIsDetailsVisible(false);
          navigate('/');
        } else {
          console.error('Error resetting data:', responses);
        }
      })
      .catch(err => console.error('Error during reset:', err));
  };

  const createBudget = () => {
    if (formState.budgetName && formState.budgetAmount) {
      const newBudget = {
        id: Date.now(),
        name: formState.budgetName,
        amount: parseFloat(formState.budgetAmount),
        spent: 0
      };

      fetch('http://localhost:3001/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudget)
      })
        .then(response => {
          if (response.ok) {
            setBudgets([...budgets, newBudget]);
            setFormState({ ...formState, budgetName: '', budgetAmount: '' });
          }
        })
        .catch(err => console.error('Error creating budget:', err));
    }
  };

  const addExpense = () => {
    if (formState.expenseName && formState.expenseAmount && formState.selectedBudget) {
      const newExpense = {
        id: Date.now(),
        name: formState.expenseName,
        amount: parseFloat(formState.expenseAmount),
        budget: formState.selectedBudget,
        date: new Date().toLocaleDateString('en-GB')
      };
  
      fetch('http://localhost:3001/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      })
        .then(response => {
          if (response.ok) {
            setExpenses(prevExpenses => [...prevExpenses, newExpense]);
  
            const updatedBudgets = budgets.map(budget =>
              budget.name === formState.selectedBudget
                ? { ...budget, spent: (budget.spent || 0) + newExpense.amount }
                : budget
            );
            setBudgets(updatedBudgets);
            setFormState({ ...formState, expenseName: '', expenseAmount: '' });
          }
        })
        .catch(err => console.error('Error adding expense:', err));
    }
  };
  

  const deleteItem = (id, type) => {
    const endpoint = type === 'expense' ? 'expenses' : 'budgets';

    fetch(`http://localhost:3001/api/${endpoint}/${id}`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          if (type === 'expense') {
            const expenseToDelete = expenses.find(expense => expense.id === id);

            const updatedExpenses = expenses.filter(expense => expense.id !== id);
            const updatedBudgets = budgets.map(budget =>
              budget.name === expenseToDelete.budget
                ? { ...budget, spent: budget.spent - expenseToDelete.amount }
                : budget
            );

            setExpenses(updatedExpenses);
            setBudgets(updatedBudgets);
            setSelectedBudgetExpenses(
              selectedBudgetExpenses.filter(expense => expense.id !== id)
            );
          } else {
            const budgetToDelete = budgets.find(budget => budget.id === id);

            const updatedBudgets = budgets.filter(budget => budget.id !== id);
            const updatedExpenses = expenses.filter(
              expense => expense.budget !== budgetToDelete.name
            );

            setBudgets(updatedBudgets);
            setExpenses(updatedExpenses);
            setSelectedBudgetExpenses(
              selectedBudgetExpenses.filter(
                expense => expense.budget !== budgetToDelete.name
              )
            );
          }
        } else {
          console.error(`Failed to delete ${type} with id ${id}`);
        }
      })
      .catch(err => console.error(`Error deleting ${type}:`, err));
  };

  const toggleDetails = (budgetName) => {
    if (formState.selectedBudget !== budgetName) {
      setFormState({ ...formState, selectedBudget: budgetName });

      fetch(`http://localhost:3001/api/expenses?budget=${encodeURIComponent(budgetName)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch expenses');
          }
          return response.json();
        })
        .then(data => setSelectedBudgetExpenses(data))
        .catch(err => console.error('Error fetching expenses for budget:', err));
    }

    setIsDetailsVisible(prevState => !prevState);
  };

  const saveEditedBudget = () => {
    if (formState.budgetName && formState.budgetAmount) {
      const updatedBudget = {
        ...budgets.find(budget => budget.name === formState.selectedBudget),
        name: formState.budgetName,
        amount: parseFloat(formState.budgetAmount)
      };

      fetch(`http://localhost:3001/api/budgets/${updatedBudget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBudget)
      })
        .then(response => {
          if (response.ok) {
            const updatedBudgets = budgets.map(budget =>
              budget.id === updatedBudget.id ? updatedBudget : budget
            );
            setBudgets(updatedBudgets);
            setFormState({
              budgetName: '',
              budgetAmount: '',
              expenseName: '',
              expenseAmount: '',
              selectedBudget: ''
            });
          }
        })
        .catch(err => console.error('Error updating budget:', err));
    }
  };

  const editBudget = (budget) => {
    setFormState({
      budgetName: budget.name,
      budgetAmount: budget.amount.toString(),
      selectedBudget: budget.name
    });
  };

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  const getBudgetPercentage = (budget) => {
    if (!budget || !budget.amount || !budget.spent) return 0;
    return (budget.spent / budget.amount) * 100;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Welcome back, <span className="text-blue-600">{username || 'Guest'}!</span></h1>
        <button
          onClick={resetData}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Delete User
        </button>
      </div>

      {/* Form untuk membuat anggaran baru dan menambahkan pengeluaran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{formState.selectedBudget ? 'Edit Budget' : 'Create Budget'}</h2>
          <input type="text" name="budgetName" value={formState.budgetName} onChange={handleChange} placeholder="Budget Name" className="w-full p-2 border rounded mb-4" />
          <input type="number" name="budgetAmount" value={formState.budgetAmount} onChange={handleChange} placeholder="Amount" className="w-full p-2 border rounded mb-4" />
          {formState.selectedBudget ? (
            <button onClick={saveEditedBudget} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Save Edited Budget</button>
          ) : (
            <button onClick={createBudget} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Create Budget</button>
          )}
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
          <input type="text" name="expenseName" value={formState.expenseName} onChange={handleChange} placeholder="Expense Name" className="w-full p-2 border rounded mb-4" />
          <input type="number" name="expenseAmount" value={formState.expenseAmount} onChange={handleChange} placeholder="Amount" className="w-full p-2 border rounded mb-4" />
          <select name="selectedBudget" value={formState.selectedBudget} onChange={handleChange} className="w-full p-2 border rounded mb-4">
            <option value="">Select Budget</option>
            {budgets.map(budget => <option key={budget.id} value={budget.name}>{budget.name}</option>)}
          </select>
          <button onClick={addExpense} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Add Expense</button>
        </div>
      </div>

      {/* Menampilkan daftar anggaran yang ada */}
      <h2 className="text-2xl font-bold mb-4">Existing Budgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {budgets.map(budget => {
          const spentPercentage = Math.min(getBudgetPercentage(budget), 100);
          return (
            <div key={budget.id} className="p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-600">
              <h3 className="text-xl font-semibold mb-2 text-blue-600">{budget.name}</h3>
              <p className="text-gray-600 mb-2">{formatRupiah(budget.amount)} Budgeted</p>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-600 text-sm font-medium">{formatRupiah(budget.spent)} spent</span>
                  <span className="text-gray-600 text-sm font-medium">{formatRupiah(budget.amount - budget.spent)} remaining</span>
                </div>
                <div className="relative h-2 bg-gray-300 rounded-full">
                  <div className="absolute h-2 bg-red-500 rounded-full" style={{ width: `${spentPercentage}%` }}></div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">{spentPercentage.toFixed(1)}%</p>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={() => toggleDetails(budget.name)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {isDetailsVisible && formState.selectedBudget === budget.name ? 'Hide Details' : 'View Details'}
                </button>
                <button onClick={() => editBudget(budget)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                  Edit
                </button>
                <button onClick={() => deleteItem(budget.id, 'budget')} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete Budget</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Menampilkan pengeluaran terbaru */}
      {isDetailsVisible && formState.selectedBudget && (
        <>
          <h2 className="text-2xl font-bold mb-4">Recent Expenses for {formState.selectedBudget}</h2>
          <table className="w-full bg-white rounded-lg shadow-md overflow-hidden table-fixed">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-center p-4">Name</th>
                <th className="text-center p-4">Amount</th>
                <th className="text-center p-4">Date</th>
                <th className="text-center p-4">Budget</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedBudgetExpenses.map(expense => (
                <tr key={expense.id} className="border-t">
                  <td className="p-4 text-center">{expense.name}</td>
                  <td className="p-4 text-center">{formatRupiah(expense.amount)}</td>
                  <td className="p-4 text-center">{expense.date}</td>
                  <td className="p-4 text-center">{expense.budget}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => deleteItem(expense.id, 'expense')} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default BudgetPage;
