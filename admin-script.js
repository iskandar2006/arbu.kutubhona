// Check if logged in
if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
  window.location.href = 'admin-login.html';
}

const sectionMeta = {
  yurisprudensiya: { label: 'Yurisprudensiya', color: '#1a5c35', bg: '#1a5c35' },
  iqtisodiyot: { label: 'Iqtisodiyot', color: '#1a4a6b', bg: '#1a4a6b' },
  tarix: { label: 'Tarix', color: '#5a3a80', bg: '#5a3a80' },
  osimliklar: { label: "O'simliklar Himoyasi va Karantini", color: '#2d8a4e', bg: '#2d8a4e' },
  psixologiya: { label: 'Psixologiya', color: '#8b4513', bg: '#8b4513' },
};

// Load books from localStorage or use default
let books = JSON.parse(localStorage.getItem('libraryBooks')) || [
  { id:1, title:'Huquq Asoslari', author:'Abdulloh Rahimov', section:'yurisprudensiya', available:true, isbn:'978-9943-123-456-7', year:2020, fileName:'', coverImage:'' },
  { id:2, title:'Fuqarolik Huquqi', author:'Karimov Baxtiyor', section:'yurisprudensiya', available:true, isbn:'978-9943-123-457-4', year:2019, fileName:'', coverImage:'' },
  { id:3, title:'Makroiqtisodiyot', author:'Sardor Aliyev', section:'iqtisodiyot', available:true, isbn:'978-9943-123-458-1', year:2021, fileName:'', coverImage:'' },
  { id:4, title:'Mikroiqtisodiyot', author:'Nilufar Hasanova', section:'iqtisodiyot', available:true, isbn:'978-9943-123-459-8', year:2020, fileName:'', coverImage:'' },
  { id:5, title:'O\'zbekiston Tarixi', author:'Ravshan Nabiyev', section:'tarix', available:true, isbn:'978-9943-123-460-4', year:2018, fileName:'', coverImage:'' },
  { id:6, title:'Jahon Tarixi', author:'Dilshod Karimov', section:'tarix', available:true, isbn:'978-9943-123-461-1', year:2019, fileName:'', coverImage:'' },
  { id:7, title:'O\'simliklar Himoyasi', author:'Gulnora Azimova', section:'osimliklar', available:true, isbn:'978-9943-123-462-8', year:2021, fileName:'', coverImage:'' },
  { id:8, title:'Karantin Tadbirlari', author:'Bekzod Usmonov', section:'osimliklar', available:true, isbn:'978-9943-123-463-5', year:2020, fileName:'', coverImage:'' },
  { id:9, title:'Umumiy Psixologiya', author:'Mohira Rashidova', section:'psixologiya', available:true, isbn:'978-9943-123-464-2', year:2019, fileName:'', coverImage:'' },
  { id:10, title:'Ijtimoiy Psixologiya', author:'Jasur Tursunov', section:'psixologiya', available:true, isbn:'978-9943-123-465-9', year:2021, fileName:'', coverImage:'' },
];

let nextId = parseInt(localStorage.getItem('libraryNextId')) || 11;
let uploadedFiles = JSON.parse(localStorage.getItem('libraryFiles')) || {};
let uploadedImages = JSON.parse(localStorage.getItem('libraryImages')) || {};

function saveBooks() {
  localStorage.setItem('libraryBooks', JSON.stringify(books));
  localStorage.setItem('libraryNextId', nextId.toString());
  localStorage.setItem('libraryFiles', JSON.stringify(uploadedFiles));
  localStorage.setItem('libraryImages', JSON.stringify(uploadedImages));
}

function renderAdminBooks(list) {
  const tbody = document.getElementById('admin-books-tbody');
  tbody.innerHTML = list.map(b => {
    const s = sectionMeta[b.section];
    return `<tr>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td><span class="tag tag-${b.section}">${s.label}</span></td>
      <td style="font-size:0.78rem;color:#888">${b.isbn}</td>
      <td><span class="book-status ${b.available ? 'status-available' : 'status-checked'}">${b.available ? 'Mavjud' : 'Topshirilgan'}</span></td>
      <td>
        <button class="btn-sm" onclick="toggleAvailability(${b.id})">${b.available ? 'Topshirish' : 'Qaytarish'}</button>
        <button class="btn-sm danger" onclick="deleteBook(${b.id})">O'chirish</button>
      </td>
    </tr>`;
  }).join('');
}

function filterAdminBooks() {
  const q = document.getElementById('admin-search').value.toLowerCase();
  const list = q ? books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)) : books;
  renderAdminBooks(list);
}

function toggleAvailability(id) {
  const b = books.find(x => x.id === id);
  if (b) { 
    b.available = !b.available; 
    renderAdminBooks(books); 
    updateStats(); 
    toast(b.available ? `"${b.title}" qaytarildi` : `"${b.title}" topshirildi`); 
    saveBooks();
  }
}

function deleteBook(id) {
  const b = books.find(x => x.id === id);
  if (b && confirm(`"${b.title}" kitobini kutubxonadan o'chirilsinmi?`)) {
    books = books.filter(x => x.id !== id);
    delete uploadedFiles[id];
    delete uploadedImages[id];
    renderAdminBooks(books);
    updateStats();
    saveBooks();
    toast(`"${b.title}" o'chirildi`);
  }
}

function addBook() {
  const title = document.getElementById('new-title').value.trim();
  const author = document.getElementById('new-author').value.trim();
  const section = document.getElementById('new-section').value;
  const isbn = document.getElementById('new-isbn').value.trim() || 'N/A';
  const year = document.getElementById('new-year').value.trim() || '2026';
  const fileInput = document.getElementById('new-file');
  const imageInput = document.getElementById('new-image');
  
  if (!title || !author) { toast('Iltimos, nomi va muallifni to\'ldiring'); return; }
  if (!fileInput.files || fileInput.files.length === 0) { toast('Iltimos, kitob faylini tanlang (PDF)'); return; }
  
  const file = fileInput.files[0];
  const fileName = file.name;
  
  const fileId = nextId;
  
  // Convert file to base64 for localStorage
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedFiles[fileId] = {
      name: fileName,
      type: file.type,
      size: file.size,
      data: e.target.result
    };
    
    // Handle image if uploaded
    let coverImageName = '';
    if (imageInput.files && imageInput.files.length > 0) {
      const image = imageInput.files[0];
      coverImageName = image.name;
      const imgReader = new FileReader();
      imgReader.onload = function(imgE) {
        uploadedImages[fileId] = imgE.target.result;
        
        books.push({ 
          id: nextId++, 
          title, 
          author, 
          section, 
          available: true, 
          isbn, 
          year: parseInt(year), 
          fileName: fileName, 
          coverImage: coverImageName 
        });
        
        updateStats();
        clearForm();
        saveBooks();
        toast(`"${title}" kutubxonaga qo'shildi!`);
        renderAdminBooks(books);
      };
      imgReader.readAsDataURL(image);
    } else {
      books.push({ 
        id: nextId++, 
        title, 
        author, 
        section, 
        available: true, 
        isbn, 
        year: parseInt(year), 
        fileName: fileName, 
        coverImage: '' 
      });
      
      updateStats();
      clearForm();
      saveBooks();
      toast(`"${title}" kutubxonaga qo'shildi!`);
      renderAdminBooks(books);
    }
  };
  reader.readAsDataURL(file);
}

function clearForm() {
  ['new-title','new-author','new-isbn','new-year'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('new-copies').value = 1;
  document.getElementById('new-file').value = '';
  document.getElementById('new-image').value = '';
}

function updateStats() {
  const avail = books.filter(b => b.available).length;
  document.getElementById('adm-total').textContent = books.length;
  document.getElementById('adm-avail').textContent = avail;
  document.getElementById('adm-out').textContent = books.length - avail;
}

function showAdminSub(sub, el) {
  document.querySelectorAll('.admin-sub').forEach(x => x.classList.remove('active'));
  document.getElementById('admin-' + sub).classList.add('active');
  document.querySelectorAll('.admin-nav-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
}

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  const toastEl = document.getElementById('toast');
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2500);
}

function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  window.location.href = 'admin-login.html';
}

// Init
renderAdminBooks(books);
updateStats();
