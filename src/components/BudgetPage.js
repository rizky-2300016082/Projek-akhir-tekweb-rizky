import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BudgetPage() {
  const navigate = useNavigate(); // kembali ke halaman buat akun
  const [budgets, setBudgets] = useState([]); // Menyimpan daftar anggaran
  const [expenses, setExpenses] = useState([]); // Menyimpan daftar pengeluaran
  const [formState, setFormState] = useState({
    budgetName: '', budgetAmount: '', expenseName: '', expenseAmount: '', selectedBudget: ''
  }); // State untuk mengelola input formulir
  const [selectedBudgetExpenses, setSelectedBudgetExpenses] = useState([]); // Pengeluaran terkait anggaran yang dipilih
  const [isDetailsVisible, setIsDetailsVisible] = useState(false); // Menentukan apakah rincian pengeluaran ditampilkan

  useEffect(() => {
    // Mengambil data anggaran dan pengeluaran dari localStorage saat pertama kali render
    const savedBudgets = JSON.parse(localStorage.getItem('budgets')) || [];
    const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    setBudgets(savedBudgets);
    setExpenses(savedExpenses);
  }, []);

  // Fungsi untuk menangani perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  // Fungsi untuk menyimpan data ke localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
      localStorage.setItem('budgets', JSON.stringify(budgets));
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  // Fungsi untuk mereset semua data
  const resetData = () => {
    setBudgets([]);
    setExpenses([]);
    setFormState({ budgetName: '', budgetAmount: '', expenseName: '', expenseAmount: '', selectedBudget: '' });
    setSelectedBudgetExpenses([]);
    setIsDetailsVisible(false);
    localStorage.removeItem('budgets');
    localStorage.removeItem('expenses');
    navigate('/create-account');
  };

  // Fungsi untuk membuat anggaran baru
  const createBudget = () => {
    if (formState.budgetName && formState.budgetAmount) {
      const newBudget = {
        id: Date.now(),
        name: formState.budgetName,
        amount: parseFloat(formState.budgetAmount),
        spent: 0
      };
      const updatedBudgets = [...budgets, newBudget];
      setBudgets(updatedBudgets);
      setFormState({ ...formState, budgetName: '', budgetAmount: '' });
      saveToLocalStorage();
    }
  };

  // Fungsi untuk menambahkan pengeluaran baru
  const addExpense = () => {
    if (formState.expenseName && formState.expenseAmount && formState.selectedBudget) {
      const newExpense = {
        id: Date.now(),
        name: formState.expenseName,
        amount: parseFloat(formState.expenseAmount),
        budget: formState.selectedBudget,
        date: new Date().toLocaleDateString('en-GB')
      };

      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);

      // Memperbarui total pengeluaran pada anggaran yang dipilih
      const updatedBudgets = budgets.map(budget =>
        budget.name === formState.selectedBudget
          ? { ...budget, spent: (budget.spent || 0) + newExpense.amount }
          : budget
      );
      setBudgets(updatedBudgets);

      if (formState.selectedBudget === newExpense.budget) {
        setSelectedBudgetExpenses([...selectedBudgetExpenses, newExpense]);
      }

      setFormState({ ...formState, expenseName: '', expenseAmount: '' });
      saveToLocalStorage();
    }
  };

  // Fungsi untuk menghapus item (anggaran atau pengeluaran)
  const deleteItem = (id, type) => {
    if (type === 'expense') {
      const expenseToDelete = expenses.find(expense => expense.id === id);
      setExpenses(expenses.filter(expense => expense.id !== id));
      setBudgets(budgets.map(budget =>
        budget.name === expenseToDelete.budget
          ? { ...budget, spent: budget.spent - expenseToDelete.amount }
          : budget
      ));
      setSelectedBudgetExpenses(selectedBudgetExpenses.filter(expense => expense.id !== id));
    } else {
      const budgetToDelete = budgets.find(budget => budget.id === id);
      setExpenses(expenses.filter(expense => expense.budget !== budgetToDelete.name));
      setBudgets(budgets.filter(budget => budget.id !== id));
      setSelectedBudgetExpenses(selectedBudgetExpenses.filter(expense => expense.budget !== budgetToDelete.name));
    }
    saveToLocalStorage();
  };

  // Fungsi untuk menampilkan atau menyembunyikan rincian pengeluaran
  const toggleDetails = (budgetName) => {
    if (formState.selectedBudget !== budgetName) {
      setFormState({ ...formState, selectedBudget: budgetName });
      setSelectedBudgetExpenses(expenses.filter(expense => expense.budget === budgetName));
    }
    setIsDetailsVisible(prevState => !prevState); // Toggle tampilan rincian
  };

  // Fungsi untuk memformat angka ke format mata uang Indonesia (Rupiah)
  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  // Fungsi untuk menghitung persentase pengeluaran dari total anggaran
  const getBudgetPercentage = (budget) => budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;

  // Fungsi untuk menyimpan perubahan nama dan jumlah anggaran yang telah diedit
  const saveEditedBudget = () => {
    if (formState.budgetName && formState.budgetAmount) {
      const updatedBudgets = budgets.map(budget =>
        budget.name === formState.selectedBudget
          ? { ...budget, name: formState.budgetName, amount: parseFloat(formState.budgetAmount) }
          : budget
      );

      // Update pengeluaran yang terkait dengan nama anggaran yang sudah diubah
      const updatedExpenses = expenses.map(expense =>
        expense.budget === formState.selectedBudget
          ? { ...expense, budget: formState.budgetName }
          : expense
      );

      setBudgets(updatedBudgets);
      setExpenses(updatedExpenses);

      // Update pengeluaran untuk anggaran yang baru saja diubah
      setSelectedBudgetExpenses(updatedExpenses.filter(expense => expense.budget === formState.budgetName));

      setFormState({ budgetName: '', budgetAmount: '', expenseName: '', expenseAmount: '', selectedBudget: '' }); // Reset form setelah pengeditan
      saveToLocalStorage();
    }
  };

  // Fungsi untuk mengedit anggaran yang dipilih
  const editBudget = (budget) => {
    setFormState({
      ...formState,
      budgetName: budget.name,
      budgetAmount: budget.amount.toString(),
      selectedBudget: budget.name
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Welcome back, <span className="text-blue-600">budgel!</span></h1>
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
