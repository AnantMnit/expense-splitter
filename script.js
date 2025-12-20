// Global state
let persons = [];
let selectedPersons = [];
let personAmounts = {};

// Add person
function addPerson() {
    const input = document.getElementById('personNameInput');
    const name = input.value.trim();
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    if (persons.find(p => p.name === name)) {
        alert('Person already added');
        return;
    }
    
    persons.push({
        name: name,
        balance: {}
    });
    
    input.value = '';
    renderPersonsList();
    updatePayerSelect();
    
    if (persons.length >= 2) {
        document.getElementById('continueBtn').style.display = 'block';
    }
}

// Remove person
function removePerson(name) {
    persons = persons.filter(p => p.name !== name);
    renderPersonsList();
    updatePayerSelect();
    
    if (persons.length < 2) {
        document.getElementById('continueBtn').style.display = 'none';
    }
}

// Render persons list
function renderPersonsList() {
    const container = document.getElementById('personsList');
    container.innerHTML = '';
    
    persons.forEach(person => {
        const chip = document.createElement('div');
        chip.className = 'person-chip';
        chip.innerHTML = `
            <span>${person.name}</span>
            <button onclick="removePerson('${person.name}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
        container.appendChild(chip);
    });
}

// Continue to expenses
function continueToExpenses() {
    document.getElementById('addPersonSection').style.display = 'none';
    document.getElementById('addExpenseSection').style.display = 'block';
    updatePersonSelectButtons();
    updateIndividualAmountsList();
}

// Update payer select
function updatePayerSelect() {
    const select = document.getElementById('payerSelect');
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select person</option>';
    
    persons.forEach(person => {
        const option = document.createElement('option');
        option.value = person.name;
        option.textContent = person.name;
        select.appendChild(option);
    });
    
    if (persons.find(p => p.name === currentValue)) {
        select.value = currentValue;
    }
}

// Update division mode
function updateDivisionMode() {
    const mode = document.querySelector('input[name="divisionMode"]:checked').value;
    
    if (mode === 'equal') {
        document.getElementById('equalSplitSection').style.display = 'block';
        document.getElementById('individualAmountsSection').style.display = 'none';
        updatePersonSelectButtons();
    } else {
        document.getElementById('equalSplitSection').style.display = 'none';
        document.getElementById('individualAmountsSection').style.display = 'block';
        updateIndividualAmountsList();
    }
}

// Update person select buttons
function updatePersonSelectButtons() {
    const container = document.getElementById('personSelectButtons');
    container.innerHTML = '';
    
    persons.forEach(person => {
        const btn = document.createElement('button');
        btn.className = 'person-btn';
        btn.textContent = person.name;
        btn.onclick = () => togglePersonSelection(person.name);
        
        if (selectedPersons.includes(person.name)) {
            btn.classList.add('selected');
        }
        
        container.appendChild(btn);
    });
}

// Toggle person selection
function togglePersonSelection(name) {
    if (selectedPersons.includes(name)) {
        selectedPersons = selectedPersons.filter(n => n !== name);
    } else {
        selectedPersons.push(name);
    }
    updatePersonSelectButtons();
}

// Update individual amounts list
function updateIndividualAmountsList() {
    const container = document.getElementById('individualAmountsList');
    const payer = document.getElementById('payerSelect').value;
    container.innerHTML = '';
    
    persons.filter(p => p.name !== payer).forEach(person => {
        const row = document.createElement('div');
        row.className = 'individual-amount-row';
        row.innerHTML = `
            <span>${person.name}</span>
            <input type="number" 
                   id="amount_${person.name}" 
                   placeholder="0.00" 
                   step="0.01"
                   value="${personAmounts[person.name] || ''}" 
                   onchange="updatePersonAmount('${person.name}', this.value)" />
        `;
        container.appendChild(row);
    });
}

// Update person amount
function updatePersonAmount(name, value) {
    personAmounts[name] = value;
}

// Validate individual amounts
function validateIndividualAmounts(totalAmount, payer) {
    let sumOfAmounts = 0;
    let hasAnyAmount = false;
    const errors = [];
    
    Object.keys(personAmounts).forEach(consumerName => {
        const amt = parseFloat(personAmounts[consumerName]);
        if (consumerName !== payer && !isNaN(amt) && amt > 0) {
            sumOfAmounts += amt;
            hasAnyAmount = true;
        }
    });
    
    // Check if any amounts were entered
    if (!hasAnyAmount) {
        errors.push('Please enter at least one person\'s amount');
    }
    
    // Only error if sum EXCEEDS total (payer's share is automatically calculated as remainder)
    if (sumOfAmounts > totalAmount) {
        const excess = sumOfAmounts - totalAmount;
        errors.push(`Individual amounts (₹${sumOfAmounts.toFixed(2)}) exceed total amount (₹${totalAmount.toFixed(2)})\nExcess: ₹${excess.toFixed(2)}`);
    }
    
    return errors;
}

// Add expense
function addExpense() {
    const amount = parseFloat(document.getElementById('amountInput').value);
    const payer = document.getElementById('payerSelect').value;
    const mode = document.querySelector('input[name="divisionMode"]:checked').value;
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (!payer) {
        alert('Please select who paid');
        return;
    }
    
    if (mode === 'equal') {
        const consumers = selectedPersons.length > 0 ? selectedPersons : persons.map(p => p.name);
        
        if (consumers.length === 0) {
            alert('Please select at least one person to split the expense');
            return;
        }
        
        const perPerson = amount / consumers.length;
        
        consumers.forEach(consumerName => {
            if (consumerName !== payer) {
                const consumer = persons.find(p => p.name === consumerName);
                if (!consumer.balance[payer]) {
                    consumer.balance[payer] = 0;
                }
                consumer.balance[payer] += perPerson;
            }
        });
    } else {
        // Individual amounts - VALIDATE FIRST
        const validationErrors = validateIndividualAmounts(amount, payer);
        
        if (validationErrors.length > 0) {
            alert('⚠️ Invalid Expense!\n\n' + validationErrors.join('\n\n'));
            return;
        }
        
        // Calculate sum of others' amounts
        let sumOfOthers = 0;
        Object.keys(personAmounts).forEach(consumerName => {
            const amt = parseFloat(personAmounts[consumerName]);
            if (consumerName !== payer && amt > 0) {
                sumOfOthers += amt;
            }
        });
        
        // Payer's share is the remainder (total - sum of others)
        const payerShare = amount - sumOfOthers;
        
        // Add others' balances
        Object.keys(personAmounts).forEach(consumerName => {
            const amt = parseFloat(personAmounts[consumerName]);
            if (consumerName !== payer && amt > 0) {
                const consumer = persons.find(p => p.name === consumerName);
                if (!consumer.balance[payer]) {
                    consumer.balance[payer] = 0;
                }
                consumer.balance[payer] += amt;
            }
        });
        
        // If payer also consumed, add their balance to themselves (they owe themselves, which nets to zero in final calculation)
        // This is just for tracking purposes - the settlement will handle it correctly
    }
    
    // Reset form
    document.getElementById('amountInput').value = '';
    selectedPersons = [];
    personAmounts = {};
    updatePersonSelectButtons();
    updateIndividualAmountsList();
    
    alert('✅ Expense added successfully!');
}

// Calculate balances
function calculateBalances() {
    const results = [];
    
    persons.forEach(payer => {
        const owes = [];
        
        Object.keys(payer.balance).forEach(receiver => {
            const sentMoney = payer.balance[receiver];
            const receiverPerson = persons.find(p => p.name === receiver);
            const receivedMoney = receiverPerson?.balance[payer.name] || 0;
            
            if (sentMoney > receivedMoney) {
                const finalMoney = sentMoney - receivedMoney;
                owes.push({ to: receiver, amount: finalMoney });
            }
        });
        
        if (owes.length > 0) {
            results.push({ from: payer.name, owes });
        }
    });
    
    return results;
}

// Show balance
function showBalance() {
    const balances = calculateBalances();
    const container = document.getElementById('balanceContent');
    
    if (balances.length === 0) {
        container.innerHTML = '<div class="no-balance">All settled up! 🎉</div>';
    } else {
        container.innerHTML = '';
        balances.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'balance-item';
            
            let html = `<div class="balance-item-header">${entry.from} owes:</div>`;
            entry.owes.forEach(owe => {
                html += `
                    <div class="balance-row">
                        <span>${owe.to}</span>
                        <span class="balance-amount">₹${owe.amount.toFixed(2)}</span>
                    </div>
                `;
            });
            
            item.innerHTML = html;
            container.appendChild(item);
        });
    }
    
    document.getElementById('balanceSection').style.display = 'block';
}

// Close balance
function closeBalance() {
    document.getElementById('balanceSection').style.display = 'none';
}

// Allow Enter key to add person
document.getElementById('personNameInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addPerson();
    }
});

// Update individual amounts when payer changes
document.getElementById('payerSelect').addEventListener('change', function() {
    updateIndividualAmountsList();
});