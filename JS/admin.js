import { supabase } from './config.js';

async function verificarAccesoAdmin() {
   
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

   
    const { data: perfil, error } = await supabase
        .from('perfiles')
        .select('es_admin')
        .eq('id', user.id)
        .single();

    if (error || !perfil?.es_admin) {
        alert("Acceso denegado. Solo para administradores.");
        window.location.href = 'index.html'; 
        return;
    }

   
    cargarPedidosAdmin();
    cargarGestionStock();
}

verificarAccesoAdmin();



async function cargarPedidosAdmin(estado = 'pendiente') {
    const tabla = document.getElementById('tabla-admin-pedidos');
    tabla.innerHTML = '<tr><td colspan="6" class="text-center">Cargando pedidos...</td></tr>';


    const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select(`
        id,
        monto_total,
        estado,
        perfiles ( 
            nombre_completo, 
            telefono, 
            direccion 
        )
    `)
    .eq('estado', estado);
    if (error) {
        console.error("Error al cargar pedidos:", error);
        tabla.innerHTML = '<tr><td colspan="6" class="text-danger">Error al cargar datos.</td></tr>';
        return;
    }

    tabla.innerHTML = '';

    pedidos.forEach(p => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${p.perfiles?.nombre_completo || 'N/A'}</td>
            <td>${p.perfiles?.telefono || 'N/A'}</td>
            <td>${p.perfiles?.direccion || 'N/A'}</td>
            <td class="fw-bold">$${p.monto_total.toFixed(2)}</td>
            <td><span class="badge ${estado === 'pendiente' ? 'bg-warning' : 'bg-success'}">${p.estado}</span></td>
            <td>
                <div class="btn-group">
                    <!-- BOTÓN DE DETALLES -->
                    <button class="btn btn-sm btn-info text-white" onclick="verDetalles('${p.id}')">
                        <i class="bi bi-eye"></i> Ver Galletas
                    </button>
                    
                    <!-- BOTÓN DE ENTREGAR (Solo si está pendiente) -->
                    ${estado === 'pendiente' ? 
                    `<button class="btn btn-sm btn-success" onclick="cambiarEstadoPedido('${p.id}', 'entregado')">
                        Entregar
                    </button>` : 
                    '<span class="ms-2 text-success"><i class="bi bi-check-lg"></i></span>'}
                </div>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

window.cargarPedidosAdmin = cargarPedidosAdmin;
window.cambiarEstadoPedido = async function(id, nuevoEstado) {
    try {
        const { error } = await supabase
            .from('pedidos')
            .update({ estado: nuevoEstado }) 
            .eq('id', id);

        if (error) throw error;

        alert("¡Pedido entregado con éxito!");
        
        cargarPedidosAdmin('pendiente'); 
        
    } catch (err) {
        console.error("Error al actualizar:", err.message);
        alert("No se pudo actualizar el estado");
    }
};


window.verDetallesAdmin = async (pedidoId) => {
    const filaDetalle = document.getElementById(`detalles-${pedidoId}`);
    const contenedor = document.getElementById(`contenido-detalles-${pedidoId}`);

    
    if (filaDetalle.style.display === 'table-row') {
        filaDetalle.style.display = 'none';
        return;
    }

    
    filaDetalle.style.display = 'table-row';

    const { data: detalles, error } = await supabase
        .from('detalles_pedido')
        .select(`
            cantidad,
            productos ( nombre )
        `)
        .eq('pedido_id', pedidoId);

    if (error) {
        contenedor.innerHTML = '<span class="text-danger">Error al cargar productos</span>';
        return;
    }


    if (detalles && detalles.length > 0) {
        let html = '<strong>Productos del pedido:</strong><ul class="mb-0 mt-2">';
        detalles.forEach(item => {
            html += `<li>${item.productos.nombre} — <span class="badge bg-secondary">x${item.cantidad}</span></li>`;
        });
        html += '</ul>';
        contenedor.innerHTML = html;
    } else {
        contenedor.innerHTML = '<span class="text-muted">No hay detalles registrados.</span>';
    }
};


window.verDetalles = async function(pedidoId) {
    const lista = document.getElementById('lista-detalles');
    lista.innerHTML = '<li>Cargando...</li>';
    
  
    const myModal = new bootstrap.Modal(document.getElementById('modalDetalles'));
    myModal.show();

    const { data, error } = await supabase
        .from('detalles_pedido')
        .select(`
            cantidad,
            precio_unitario,
            productos ( nombre )
        `)
        .eq('pedido_id', pedidoId);

    if (error) {
        lista.innerHTML = '<li>Error al cargar detalles</li>';
        return;
    }

    lista.innerHTML = data.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${item.productos.nombre} (x${item.cantidad})
            <span class="badge bg-primary rounded-pill">$${(item.cantidad * item.precio_unitario).toFixed(2)}</span>
        </li>
    `).join('');
};

async function cargarGestionStock() {
    const { data: productos, error } = await supabase
        .from('productos')
        .select('id, nombre, stock')
        .order('nombre');

    if (error) return;

    const contenedor = document.getElementById('tabla-inventario');
    contenedor.innerHTML = '';

    productos.forEach(prod => {
        contenedor.innerHTML += `
            <tr>
                <td>${prod.nombre}</td>
                <td>
                    <input type="number" id="input-stock-${prod.id}" value="${prod.stock}" class="form-control form-control-sm" style="width: 100px;">
                </td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="actualizarStock('${prod.id}')">
                        Guardar
                    </button>
                </td>
            </tr>
        `;
    });
}

window.actualizarStock = async (id) => {
    const nuevoStock = document.getElementById(`input-stock-${id}`).value;
    
    const { error } = await supabase
        .from('productos')
        .update({ stock: parseInt(nuevoStock) })
        .eq('id', id);

    if (error) alert("Error al actualizar stock");
    else alert("Stock actualizado correctamente");
};


window.cargarPedidosAdmin = cargarPedidosAdmin;


cargarPedidosAdmin();
cargarGestionStock();