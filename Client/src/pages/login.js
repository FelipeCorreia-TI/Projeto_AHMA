import { _supabase } from "../config/supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  sessionStorage.clear();

  const tabLogin = document.getElementById("tab-login");
  const tabCadastro = document.getElementById("tab-cadastro");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // 1. ALTERNÂNCIA DE ABAS
  if (tabLogin && tabCadastro && loginForm && registerForm) {
    tabLogin.onclick = (e) => {
      e.preventDefault();
      tabLogin.classList.add("active");
      tabCadastro.classList.remove("active");
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    };

    tabCadastro.onclick = (e) => {
      e.preventDefault();
      tabCadastro.classList.add("active");
      tabLogin.classList.remove("active");
      loginForm.style.display = "none";
      registerForm.style.display = "block";
    };
  }

  // 2. MOSTRAR/OCULTAR SENHA - LOGIN
  const btnToggle = document.getElementById("toggle-password");
  const passInput = document.getElementById("password");
  if (btnToggle && passInput) {
    btnToggle.onclick = (e) => {
      e.preventDefault();
      const isPass = passInput.type === "password";
      passInput.type = isPass ? "text" : "password";
      btnToggle.textContent = isPass ? "🙈" : "👁";
    };
  }

  // 3. MOSTRAR/OCULTAR SENHA - CADASTRO
  const btnToggleReg = document.getElementById("toggle-reg-password");
  const regPassInput = document.getElementById("reg-password");
  if (btnToggleReg && regPassInput) {
    btnToggleReg.onclick = (e) => {
      e.preventDefault();
      const isPass = regPassInput.type === "password";
      regPassInput.type = isPass ? "text" : "password";
      btnToggleReg.textContent = isPass ? "🙈" : "👁";
    };
  }

  // 4. SUBMISSÃO DE LOGIN
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const errorMessage = document.getElementById("error-message");
      const btnSubmit = document.getElementById("btn-login");

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      if (errorMessage) {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
      }

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Entrando...";
      }

      try {
        const { data: authData, error: authError } = await _supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw new Error("E-mail ou senha incorretos.");

        const { data: usuarioCadastro, error: cadastroError } = await _supabase
          .from("cadastro")
          .select("status")
          .eq("id_conta", authData.user.id)
          .maybeSingle();

        if (cadastroError || !usuarioCadastro || usuarioCadastro.status === false) {
          await _supabase.auth.signOut();
          throw new Error("Sua conta está inativa ou não cadastrada no sistema.");
        }

        window.location.replace("hub.html");

      } catch (error) {
        console.error("Erro no login:", error);
        if (errorMessage) {
          errorMessage.textContent = error.message;
          errorMessage.style.display = "block";
        }
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Entrar";
        }
      }
    };
  }

  // 5. SUBMISSÃO DE CADASTRO (Ajustado para usar apenas o signUp)
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();

      const regEmailInput = document.getElementById("reg-email");
      const regPasswordInput = document.getElementById("reg-password");
      const regErrorMsg = document.getElementById("reg-error-message");
      const btnRegister = document.getElementById("btn-register");

      const regEmail = regEmailInput ? regEmailInput.value.trim() : "";
      const regPassword = regPasswordInput ? regPasswordInput.value : "";

      if (!regEmail || !regPassword) {
        if (regErrorMsg) {
          regErrorMsg.textContent = "Preencha o e-mail e a senha.";
          regErrorMsg.style.display = "block";
        }
        return;
      }

      if (regErrorMsg) {
        regErrorMsg.textContent = "";
        regErrorMsg.style.display = "none";
      }

      if (btnRegister) {
        btnRegister.disabled = true;
        btnRegister.textContent = "Cadastrando...";
      }

      try {
        // A trigger do banco criará a linha na tabela 'cadastro' automaticamente
        const { error: authError } = await _supabase.auth.signUp({
          email: regEmail,
          password: regPassword,
        });

        if (authError) throw authError;

        if (regErrorMsg) {
          regErrorMsg.style.color = "green";
          regErrorMsg.textContent = "Conta criada com sucesso! Faça login.";
          regErrorMsg.style.display = "block";
        }

        if (tabLogin) tabLogin.click();

      } catch (err) {
        console.error("Erro no cadastro:", err);
        if (regErrorMsg) {
          regErrorMsg.style.color = "";
          regErrorMsg.textContent = err.message || "Erro ao criar conta.";
          regErrorMsg.style.display = "block";
        }
      } finally {
        if (btnRegister) {
          btnRegister.disabled = false;
          btnRegister.textContent = "Criar Conta";
        }
      }
    };
  }
});