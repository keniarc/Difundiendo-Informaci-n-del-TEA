// ============================================================
//  REFERENCIAS.JS — lógica exclusiva de Referencias.html
//  Agrega este archivo en Referencias.html con:
//  <script src="referencias.js"></script>
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const searchInput  = document.getElementById('refSearch');
  const clearBtn     = document.getElementById('refClear');
  const filterBtns   = document.querySelectorAll('.ref-filter');
  const refItems     = document.querySelectorAll('.ref-item');
  const countEl      = document.getElementById('refCount');
  const emptyEl      = document.getElementById('refEmpty');
  const resetBtn     = document.getElementById('refReset');

  let activeFilter = 'all';
  let searchQuery  = '';

  // ——————————————————————————————————
  //  BÚSQUEDA
  // ——————————————————————————————————
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      clearBtn?.classList.toggle('visible', searchQuery.length > 0);
      applyFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.classList.remove('visible');
      applyFilters();
      searchInput.focus();
    });
  }

  // ——————————————————————————————————
  //  FILTROS POR TIPO
  // ——————————————————————————————————
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset filtro
      filterBtns.forEach(b => b.classList.remove('active'));
      document.querySelector('.ref-filter[data-filter="all"]')?.classList.add('active');
      activeFilter = 'all';
      // Reset búsqueda
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      clearBtn?.classList.remove('visible');
      applyFilters();
    });
  }

  // ——————————————————————————————————
  //  LÓGICA DE FILTRADO + BÚSQUEDA
  // ——————————————————————————————————
  function applyFilters() {
    let visible = 0;

    refItems.forEach(item => {
      const typeMatch   = activeFilter === 'all' || item.dataset.type === activeFilter;
      const keywords    = (item.dataset.keywords || '') + ' ' + item.textContent.toLowerCase();
      const searchMatch = searchQuery === '' || keywords.includes(searchQuery);
      const show        = typeMatch && searchMatch;

      item.classList.toggle('hidden', !show);
      if (show) {
        visible++;
        highlightText(item, searchQuery);
      }
    });

    // Actualizar contador
    if (countEl) {
      countEl.innerHTML = `Mostrando <strong>${visible}</strong> referencia${visible !== 1 ? 's' : ''}`;
    }

    // Mostrar / ocultar empty state
    if (emptyEl) emptyEl.hidden = visible > 0;
  }

  // ——————————————————————————————————
  //  RESALTAR TEXTO BUSCADO
  // ——————————————————————————————————
  function highlightText(item, query) {
    const citation = item.querySelector('.ref-citation');
    const note     = item.querySelector('.ref-note');

    [citation, note].forEach(el => {
      if (!el) return;
      // Restaurar texto original guardado
      if (el.dataset.original) {
        el.innerHTML = el.dataset.original;
      }
      if (!query) return;

      // Guardar original antes de modificar
      if (!el.dataset.original) {
        el.dataset.original = el.innerHTML;
      }

      // Escapar caracteres especiales del query
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex   = new RegExp(`(${escaped})`, 'gi');

      // Solo resaltar en nodos de texto para no romper HTML
      walkTextNodes(el, regex);
    });
  }

  function walkTextNodes(node, regex) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (regex.test(text)) {
        const span = document.createElement('span');
        span.innerHTML = text.replace(regex, '<mark class="ref-highlight">$1</mark>');
        node.replaceWith(span);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'MARK') {
      Array.from(node.childNodes).forEach(child => walkTextNodes(child, regex));
    }
  }

  // ——————————————————————————————————
  //  COPIAR CITA AL PORTAPAPELES
  // ——————————————————————————————————
  document.querySelectorAll('.ref-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.ref;
      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = '✅ ¡Copiado!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback por si clipboard no está disponible
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        btn.textContent = '✅ ¡Copiado!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📋 Copiar cita';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

  // Inicializar contador
  applyFilters();

});