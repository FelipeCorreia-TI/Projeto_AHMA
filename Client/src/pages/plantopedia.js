// src/pages/plantopedia.js

document.addEventListener("DOMContentLoaded", () => {
  let plants = [];
  let currentDetailId = null;

  // Elementos da DOM
  const grid = document.getElementById("ppGrid");
  const emptyState = document.getElementById("ppEmpty");
  const searchInput = document.getElementById("ppSearch");

  // ---- Modal: Adicionar planta ----
  const formOverlay = document.getElementById("ppFormOverlay");
  const form = document.getElementById("ppForm");
  const photoUpload = document.getElementById("ppPhotoUpload");
  const photoInput = document.getElementById("ppPhotoInput");
  const photoPreview = document.getElementById("ppPhotoPreview");
  const photoPlaceholder = document.getElementById("ppPhotoPlaceholder");

  // ---- Modal: Detalhes ----
  const detailOverlay = document.getElementById("ppDetailOverlay");
  const detailImg = document.getElementById("ppDetailImg");
  const detailPlaceholder = document.getElementById("ppDetailPlaceholder");
  const detailName = document.getElementById("ppDetailName");
  const detailScientific = document.getElementById("ppDetailScientific");
  const detailCategory = document.getElementById("ppDetailCategory");
  const detailInfo = document.getElementById("ppDetailInfo");
  const detailDeleteBtn = document.getElementById("ppDetailDelete");

  // 🔄 Função para buscar dados do Supabase e renderizar
  async function fetchAndRender() {
    try {
      plants = await PlantService.listarPlantas();
      renderGrid();
    } catch (e) {
      console.error("Falha ao carregar grid:", e);
    }
  }

  // 🎨 Função para desenhar os cards na tela
  function renderGrid() {
    const term = searchInput.value.trim().toLowerCase();

    // Filtra localmente o array obtido do banco
    const filtered = plants.filter(
      (p) =>
        p.nome_popular.toLowerCase().includes(term) ||
        (p.nome_cientifico && p.nome_cientifico.toLowerCase().includes(term)),
    );

    grid.innerHTML = "";

    filtered.forEach((p) => {
      const card = document.createElement("article");
      card.className = "pp-card";

      const nomeCat = p.categoria_especimes?.nome_categoria || "Geral";

      card.innerHTML = `
        <div class="pp-card-photo">
          ${p.foto_url ? `<img src="${p.foto_url}" alt="${p.nome_popular}">` : ""}
        </div>
        <div class="pp-card-body">
          <span class="pp-badge">${nomeCat}</span>
          <h4>${p.nome_popular}</h4>
          <p><em>${p.nome_cientifico || ""}</em></p>
        </div>
      `;

      card.addEventListener("click", () => openDetail(p.id_planta));
      grid.appendChild(card);
    });

    emptyState.hidden = filtered.length !== 0;
  }

  // Evento de busca em tempo real
  searchInput.addEventListener("input", renderGrid);

  // ---- Modais: Abertura e Fechamento ----
  document.getElementById("ppBtnAdd").addEventListener("click", () => {
    form.reset();
    photoPreview.hidden = true;
    photoPlaceholder.hidden = false;
    formOverlay.hidden = false;
  });

  function closeForm() {
    formOverlay.hidden = true;
  }
  document.getElementById("ppFormClose").addEventListener("click", closeForm);
  document.getElementById("ppFormCancel").addEventListener("click", closeForm);
  formOverlay.addEventListener("click", (e) => {
    if (e.target === formOverlay) closeForm();
  });

  photoUpload.addEventListener("click", () => photoInput.click());
  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      photoPreview.src = reader.result;
      photoPreview.hidden = false;
      photoPlaceholder.hidden = true;
    };
    reader.readAsDataURL(file);
  });

  // ---- Modal Detalhes ----
  function openDetail(id) {
    const p = plants.find((pl) => pl.id_planta === id);
    if (!p) return;
    currentDetailId = id;

    if (p.foto_url) {
      detailImg.src = p.foto_url;
      detailImg.hidden = false;
      detailPlaceholder.hidden = true;
    } else {
      detailImg.hidden = true;
      detailPlaceholder.hidden = false;
    }

    detailName.textContent = p.nome_popular;
    detailScientific.textContent = p.nome_cientifico || "";
    detailCategory.textContent =
      p.categoria_especimes?.nome_categoria || "Geral";
    detailInfo.textContent =
      p.informacoes_adicionais || "Sem informações adicionadas ainda.";
    detailOverlay.hidden = false;
  }

  function closeDetail() {
    detailOverlay.hidden = true;
    currentDetailId = null;
  }

  document
    .getElementById("ppDetailClose")
    .addEventListener("click", closeDetail);
  detailOverlay.addEventListener("click", (e) => {
    if (e.target === detailOverlay) closeDetail();
  });

  // 🗑️ Evento de Exclusão no Supabase
  detailDeleteBtn.addEventListener("click", async () => {
    if (!currentDetailId) return;

    if (confirm("Tem certeza de que deseja excluir esta planta?")) {
      try {
        await PlantService.deletarPlanta(currentDetailId);
        closeDetail();
        fetchAndRender(); // Recarrega a lista do banco
      } catch (e) {
        alert("Erro ao excluir a planta.");
      }
    }
  });
  

  // Inicializa o carregamento
  fetchAndRender();
});
