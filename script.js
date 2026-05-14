let sectionMeta = JSON.parse(localStorage.getItem('librarySectionMeta')) || {
  yurisprudensiya: { label: 'Yurisprudensiya', icon: '⚖️', color: '#1a5c35', bg: '#1a5c35' },
  iqtisodiyot: { label: 'Iqtisodiyot', icon: '📈', color: '#1a4a6b', bg: '#1a4a6b' },
  tarix: { label: 'Tarix', icon: '📜', color: '#5a3a80', bg: '#5a3a80' },
  osimliklar: { label: "O'simliklar Himoyasi va Karantini", icon: '🌿', color: '#2d8a4e', bg: '#2d8a4e' },
  psixologiya: { label: 'Psixologiya', icon: '🧠', color: '#8b4513', bg: '#8b4513' },
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
let currentFilter = 'all';
let uploadedFiles = JSON.parse(localStorage.getItem('libraryFiles')) || {};
let uploadedImages = JSON.parse(localStorage.getItem('libraryImages')) || {};
let currentBookId = null;

function renderBooks(list) {
  const grid = document.getElementById('books-grid');
  const heading = document.getElementById('current-section-heading');
  const overview = document.getElementById('sections-overview');
  if (!list || list.length === 0) {
    grid.innerHTML = '<p style="color:var(--ink-muted);padding:1rem 0">Kitoblar topilmadi.</p>';
    heading.style.display = 'flex';
    overview.style.display = 'none';
    document.getElementById('section-badge-count').textContent = '0 ta kitob';
    return;
  }
  grid.innerHTML = list.map(b => {
    const s = sectionMeta[b.section];
    const hasFile = uploadedFiles[b.id] ? true : (b.fileName ? true : false);
    const hasImage = uploadedImages[b.id] ? true : (b.coverImage ? true : false);
    return `<div class="book-card" onclick="showBookModal(${b.id})">
      <div class="book-cover" style="background:${s.bg}">
        ${hasImage ? `<img src="${uploadedImages[b.id] || b.coverImage}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:2;border-radius:0">` : `<span>${b.title}</span>`}
      </div>
      <div class="book-info">
        <div class="book-title">${b.title}</div>
        <div class="book-author">${b.author}</div>
        <span class="book-status ${b.available ? 'status-available' : 'status-checked'}">${b.available ? 'Mavjud' : 'Topshirilgan'}</span>
        ${hasFile ? '<div style="margin-top:6px"><button class="btn-sm primary" onclick="event.stopPropagation(); downloadBook(' + b.id + ')" style="font-size:0.68rem;padding:2px 8px">📄 Yuklab olish</button></div>' : ''}
      </div>
    </div>`;
  }).join('');
}

function filterBooks(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
  const overview = document.getElementById('sections-overview');
  const heading = document.getElementById('current-section-heading');
  const titleEl = document.getElementById('section-title');
  const badge = document.getElementById('section-badge-count');

  let list;
  if (filter === 'all') {
    list = books;
    titleEl.textContent = 'Barcha Kitoblar';
    badge.textContent = books.length + ' ta kitob';
    badge.style.background = '#f3f0e8';
    badge.style.color = '#7a7568';
  } else if (filter === 'available') {
    list = books.filter(b => b.available);
    titleEl.textContent = 'Mavjud Kitoblar';
    badge.textContent = list.length + ' ta kitob';
    badge.style.background = '#e8f5ec';
    badge.style.color = '#2d6a3f';
  } else if (filter === 'checked') {
    list = books.filter(b => !b.available);
    titleEl.textContent = 'Topshirilgan';
    badge.textContent = list.length + ' ta kitob';
    badge.style.background = '#f9f0e4';
    badge.style.color = '#7a4a1a';
  } else {
    list = books.filter(b => b.section === filter);
    const s = sectionMeta[filter];
    titleEl.textContent = s.label;
    badge.textContent = list.length + ' ta kitob';
  }

  overview.style.display = 'none';
  heading.style.display = 'flex';
  renderBooks(list);
}

function liveSearch() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const sec = document.getElementById('sectionFilter').value;
  let list = books;
  if (sec) list = list.filter(b => b.section === sec);
  if (q) list = list.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  const heading = document.getElementById('current-section-heading');
  const overview = document.getElementById('sections-overview');
  heading.style.display = 'flex';
  overview.style.display = 'none';
  document.getElementById('section-title').textContent = 'Qidiruv Natijalari';
  document.getElementById('section-badge-count').textContent = list.length + ' ta topildi';
  renderBooks(list);
}

function updateLibraryStats() {
  const total = books.length;
  const avail = books.filter(b => b.available).length;
  const heroStats = document.querySelectorAll('.hero-stat .num');
  if (heroStats.length >= 2) {
    heroStats[0].textContent = total;
    heroStats[1].textContent = avail;
  }
}

function showPage(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.getElementById('page-' + p).classList.add('active');
  document.querySelectorAll('.topbar-nav button').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function downloadBook(id) {
  if (uploadedFiles[id]) {
    const file = uploadedFiles[id];
    const a = document.createElement('a');
    a.href = file.data;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast(`Yuklanmoqda: ${file.name}`);
  } else {
    toast('Bu kitob uchun fayl mavjud emas');
  }
}

function showBookModal(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;
  
  currentBookId = bookId;
  const section = sectionMeta[book.section];
  const hasFile = uploadedFiles[bookId] ? true : (book.fileName ? true : false);
  const hasImage = uploadedImages[bookId] ? true : (book.coverImage ? true : false);
  
  // Populate modal content
  document.getElementById('modal-title').textContent = book.title;
  document.getElementById('modal-author').textContent = book.author;
  document.getElementById('modal-section').textContent = section.label;
  document.getElementById('modal-isbn').textContent = book.isbn;
  document.getElementById('modal-year').textContent = book.year;
  document.getElementById('modal-status').textContent = book.available ? 'Mavjud' : 'Topshirilgan';
  
  // Set cover image
  const coverEl = document.getElementById('modal-cover-image');
  if (hasImage) {
    coverEl.innerHTML = `<img src="${uploadedImages[bookId] || book.coverImage}" />`;
  } else {
    coverEl.innerHTML = `<span>${book.title}</span>`;
    coverEl.style.background = `linear-gradient(135deg, ${section.color} 0%, ${section.bg} 100%)`;
  }
  
  // Show/hide download button
  const downloadBtn = document.getElementById('modal-download-btn');
  if (hasFile) {
    downloadBtn.style.display = 'block';
  } else {
    downloadBtn.style.display = 'none';
  }
  
  // Show modal
  document.getElementById('book-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeBookModal() {
  document.getElementById('book-modal').style.display = 'none';
  document.body.style.overflow = 'auto';
  currentBookId = null;
}

function downloadBookFromModal() {
  if (currentBookId) {
    downloadBook(currentBookId);
  }
}

function renderSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const sectionItems = Array.from(sidebar.querySelectorAll('.sidebar-item')).slice(2); // Get all section items
  const firstDivider = sidebar.querySelector('.sidebar-divider');
  
  if (!firstDivider) return;
  
  // Build the sidebar HTML
  let html = `
    <div class="sidebar-label">Ko'rish</div>
    <div class="sidebar-item active" onclick="filterBooks('all', this)">
      <span class="sidebar-dot" style="background:#888"></span> Barcha Kitoblar
    </div>
    <div class="sidebar-divider"></div>
    <div class="sidebar-label">Yo'nalishlar</div>
  `;
  
  // Add dynamic category items
  Object.keys(sectionMeta).forEach(key => {
    const cat = sectionMeta[key];
    html += `
      <div class="sidebar-item" onclick="filterBooks('${key}', this)">
        <span style="font-size:1rem;width:20px;text-align:center">${cat.icon}</span> ${cat.label}
      </div>
    `;
  });
  
  html += `
    <div class="sidebar-divider"></div>
    <div class="sidebar-label">Holat</div>
    <div class="sidebar-item" onclick="filterBooks('available', this)">
      <span class="sidebar-dot" style="background:#2d6a3f"></span> Mavjud
    </div>
    <div class="sidebar-item" onclick="filterBooks('checked', this)">
      <span class="sidebar-dot" style="background:#b8922a"></span> Topshirilgan
    </div>
  `;
  
  sidebar.innerHTML = html;
}

// Init: show all books section overview on load
document.getElementById('sections-overview').style.display = 'block';
document.getElementById('current-section-heading').style.display = 'none';
renderSidebar();
renderBooks(books);
updateLibraryStats();
