//Aqui será criado a lógica por trás do SELECT para as informações do DB

const PlantService = {
  async listarPlantas() {
    const { data, error } = await _supabase
      .from("especimes")
      .select(
        `
            id_planta,
            nome_popular,
            nome_cientifico,
            informacoes_adicionais,
            foto_url,
            categoria_especimes(
                id_categoria,
                nome_categoria
            )
            `,
      )
      .order("id_planta", { ascending: false });

    if (error) {
      console.error("Erro no supabase ao listar plantas:", error.message);
      throw error;
    }
    return data;
  },
  async listarCategorias() {
    const { data, error } = await _supabase
      .from("categoria_especimes")
      .select("id_categoria, nome_categoria");

    if (error) throw error;
    return data;
  },
  async adicionaPlanta(dadosPlanta) {
    const { data, error } = await _supabase
      .from("especimes")
      .insert([
        {
          nome_popular: dadosPlanta.nome_popular,
          nome_cientifico: dadosPlanta.nome_cientifico,
          informacoes_adicionais: dadosPlanta.informacoes_adicionais,
          id_categoria: dadosPlanta.id_categoria,
          foto_url: dadosPlanta.foto_url || null,
        },
      ])
      .select();
    if (error) {
      console.error("Erro ao salvar planta no Supabase:", error.message);
      throw error;
    }
    return data;
  },
  async deletarPlanta(id) {
    const { error } = await _supabase
      .from("especimes")
      .delete()
      .eq("id_planta", id);
    if (error) {
      console.error("Erro ao deletar a planta:", error.message);
      throw true;
    }
    return true;
  },
  async enviarFoto(arquivo) {
    if (!arquivo) return null;

    const nomeArquivo = `${Date.now()}_${arquivo.name}`;

    const { data, error } = await _supabase.storage
      .from("plantas-fotos")
      .upload(nomeArquivo, arquivo);

    if (error) {
      console.error("Erro ao enviar foto para o Storage:", error.message);
      throw error;
    }

    const { data: publicUrlData } = _supabase.storage
      .from("plantas-fotos")
      .getPublicUrl(nomeArquivo);

    return publicUrlData.publicUrl;
  },
  async deletarFotoStorage(fotoUrl) {
    if (!fotoUrl) return;

    try {
      // Pega apenas o nome do arquivo no final da URL
      const nomeArquivo = fotoUrl.split("/").pop();

      const { error } = await _supabase.storage
        .from("plantas-fotos")
        .remove([nomeArquivo]);

      if (error) {
        console.error("Erro ao deletar imagem do Storage:", error.message);
      }
    } catch (err) {
      console.error("Falha ao processar deleção da foto:", err);
    }
  },
};
