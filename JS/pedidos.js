import { supabase } from './config.js';

const listaPedidos = document.getElementById('lista-pedidos');

async function cargarHistorial() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', user.id) 
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error:", error);
        return;
    }

    listaPedidos.innerHTML = '';

    if (!pedidos || pedidos.length === 0) {
        listaPedidos.innerHTML = '<tr><td colspan="5" class="text-center">Aún no has hecho ningún pedido. ¡Ve por tus galletas!</td></tr>';
        return;
    }

    pedidos.forEach(pedido => {
        const fecha = pedido.created_at ? new Date(pedido.created_at).toLocaleDateString() : 'Sin fecha';
        const total = pedido.monto_total ? pedido.monto_total.toFixed(2) : '0.00';
        
        let badgeClass = 'bg-warning text-dark';
        const estadoActual = (pedido.estado || 'pendiente').toLowerCase();

        if (estadoActual === 'entregado') badgeClass = 'bg-success';
        if (estadoActual === 'en camino') badgeClass = 'bg-info text-dark';
        if (estadoActual === 'cancelado') badgeClass = 'bg-danger';

        listaPedidos.innerHTML += `
            <tr>
                <td>#${pedido.id.substring(0, 8)}</td>
                <td>${fecha}</td>
                <td class="fw-bold">$${total}</td>
                <td>
                    <span class="badge ${badgeClass}">
                        ${estadoActual.toUpperCase()}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="verDetalles('${pedido.id}')">
                        Ver detalles
                    </button>
                </td>
            </tr>
        `;
    });
}

// Definimos verDetalles en el objeto window para que el onclick del HTML lo encuentre
window.verDetalles = async (pedidoId) => {
    const { data: detalles, error } = await supabase
        .from('detalles_pedido')
        .select(`
            cantidad,
            subtotal,
            productos (
                nombre
            )
        `)
        .eq('pedido_id', pedidoId);

    if (error) {
        console.error("Error al obtener detalles:", error);
        return;
    }

    if (detalles && detalles.length > 0) {
        let mensaje = "Detalle de tu compra en Galletas MTY:\n\n";
        detalles.forEach(item => {
            mensaje += `- ${item.productos.nombre} x${item.cantidad} (Subtotal: $${item.subtotal})\n`;
        });
        alert(mensaje);
    } else {
        alert("No se encontraron productos para este pedido.");
    }
};

// Ejecutamos la función principal
cargarHistorial();