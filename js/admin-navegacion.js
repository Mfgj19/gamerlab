document.querySelectorAll('[data-abrir-panel]').forEach(boton => boton.addEventListener('click', () => {
    const tab = document.querySelector('#tab-' + boton.dataset.abrirPanel);
    bootstrap.Tab.getOrCreateInstance(tab).show();
    tab.focus();
}));
