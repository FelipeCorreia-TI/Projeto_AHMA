import { supabase } from "../config/supabaseClient.js";

export const AuthService = {
  /**
   * Realiza o login do usuário com Email e Senha
   */
  async login(email, senha) {
    // 1. Tenta autenticar na base de usuários do Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (authError) {
      throw new Error(authError.message || "E-mail ou senha inválidos.");
    }

    const user = authData.user;

    // 2. Busca os dados de perfil na tabela 'cadastro' usando o email ou id_usuario
    const { data: cadastroData, error: cadastroError } = await supabase
      .from("cadastro")
      .select("id_cadastro, nome, email, nivel_acesso")
      .eq("email", email)
      .single();

    if (cadastroError) {
      console.warn("Aviso: Usuário autenticado, mas não possui registro estendido na tabela 'cadastro'.");
    }

    // 3. Monta o objeto de sessão
    const usuarioSessao = {
      uid: user.id,
      email: user.email,
      nome: cadastroData?.nome || user.email.split("@")[0],
      nivel_acesso: cadastroData?.nivel_acesso || "COMUM",
    };

    // 4. Salva a sessão no localStorage
    localStorage.setItem("usuario_ahma", JSON.stringify(usuarioSessao));

    return usuarioSessao;
  },

  /**
   * Encerra a sessão do usuário (Logout)
   */
  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario_ahma");
    window.location.href = "index.html";
  },

  /**
   * Retorna os dados do usuário atualmente logado
   */
  getUsuarioAtual() {
    const data = localStorage.getItem("usuario_ahma");
    return data ? JSON.parse(data) : null;
  }
};