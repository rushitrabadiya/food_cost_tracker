const members = ['Rushit', 'Amit', 'Jay', 'Neha', 'Kunal', 'Priya', 'Ravi', 'Sneha', 'Manav', 'Divya'];
const balances = JSON.parse(localStorage.getItem('balances')) || {};
const historyData = JSON.parse(localStorage.getItem('historyData')) || [];

members.forEach(name => {
  if (!balances[name]) balances[name] = 0;
});

const personSelect = document.getElementById('personSelect');
const memberCheckboxes = document.getElementById('memberCheckboxes');

members.forEach(name => {
  const option = document.createElement('option');
  option.value = name;
  option.textContent = name;
  personSelect.appendChild(option);

  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = name;
  checkbox.checked = true;
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(name));
  memberCheckboxes.appendChild(label);
});

function addExpense() {
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const message = document.getElementById('expenseMsg').value.trim();
  if (!amount || amount <= 0) return alert('Enter valid amount');
  if (!message) return alert('Enter a message');

  const selectedMembers = Array.from(memberCheckboxes.querySelectorAll('input:checked')).map(cb => cb.value);
  if (selectedMembers.length === 0) return alert('Select at least one member');

  const share = amount / selectedMembers.length;
  selectedMembers.forEach(name => balances[name] += share);

  historyData.push({
    date: new Date().toLocaleString(),
    message,
    amount: amount.toFixed(2),
    share: share.toFixed(2),
    members: selectedMembers
  });

  saveAndRender();
  document.getElementById('expenseAmount').value = '';
  document.getElementById('expenseMsg').value = '';
}

function recordPayment() {
  const name = document.getElementById('personSelect').value;
  const amount = parseFloat(document.getElementById('paymentAmount').value);
  if (!amount || amount <= 0) return alert('Enter valid payment amount');
  balances[name] -= amount;
  saveAndRender();
  document.getElementById('paymentAmount').value = '';
}

function saveAndRender() {
  localStorage.setItem('balances', JSON.stringify(balances));
  localStorage.setItem('historyData', JSON.stringify(historyData));
  renderBalances();
}

function renderBalances() {
  const container = document.getElementById('balanceContainer');
  container.innerHTML = '';
  for (const name in balances) {
    const div = document.createElement('div');
    div.className = 'person';
    const status = balances[name] <= 0 ? 'paid' : 'due';
    div.innerHTML = `
      <span>${name}</span>
      <span class="${status}">₹${balances[name].toFixed(2)}</span>
    `;
    container.appendChild(div);
  }
}

renderBalances();
