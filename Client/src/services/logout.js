import { _supabase } from "../config/supabase.js";

export function inicializarLogout() {
  document.addEventListener("DOMContentLoaded", () => {
    const btnLogout = document.getElementById("login-content");

    if (!btnLogout) return;

    btnLogout.addEventListener("click", async (e) => {
      e.preventDefault();

      if (confirm("Deseja realmente sair da sua conta?")) {
        try {
          await _supabase.auth.signOut();
        } catch (error) {
          console.error("Erro ao encerrar sessão:", error);
        } finally {
          localStorage.clear();
          sessionStorage.clear();
          // Redireciona para o login substituindo o histórico
          window.location.replace("index.html");
        }
      }
    });
  });
}