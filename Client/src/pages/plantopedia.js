
        (function () {
            const STORAGE_KEY = 'ahma_plantopedia_plants';

            const seed = [
                
            ];

            function loadPlants() {
                try {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    if (raw) return JSON.parse(raw);
                } catch (e) { console.warn('Não foi possível ler o localStorage', e); }
                return seed;
            }

            function savePlants(list) {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                } catch (e) { console.warn('Não foi possível salvar no localStorage', e); }
            }

            let plants = loadPlants();
            let pendingPhoto = null;

            const grid = document.getElementById('ppGrid');
            const emptyState = document.getElementById('ppEmpty');
            const searchInput = document.getElementById('ppSearch');

            function renderGrid() {
                const term = searchInput.value.trim().toLowerCase();
                const filtered = plants.filter(p => p.nome.toLowerCase().includes(term));

                grid.innerHTML = '';
                filtered.forEach(p => {
                    const card = document.createElement('article');
                    card.className = 'pp-card';
                    card.innerHTML = `
                        <div class="pp-card-photo">
                            ${p.foto ? `<img src="${p.foto}" alt="${p.nome}">` : ''}
                        </div>
                        <div class="pp-card-body">
                            <span class="pp-badge">${p.categoria}</span>
                            <h4>${p.nome}</h4>
                            <p>${p.info || 'Sem informações adicionadas ainda.'}</p>
                        </div>
                    `;
                    card.addEventListener('click', () => openDetail(p.id));
                    grid.appendChild(card);
                });

                emptyState.hidden = filtered.length !== 0;
            }

            searchInput.addEventListener('input', renderGrid);

            // ---- Modal: adicionar planta ----
            const formOverlay = document.getElementById('ppFormOverlay');
            const form = document.getElementById('ppForm');
            const photoUpload = document.getElementById('ppPhotoUpload');
            const photoInput = document.getElementById('ppPhotoInput');
            const photoPreview = document.getElementById('ppPhotoPreview');
            const photoPlaceholder = document.getElementById('ppPhotoPlaceholder');

            document.getElementById('ppBtnAdd').addEventListener('click', () => {
                form.reset();
                pendingPhoto = null;
                photoPreview.hidden = true;
                photoPlaceholder.hidden = false;
                formOverlay.hidden = false;
            });

            function closeForm() { formOverlay.hidden = true; }
            document.getElementById('ppFormClose').addEventListener('click', closeForm);
            document.getElementById('ppFormCancel').addEventListener('click', closeForm);
            formOverlay.addEventListener('click', e => { if (e.target === formOverlay) closeForm(); });

            photoUpload.addEventListener('click', () => photoInput.click());
            photoInput.addEventListener('change', () => {
                const file = photoInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    pendingPhoto = reader.result;
                    photoPreview.src = pendingPhoto;
                    photoPreview.hidden = false;
                    photoPlaceholder.hidden = true;
                };
                reader.readAsDataURL(file);
            });

            form.addEventListener('submit', e => {
                e.preventDefault();
                const novaPlanta = {
                    id: 'p' + Date.now(),
                    nome: document.getElementById('ppName').value.trim(),
                    cientifico: document.getElementById('ppScientific').value.trim(),
                    categoria: document.getElementById('ppCategory').value,
                    info: document.getElementById('ppInfo').value.trim(),
                    foto: pendingPhoto
                };
                if (!novaPlanta.nome) return;

                plants.unshift(novaPlanta);
                savePlants(plants);
                renderGrid();
                closeForm();
            });

            // ---- Modal: detalhes / exclusão ----
            const detailOverlay = document.getElementById('ppDetailOverlay');
            const detailImg = document.getElementById('ppDetailImg');
            const detailPlaceholder = document.getElementById('ppDetailPlaceholder');
            const detailName = document.getElementById('ppDetailName');
            const detailScientific = document.getElementById('ppDetailScientific');
            const detailCategory = document.getElementById('ppDetailCategory');
            const detailInfo = document.getElementById('ppDetailInfo');
            const detailDeleteBtn = document.getElementById('ppDetailDelete');

            let currentDetailId = null;

            function openDetail(id) {
                const p = plants.find(pl => pl.id === id);
                if (!p) return;
                currentDetailId = id;

                if (p.foto) {
                    detailImg.src = p.foto;
                    detailImg.hidden = false;
                    detailPlaceholder.hidden = true;
                } else {
                    detailImg.hidden = true;
                    detailPlaceholder.hidden = false;
                }
                detailName.textContent = p.nome;
                detailScientific.textContent = p.cientifico || '';
                detailCategory.textContent = p.categoria;
                detailInfo.textContent = p.info || 'Sem informações adicionadas ainda.';
                detailOverlay.hidden = false;
            }

            function closeDetail() { detailOverlay.hidden = true; currentDetailId = null; }
            document.getElementById('ppDetailClose').addEventListener('click', closeDetail);
            detailOverlay.addEventListener('click', e => { if (e.target === detailOverlay) closeDetail(); });

            detailDeleteBtn.addEventListener('click', () => {
                if (!currentDetailId) return;
                plants = plants.filter(p => p.id !== currentDetailId);
                savePlants(plants);
                renderGrid();
                closeDetail();
            });

            renderGrid();
    })();