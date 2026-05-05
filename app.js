import { supabase } from './JS/config.js';

// --- ESTADO DEL CARRITO ---
let carrito = [];

async function inicializarPagina() {
    await gestionarMenuUsuario();
    await cargarGalletas();
}

async function gestionarMenuUsuario() {
    const userMenu = document.getElementById('user-menu');
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // --- BLOQUE DE VERIFICACIÓN DE ADMIN ---
        // Consultamos el perfil para ver si tiene el botón de seguridad
        const { data: perfil } = await supabase
            .from('perfiles')
            .select('es_admin')
            .eq('id', user.id)
            .single();

        // Si es admin, mostramos el botón que tienes en el HTML
        if (perfil && perfil.es_admin === true) {
            const btnAdmin = document.getElementById('btn-admin-seguridad');
            if (btnAdmin) btnAdmin.style.display = 'block';
        }
        // ---------------------------------------

        const nombre = user.user_metadata.full_name || "Cliente";
        userMenu.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-warning dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle"></i> Hola, ${nombre}
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                    <li><a class="dropdown-item" href="perfil.html">Mi Perfil</a></li>
                    <li><a class="dropdown-item" href="pedidos.html">Mis Pedidos</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" id="btn-logout">Salir</button></li>
                </ul>
            </div>`;

        document.getElementById('btn-logout').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload();
        });

    } else {
        userMenu.innerHTML = `<button class="btn btn-primary btn-sm" onclick="location.href='login.html'">Iniciar Sesión</button>`;
        // Si no hay usuario, nos aseguramos de que el botón de admin esté oculto
        const btnAdmin = document.getElementById('btn-admin-seguridad');
        if (btnAdmin) btnAdmin.style.display = 'none';
    }
}

// CARGAR GALLETAS 
async function cargarGalletas() {
    const contenedor = document.getElementById('contenedor-galletas');
    const { data: productos, error } = await supabase.from('productos').select('*').gt('stock', 0);

    if (error) {
        contenedor.innerHTML = `<p class="text-danger text-center">Error al conectar con la panadería...</p>`;
        return;
    }

    contenedor.innerHTML = '';

    productos.forEach(p => {
        const div = document.createElement('div');
        div.className = 'col-md-4';
        div.innerHTML = `
            <div class="card cookie-card h-100 shadow-sm border-0">
                <img src="${p.imagen_url}" class="card-img-top" style="height: 200px; object-fit: cover; border-radius: 10px 10px 0 0;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold">${p.nombre}</h5>
                    <p class="card-text text-muted small">${p.descripcion || ''}</p>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span class="fs-5 fw-bold text-success">$${p.precio.toFixed(2)}</span>
                        <button class="btn btn-warning btn-sm fw-bold add-to-cart" 
                                data-id="${p.id}" data-nombre="${p.nombre}" data-precio="${p.precio}">
                            + Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
    });

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', agregarAlCarrito);
    });
}

function agregarAlCarrito(e) {
    const btn = e.target;
    const item = {
        id: btn.dataset.id,
        nombre: btn.dataset.nombre,
        precio: parseFloat(btn.dataset.precio)
    };
    
    carrito.push(item);
    actualizarUI();
}

function actualizarUI() {
    // 1. Contador del botón del carrito
    document.getElementById('cart-count').innerText = carrito.length;

    // 2. Lista dentro del modal
    const lista = document.getElementById('lista-carrito');
    const totalElem = document.getElementById('total-carrito');
    
    lista.innerHTML = '';
    let total = 0;

    carrito.forEach((item, index) => {
        total += item.precio;
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <span class="fw-bold">${item.nombre}</span>
                    <br>
                    <small class="text-success">$${item.precio.toFixed(2)}</small>
                </div>
                <!-- BOTÓN DE ELIMINAR -->
                <button class="btn btn-outline-danger btn-sm border-0" onclick="eliminarDelCarrito(${index})">
                    <i class="bi bi-trash3"></i>
                </button>
            </li>`;
    });

    totalElem.innerText = total.toFixed(2);
}

// Iniciar
inicializarPagina();

document.addEventListener('DOMContentLoaded', () => {
    gestionarMenuUsuario();
    cargarGalletas();
});


window.eliminarDelCarrito = function(index) {
    
    carrito.splice(index, 1);
    
 
    actualizarUI();
};

async function cargarPedidos() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Consultamos el rol del usuario actual
    const { data: perfil } = await supabase
        .from('perfiles')
        .select('es_admin')
        .eq('id', user.id)
        .single();

    let consulta = supabase.from('pedidos').select('*');

    if (perfil?.es_admin) {
        // SI ES ADMIN: Trae TODOS los pedidos de todos los clientes
        console.log("Acceso de Administrador");
    } else {
        // SI ES CLIENTE: Solo trae sus propios pedidos
        consulta = consulta.eq('user_id', user.id);
    }

    const { data: pedidos, error } = await consulta;
    // ... aquí dibujas los pedidos en el HTML
}

window.realizarPedido = async function() {
    if (carrito.length === 0) return alert("El carrito está vacío");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Debes iniciar sesión");

    try {
        // --- VALIDACIÓN DE INFORMACIÓN DE CONTACTO ---
        // Consultamos si el perfil tiene los datos necesarios
        const { data: perfil, error: errorPerfil } = await supabase
            .from('perfiles')
            .select('nombre_completo, telefono, direccion')
            .eq('id', user.id)
            .single();

        // Si falta algún dato, detenemos el proceso y lo mandamos a perfil.html
        if (errorPerfil || !perfil?.nombre_completo || !perfil?.telefono || !perfil?.direccion) {
            alert("⚠️ ¡Atención! Necesitamos tu nombre, teléfono y dirección para entregar tus galletas.");
            window.location.href = 'perfil.html'; 
            return; // Corta la ejecución para que no se cree el pedido
        }
        // ----------------------------------------------

        // Si los datos están completos, sigue tu lógica normal
        console.log("Datos de cliente verificados. Procesando pedido...");
        
        // Aquí continúa tu código de validación de stock, insert en 'pedidos', etc.
        // ...
        
    } catch (err) {
        console.error("Error al procesar pedido:", err);
    }
    
    try {
        // 1. VALIDACIÓN DE STOCK
        for (const item of carrito) {
            const { data: producto } = await supabase
                .from('productos')
                .select('stock, nombre')
                .eq('id', item.id)
                .single();

            if (!producto || producto.stock < 1) {
                alert(`Lo sentimos, ya no hay stock de: ${producto ? producto.nombre : 'un producto'}`);
                return;
            }
        }

        const totalVenta = carrito.reduce((acc, item) => acc + item.precio, 0);

        // 2. INSERTAR PEDIDO
        const { data: pedido, error: errorPedido } = await supabase
            .from('pedidos')
            .insert({
                user_id: user.id,
                monto_total: totalVenta,
                estado: 'pendiente'
            })
            .select().single();

        if (errorPedido) throw errorPedido;

        // 3. INSERTAR DETALLES Y RESTAR STOCK (USANDO RPC)
        for (const item of carrito) {
            await supabase.from('detalles_pedido').insert({
                pedido_id: pedido.id,
                producto_id: item.id,
                cantidad: 1,
                precio_unitario: item.precio
            });

            // Llamada a tu función de SQL
            await supabase.rpc('restar_stock', { 
                prod_id: item.id, 
                cant: 1 
            });
        }

        alert("¡Pedido realizado con éxito!");
        carrito = [];
        actualizarUI();
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
        if (modal) modal.hide();

    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    }
};