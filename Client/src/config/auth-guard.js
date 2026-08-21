import { _supabase } from "./supabase.js";

/**
 * Protege rotas que exigem login.
 * Trata o histórico do navegador e evita visualização pelo B.F. Cache (Botão Voltar).
 */
export async function protegerRota() {
  // 🛡️ Garante revalidação forçada ao usar os botões "Voltar" ou "Avançar"
  window.addEventListener("pageshow", async (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });

  const { data: { session } } = await _supabase.auth.getSession();

  if (!session) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("login.html");
    return null;
  }

  let usuarioLocal = JSON.parse(localStorage.getItem("usuario_ahma") || "null");

  if (!usuarioLocal || usuarioLocal.uid !== session.user.id) {
    const { data: cadastroData } = await _supabase
      .from("cadastro")
      .select("nome, nivel_acesso, status")
      .eq("id_conta", session.user.id)
      .single();

    if (cadastroData && cadastroData.status === false) {
      await _supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("login.html");
      return null;
    }

    usuarioLocal = {
      uid: session.user.id,
      email: session.user.email,
      nome: cadastroData?.nome || session.user.email.split("@")[0],
      nivel_acesso: cadastroData?.nivel_acesso || "COMUM",
    };

    localStorage.setItem("usuario_ahma", JSON.stringify(usuarioLocal));
  }

  const nivel = (usuarioLocal.nivel_acesso || "").toUpperCase();
  const eAdmin = nivel === "TI" || nivel === "AGRO";

  return { usuario: usuarioLocal, eAdmin };
}