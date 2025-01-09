import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BudgetPage() {
  // State untuk menyimpan username yang diambil dari localStorage
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // State untuk menyimpan data anggaran dan pengeluaran
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // State untuk form data inputan anggaran dan pengeluaran
  const [formState, setFormState] = useState({
    budgetName: '',
    budgetAmount: '',
    expenseName: '',
    expenseAmount: '',
    selectedBudget: ''
  });

  // State untuk menyimpan pengeluaran terkait anggaran yang dipilih
  const [selectedBudgetExpenses, setSelectedBudgetExpenses] = useState([]);

  // State untuk mengontrol visibilitas detail anggaran
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  useEffect(() => {
    // Mengambil data user yang disimpan di localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.username) {
      setUsername(storedUser.username);
    }

    // Mengambil data anggaran dari API
    fetch('http://localhost:3001/api/budgets')
      .then(response => response.json())
      .then(data => setBudgets(data))
      .catch(err => console.error('Error fetching budgets:', err));

    // Mengambil data pengeluaran dari API
    fetch('http://localhost:3001/api/expenses')
      .then(response => response.json())
      .then(data => setExpenses(data))
      .catch(err => console.error('Error fetching expenses:', err));
  }, []);

  // Fungsi untuk menangani perubahan pada form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  // Fungsi untuk mereset semua data (anggaran dan pengeluaran) serta form state
  const resetData = () => {
    fetch('http://localhost:3001/api/reset', { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
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
          navigate('/budget');
        } else {
          console.error('Error resetting data');
        }
      })
      .catch(err => console.error('Error during reset:', err));
  };

  // membuat anggaran baru
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

  // menambahkan pengeluaran pada anggaran yang dipilih
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

  // menghapus anggaran atau pengeluaran
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

  // men-toggle visibilitas detail anggaran
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

  // menyimpan perubahan anggaran yang di diedit
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

  // mengedit anggaran yang udah ada
  const editBudget = (budget) => {
    setFormState({
      budgetName: budget.name,
      budgetAmount: budget.amount.toString(),
      selectedBudget: budget.name
    });
  };

  // memformat jumlah uang ke format Rupiah
  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  // menghitung persentase pengeluaran dari anggaran
  const getBudgetPercentage = (budget) => {
    if (!budget || !budget.amount || !budget.spent) return 0;
    return (budget.spent / budget.amount) * 100;
  };

  return (
    <div className="p-24 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Welcome back, <span className="text-blue-600">{username || 'Guest'}!</span></h1>
        <button
          onClick={resetData}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Delete All budget
        </button>
      </div>

      {/* anggaran baru dan menambahkan pengeluaran */}
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
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Existing Budgets</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {budgets.map(budget => {
          const spentPercentage = Math.min(getBudgetPercentage(budget), 100);
          return (
            <div key={budget.id} className="p-4 sm:p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-600">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-blue-600">{budget.name}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                {formatRupiah(budget.amount)} Budgeted
              </p>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-600 text-xs sm:text-sm font-medium">
                    {formatRupiah(budget.spent)} spent
                  </span>
                  <span className="text-gray-600 text-xs sm:text-sm font-medium">
                    {formatRupiah(budget.amount - budget.spent)} remaining
                  </span>
                </div>
                <div className="relative h-2 bg-gray-300 rounded-full">
                  <div
                    className="absolute h-2 bg-red-500 rounded-full"
                    style={{ width: `${spentPercentage}%` }}
                  ></div>
                </div>
                <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                  {spentPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => toggleDetails(budget.name)}
                  className="bg-blue-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded hover:bg-blue-700 flex-1 sm:flex-none"
                >
                  {isDetailsVisible && formState.selectedBudget === budget.name
                    ? 'Hide Details'
                    : 'View Details'}
                </button>
                <button
                  onClick={() => editBudget(budget)}
                  className="bg-yellow-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded hover:bg-yellow-600 flex-1 sm:flex-none"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(budget.id, 'budget')}
                  className="bg-red-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded hover:bg-red-600 flex-1 sm:flex-none"
                >
                  Delete Budget
                </button>
              </div>
            </div>
          );
        })}
      </div>


      { }
      {isDetailsVisible && formState.selectedBudget && (
        <>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Recent Expenses for {formState.selectedBudget}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-md overflow-hidden table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm sm:text-base w-1/5">Name</th>
                  <th className="text-left p-4 text-sm sm:text-base w-1/5">Amount</th>
                  <th className="text-left p-4 text-sm sm:text-base w-1/5">Date</th>
                  <th className="text-left p-4 text-sm sm:text-base w-1/5">Budget</th>
                  <th className="text-center p-4 text-sm sm:text-base w-1/5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedBudgetExpenses.map(expense => (
                  <tr key={expense.id} className="border-t">
                    <td className="p-4 text-sm sm:text-base break-words max-w-[150px]">
                      {expense.name}
                    </td>
                    <td className="p-4 text-sm sm:text-base">{formatRupiah(expense.amount)}</td>
                    <td className="p-4 text-sm sm:text-base">{expense.date}</td>
                    <td className="p-4 text-sm sm:text-base break-words max-w-[150px]">
                      {expense.budget}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => deleteItem(expense.id, 'expense')}
                        className="bg-red-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-1 rounded hover:bg-red-600">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
}

export default BudgetPage;