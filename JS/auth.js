import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://qjtxumahovqojdyywyjl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdHh1bWFob3Zxb2pkeXl3eWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTA0NzcsImV4cCI6MjA4ODQyNjQ3N30.YthIq-OT4xC0QbB4XmwzaLL6udUoBsUrnqeKMsR1rqo'
const supabase = createClient(supabaseUrl, supabaseKey)

const authForm = document.getElementById('auth-form');
const toggleAuth = document.getElementById('toggle-auth');
const registerFields = document.getElementById('register-fields');
const authTitle = document.getElementById('auth-title');
const btnAuth = document.getElementById('btn-auth');

let isRegistering = false;


toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isRegistering = !isRegistering;
    
    if (isRegistering) {
        authTitle.innerText = "Crea tu cuenta de cliente";
        btnAuth.innerText = "Registrarme";
        toggleAuth.innerText = "¿Ya tienes cuenta? Inicia sesión";
        registerFields.classList.remove('d-none');
    } else {
        authTitle.innerText = "Inicia sesión para comprar";
        btnAuth.innerText = "Entrar";
        toggleAuth.innerText = "¿No tienes cuenta? Regístrate aquí";
        registerFields.classList.add('d-none');
    }
});


authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('full_name').value;

    if (isRegistering) {
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName } 
            }
        });
        if (error) alert("Error al registrar: " + error.message);
        else alert("¡Registro exitoso! Revisa tu correo para confirmar.");
    } else {
       
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert("Error: " + error.message);
        else window.location.href = 'index.html'; // Redirigir a la tienda
    }
});