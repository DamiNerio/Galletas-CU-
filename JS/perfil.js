import { supabase } from './config.js';

const perfilForm = document.getElementById('perfil-form');

async function cargarPerfil() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return window.location.href = 'login.html';

  
    const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (data) {
        document.getElementById('perf-nombre').value = data.nombre_completo || '';
        document.getElementById('perf-tel').value = data.telefono || '';
        document.getElementById('perf-dir').value = data.direccion || '';
    }
}

perfilForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnGuardar = e.target.querySelector('button');
    btnGuardar.disabled = true;
    btnGuardar.innerText = "Guardando...";

    const { data: { user } } = await supabase.auth.getUser();
    const nuevoNombre = document.getElementById('perf-nombre').value;
    const nuevoTel = document.getElementById('perf-tel').value;
    const nuevaDir = document.getElementById('perf-dir').value;

   
    const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: nuevoNombre }
    });

    const { error: profileError } = await supabase
        .from('perfiles')
        .upsert({
            id: user.id,
            nombre_completo: nuevoNombre,
            telefono: nuevoTel,
            direccion: nuevaDir,
            updated_at: new Date()
        });

    if (authError || profileError) {
        alert("Error al actualizar: " + (authError?.message || profileError?.message));
    } else {
        alert("¡Perfil de Galletas MTY actualizado con éxito!");
    }

    btnGuardar.disabled = false;
    btnGuardar.innerText = "Guardar Cambios";
});

cargarPerfil();