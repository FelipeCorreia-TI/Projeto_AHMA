import { protegerRota } from "../config/auth-guard.js";
import { PlantService } from "../services/plantService.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 🛡️ Garante autenticação e obtém a permissão baseada na coluna nivel_acesso (TI / AGRO) da tabela 'cadastro'
  const dadosAutenticacao = await protegerRota();
  if (!dadosAutenticacao) return;

  const { eAdmin } = dadosAutenticacao;

  let plants = [];
  let currentDetailId = null;
  let pendingPhotoFile = null;

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

  // 🔒 Botão Adicionar: Exibe apenas para ADMs (TI / AGRO)
  const btnAdd = document.getElementById("ppBtnAdd");
  if (btnAdd) {
    btnAdd.style.display = eAdmin ? "flex" : "none";

    btnAdd.addEventListener("click", () => {
      if (!eAdmin) return;
      form.reset();
      pendingPhotoFile = null;
      if (photoPreview) photoPreview.hidden = true;
      if (photoPlaceholder) photoPlaceholder.hidden = false;
      if (formOverlay) formOverlay.hidden = false;
    });
  }

  // 🔄 Buscar e renderizar plantas
  async function fetchAndRender() {
    try {
      plants = await PlantService.listarPlantas();
      renderGrid();
    } catch (e) {
      console.error("Falha ao carregar lista de plantas:", e);
    }
  }

  // 🎨 Desenha os cards na tela
  function renderGrid() {
    const term = searchInput ? searchInput.value.trim().toLowerCase() : "";

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

    if (emptyState) {
      emptyState.hidden = filtered.length !== 0;
    }
  }

  // Evento de busca em tempo real
  if (searchInput) {
    searchInput.addEventListener("input", renderGrid);
  }

  // ---- Modais: Fechamento ----
  function closeForm() {
    if (formOverlay) formOverlay.hidden = true;
    pendingPhotoFile = null;
  }

  const btnCloseForm = document.getElementById("ppFormClose");
  const btnCancelForm = document.getElementById("ppFormCancel");
  if (btnCloseForm) btnCloseForm.addEventListener("click", closeForm);
  if (btnCancelForm) btnCancelForm.addEventListener("click", closeForm);

  if (formOverlay) {
    formOverlay.addEventListener("click", (e) => {
      if (e.target === formOverlay) closeForm();
    });
  }

  // ---- Manipulação do Upload de Foto ----
  if (photoUpload && photoInput) {
    photoUpload.addEventListener("click", () => photoInput.click());
  }

  if (photoInput) {
    photoInput.addEventListener("change", () => {
      const file = photoInput.files[0];
      if (!file) return;

      pendingPhotoFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        if (photoPreview) {
          photoPreview.src = reader.result;
          photoPreview.hidden = false;
        }
        if (photoPlaceholder) {
          photoPlaceholder.hidden = true;
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // ➕ Envio do Formulário (CREATE)
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!eAdmin) {
        alert("Apenas administradores (TI / AGRO) podem cadastrar plantas.");
        return;
      }

      try {
        let fotoUrlFinal = null;

        if (pendingPhotoFile) {
          fotoUrlFinal = await PlantService.enviarFoto(pendingPhotoFile);
        }

        const novaPlanta = {
          nome_popular: document.getElementById("ppName").value.trim(),
          nome_cientifico: document.getElementById("ppScientific").value.trim(),
          id_categoria: parseInt(
            document.getElementById("ppCategory").value,
            10,
          ),
          informacoes_adicionais: document
            .getElementById("ppInfo")
            .value.trim(),
          foto_url: fotoUrlFinal,
        };

        if (!novaPlanta.nome_popular) return;

        await PlantService.adicionaPlanta(novaPlanta);
        closeForm();
        fetchAndRender();
      } catch (error) {
        alert("Erro ao salvar a planta no banco de dados.");
        console.error(error);
      }
    });
  }

  // ---- Modal Detalhes e Exclusão (DELETE) ----
  function openDetail(id) {
    const p = plants.find((pl) => pl.id_planta === id);
    if (!p) return;
    currentDetailId = id;

    if (p.foto_url) {
      detailImg.src = p.foto_url;
      detailImg.hidden = false;
      if (detailPlaceholder) detailPlaceholder.hidden = true;
    } else {
      detailImg.hidden = true;
      if (detailPlaceholder) detailPlaceholder.hidden = false;
    }

    detailName.textContent = p.nome_popular;
    detailScientific.textContent = p.nome_cientifico || "";
    detailCategory.textContent =
      p.categoria_especimes?.nome_categoria || "Geral";
    detailInfo.textContent =
      p.informacoes_adicionais || "Sem informações adicionadas ainda.";

    // 🔒 Botão de Excluir: Exibe no modal apenas se for ADM
    if (detailDeleteBtn) {
      detailDeleteBtn.style.display = eAdmin ? "block" : "none";
    }

    detailOverlay.hidden = false;
  }

  function closeDetail() {
    if (detailOverlay) detailOverlay.hidden = true;
    currentDetailId = null;
  }

  const btnCloseDetail = document.getElementById("ppDetailClose");
  if (btnCloseDetail) btnCloseDetail.addEventListener("click", closeDetail);

  if (detailOverlay) {
    detailOverlay.addEventListener("click", (e) => {
      if (e.target === detailOverlay) closeDetail();
    });
  }

  // 🗑️ Excluir Planta (DELETE)
  if (detailDeleteBtn) {
    detailDeleteBtn.addEventListener("click", async () => {
      if (!currentDetailId) return;

      if (!eAdmin) {
        alert("Apenas administradores (TI / AGRO) podem excluir plantas.");
        return;
      }

      if (confirm("Tem certeza de que deseja excluir esta planta?")) {
        try {
          const plantaAtual = plants.find((p) => p.id_planta === currentDetailId);

          if (plantaAtual && plantaAtual.foto_url) {
            await PlantService.deletarFotoStorage(plantaAtual.foto_url);
          }

          await PlantService.deletarPlanta(currentDetailId);

          closeDetail();
          fetchAndRender();
        } catch (e) {
          alert("Erro ao excluir a planta.");
          console.error(e);
        }
      }
    });
  }

  // Inicialização
  fetchAndRender();
});