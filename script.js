// Currency denominations in descending order (Indian Rupees)
const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

// DOM Elements
const cashForm = document.getElementById('cashForm');
const billAmountInput = document.getElementById('billAmount');
const cashGivenInput = document.getElementById('cashGiven');
const resetBtn = document.getElementById('resetBtn');
const messageContainer = document.getElementById('messageContainer');
const resultsSection = document.getElementById('resultsSection');
const notesTableBody = document.getElementById('notesTableBody');
const billError = document.getElementById('billError');
const cashError = document.getElementById('cashError');

// Display elements
const displayBill = document.getElementById('displayBill');
const displayCash = document.getElementById('displayCash');
const displayChange = document.getElementById('displayChange');
const totalNotesCount = document.getElementById('totalNotesCount');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    hideResults();
});

// Event Listeners
function initializeEventListeners() {
    cashForm.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', resetForm);
    billAmountInput.addEventListener('input', clearError);
    cashGivenInput.addEventListener('input', clearError);
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    clearMessages();
    hideResults();
    
    const billAmount = parseFloat(billAmountInput.value);
    const cashGiven = parseFloat(cashGivenInput.value);
    
    // Validate inputs
    if (validateInputs(billAmount, cashGiven)) {
        calculateChange(billAmount, cashGiven);
    }
}

// Validate input values
function validateInputs(billAmount, cashGiven) {
    let isValid = true;
    
    // Check if bill amount is valid
    if (isNaN(billAmount) || billAmount <= 0) {
        showError(billError, 'Please enter a valid bill amount greater than 0');
        billAmountInput.classList.add('error');
        isValid = false;
    } else if (billAmount < 0) {
        showError(billError, 'Bill amount cannot be negative');
        billAmountInput.classList.add('error');
        isValid = false;
    }
    
    // Check if cash given is valid
    if (isNaN(cashGiven) || cashGiven <= 0) {
        showError(cashError, 'Please enter a valid cash amount greater than 0');
        cashGivenInput.classList.add('error');
        isValid = false;
    } else if (cashGiven < 0) {
        showError(cashError, 'Cash amount cannot be negative');
        cashGivenInput.classList.add('error');
        isValid = false;
    }
    
    // Check if cash given is sufficient
    if (!isNaN(billAmount) && !isNaN(cashGiven) && billAmount > 0 && cashGiven > 0) {
        if (cashGiven < billAmount) {
            showMessage('error', 'Cash given is less than bill amount! Please pay at least ₹' + billAmount);
            cashGivenInput.classList.add('error');
            isValid = false;
        } else if (cashGiven === billAmount) {
            showMessage('success', 'Exact amount paid! No change to return.');
            isValid = false;
        }
    }
    
    return isValid;
}

// Calculate change and display results
function calculateChange(billAmount, cashGiven) {
    const changeAmount = cashGiven - billAmount;
    
    // Calculate notes breakdown
    const notesBreakdown = calculateNotesBreakdown(changeAmount);
    
    // Display results
    displayResults(billAmount, cashGiven, changeAmount, notesBreakdown);
    
    // Show success message
    showMessage('success', `Change calculated successfully! Return ₹${changeAmount.toFixed(2)} to the customer.`);
}

// Calculate minimum notes breakdown
function calculateNotesBreakdown(amount) {
    const breakdown = [];
    let remainingAmount = Math.floor(amount); // Work with integer values
    let totalNotes = 0;
    
    for (const denomination of denominations) {
        if (remainingAmount >= denomination) {
            const count = Math.floor(remainingAmount / denomination);
            breakdown.push({
                denomination: denomination,
                count: count,
                total: denomination * count
            });
            remainingAmount = remainingAmount % denomination;
            totalNotes += count;
        }
    }
    
    return { breakdown, totalNotes };
}

// Display results in the UI
function displayResults(billAmount, cashGiven, changeAmount, notesData) {
    // Update summary
    displayBill.textContent = `₹${billAmount.toFixed(2)}`;
    displayCash.textContent = `₹${cashGiven.toFixed(2)}`;
    displayChange.textContent = `₹${changeAmount.toFixed(2)}`;
    totalNotesCount.textContent = notesData.totalNotes;
    
    // Clear and populate table
    notesTableBody.innerHTML = '';
    
    notesData.breakdown.forEach(note => {
        const row = createTableRow(note);
        notesTableBody.appendChild(row);
    });
    
    // Show results section
    showResults();
}

// Create table row for notes breakdown
function createTableRow(noteData) {
    const row = document.createElement('tr');
    
    const denominationText = noteData.denomination >= 10 ? 'Note' : 'Coin';
    
    row.innerHTML = `
        <td class="note-denomination">₹${noteData.denomination} ${denominationText}</td>
        <td><span class="note-count">${noteData.count}</span></td>
        <td>₹${noteData.total}</td>
    `;
    
    return row;
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

// Clear error messages
function clearError(e) {
    const input = e.target;
    input.classList.remove('error');
    
    if (input === billAmountInput) {
        billError.classList.remove('show');
        billError.textContent = '';
    } else if (input === cashGivenInput) {
        cashError.classList.remove('show');
        cashError.textContent = '';
    }
}

// Show message
function showMessage(type, text) {
    clearMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    messageDiv.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${text}</span>
    `;
    
    messageContainer.appendChild(messageDiv);
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }, 5000);
    }
}

// Clear all messages
function clearMessages() {
    messageContainer.innerHTML = '';
}

// Show results section
function showResults() {
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Hide results section
function hideResults() {
    resultsSection.classList.add('hidden');
}

// Reset form and clear all data
function resetForm() {
    cashForm.reset();
    clearMessages();
    hideResults();
    
    // Clear error states
    billAmountInput.classList.remove('error');
    cashGivenInput.classList.remove('error');
    billError.classList.remove('show');
    cashError.classList.remove('show');
    billError.textContent = '';
    cashError.textContent = '';
    
    // Focus on bill amount input
    billAmountInput.focus();
}

// Add fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);