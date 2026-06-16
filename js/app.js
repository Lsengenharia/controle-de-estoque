let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let editMode = false;

const form = document.getElementById('stock-form');
const stockList = document.getElementById('stock-list');
const grandTotalEl = document.getElementById('grand-total');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const exportBtn = document.getElementById('export-btn');

// Elementos dos inputs
const idInput = document.getElementById('product-id');
const nameInput = document.getElementById('name');
const responsibleInput = document.getElementById('responsible');
const pickupDateInput = document.getElementById('pickup-date');
const returnDateInput = document.getElementById('return-date');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');

// Inicializar
renderInventory();

// Formatar data para exibição (DD/MM/AAAA)
function formatDate(dateString) {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Evento de envio do formulário
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const productData = {
        id: editMode ? parseInt(idInput.value) : Date.now(),
        name: nameInput.value,
        responsible: responsibleInput.value,
        pickupDate: pickupDateInput.value,
        returnDate: returnDateInput.value,
        quantity: parseInt(quantityInput.value),
        price: parseFloat(priceInput.value)
    };

    if (editMode) {
        inventory = inventory.map(item => item.id === productData.id ? productData : item);
        resetForm();
    } else {
        inventory.push(productData);
    }

    saveAndRender();
    form.reset();
});

// Salvar no LocalStorage e renderizar
function saveAndRender() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    renderInventory();
}

// Renderizar a tabela
function renderInventory() {
    stockList.innerHTML = '';
    let totalValue = 0;

    inventory.forEach(item => {
        const itemTotal = item.quantity * item.price;
        totalValue += itemTotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.responsible || '-'}</td>
            <td>${formatDate(item.pickupDate)}</td>
            <td>${formatDate(item.returnDate)}</td>
            <td>${item.quantity}</td>
            <td>R$ ${item.price.toFixed(2).replace('.', ',')}</td>
            <td>R$ ${itemTotal.toFixed(2).replace('.', ',')}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editProduct(${item.id})">Retirada</button>
                <button class="btn-delete" onclick="deleteProduct(${item.id})">Excluir</button>
            </td>
        `;
        stockList.appendChild(tr);
    });

    grandTotalEl.innerText = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
}

// Função para exportar para Excel
exportBtn.addEventListener('click', () => {
    if (inventory.length === 0) {
        alert('Não há dados para exportar!');
        return;
    }

    // Preparar dados para o Excel
    const dataToExport = inventory.map(item => ({
        'Produto': item.name,
        'Responsável': item.responsible,
        'Data de Retirada': formatDate(item.pickupDate),
        'Data de Devolução': formatDate(item.returnDate),
        'Quantidade': item.quantity,
        'Preço Unitário (R$)': item.price.toFixed(2).replace('.', ','),
        'Total (R$)': (item.quantity * item.price).toFixed(2).replace('.', ',')
    }));

    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");

    // Gerar arquivo e baixar
    XLSX.writeFile(workbook, "Controle_de_Estoque.xlsx");
});

// Excluir produto
window.deleteProduct = function(id) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
        inventory = inventory.filter(item => item.id !== id);
        saveAndRender();
        if (editMode && parseInt(idInput.value) === id) {
            resetForm();
        }
    }
};

// Editar produto
window.editProduct = function(id) {
    const item = inventory.find(p => p.id === id);
    if (item) {
        editMode = true;
        idInput.value = item.id;
        nameInput.value = item.name;
        responsibleInput.value = item.responsible || '';
        pickupDateInput.value = item.pickupDate || '';
        returnDateInput.value = item.returnDate || '';
        quantityInput.value = item.quantity;
        priceInput.value = item.price;

        formTitle.innerText = 'Editar Registro';
        submitBtn.innerText = 'Atualizar';
        cancelBtn.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Cancelar edição
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    editMode = false;
    form.reset();
    idInput.value = '';
    formTitle.innerText = 'Adicionar Registro';
    submitBtn.innerText = 'Salvar';
    cancelBtn.style.display = 'none';
}