document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:5000/api/transactions';
  const form = document.getElementById('transactionForm');
  const tableBody = document.getElementById('transactionsBody');

  // Load transactions on page load
  fetchTransactions();

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const transaction = {
      title: document.getElementById('title').value,
      amount: parseFloat(document.getElementById('amount').value),
      type: document.getElementById('type').value,
      category: document.getElementById('category').value || 'Uncategorized',
      date: document.getElementById('date').value || new Date().toISOString().split('T')[0],
      description: document.getElementById('description').value
    };

    createTransaction(transaction);
    form.reset();
  });

  // Fetch all transactions
  async function fetchTransactions() {
    try {
      const response = await fetch(API_URL);
      const transactions = await response.json();
      renderTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  // Create new transaction
  async function createTransaction(transaction) {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  }

  // Delete transaction
  async function deleteTransaction(id) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  // Render transactions in table
  function renderTransactions(transactions) {
    tableBody.innerHTML = '';
    
    transactions.forEach(trans => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${trans.title}</td>
        <td class="${trans.type}">${trans.amount.toFixed(2)}</td>
        <td>${trans.type.charAt(0).toUpperCase() + trans.type.slice(1)}</td>
        <td>${trans.category}</td>
        <td>${trans.date}</td>
        <td class="actions">
          <button class="delete-btn" data-id="${trans.id}">Delete</button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this transaction?')) {
          deleteTransaction(id);
        }
      });
    });
  }
});