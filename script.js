const companyForm = document.getElementById('company-form');
const invoiceForm = document.getElementById('invoice-form');
const saveCompanyBtn = document.getElementById('saveCompanyBtn');
const loadSavedBtn = document.getElementById('loadSavedBtn');
const addItemBtn = document.getElementById('addItemBtn');
const generateBtn = document.getElementById('generateBtn');
const printBtn = document.getElementById('printBtn');
const itemsBody = document.getElementById('itemsBody');
const invoiceTotalEl = document.getElementById('invoiceTotal');
const invoicePreview = document.getElementById('invoicePreview');
const previewItems = document.getElementById('previewItems');

const fields = {
  companyName: document.getElementById('companyName'),
  companyAddress: document.getElementById('companyAddress'),
  companyPhone: document.getElementById('companyPhone'),
  companyEmail: document.getElementById('companyEmail'),
  companyWebsite: document.getElementById('companyWebsite'),
  clientName: document.getElementById('clientName'),
  clientAddress: document.getElementById('clientAddress'),
  invoiceNumber: document.getElementById('invoiceNumber'),
  invoiceDate: document.getElementById('invoiceDate'),
  dueDate: document.getElementById('dueDate'),
  invoiceNotes: document.getElementById('invoiceNotes'),
};

const previewFields = {
  previewInvoiceNumber: document.getElementById('previewInvoiceNumber'),
  previewInvoiceDate: document.getElementById('previewInvoiceDate'),
  previewDueDate: document.getElementById('previewDueDate'),
  previewCompanyName: document.getElementById('previewCompanyName'),
  previewCompanyAddress: document.getElementById('previewCompanyAddress'),
  previewCompanyPhone: document.getElementById('previewCompanyPhone'),
  previewCompanyEmail: document.getElementById('previewCompanyEmail'),
  previewCompanyWebsite: document.getElementById('previewCompanyWebsite'),
  previewClientName: document.getElementById('previewClientName'),
  previewClientAddress: document.getElementById('previewClientAddress'),
  previewNotes: document.getElementById('previewNotes'),
  previewInvoiceTotal: document.getElementById('previewInvoiceTotal'),
};

const STORAGE_KEY = 'invoiceAppCompanyInfo';
let items = [];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function calculateTotals() {
  let total = 0;
  const rows = itemsBody.querySelectorAll('tr');

  rows.forEach((row, index) => {
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const line = qty * price;
    row.querySelector('.item-total').textContent = formatCurrency(line);
    total += line;
    items[index] = { description: row.querySelector('.item-desc').value, quantity: qty, unitPrice: price, total: line };
  });

  invoiceTotalEl.textContent = formatCurrency(total);
  return total;
}

function createItemRow(item = { description: '', quantity: 1, unitPrice: 0 }) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" class="item-desc" placeholder="Website purchase or lease description" value="${item.description}" /></td>
    <td><input type="number" class="item-qty" min="0" value="${item.quantity}" /></td>
    <td><input type="number" class="item-price" min="0" step="0.01" value="${item.unitPrice}" /></td>
    <td class="item-total">$0.00</td>
    <td><button type="button" class="remove-item-btn secondary-btn">Remove</button></td>
  `;

  const qtyInput = row.querySelector('.item-qty');
  const priceInput = row.querySelector('.item-price');
  const removeBtn = row.querySelector('.remove-item-btn');

  const update = () => calculateTotals();
  qtyInput.addEventListener('input', update);
  priceInput.addEventListener('input', update);
  row.querySelector('.item-desc').addEventListener('input', update);

  removeBtn.addEventListener('click', () => {
    row.remove();
    calculateTotals();
  });

  itemsBody.appendChild(row);
  calculateTotals();
}

function saveCompanyInfo() {
  const data = {
    companyName: fields.companyName.value,
    companyAddress: fields.companyAddress.value,
    companyPhone: fields.companyPhone.value,
    companyEmail: fields.companyEmail.value,
    companyWebsite: fields.companyWebsite.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  alert('Company information saved locally.');
}

function loadCompanyInfo() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    alert('No saved company information found.');
    return;
  }
  const data = JSON.parse(saved);
  Object.keys(data).forEach((key) => {
    if (fields[key]) {
      fields[key].value = data[key];
    }
  });
  alert('Loaded saved company information.');
}

function generateInvoice() {
  if (!fields.clientName.value || !fields.invoiceNumber.value) {
    alert('Please enter client name and invoice number.');
    return;
  }

  const total = calculateTotals();
  if (total <= 0) {
    alert('Add invoice items with a positive total.');
    return;
  }

  previewFields.previewInvoiceNumber.textContent = `Invoice #: ${fields.invoiceNumber.value}`;
  previewFields.previewInvoiceDate.textContent = `Date: ${fields.invoiceDate.value || new Date().toISOString().split('T')[0]}`;
  previewFields.previewDueDate.textContent = fields.dueDate.value ? `Due: ${fields.dueDate.value}` : '';
  previewFields.previewCompanyName.textContent = fields.companyName.value || 'Your Company';
  previewFields.previewCompanyAddress.textContent = fields.companyAddress.value;
  previewFields.previewCompanyPhone.textContent = fields.companyPhone.value;
  previewFields.previewCompanyEmail.textContent = fields.companyEmail.value;
  previewFields.previewCompanyWebsite.textContent = fields.companyWebsite.value;
  previewFields.previewClientName.textContent = fields.clientName.value;
  previewFields.previewClientAddress.textContent = fields.clientAddress.value;
  previewFields.previewNotes.textContent = fields.invoiceNotes.value;
  previewFields.previewInvoiceTotal.textContent = formatCurrency(total);

  previewItems.innerHTML = '';
  items.forEach((item) => {
    if (!item.description && item.total === 0) return;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.description || 'Item'}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.unitPrice)}</td>
      <td>${formatCurrency(item.total)}</td>
    `;
    previewItems.appendChild(row);
  });

  invoicePreview.classList.remove('hidden');
  invoicePreview.scrollIntoView({ behavior: 'smooth' });
}

saveCompanyBtn.addEventListener('click', saveCompanyInfo);
loadSavedBtn.addEventListener('click', loadCompanyInfo);
addItemBtn.addEventListener('click', () => createItemRow());
generateBtn.addEventListener('click', generateInvoice);
printBtn.addEventListener('click', () => window.print());

window.addEventListener('DOMContentLoaded', () => {
  addItemBtn.click();
});
